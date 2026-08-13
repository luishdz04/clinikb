import { NextResponse, type NextRequest } from "next/server";
import { resolverParticipante } from "@/lib/auth/participanteCita";
import { crearSalaDeConsulta } from "@/lib/video/sala";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Crea (o recupera) la sala de una consulta.
 *
 * `createdBy` llegaba en el cuerpo y no se verificaba contra nada, así que
 * cualquiera podía crear salas para citas ajenas. Ahora el creador se deriva
 * de la sesión y sólo puede hacerlo quien participa en esa cita.
 */
export async function POST(request: NextRequest) {
  try {
    const { appointmentId } = (await request.json()) as { appointmentId?: string };

    if (!appointmentId) {
      return NextResponse.json({ error: "appointmentId es requerido" }, { status: 400 });
    }

    const quien = await resolverParticipante(appointmentId);
    if (!quien.ok) {
      return NextResponse.json({ error: quien.error }, { status: quien.status });
    }

    const sala = await crearSalaDeConsulta(appointmentId, quien.participante.streamUserId);
    if (!sala.ok) {
      return NextResponse.json({ error: sala.error }, { status: sala.status });
    }

    return NextResponse.json({
      message: "Sala de videollamada lista",
      roomId: sala.roomId,
      meetingLink: sala.meetingLink,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Error al crear la sala de videollamada" },
      { status: 500 },
    );
  }
}
