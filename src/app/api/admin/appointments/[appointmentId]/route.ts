import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;
    const supabase = createAdminClient();

    if (!supabase) {
      console.error("Failed to create admin client");
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
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
