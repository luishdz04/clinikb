import 'server-only';
import { Resend } from 'resend';

/**
 * Único punto de salida de correo de la app.
 *
 * Antes esto iba por SMTP con nodemailer. Se cambió a Resend por dos razones:
 * el sitio corre en funciones serverless de Netlify, donde SMTP es frágil
 * (puertos bloqueados, conexiones frías, timeouts), y el dominio está
 * verificado en Resend con SPF + DKIM, que es lo que mantiene los correos
 * fuera de spam.
 */

let cliente: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  cliente ??= new Resend(apiKey);
  return cliente;
}

function remitente(): string {
  const email = process.env.SMTP_FROM_EMAIL;
  const nombre = process.env.SMTP_FROM_NAME || 'CliniKB';
  if (!email) throw new Error('Falta SMTP_FROM_EMAIL');
  return `${nombre} <${email}>`;
}

export interface EnviarCorreoParams {
  to: string | string[];
  subject: string;
  html: string;
  /**
   * Evita duplicados si la petición se reintenta. Formato `<evento>/<id>`.
   * Con la misma clave y el mismo contenido, Resend no reenvía.
   */
  idempotencyKey?: string;
}

/**
 * Envía un correo. Devuelve el id de Resend o lanza con un mensaje útil.
 *
 * Ojo: el SDK de Resend NO lanza excepciones ante errores de la API, devuelve
 * `{ data, error }`. Hay que revisar `error` a mano.
 */
export async function sendEmail({ to, subject, html, idempotencyKey }: EnviarCorreoParams) {
  const resend = getResend();

  if (!resend) {
    // No se rompe el flujo de negocio por una variable sin configurar: quien
    // llama decide si el correo es crítico. Pero sí queda registrado.
    console.error('[email] RESEND_API_KEY no configurada; no se envió:', subject);
    throw new Error('El servicio de correo no está configurado');
  }

  const replyTo = process.env.EMAIL_REPLY_TO;

  const { data, error } = await resend.emails.send(
    {
      from: remitente(),
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      // El dominio aún no tiene MX: sin esto, las respuestas rebotan.
      ...(replyTo ? { replyTo } : {}),
    },
    idempotencyKey ? { idempotencyKey } : undefined,
  );

  if (error) {
    console.error('[email] Resend rechazó el envío:', error.name, error.message);
    throw new Error(`No se pudo enviar el correo: ${error.message}`);
  }

  console.log('[email] enviado:', data?.id, '->', subject);
  return data;
}
