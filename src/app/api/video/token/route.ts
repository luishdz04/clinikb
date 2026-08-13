import { NextResponse, type NextRequest } from "next/server";
import { isStreamConfigured, issueUserToken } from "@/lib/stream";
import { resolverParticipante } from "@/lib/auth/participanteCita";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Token de Stream para entrar a una consulta.
 *
 * Antes recibía `userId` en el cuerpo y emitía un token para ese usuario sin
 * comprobar nada: mandando el id de otro paciente se entraba a su consulta.
 * Ahora sólo se recibe la cita; la identidad sale de la sesión y se verifica
 * que esa persona sea el paciente o el doctor de esa cita.
 *
 * La respuesta incluye el usuario resuelto porque el cliente ya no puede (ni
 * debe) decidirlo: el personal médico no está en Supabase Auth, así que la
 * sala no tenía forma de saber quién era y se quedaba cargando para siempre.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isStreamConfigured()) {
      return NextResponse.json(
        { error: "Las videollamadas no están configuradas en este servidor." },
        { status: 503 },
      );
    }

    const { appointmentId } = (await request.json()) as { appointmentId?: string };

    if (!appointmentId) {
      return NextResponse.json({ error: "Falta la cita" }, { status: 400 });
    }

    const resultado = await resolverParticipante(appointmentId);
    if (!resultado.ok) {
      return NextResponse.json({ error: resultado.error }, { status: resultado.status });
    }

    const { streamUserId, nombre, rol } = resultado.participante;
    const token = await issueUserToken(streamUserId, nombre);

    return NextResponse.json({
      token,
      userId: streamUserId,
      userName: nombre,
      role: rol,
      // La clave pública puede ir al cliente; el secreto nunca sale del servidor.
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY,
    });
  } catch (error) {
    console.error("Error generating video token:", error);
    return NextResponse.json(
      { error: "Error al generar el acceso a la videollamada" },
      { status: 500 },
    );
  }
}
