import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { appointment_id, meeting_link } = body;

    if (!appointment_id || !meeting_link) {
      return NextResponse.json(
        { error: "appointment_id y meeting_link son requeridos" },
        { status: 400 }
      );
    }

    // Actualizar la cita
    const { error } = await supabase
      .from("appointments")
      .update({
        status: "confirmed",
        meeting_link,
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointment_id);

    if (error) {
      console.error("Error confirming appointment:", error);
      return NextResponse.json(
        { error: "Error al confirmar la cita" },
        { status: 500 }
      );
    }

    // TODO: Enviar email de confirmación al paciente con el meeting_link

    return NextResponse.json({
      message: "Cita confirmada exitosamente",
    });
  } catch (error) {
    console.error("Error in confirm appointment:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
