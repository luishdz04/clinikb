import 'server-only';
import { google } from 'googleapis';
import { randomUUID } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Integración con Google Calendar para generar enlaces de Meet.
 *
 * La clínica autoriza una vez su cuenta de Google desde el panel; a partir de
 * ahí guardamos su refresh token y creamos los eventos en su calendario. Cada
 * evento genera su propio enlace de Meet.
 *
 * Se guarda el ID del evento, no sólo la URL: reprogramar o cancelar actualiza
 * el MISMO evento. Creando uno nuevo cada vez, el paciente se quedaría con un
 * enlace muerto en el correo que ya recibió.
 */

const ZONA = 'America/Monterrey';
const CALENDARIO = 'primary';

/** Permiso mínimo: crear y administrar eventos, nada de leer todo el calendario. */
export const ALCANCE_GOOGLE = 'https://www.googleapis.com/auth/calendar.events';

export interface DatosEvento {
  titulo: string;
  descripcion?: string;
  /** YYYY-MM-DD, hora de pared de Monterrey. */
  fecha: string;
  /** HH:MM:SS */
  horaInicio: string;
  horaFin: string;
  invitados: string[];
}

export interface ResultadoEvento {
  eventId: string;
  meetUrl: string | null;
  calendarId: string;
}

function clienteOAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Faltan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o GOOGLE_REDIRECT_URI',
    );
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/** ¿Está configurada la integración a nivel de servidor? */
export function googleConfigurado(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI,
  );
}

/** URL a la que se manda a la clínica para autorizar su cuenta. */
export function urlDeConsentimiento(): string {
  return clienteOAuth().generateAuthUrl({
    // `offline` es lo que hace que Google entregue refresh token; sin esto
    // sólo llega un token de acceso que vence en una hora.
    access_type: 'offline',
    // Fuerza la pantalla de consentimiento aunque ya haya autorizado antes:
    // Google sólo devuelve el refresh token la primera vez si no se pide.
    prompt: 'consent',
    scope: [ALCANCE_GOOGLE, 'https://www.googleapis.com/auth/userinfo.email'],
  });
}

/** Cambia el código de la redirección por un refresh token y lo guarda. */
export async function guardarAutorizacion(codigo: string, doctorId?: string) {
  const oauth = clienteOAuth();
  const { tokens } = await oauth.getToken(codigo);

  if (!tokens.refresh_token) {
    throw new Error(
      'Google no devolvió un refresh token. Revoca el acceso de la app en la cuenta y vuelve a autorizar.',
    );
  }

  oauth.setCredentials(tokens);
  const { data } = await google.oauth2({ version: 'v2', auth: oauth }).userinfo.get();

  const supabase = createAdminClient();
  if (!supabase) throw new Error('Error de configuración del servidor');

  const { error } = await supabase.from('app_integrations').upsert({
    provider: 'google',
    account_email: data.email ?? null,
    refresh_token: tokens.refresh_token,
    scope: tokens.scope ?? null,
    connected_by: doctorId ?? null,
    // Se refrescan a mano: en un upsert que choca con la fila existente, los
    // valores por defecto de la columna no vuelven a aplicarse.
    connected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(`No se pudo guardar la autorización: ${error.message}`);
  return { email: data.email ?? null };
}

/** Cuenta conectada, sin exponer el token. */
export async function estadoIntegracion() {
  const supabase = createAdminClient();
  if (!supabase) return { conectado: false as const };

  const { data } = await supabase
    .from('app_integrations')
    .select('account_email, connected_at')
    .eq('provider', 'google')
    .maybeSingle();

  return data
    ? { conectado: true as const, email: data.account_email, desde: data.connected_at }
    : { conectado: false as const };
}

async function calendario() {
  const supabase = createAdminClient();
  if (!supabase) throw new Error('Error de configuración del servidor');

  const { data } = await supabase
    .from('app_integrations')
    .select('refresh_token')
    .eq('provider', 'google')
    .maybeSingle();

  if (!data?.refresh_token) {
    throw new Error('La cuenta de Google de la clínica no está conectada.');
  }

  const oauth = clienteOAuth();
  // Con el refresh token, la librería pide un token de acceso nuevo sola.
  oauth.setCredentials({ refresh_token: data.refresh_token });
  return google.calendar({ version: 'v3', auth: oauth });
}

/**
 * Une fecha y hora de pared en el formato que espera Calendar.
 *
 * La zona va aparte, en `timeZone`, en vez de incrustar un desfase: así el
 * horario de verano lo resuelve Google y no nosotros. Es coherente con cómo
 * guardamos las citas —`date` y `time` sin zona, siempre hora de Monterrey.
 */
const momento = (fecha: string, hora: string) => ({
  dateTime: `${fecha}T${hora}`,
  timeZone: ZONA,
});

export async function crearEventoConMeet(datos: DatosEvento): Promise<ResultadoEvento> {
  const cal = await calendario();

  const evento = await cal.events.insert({
    calendarId: CALENDARIO,
    // Sin esto Calendar ignora el bloque conferenceData y no genera el Meet.
    conferenceDataVersion: 1,
    sendUpdates: 'all',
    requestBody: {
      summary: datos.titulo,
      description: datos.descripcion,
      start: momento(datos.fecha, datos.horaInicio),
      end: momento(datos.fecha, datos.horaFin),
      attendees: datos.invitados.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          // Único por solicitud: si se repite, Google reutiliza la conferencia
          // anterior en vez de crear una nueva.
          requestId: randomUUID(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });

  const meetUrl =
    evento.data.hangoutLink ??
    evento.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri ??
    null;

  return {
    eventId: evento.data.id!,
    meetUrl,
    calendarId: CALENDARIO,
  };
}

/** Mueve un evento existente conservando su enlace de Meet. */
export async function moverEvento(
  eventId: string,
  fecha: string,
  horaInicio: string,
  horaFin: string,
): Promise<void> {
  const cal = await calendario();
  await cal.events.patch({
    calendarId: CALENDARIO,
    eventId,
    sendUpdates: 'all',
    requestBody: {
      start: momento(fecha, horaInicio),
      end: momento(fecha, horaFin),
    },
  });
}

/** Cancela el evento y avisa a los invitados. */
export async function cancelarEvento(eventId: string): Promise<void> {
  const cal = await calendario();
  await cal.events.delete({
    calendarId: CALENDARIO,
    eventId,
    sendUpdates: 'all',
  });
}
