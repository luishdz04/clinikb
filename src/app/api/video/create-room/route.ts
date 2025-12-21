import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createVideoCall } from "@/lib/stream";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, createdBy } = await request.json();

    if (!appointmentId || !createdBy) {
      return NextResponse.json(
        { error: "appointmentId y createdBy son requeridos" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    // Verificar que la cita existe
    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("id, modality")
      .eq("id", appointmentId)
      .single();

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la cita es online
    if (appointment.modality !== "online") {
      return NextResponse.json(
        { error: "Esta cita no es de modalidad online" },
        { status: 400 }
      );
    }

    // Generar ID único para la sala
    const roomId = nanoid(12);
    
    // Crear sala de videollamada en Stream
    await createVideoCall(roomId, createdBy);

    // Guardar el link de la sala en la cita
    const meetingLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/consulta/${appointmentId}/sala?room=${roomId}`;
    
    const { error: updateError } = await supabase
      .from("appointments")
      .update({ meeting_link: meetingLink })
      .eq("id", appointmentId);

    if (updateError) {
      console.error("Error updating appointment:", updateError);
      return NextResponse.json(
        { error: "Error al guardar el link de la sala" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Sala de videollamada creada exitosamente",
      roomId,
      meetingLink,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Error al crear sala de videollamada" },
      { status: 500 }
    );
  }
}
