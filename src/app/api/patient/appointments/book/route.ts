import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/nodemailer";
import { getAppointmentConfirmationEmailHTML, getAdminAppointmentNotificationEmailHTML } from "@/lib/email/appointment-emails";
import dayjs from "dayjs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Obtener usuario autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener paciente por user_id
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, email, full_name")
      .eq("user_id", user.id)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: "Paciente no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    // Sólo el servicio y el horario: la fecha, la hora y el doctor salen del
    // slot, así que pedirlos al cliente sólo daba margen a contradecirlo.
    const { service_id, slot_id, patient_notes } = body;

    if (!service_id || !slot_id) {
      return NextResponse.json(
        { error: "Falta el servicio o el horario" },
        { status: 400 }
      );
    }

    // Verificar que el slot esté disponible
    const { data: slot, error: slotError } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("id", slot_id)
      .eq("is_available", true)
      .single();

    if (slotError || !slot) {
      return NextResponse.json(
        { error: "El horario seleccionado ya no está disponible" },
        { status: 400 }
      );
    }

    // La cita se arma con los datos del SLOT, no con los del cuerpo. Antes se
    // insertaban la fecha, la hora y el doctor que mandaba el cliente aunque
    // el slot ya los definía: bastaba enviar otros valores para reservar en un
    // horario que el doctor nunca abrió, o a nombre de otro doctor.
    if (slot.service_id !== service_id) {
      return NextResponse.json(
        { error: "Ese horario no corresponde al servicio elegido" },
        { status: 400 }
      );
    }

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        patient_id: patient.id,
        service_id: slot.service_id,
        doctor_id: slot.doctor_id,
        appointment_date: slot.slot_date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        slot_id: slot_id,
        status: "pending",
        patient_notes: patient_notes || null,
      })
      .select()
      .single();

    if (appointmentError) {
      console.error("Error creating appointment:", appointmentError);
      return NextResponse.json(
        { error: "Error al crear la cita" },
        { status: 500 }
      );
    }

    // Marcar el slot como no disponible
    const { error: updateSlotError } = await supabase
      .from("availability_slots")
      .update({ is_available: false })
      .eq("id", slot_id);

    if (updateSlotError) {
      console.error("Error updating slot:", updateSlotError);
      // No falla la operación, pero se registra el error
    }

    // Obtener información del servicio y doctor para el email
    const { data: serviceData } = await supabase
      .from("services")
      .select("title")
      .eq("id", service_id)
      .single();

    const { data: doctorData } = await supabase
      .from("doctors")
      .select("full_name")
      .eq("id", slot.doctor_id)
      .single();

    // Enviar email de reserva confirmada al paciente
    try {
      // Formatear las horas correctamente
      const formattedStartTime = slot.start_time.substring(0, 5);
      const formattedEndTime = slot.end_time.substring(0, 5);
      
      await sendEmail({
        to: patient.email,
        subject: "Solicitud de cita recibida - CliniKB",
        html: getAppointmentConfirmationEmailHTML(patient.full_name || "Paciente", {
          service: serviceData?.title || "Consulta",
          date: dayjs(slot.slot_date).format("DD/MM/YYYY"),
          time: `${formattedStartTime} - ${formattedEndTime}`,
          doctor: doctorData?.full_name || "Profesional de CliniKB",
          modality: slot.modality === 'online' ? 'En línea (videollamada)' : 'Presencial',
        }),
      });
      console.log("Confirmation email sent to:", patient.email, "- Name:", patient.full_name);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // No falla la operación si el email falla
    }

    // Enviar notificación al admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const formattedStartTime = slot.start_time.substring(0, 5);
        const formattedEndTime = slot.end_time.substring(0, 5);
        const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const dashboardUrl = `${origin}/admin/citas`;

        await sendEmail({
          to: adminEmail,
          subject: `Nueva cita reservada - ${patient.full_name}`,
          html: getAdminAppointmentNotificationEmailHTML(
            patient.full_name || "Paciente",
            patient.email,
            {
              service: serviceData?.title || "Consulta",
              date: dayjs(slot.slot_date).format("DD/MM/YYYY"),
              time: `${formattedStartTime} - ${formattedEndTime}`,
              doctor: doctorData?.full_name || "Profesional de CliniKB",
              modality: slot.modality === 'online' ? 'En línea (videollamada)' : 'Presencial',
              notes: undefined,
            },
            dashboardUrl
          ),
        });
        console.log("Admin notification sent to:", adminEmail);
      }
    } catch (emailError) {
      console.error("Error sending admin notification:", emailError);
      // No falla la operación si el email falla
    }

    return NextResponse.json({
      success: true,
      appointment,
      message: "Solicitud enviada. El doctor confirmará tu cita pronto.",
    });
  } catch (error) {
    console.error("Error in POST /api/patient/appointments/book:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
