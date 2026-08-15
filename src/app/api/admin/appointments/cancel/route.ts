import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { eliminarEventoDeCita } from "@/lib/google/citas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointment_id, cancellation_reason } = body;

    const supabase = createAdminClient();

    // Los doctores no viven en Supabase Auth, así que el cliente anónimo no
    // pasa las políticas de la tabla: aquí hace falta el cliente de servicio.
    if (!supabase) {
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

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

    // Quita el evento del calendario y avisa a los invitados.
    await eliminarEventoDeCita(appointment_id);

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
