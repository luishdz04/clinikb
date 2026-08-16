import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { render } from "@react-email/components";
import { COOKIE_SESION_DOCTOR, verificarSesionDoctor } from "@/lib/auth/doctorSession";
import { PLANTILLAS } from "@/emails/catalogo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vista previa de las plantillas de correo, en el navegador y SIN ENVIAR.
 *
 * Existe porque revisar el diseño mandando correos de verdad quemó el límite
 * diario del buzón de la clínica y lo dejó suspendido —lo que además tumba
 * los códigos de verificación del registro—. Para ver cómo quedó un cambio de
 * color no hace falta gastar un envío.
 *
 * Sigue faltando una prueba real antes de dar algo por bueno: el navegador no
 * hace lo que hace Gmail ni Outlook con el mismo HTML. Pero eso es una vez al
 * final, no en cada iteración.
 */
export async function GET(request: Request) {
  const galletas = await cookies();
  const sesion = await verificarSesionDoctor(galletas.get(COOKIE_SESION_DOCTOR)?.value);

  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (sesion.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const nombre = new URL(request.url).searchParams.get("plantilla");

  if (!nombre) {
    const enlaces = Object.entries(PLANTILLAS)
      .map(
        ([clave, p]) =>
          `<li><a href="?plantilla=${clave}">${clave}</a> <span>${p.asunto}</span></li>`,
      )
      .join("");

    return new NextResponse(
      `<!doctype html><html lang="es"><head><meta charset="utf-8">
       <title>Plantillas de correo · CliniKB</title>
       <style>
         body{font-family:system-ui,sans-serif;max-width:640px;margin:48px auto;padding:0 24px;color:#060807}
         h1{font-size:20px} li{margin:10px 0} span{color:#7a8585;font-size:13px}
         a{color:#367c84}
       </style></head>
       <body><h1>Plantillas de correo</h1>
       <p>Vista previa. No envía nada.</p>
       <ul>${enlaces}</ul></body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const plantilla = PLANTILLAS[nombre];
  if (!plantilla) {
    return NextResponse.json(
      { error: `No existe la plantilla "${nombre}"`, disponibles: Object.keys(PLANTILLAS) },
      { status: 404 },
    );
  }

  const html = await render(plantilla.elemento());
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
