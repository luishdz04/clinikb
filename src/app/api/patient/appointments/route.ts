import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: "Paciente no encontrado" },
        { status: 404 }
      );
    }

    // Obtener todas las citas del paciente con servicios
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        *,
        service:services (
          id,
          title,
          category,
          duration_minutes
        )
      `)
      .eq("patient_id", patient.id)
      .order("appointment_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
      return NextResponse.json(
        { error: "Error al cargar citas" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      appointments: appointments || [],
      patient_id: patient.id,
    });
  } catch (error) {
    console.error("Error in GET /api/patient/appointments:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
