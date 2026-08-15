import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { COOKIE_SESION_DOCTOR, verificarSesionDoctor } from "@/lib/auth/doctorSession";
import { googleConfigurado, urlDeConsentimiento } from "@/lib/google/calendario";

export const runtime = "nodejs";

export const COOKIE_ESTADO_GOOGLE = "clinikb_google_state";

/**
 * Manda a la persona a la pantalla de consentimiento de Google.
 *
 * Es una navegación del navegador, no un fetch: por eso responde con un
 * redirect y no con JSON.
 */
export async function GET() {
  const galletas = await cookies();
  const sesion = await verificarSesionDoctor(galletas.get(COOKIE_SESION_DOCTOR)?.value);

  if (!sesion || sesion.role !== "admin") {
    return NextResponse.redirect(new URL("/admin", process.env.NEXT_PUBLIC_SITE_URL));
  }

  if (!googleConfigurado()) {
    return NextResponse.redirect(
      new URL("/admin/configuracion?google=sin-configurar", process.env.NEXT_PUBLIC_SITE_URL),
    );
  }

  // `state` viaja hasta Google y regresa igual: comparándolo con la cookie
  // sabemos que la vuelta corresponde a una autorización que iniciamos aquí.
  const estado = randomUUID();
  const respuesta = NextResponse.redirect(`${urlDeConsentimiento()}&state=${estado}`);

  respuesta.cookies.set(COOKIE_ESTADO_GOOGLE, estado, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return respuesta;
}
