import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/nodemailer";
import { getAppointmentRequestEmailHTML, getAdminAppointmentNotificationEmailHTML } from "@/lib/email/appointment-emails";
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
      .select("id, email, full_name, attention_type")
      .eq("user_id", user.id)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: "Paciente no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      service_id,
      modality,
      preferred_date,
      preferred_time,
      patient_notes,
    } = body;

    // Validar campos requeridos
    if (!service_id || !modality) {
      return NextResponse.json(
        { error: "El servicio y la modalidad son requeridos" },
        { status: 400 }
      );
    }

    // Obtener servicio
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*, doctor_services!inner(doctor_id)")
      .eq("id", service_id)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    // Obtener el primer doctor que ofrece este servicio
    // (en producción, podrías permitir que el paciente elija)
    const doctorService = service.doctor_services[0];
    if (!doctorService) {
      return NextResponse.json(
        { error: "No hay doctores disponibles para este servicio" },
        { status: 404 }
      );
    }

    // Preparar datos de la cita
    const appointmentData: any = {
      patient_id: patient.id,
      service_id,
      doctor_id: doctorService.doctor_id,
      modality: modality, // Modalidad preferida del paciente
      status: "pending", // Solicitud pendiente de aprobación
      patient_notes: patient_notes || null,
      slot_id: null, // NULL indica que es una solicitud, no una reserva de slot
    };

    // Si se especificó fecha y hora preferida
    if (preferred_date) {
      appointmentData.appointment_date = preferred_date;
      
      if (preferred_time) {
        // Asumir duración del servicio
        const duration = service.duration_minutes || 60;
        const [hours, minutes] = preferred_time.split(":");
        const startTime = `${hours}:${minutes}:00`;
        const endHour = parseInt(hours) + Math.floor(duration / 60);
        const endMinute = parseInt(minutes) + (duration % 60);
        const endTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}:00`;
        
        appointmentData.start_time = startTime;
        appointmentData.end_time = endTime;
      } else {
        // Valores por defecto si no se especifica hora
        appointmentData.start_time = "09:00:00";
        const duration = service.duration_minutes || 60;
        const endHour = 9 + Math.floor(duration / 60);
        const endMinute = duration % 60;
        appointmentData.end_time = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}:00`;
      }
    } else {
      // Si no hay fecha preferida, usar fecha tentativa (mañana)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      appointmentData.appointment_date = tomorrow.toISOString().split("T")[0];
      appointmentData.start_time = "09:00:00";
      const duration = service.duration_minutes || 60;
      const endHour = 9 + Math.floor(duration / 60);
      const endMinute = duration % 60;
      appointmentData.end_time = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}:00`;
    }

    // Crear la solicitud de cita
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert(appointmentData)
      .select()
      .single();

    if (appointmentError) {
      console.error("Error creating appointment request:", appointmentError);
      return NextResponse.json(
        { error: "Error al crear la solicitud de cita" },
        { status: 500 }
      );
    }

    // Enviar email de confirmación de solicitud al paciente
    try {
      await sendEmail({
        to: patient.email,
        subject: "📝 Solicitud de Cita Recibida - CliniKB",
        html: getAppointmentRequestEmailHTML(patient.full_name || "Paciente", {
          service: service.title,
          modality: modality === 'online' ? '💻 En línea (videollamada)' : '🏥 Presencial',
          preferredDate: preferred_date ? dayjs(preferred_date).format("DD/MM/YYYY") : undefined,
          preferredTime: preferred_time || undefined,
          notes: patient_notes || undefined,
        }),
      });
      console.log("Request confirmation email sent to:", patient.email);
    } catch (emailError) {
      console.error("Error sending request confirmation email:", emailError);
      // No falla la operación si el email falla
    }

    // Enviar notificación al admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      if (adminEmail) {
        const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const dashboardUrl = `${origin}/admin/dashboard`;

        // Obtener nombre del doctor
        const { data: doctorData } = await supabase
          .from("doctors")
          .select("full_name")
          .eq("id", doctorService.doctor_id)
          .single();

        await sendEmail({
          to: adminEmail,
          subject: `🔔 Nueva Solicitud de Cita - ${patient.full_name}`,
          html: getAdminAppointmentNotificationEmailHTML(
            patient.full_name || "Paciente",
            patient.email,
            {
              service: service.title,
              date: preferred_date ? dayjs(preferred_date).format("DD/MM/YYYY") : "Por definir",
              time: preferred_time || "Por definir",
              doctor: doctorData?.full_name || "Por asignar",
              modality: modality === 'online' ? '💻 En línea (videollamada)' : '🏥 Presencial',
              notes: patient_notes,
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
      message: "Solicitud enviada exitosamente. El doctor te contactará pronto para confirmar.",
    });
  } catch (error) {
    console.error("Error in POST /api/patient/appointments/request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
