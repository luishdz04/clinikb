import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { correoCitaRechazada, fechaLegible, horaLegible } from "@/lib/email/plantillas";
import { eliminarEventoDeCita } from "@/lib/google/citas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointment_id, rejection_reason } = body;

    if (!appointment_id || !rejection_reason) {
      return NextResponse.json(
        { error: "appointment_id y rejection_reason son requeridos" },
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

    // Obtener información de la cita antes de rechazarla
    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select(`
        *,
        patient:patients(full_name, email),
        service:services(title)
      `)
      .eq("id", appointment_id)
      .single();

    if (fetchError || !appointment) {
      console.error("Error fetching appointment:", fetchError);
      return NextResponse.json(
        { error: "No se pudo encontrar la cita" },
        { status: 404 }
      );
    }

    // Actualizar la cita
    const { error } = await supabase
      .from("appointments")
      .update({
        status: "rejected",
        rejection_reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointment_id);

    if (error) {
      console.error("Error rejecting appointment:", error);
      return NextResponse.json(
        { error: "Error al rechazar la cita" },
        { status: 500 }
      );
    }

    // Si ya se había generado la sala, se elimina el evento del calendario.
    await eliminarEventoDeCita(appointment_id);

    // Enviar email al paciente notificando el rechazo
    try {
      const emailHTML = await correoCitaRechazada({
        nombrePaciente: appointment.patient.full_name,
        servicio: appointment.service.title,
        fecha: fechaLegible(appointment.appointment_date),
        hora: horaLegible(appointment.start_time),
        motivo: rejection_reason,
      });

      await sendEmail({
        to: appointment.patient.email,
        subject: "Sobre tu solicitud de cita · CliniKB",
        html: emailHTML,
      });

      console.log("Email de rechazo enviado a:", appointment.patient.email);
    } catch (emailError) {
      console.error("Error sending rejection email:", emailError);
      // No retornamos error porque la cita ya fue rechazada
    }

    return NextResponse.json({
      message: "Cita rechazada exitosamente",
    });
  } catch (error) {
    console.error("Error in reject appointment:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
