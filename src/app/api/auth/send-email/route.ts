import { NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { render } from '@react-email/components';
import { VerificationCodeEmail } from '@/emails/VerificationCodeEmail';
import { sendEmail } from '@/lib/email/send';

/**
 * Send Email Hook de Supabase Auth.
 *
 * Cuando Auth necesita mandar un correo, en vez de enviarlo él llama a este
 * endpoint con el token ya generado. Nosotros lo renderizamos con React Email
 * y lo enviamos por Resend, que es lo que nos permite usar plantilla propia y
 * el dominio verificado.
 *
 * Auth sigue siendo el dueño del código: lo genera, lo expira (Auth >
 * Providers > Email > OTP Expiration) y lo valida en `verifyOtp`. Aquí no se
 * guarda ni se inventa ningún código.
 *
 * Este endpoint es público, por eso la firma es obligatoria: sin verificarla,
 * cualquiera podría dispararlo y mandar correos a nombre de la clínica.
 */

// standardwebhooks usa crypto de Node, no corre en el runtime edge.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface HookPayload {
  user: { email: string; user_metadata?: { full_name?: string } };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

/** El asunto depende de para qué pidió Auth el correo. */
const ASUNTOS: Record<string, string> = {
  signup: 'Tu código de verificación · CliniKB',
  email_change: 'Confirma tu nuevo correo · CliniKB',
  recovery: 'Código para restablecer tu contraseña · CliniKB',
  magiclink: 'Tu código de acceso · CliniKB',
  invite: 'Te invitaron a CliniKB',
};

function minutosDeVigencia(): number {
  // Espejo de Auth > Providers > Email > Email OTP Expiration (segundos).
  const segundos = Number(process.env.SUPABASE_OTP_EXPIRY_SECONDS) || 600;
  return Math.max(1, Math.round(segundos / 60));
}

export async function POST(request: Request) {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET;

  if (!secret) {
    console.error('[send-email-hook] Falta SEND_EMAIL_HOOK_SECRET');
    return NextResponse.json(
      { error: { http_code: 500, message: 'Hook no configurado' } },
      { status: 500 },
    );
  }

  // La firma se calcula sobre el cuerpo crudo: no usar request.json().
  const payload = await request.text();
  const headers = Object.fromEntries(request.headers);

  let datos: HookPayload;
  try {
    // El secreto se guarda como "v1,whsec_xxx" pero la librería espera el
    // base64 pelado.
    const wh = new Webhook(secret.replace('v1,whsec_', ''));
    datos = wh.verify(payload, headers) as HookPayload;
  } catch (error) {
    console.error('[send-email-hook] Firma inválida:', error);
    return NextResponse.json(
      { error: { http_code: 401, message: 'Firma inválida' } },
      { status: 401 },
    );
  }

  const { user, email_data } = datos;
  const accion = email_data.email_action_type;

  try {
    const html = await render(
      VerificationCodeEmail({
        token: email_data.token,
        fullName: user.user_metadata?.full_name,
        expiresInMinutes: minutosDeVigencia(),
      }),
    );

    await sendEmail({
      to: user.email,
      subject: ASUNTOS[accion] ?? 'Tu código de verificación · CliniKB',
      html,
      // El token cambia en cada reenvío, así que dos códigos distintos nunca
      // colisionan; pero un reintento del mismo hook no duplica el correo.
      idempotencyKey: `auth-${accion}/${email_data.token_hash}`.slice(0, 256),
    });
  } catch (error) {
    // Devolver error hace que Auth marque el envío como fallido y el usuario
    // vea que algo pasó, en vez de quedarse esperando un correo fantasma.
    const mensaje = error instanceof Error ? error.message : 'Error al enviar';
    console.error('[send-email-hook] Falló el envío:', mensaje);
    return NextResponse.json(
      { error: { http_code: 500, message: mensaje } },
      { status: 500 },
    );
  }

  return NextResponse.json({}, { status: 200 });
}
