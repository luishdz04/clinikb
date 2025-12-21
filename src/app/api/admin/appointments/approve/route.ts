import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";
import { getAppointmentApprovedEmailHTML } from "@/lib/email/approval-emails";

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "El ID de la cita es requerido" },
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
        service:services(title)
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

    // Si es cita online, crear sala de videollamada
    let meetingLink = appointment.meeting_link;
    if (appointment.modality === 'online' && !meetingLink) {
      try {
        const roomResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/video/create-room`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: appointmentId,
            createdBy: appointment.doctor_id,
          }),
        });

        if (roomResponse.ok) {
          const roomData = await roomResponse.json();
          meetingLink = roomData.meetingLink;
        }
      } catch (error) {
        console.error("Error creating video room:", error);
        // Continuar sin sala, se puede crear después
      }
    }

    // Actualizar status a confirmed
    const { error: updateError } = await supabase
      .from("appointments")
      .update({ status: "confirmed" })
      .eq("id", appointmentId);

    if (updateError) {
      console.error("Error updating appointment:", updateError);
      return NextResponse.json(
        { error: "No se pudo actualizar la cita" },
        { status: 500 }
      );
    }

    // Enviar email al paciente
    try {
      const emailHTML = getAppointmentApprovedEmailHTML(
        appointment.patient.full_name,
        {
          service: appointment.service.title,
          date: new Date(appointment.appointment_date).toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: appointment.start_time,
          doctor: appointment.doctor.full_name,
          modality: appointment.modality || "Presencial",
        }
      );

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: appointment.patient.email,
        subject: "✅ Tu cita ha sido confirmada - CliniKB",
        html: emailHTML,
      });

      console.log("Email de aprobación enviado a:", appointment.patient.email);
    } catch (emailError) {
      console.error("Error sending approval email:", emailError);
      // No retornamos error porque la cita ya fue aprobada
    }

    return NextResponse.json({
      message: "Cita aprobada exitosamente",
      appointment,
    });
  } catch (error) {
    console.error("Error in approve appointment:", error);
    return NextResponse.json(
      { error: "Error al aprobar la cita" },
      { status: 500 }
    );
  }
}
