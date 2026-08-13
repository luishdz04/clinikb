import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;
    const supabase = await createClient();

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Tener sesión no basta: hay que comprobar que la cita sea de quien
    // pregunta. Antes se filtraba sólo por id, así que cualquier paciente
    // podía leer la cita de otro con sólo cambiar el identificador de la URL.
    const { data: paciente } = await supabase
      .from("patients")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!paciente) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { data: appointment, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        start_time,
        end_time,
        modality,
        meeting_link,
        service:services(title),
        doctor:doctors!appointments_doctor_id_fkey(full_name),
        patient:patients(full_name)
      `)
      .eq("id", appointmentId)
      .eq("patient_id", paciente.id)
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Cita no encontrada", details: error.message },
        { status: 404 }
      );
    }

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Error al obtener la cita" },
      { status: 500 }
    );
  }
}
