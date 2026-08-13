import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { COOKIE_SESION_DOCTOR, verificarSesionDoctor } from "@/lib/auth/doctorSession";

/**
 * Puerta de entrada del panel médico.
 *
 * Antes no había ninguna: las rutas de `/api/admin` respondían a cualquiera y
 * devolvían expedientes completos —enfermedades, objetivos de consulta,
 * estructura familiar— sin pedir credenciales. El panel sólo "protegía"
 * escondiendo la interfaz, y saltarse la interfaz es trivial.
 *
 * El control vive aquí y no en cada endpoint por dos razones: son diecisiete
 * rutas, y así una ruta nueva nace protegida en lugar de nacer abierta.
 */

/** Rutas de `/api/admin` que sí son públicas, si alguna vez hiciera falta. */
const API_ADMIN_PUBLICA: string[] = [];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const esApiAdmin = pathname.startsWith("/api/admin");
  const esPanel = pathname.startsWith("/admin");

  if ((esApiAdmin || esPanel) && !API_ADMIN_PUBLICA.includes(pathname)) {
    const sesion = await verificarSesionDoctor(
      request.cookies.get(COOKIE_SESION_DOCTOR)?.value,
    );

    if (!sesion) {
      // La API responde 401 para que el cliente lo maneje; las páginas
      // redirigen al login, que es lo que espera una persona.
      if (esApiAdmin) {
        return NextResponse.json(
          { error: "No autenticado" },
          { status: 401 },
        );
      }
      const destino = new URL("/login/doctor", request.url);
      return NextResponse.redirect(destino);
    }

    // El catálogo de servicios es sólo para administradores. Se comprueba
    // aquí y no únicamente al pintar el menú, porque ocultar el enlace no
    // impide llamar al endpoint.
    const soloAdmin = pathname.startsWith("/api/services") || pathname === "/admin/servicios";
    if (soloAdmin && sesion.role !== "admin") {
      return esApiAdmin
        ? NextResponse.json({ error: "No autorizado" }, { status: 403 })
        : NextResponse.redirect(new URL("/admin/pacientes", request.url));
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - image files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
