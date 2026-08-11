import { NextResponse } from 'next/server';
import { createAuthAnonClient, traducirErrorAuth } from '@/lib/supabase/auth-anon';

export const dynamic = 'force-dynamic';

/**
 * Reenvía el código de confirmación de alta.
 *
 * Supabase limita esto a 1 correo por minuto por usuario (Auth > Rate Limits);
 * cuando pega el límite devuelve 429 y la UI muestra la cuenta regresiva.
 */
export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email) {
      return NextResponse.json({ error: 'Falta el correo' }, { status: 400 });
    }

    const anonSupabase = createAuthAnonClient();
    if (!anonSupabase) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    const { error } = await anonSupabase.auth.resend({ type: 'signup', email });

    if (error) {
      const esLimite =
        error.message.toLowerCase().includes('security purposes') ||
        error.message.toLowerCase().includes('rate limit');

      console.warn('[resend-code] Falló el reenvío:', error.message);
      return NextResponse.json(
        { error: traducirErrorAuth(error.message) },
        { status: esLimite ? 429 : 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Te enviamos un código nuevo.' });
  } catch (error) {
    console.error('[resend-code] Error inesperado:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
