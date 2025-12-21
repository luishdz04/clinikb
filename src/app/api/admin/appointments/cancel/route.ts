import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { appointment_id, cancellation_reason } = body;

    if (!appointment_id || !cancellation_reason) {
      return NextResponse.json(
        { error: "appointment_id y cancellation_reason son requeridos" },
        { status: 400 }
      );
    }

    // Obtener información de la cita para saber quién la cancela
    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("doctor_id")
      .eq("id", appointment_id)
      .single();

    if (fetchError || !appointment) {
      console.error("Error fetching appointment:", fetchError);
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar la cita
    const { error } = await supabase
      .from("appointments")
      .update({
        status: "cancelled",
        cancellation_reason,
        cancelled_by: appointment.doctor_id,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointment_id);

    if (error) {
      console.error("Error cancelling appointment:", error);
      return NextResponse.json(
        { error: "Error al cancelar la cita" },
        { status: 500 }
      );
    }

    // TODO: Enviar email al paciente notificando la cancelación

    return NextResponse.json({
      message: "Cita cancelada exitosamente",
    });
  } catch (error) {
    console.error("Error in cancel appointment:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
