import { NextResponse } from "next/server";
import { COOKIE_SESION_DOCTOR } from "@/lib/auth/doctorSession";

export const dynamic = "force-dynamic";

/**
 * Cierre de sesión del panel médico.
 *
 * Hace falta un endpoint porque la cookie es httpOnly: el navegador no puede
 * borrarla por su cuenta. Antes el "cerrar sesión" sólo limpiaba localStorage,
 * lo que dejaría la sesión real abierta en el servidor.
 */
export async function POST() {
  const respuesta = NextResponse.json({ success: true });
  respuesta.cookies.set(COOKIE_SESION_DOCTOR, "", { path: "/", maxAge: 0 });
  return respuesta;
}
