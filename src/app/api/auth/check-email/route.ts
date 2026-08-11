import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Estado de un correo antes de que el paciente llene todo el formulario.
 *
 * Sin esto, alguien con un registro a medias tendría que recorrer los cinco
 * pasos otra vez sólo para enterarse al final de que le faltaba confirmar.
 *
 * No revela nada que el propio formulario no revelara ya al enviarse: el alta
 * siempre respondió distinto para un correo tomado.
 */
export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Falta el correo' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
      return NextResponse.json({ estado: 'libre' });
    }

    const { data: patient } = await adminSupabase
      .from('patients')
      .select('user_id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (!patient) {
      return NextResponse.json({ estado: 'libre' });
    }

    const { data: existing } = patient.user_id
      ? await adminSupabase.auth.admin.getUserById(patient.user_id)
      : { data: { user: null } };

    return NextResponse.json({
      estado: existing?.user?.email_confirmed_at ? 'registrado' : 'pendiente',
    });
  } catch (error) {
    console.error('[check-email] Error inesperado:', error);
    // Ante la duda se deja pasar: el alta volverá a validar de todos modos.
    return NextResponse.json({ estado: 'libre' });
  }
}
