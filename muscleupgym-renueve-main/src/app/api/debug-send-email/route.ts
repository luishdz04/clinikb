import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import ConfirmationEmail from '@/emails/ConfirmationEmail';
import WelcomeEmail from '@/emails/WelcomeEmail';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Bloquear en producción por seguridad
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Endpoint no disponible en producción' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const to: string = body?.to;
    const template: 'confirmation' | 'welcome' = body?.template || 'confirmation';
    const firstName: string = body?.firstName || 'Usuario';
    const confirmationUrl: string = body?.confirmationUrl || 'https://example.com/confirm/test';
    const contractUrl: string | undefined = body?.contractUrl;

    if (!to) {
      return NextResponse.json({ error: 'Falta el parámetro "to"' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY no configurada' }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    const reactComponent =
      template === 'welcome'
        ? WelcomeEmail({ firstName, contractUrl })
        : ConfirmationEmail({ firstName, confirmationUrl });

    const fromAddress = process.env.RESEND_FROM || 'Muscle Up GYM <onboarding@resend.dev>';
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject: template === 'welcome' ? 'Bienvenido a Muscle Up GYM' : 'Confirma tu cuenta en Muscle Up GYM',
      react: reactComponent,
    });

    return NextResponse.json({ ok: !error, data, error, input: { to, template, firstName, confirmationUrl, contractUrl } });
  } catch (err) {
    console.error('Debug send email error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
