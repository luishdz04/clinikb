import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  cancelarEvento,
  crearEventoConMeet,
  googleConfigurado,
  moverEvento,
} from '@/lib/google/calendario';

/**
 * Mantiene el evento de Google Calendar al día con la cita.
 *
 * Se llama SIEMPRE después de guardar los cambios en la base, para que el
 * evento refleje la fecha final. Nunca hace fallar la operación: si Google
 * está caído o sin conectar, la cita queda confirmada igual y el enlace se
 * puede generar después; perder la cita por un problema del calendario sería
 * mucho peor que quedarse sin enlace.
 */

interface Resultado {
  meetUrl: string | null;
  aviso?: string;
}

const soloHora = (t: string) => (t.length === 5 ? `${t}:00` : t);

export async function sincronizarEventoDeCita(appointmentId: string): Promise<Resultado> {
  const supabase = createAdminClient();
  if (!supabase) return { meetUrl: null, aviso: 'Error de configuración del servidor' };

  const { data: cita, error } = await supabase
    .from('appointments')
    .select(
      `id, appointment_date, start_time, end_time, modality, status,
       google_event_id, google_meet_url,
       patient:patients(full_name, email),
       doctor:doctors!appointments_doctor_id_fkey(full_name, email),
       service:services(title)`,
    )
    .eq('id', appointmentId)
    .single<{
      id: string;
      appointment_date: string;
      start_time: string;
      end_time: string | null;
      modality: string | null;
      status: string;
      google_event_id: string | null;
      google_meet_url: string | null;
      patient: { full_name: string; email: string } | null;
      doctor: { full_name: string; email: string | null } | null;
      service: { title: string } | null;
    }>();

  if (error || !cita) return { meetUrl: null, aviso: 'No se pudo leer la cita' };

  // Sólo las citas en línea necesitan sala.
  if (cita.modality !== 'online') return { meetUrl: null };

  if (!googleConfigurado()) {
    return { meetUrl: null, aviso: 'La integración con Google no está configurada' };
  }

  const inicio = soloHora(cita.start_time);
  // Sin hora de fin asumimos una hora, que es la duración habitual; el evento
  // necesita un fin obligatoriamente.
  const fin = cita.end_time
    ? soloHora(cita.end_time)
    : soloHora(`${String(Number(inicio.slice(0, 2)) + 1).padStart(2, '0')}${inicio.slice(2)}`);

  try {
    if (cita.google_event_id) {
      await moverEvento(cita.google_event_id, cita.appointment_date, inicio, fin);
      return { meetUrl: cita.google_meet_url };
    }

    const invitados = [cita.patient?.email, cita.doctor?.email].filter(
      (e): e is string => Boolean(e),
    );

    const evento = await crearEventoConMeet({
      titulo: `${cita.service?.title ?? 'Consulta'} · ${cita.patient?.full_name ?? 'Paciente'}`,
      descripcion: [
        `Consulta en línea de CliniKB.`,
        cita.doctor?.full_name ? `Te atiende: ${cita.doctor.full_name}` : null,
        `Si necesitas reprogramar, avísanos con anticipación.`,
      ]
        .filter(Boolean)
        .join('\n'),
      fecha: cita.appointment_date,
      horaInicio: inicio,
      horaFin: fin,
      invitados,
    });

    await supabase
      .from('appointments')
      .update({
        google_event_id: evento.eventId,
        google_meet_url: evento.meetUrl,
        google_calendar_id: evento.calendarId,
        // `meeting_link` es lo que ya leen las pantallas; se mantiene al día
        // para no tener dos fuentes de verdad del enlace.
        meeting_link: evento.meetUrl,
      })
      .eq('id', appointmentId);

    return { meetUrl: evento.meetUrl };
  } catch (e) {
    console.error('Error sincronizando el evento de Google:', e);
    return {
      meetUrl: cita.google_meet_url,
      aviso: e instanceof Error ? e.message : 'No se pudo crear la sala en Google Meet',
    };
  }
}

/** Borra el evento del calendario cuando la cita se cancela o se rechaza. */
export async function eliminarEventoDeCita(appointmentId: string): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase || !googleConfigurado()) return;

  const { data: cita } = await supabase
    .from('appointments')
    .select('google_event_id')
    .eq('id', appointmentId)
    .maybeSingle();

  if (!cita?.google_event_id) return;

  try {
    await cancelarEvento(cita.google_event_id);
  } catch (e) {
    // Si el evento ya no existe en Google, seguimos limpiando de todos modos.
    console.error('Error eliminando el evento de Google:', e);
  }

  await supabase
    .from('appointments')
    .update({ google_event_id: null, google_meet_url: null, meeting_link: null })
    .eq('id', appointmentId);
}
