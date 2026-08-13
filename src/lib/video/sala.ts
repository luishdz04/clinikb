import 'server-only';
import { nanoid } from 'nanoid';
import { createAdminClient } from '@/lib/supabase/admin';
import { createVideoCall, isStreamConfigured } from '@/lib/stream';

/**
 * Alta de la sala de videollamada de una cita.
 *
 * Vive aquí y no dentro del endpoint porque las rutas de aprobar y reagendar
 * la necesitan desde el servidor. Antes la llamaban por HTTP contra la propia
 * app, lo que tenía dos problemas: dependía de que NEXT_PUBLIC_APP_URL fuera
 * correcta, y esas peticiones no llevan cookies, así que al cerrar el endpoint
 * con autenticación se habrían roto.
 */

export type ResultadoSala =
  | { ok: true; roomId: string; meetingLink: string }
  | { ok: false; status: 400 | 404 | 500 | 503; error: string };

export async function crearSalaDeConsulta(
  appointmentId: string,
  creadorStreamId: string,
): Promise<ResultadoSala> {
  if (!isStreamConfigured()) {
    return { ok: false, status: 503, error: 'Las videollamadas no están configuradas.' };
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return { ok: false, status: 500, error: 'Error de configuración del servidor' };
  }

  const { data: cita } = await supabase
    .from('appointments')
    .select('id, modality, meeting_link')
    .eq('id', appointmentId)
    .maybeSingle();

  if (!cita) {
    return { ok: false, status: 404, error: 'Cita no encontrada' };
  }

  if (cita.modality !== 'online') {
    return { ok: false, status: 400, error: 'Esta cita no es de modalidad online' };
  }

  // Si ya tiene sala, se reutiliza: crear una nueva dejaría fuera a quien ya
  // tuviera el enlace anterior.
  if (cita.meeting_link) {
    const existente = new URL(cita.meeting_link).searchParams.get('room');
    if (existente) {
      return { ok: true, roomId: existente, meetingLink: cita.meeting_link };
    }
  }

  const roomId = nanoid(12);
  await createVideoCall(roomId, creadorStreamId);

  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const meetingLink = `${base}/consulta/${appointmentId}/sala?room=${roomId}`;

  const { error } = await supabase
    .from('appointments')
    .update({ meeting_link: meetingLink })
    .eq('id', appointmentId);

  if (error) {
    console.error('Error guardando el enlace de la sala:', error);
    return { ok: false, status: 500, error: 'Error al guardar el enlace de la sala' };
  }

  return { ok: true, roomId, meetingLink };
}
