import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { render } from "@react-email/components";
import { sendEmail } from "@/lib/email/send";
import { COOKIE_SESION_DOCTOR, verificarSesionDoctor } from "@/lib/auth/doctorSession";
import { PLANTILLAS } from "@/emails/catalogo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Manda UNA plantilla de prueba al correo indicado.
 *
 * Para revisar el diseño usa la vista previa en `/api/admin/correos`, que no
 * gasta envíos. Esto es sólo para la comprobación final en un cliente real,
 * porque el navegador no hace lo que hacen Gmail y Outlook con el mismo HTML.
 *
 * Se manda de una en una a propósito: mandar el juego completo quemó el
 * límite diario del buzón de la clínica y lo dejó suspendido, lo que además
 * tumba los códigos de verificación del registro.
 */
export async function POST(request: Request) {
  const galletas = await cookies();
  const sesion = await verificarSesionDoctor(galletas.get(COOKIE_SESION_DOCTOR)?.value);

  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (sesion.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let plantilla: unknown;
  let to: unknown;
  try {
    ({ plantilla, to } = await request.json());
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  const elegida = typeof plantilla === "string" ? PLANTILLAS[plantilla] : undefined;
  if (!elegida) {
    return NextResponse.json(
      { error: "Indica una plantilla válida", disponibles: Object.keys(PLANTILLAS) },
      { status: 400 },
    );
  }

  const destino = typeof to === "string" && to ? to : process.env.ADMIN_EMAIL;
  if (!destino) {
    return NextResponse.json({ error: "Indica `to` o configura ADMIN_EMAIL" }, { status: 400 });
  }

  try {
    await sendEmail({
      to: destino,
      subject: `[Prueba] ${elegida.asunto}`,
      html: await render(elegida.elemento()),
    });
    return NextResponse.json({ ok: true, message: `Enviada a ${destino}` });
  } catch (error) {
    console.error("Error enviando la plantilla de prueba:", error);
    return NextResponse.json(
      {
        error: "No se pudo enviar",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
