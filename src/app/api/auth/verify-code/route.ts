import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createAuthAnonClient, traducirErrorAuth } from '@/lib/supabase/auth-anon';
import { sendEmail } from '@/lib/email/send';
import { getNewRegistrationEmailHTML } from '@/lib/email/registration-notification';

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

    // El correo quedó confirmado. El paciente sigue en 'pending' esperando la
    // aprobación del administrador: son dos puertas distintas.
    const { data: patient } = await adminSupabase
      .from('patients')
      .select('id, full_name, email, status')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (patient) {
      try {
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || '';
        const adminEmail = process.env.ADMIN_EMAIL;

        if (adminEmail) {
          await sendEmail({
            to: adminEmail,
            subject: `CliniKB - Nuevo Registro Pendiente: ${patient.full_name}`,
            html: getNewRegistrationEmailHTML(
              patient.full_name,
              patient.email,
              `${origin}/admin/dashboard`
            ),
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
      message: 'Correo verificado. Tu solicitud quedó pendiente de aprobación.',
    });
  } catch (error) {
    console.error('[verify-code] Error inesperado:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
