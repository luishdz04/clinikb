import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createAuthAnonClient, traducirErrorAuth } from '@/lib/supabase/auth-anon';
import { sendEmail } from '@/lib/email/send';
import { correoAvisoInterno, sitio } from '@/lib/email/plantillas';

export const dynamic = 'force-dynamic';

/**
 * Valida el código que Auth mandó por correo.
 *
 * Quien valida el código es Supabase (`verifyOtp`): aquí no se compara nada a
 * mano, ni se guarda el código en ningún lado. Auth ya controla la vigencia y
 * el número de intentos.
 *
 * Al confirmarse es cuando se avisa al administrador: así no le llegan
 * solicitudes de correos que nunca se verificaron.
 */
export async function POST(request: Request) {
  try {
    const { email, token } = (await request.json()) as { email?: string; token?: string };

    if (!email || !token) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const anonSupabase = createAuthAnonClient();
    const adminSupabase = createAdminClient();

    if (!anonSupabase || !adminSupabase) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    const { data, error } = await anonSupabase.auth.verifyOtp({
      email,
      token: token.trim(),
      type: 'signup',
    });

    if (error || !data.user) {
      // Código malo o vencido: no se distingue cuál en la respuesta para no
      // darle pistas a quien esté probando códigos al azar.
      console.warn('[verify-code] Falló la verificación:', error?.message);
      return NextResponse.json(
        { error: traducirErrorAuth(error?.message ?? 'invalid token') },
        { status: 400 }
      );
    }

    // Verificar el correo COMPLETA el registro: ya no hay aprobación manual
    // del médico. Se marca 'approved' para que el paciente pueda entrar de
    // inmediato — el login y el layout de cliente exigen ese estado.
    // `approved_by` queda nulo justamente para distinguir las altas
    // automáticas de las que en su momento aprobó una persona.
    const { data: patient } = await adminSupabase
      .from('patients')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('user_id', data.user.id)
      .select('id, full_name, email, status')
      .maybeSingle();

    if (patient) {
      try {
        const adminEmail = process.env.ADMIN_EMAIL;

        if (adminEmail) {
          await sendEmail({
            to: adminEmail,
            subject: `Nuevo paciente registrado: ${patient.full_name}`,
            html: await correoAvisoInterno({
              titulo: 'Nuevo paciente registrado',
              resumen: `${patient.full_name} completó su registro y ya puede agendar.`,
              datos: [
                { etiqueta: 'Paciente', valor: patient.full_name },
                { etiqueta: 'Correo', valor: patient.email },
              ],
              enlace: `${sitio()}/admin/pacientes`,
              textoEnlace: 'Ver su expediente',
            }),
            // Un solo aviso por paciente aunque se reintente la petición.
            idempotencyKey: `nuevo-registro/${patient.id}`,
          });
        }
      } catch (emailError) {
        // El correo ya quedó verificado; no se le puede fallar al paciente
        // porque el aviso interno no salió.
        console.error('[verify-code] No se pudo avisar al admin:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Correo verificado. Tu cuenta ya está activa.',
    });
  } catch (error) {
    console.error('[verify-code] Error inesperado:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
