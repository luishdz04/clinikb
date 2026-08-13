import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { getAppointmentApprovedEmailHTML } from "@/lib/email/approval-emails";
import { crearSalaDeConsulta } from "@/lib/video/sala";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, newDate, newTime } = await request.json();

    if (!appointmentId || !newDate || !newTime) {
      return NextResponse.json(
        { error: "El ID de la cita, fecha y hora son requeridos" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    // Obtener información de la cita
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(`
        *,
        patient:patients(full_name, email),
        doctor:doctors!appointments_doctor_id_fkey(full_name),
        service:services(title, duration_minutes)
      `)
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      console.error("Error fetching appointment:", appointmentError);
      return NextResponse.json(
        { error: "No se pudo encontrar la cita" },
        { status: 404 }
      );
    }

    // Calcular end_time basado en la duración del servicio
    const durationMinutes = appointment.service.duration_minutes || 60;
    const [hours, minutes] = newTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const calculatedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    // Si es cita online, crear sala de videollamada si no existe
    let meetingLink = appointment.meeting_link;
    if (appointment.modality === 'online' && !meetingLink) {
      try {
        // Llamada directa, no por HTTP contra la propia app: aquí ya estamos
        // en el servidor con permisos, y una petición interna no lleva
        // cookies, así que fallaría la autenticación del endpoint.
        const sala = await crearSalaDeConsulta(
          appointmentId,
          `doctor-${appointment.doctor_id}`,
        );
        if (sala.ok) {
          meetingLink = sala.meetingLink;
        } else {
          console.error("No se pudo crear la sala:", sala.error);
        }
      } catch (error) {
        console.error("Error creating video room:", error);
        // Continuar sin sala, se puede crear después
      }
    }

    // Actualizar fecha, hora y status a confirmed
    const { error: updateError } = await supabase
      .from("appointments")
      .update({ 
        appointment_date: newDate,
        start_time: newTime,
        end_time: calculatedEndTime,
        status: "confirmed" 
      })
      .eq("id", appointmentId);

    if (updateError) {
      console.error("Error updating appointment:", updateError);
      return NextResponse.json(
        { error: "No se pudo actualizar la cita" },
        { status: 500 }
      );
    }

    // Enviar email al paciente con la nueva fecha
    try {
      const emailHTML = getAppointmentApprovedEmailHTML(
        appointment.patient.full_name,
        {
          service: appointment.service.title,
          date: new Date(newDate).toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: newTime,
          doctor: appointment.doctor.full_name,
          modality: appointment.modality || "Presencial",
        }
      );

      await sendEmail({
        to: appointment.patient.email,
        subject: "✅ Tu cita ha sido confirmada (con nueva fecha) - CliniKB",
        html: emailHTML,
      });

      console.log("Email de aprobación con nueva fecha enviado a:", appointment.patient.email);
    } catch (emailError) {
      console.error("Error sending approval email:", emailError);
      // No retornamos error porque la cita ya fue reprogramada
    }

    return NextResponse.json({
      message: "Cita reprogramada y aprobada exitosamente",
      appointment: {
        ...appointment,
        appointment_date: newDate,
        start_time: newTime,
        status: "confirmed"
      },
    });
  } catch (error) {
    console.error("Error in reschedule appointment:", error);
    return NextResponse.json(
      { error: "Error al reprogramar la cita" },
      { status: 500 }
    );
  }
}
