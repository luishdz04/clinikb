import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_SESION_DOCTOR, verificarSesionDoctor } from "@/lib/auth/doctorSession";
import { createAdminClient } from "@/lib/supabase/admin";
import { estadoIntegracion, googleConfigurado } from "@/lib/google/calendario";

export const runtime = "nodejs";

/** Sólo administración toca la cuenta de Google de la clínica. */
async function soloAdmin() {
  const galletas = await cookies();
  const sesion = await verificarSesionDoctor(galletas.get(COOKIE_SESION_DOCTOR)?.value);
  if (!sesion) return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  if (sesion.role !== "admin") {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }
  return { sesion };
}

/** Estado de la conexión, para pintarlo en el panel. */
export async function GET() {
  const { error } = await soloAdmin();
  if (error) return error;

  const estado = await estadoIntegracion();
  return NextResponse.json({ ...estado, configurado: googleConfigurado() });
}

/** Desconecta la cuenta: borra el refresh token guardado. */
export async function DELETE() {
  const { error } = await soloAdmin();
  if (error) return error;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 });
  }

  const { error: errorBorrado } = await supabase
    .from("app_integrations")
    .delete()
    .eq("provider", "google");

  if (errorBorrado) {
    return NextResponse.json({ error: "No se pudo desconectar la cuenta" }, { status: 500 });
  }

  // Las citas ya creadas conservan su enlace; sólo dejan de generarse nuevos
  // hasta que se vuelva a conectar una cuenta.
  return NextResponse.json({ message: "Cuenta de Google desconectada" });
}
