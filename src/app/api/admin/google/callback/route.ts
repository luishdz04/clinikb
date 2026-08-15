import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_SESION_DOCTOR, verificarSesionDoctor } from "@/lib/auth/doctorSession";
import { guardarAutorizacion } from "@/lib/google/calendario";
import { COOKIE_ESTADO_GOOGLE } from "../conectar/route";

export const runtime = "nodejs";

/** Vuelve del consentimiento de Google con un código de un solo uso. */
export async function GET(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  const destino = (resultado: string) =>
    NextResponse.redirect(new URL(`/admin/configuracion?google=${resultado}`, base));

  const galletas = await cookies();
  const sesion = await verificarSesionDoctor(galletas.get(COOKIE_SESION_DOCTOR)?.value);

  if (!sesion || sesion.role !== "admin") {
    return NextResponse.redirect(new URL("/admin", base));
  }

  const parametros = request.nextUrl.searchParams;

  // Si la persona canceló en la pantalla de Google.
  if (parametros.get("error")) return destino("cancelado");

  const codigo = parametros.get("code");
  const estado = parametros.get("state");
  const estadoEsperado = galletas.get(COOKIE_ESTADO_GOOGLE)?.value;

  if (!codigo || !estado || !estadoEsperado || estado !== estadoEsperado) {
    return destino("estado-invalido");
  }

  try {
    const { email } = await guardarAutorizacion(codigo, sesion.id);
    const respuesta = NextResponse.redirect(
      new URL(
        `/admin/configuracion?google=conectado&cuenta=${encodeURIComponent(email ?? "")}`,
        base,
      ),
    );
    // El estado ya se usó: se descarta para que no sirva dos veces.
    respuesta.cookies.delete(COOKIE_ESTADO_GOOGLE);
    return respuesta;
  } catch (e) {
    console.error("Error autorizando Google:", e);
    return destino("error");
  }
}
