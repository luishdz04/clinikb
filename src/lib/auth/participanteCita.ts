import 'server-only';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { COOKIE_SESION_DOCTOR, verificarSesionDoctor } from '@/lib/auth/doctorSession';

/**
 * Quién está pidiendo entrar a una consulta, y si le corresponde.
 *
 * Los endpoints de video recibían `userId` en el cuerpo y emitían un token
 * para ese usuario sin comprobar nada: bastaba mandar el id de otro paciente
 * para entrar a su consulta. Aquí la identidad se deriva de la sesión, nunca
 * de lo que manda el cliente.
 *
 * Hay dos tipos de sesión porque el personal médico no vive en Supabase Auth:
 * los pacientes traen cookie de Supabase, los doctores la cookie firmada del
 * panel.
 */

export interface Participante {
  /** Id de usuario en Stream. Lleva prefijo porque pacientes y doctores
   *  viven en tablas distintas y sus UUID podrían coincidir. */
  streamUserId: string;
  nombre: string;
  rol: 'paciente' | 'doctor';
}

export type ResultadoParticipante =
  | { ok: true; participante: Participante }
  | { ok: false; status: 401 | 403 | 404 | 500; error: string };

export async function resolverParticipante(
  appointmentId: string,
): Promise<ResultadoParticipante> {
  if (!appointmentId) {
    return { ok: false, status: 400 as never, error: 'Falta la cita' };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, status: 500, error: 'Error de configuración del servidor' };
  }

  // Primero quién llama, después la cita. Al revés, un desconocido podía
  // distinguir "la cita no existe" de "no es tuya" y con eso ir descubriendo
  // qué identificadores son válidos.
  const galletas = await cookies();
  const sesionDoctor = await verificarSesionDoctor(
    galletas.get(COOKIE_SESION_DOCTOR)?.value,
  );

  let usuarioSupabase: { id: string } | null = null;
  if (!sesionDoctor) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    usuarioSupabase = user ? { id: user.id } : null;
  }

  if (!sesionDoctor && !usuarioSupabase) {
    return { ok: false, status: 401, error: 'No autenticado' };
  }

  const { data: cita } = await admin
    .from('appointments')
    .select('id, patient_id, doctor_id, status')
    .eq('id', appointmentId)
    .maybeSingle();

  if (!cita) {
    return { ok: false, status: 404, error: 'La cita no existe' };
  }

  // Una cita cancelada o rechazada no tiene por qué abrir una sala.
  if (['cancelled', 'rejected'].includes(cita.status)) {
    return { ok: false, status: 403, error: 'Esta cita ya no está activa' };
  }

  // 1) ¿Es el doctor de la cita?
  if (sesionDoctor) {
    if (sesionDoctor.id !== cita.doctor_id) {
      return { ok: false, status: 403, error: 'Esta consulta no es tuya' };
    }
    const { data: doctor } = await admin
      .from('doctors')
      .select('full_name')
      .eq('id', sesionDoctor.id)
      .maybeSingle();

    return {
      ok: true,
      participante: {
        streamUserId: `doctor-${sesionDoctor.id}`,
        nombre: doctor?.full_name?.trim() || 'Doctor',
        rol: 'doctor',
      },
    };
  }

  // 2) ¿Es el paciente de la cita? Su identidad sale de la sesión de Supabase.
  const { data: paciente } = await admin
    .from('patients')
    .select('id, full_name, status')
    .eq('user_id', usuarioSupabase!.id)
    .maybeSingle();

  if (!paciente || paciente.id !== cita.patient_id) {
    return { ok: false, status: 403, error: 'Esta consulta no es tuya' };
  }

  if (paciente.status !== 'approved') {
    return { ok: false, status: 403, error: 'Tu cuenta no está activa' };
  }

  return {
    ok: true,
    participante: {
      streamUserId: `paciente-${paciente.id}`,
      nombre: paciente.full_name?.trim() || 'Paciente',
      rol: 'paciente',
    },
  };
}
