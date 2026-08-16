import 'server-only';
import { Configuration, SendApi, type V1SendRequest } from 'hostinger-mail-api-sdk';
import { isAxiosError } from 'axios';

/**
 * Único punto de salida de correo de la app.
 *
 * Historia: SMTP con nodemailer -> Resend -> API de correo de Hostinger.
 * El cambio a Hostinger vino de tener ya los buzones reales del dominio
 * (`administracion@`, `psicologia@`, …): el correo automático sale del mismo
 * buzón que atiende la clínica, así que las respuestas de los pacientes caen
 * donde alguien las va a leer, no en un remitente que no recibe.
 *
 * Dos diferencias contra Resend que conviene tener presentes:
 *
 *  - El remitente NO se elige por parámetro: es el buzón al que pertenece el
 *    token. Por eso aquí no hay un `from`.
 *  - Cada envío deja copia en la carpeta Enviados de ese buzón.
 */

const BASE = 'https://api.mail.hostinger.com';

let cliente: SendApi | null = null;

function getCliente(): SendApi | null {
  const token = process.env.HOSTINGER_MAIL_TOKEN;
  if (!token) return null;
  cliente ??= new SendApi(new Configuration({ accessToken: token, basePath: BASE }));
  return cliente;
}

export interface EnviarCorreoParams {
  to: string | string[];
  subject: string;
  html: string;
  /**
   * Se conserva por compatibilidad con quien ya lo pasaba, pero la API de
   * Hostinger no tiene idempotencia. Si Supabase reintenta el hook, el
   * paciente puede recibir el mismo correo dos veces —con el mismo código,
   * no con uno nuevo—, así que es molesto pero no rompe el registro.
   */
  idempotencyKey?: string;
}

/** Versión legible del HTML para los clientes que no lo muestran. */
function aTextoPlano(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<br\s*\/?>|<\/(p|div|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Saca el mensaje útil de un error de axios sin volcar el token en los logs. */
function detalleDelError(error: unknown): string {
  if (isAxiosError(error)) {
    const cuerpo = error.response?.data;
    const mensaje =
      (typeof cuerpo === 'object' && cuerpo !== null && 'message' in cuerpo
        ? String((cuerpo as { message: unknown }).message)
        : null) ?? error.message;
    return `${error.response?.status ?? 'sin estado'}: ${mensaje}`;
  }
  return error instanceof Error ? error.message : String(error);
}

/**
 * Envía un correo desde el buzón de la clínica.
 *
 * Lanza si falla. Quien llama decide si el correo es crítico: en las rutas de
 * citas el envío va dentro de su propio try/catch para que un problema de
 * correo no deshaga una cita ya confirmada.
 */
export async function sendEmail({ to, subject, html }: EnviarCorreoParams) {
  const api = getCliente();
  const buzon = process.env.HOSTINGER_MAILBOX_ID;

  if (!api || !buzon) {
    console.error(
      '[email] Falta HOSTINGER_MAIL_TOKEN o HOSTINGER_MAILBOX_ID; no se envió:',
      subject,
    );
    throw new Error('El servicio de correo no está configurado');
  }

  const destinatarios = Array.isArray(to) ? to : [to];

  // Los tipos generados del SDK marcan TODOS los campos como obligatorios,
  // contradiciendo su propia documentación ("At least one of to, cc, or bcc
  // must be present"). Se manda sólo lo que la API necesita en vez de
  // inventar un `inReplyTo` o un `forwardOf` vacíos, que sí tendrían efecto.
  const cuerpo = {
    to: destinatarios,
    displayName: process.env.SMTP_FROM_NAME || 'CliniKB',
    subject,
    html,
    // Alternativa en texto plano. No es adorno: un correo que sólo trae HTML
    // puntúa peor en los filtros de spam.
    text: aTextoPlano(html),
  } as V1SendRequest;

  try {
    await api.sendEmail(buzon, cuerpo);
  } catch (error) {
    const detalle = detalleDelError(error);
    console.error('[email] Hostinger rechazó el envío:', detalle);
    throw new Error(`No se pudo enviar el correo: ${detalle}`);
  }

  console.log('[email] enviado ->', subject, '->', destinatarios.join(', '));
  return { to: destinatarios, subject };
}
