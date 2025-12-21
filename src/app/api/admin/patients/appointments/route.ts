import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get("patient_id");

    if (!patientId) {
      return NextResponse.json(
        { error: "patient_id es requerido" },
        { status: 400 }
      );
    }

    // Obtener las citas del paciente con información del servicio
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        *,
        service:services(id, key, title, category, duration_minutes)
      `)
      .eq("patient_id", patientId)
      .order("appointment_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching patient appointments:", error);
      return NextResponse.json(
        { error: "Error al obtener las citas del paciente" },
        { status: 500 }
      );
    }

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error in patient appointments GET:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
