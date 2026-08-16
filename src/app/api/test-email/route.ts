import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sendEmail, getApprovalEmailHTML } from '@/lib/email/nodemailer';
import { COOKIE_SESION_DOCTOR, verificarSesionDoctor } from '@/lib/auth/doctorSession';

export const dynamic = 'force-dynamic';

/**
 * Envía un correo de prueba para diagnosticar la entrega.
 *
 * Va cerrada a rol admin. Estuvo abierta a internet, y desde que el correo
 * sale del buzón real de la clínica eso era un problema serio: cualquiera
 * podía dispararla con `?to=` y agotar el límite diario de envío, lo que se
 * lleva por delante también el correo humano de `administracion@`.
 */
export async function GET(request: Request) {
  const galletas = await cookies();
  const sesion = await verificarSesionDoctor(galletas.get(COOKIE_SESION_DOCTOR)?.value);

  if (!sesion) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  if (sesion.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const destino =
    new URL(request.url).searchParams.get('to') || process.env.ADMIN_EMAIL;

  if (!destino) {
    return NextResponse.json(
      { error: 'Indica ?to= o configura ADMIN_EMAIL' },
      { status: 400 },
    );
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  try {
    await sendEmail({
      to: destino,
      subject: 'Prueba de correo - CliniKB',
      html: getApprovalEmailHTML('Usuario de Prueba', `${base}/login`),
    });

    return NextResponse.json({ ok: true, message: `Correo de prueba enviado a ${destino}` });
  } catch (error) {
    console.error('Error enviando el correo de prueba:', error);
    return NextResponse.json(
      {
        error: 'No se pudo enviar el correo',
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
