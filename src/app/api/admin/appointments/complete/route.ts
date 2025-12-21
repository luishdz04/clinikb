import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { appointment_id, doctor_notes } = body;

    if (!appointment_id) {
      return NextResponse.json(
        { error: "appointment_id es requerido" },
        { status: 400 }
      );
    }

    // Actualizar la cita
    const { error } = await supabase
      .from("appointments")
      .update({
        status: "completed",
        doctor_notes: doctor_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointment_id);

    if (error) {
      console.error("Error completing appointment:", error);
      return NextResponse.json(
        { error: "Error al completar la cita" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Cita completada exitosamente",
    });
  } catch (error) {
    console.error("Error in complete appointment:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
