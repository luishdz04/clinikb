import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { COOKIE_SESION_DOCTOR, verificarSesionDoctor } from "@/lib/auth/doctorSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Perfil del propio doctor.
 *
 * El id SIEMPRE sale de la cookie firmada, nunca del cuerpo de la petición:
 * si viniera del cliente, cualquiera podría editar la ficha de otro doctor
 * cambiando un campo del JSON.
 */

async function sesionActual() {
  const galletas = await cookies();
  return verificarSesionDoctor(galletas.get(COOKIE_SESION_DOCTOR)?.value);
}

/** Campos que el propio doctor puede editar. */
const CAMPOS_EDITABLES = ["full_name", "phone", "specialty"] as const;

const LARGO_MAXIMO: Record<(typeof CAMPOS_EDITABLES)[number], number> = {
  full_name: 120,
  phone: 30,
  specialty: 80,
};

export async function GET() {
  const sesion = await sesionActual();
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 });
  }

  // Sin `password_hash`: no hay motivo para que salga del servidor.
  const { data, error } = await supabase
    .from("doctors")
    .select("id, email, full_name, phone, specialty, role, status, created_at")
    .eq("id", sesion.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No se encontró tu perfil" }, { status: 404 });
  }

  return NextResponse.json({ perfil: data });
}

export async function PATCH(request: NextRequest) {
  const sesion = await sesionActual();
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 });
  }

  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  // Lista blanca. Sin esto, mandar `{"role":"admin"}` en el JSON sería un
  // ascenso instantáneo; lo mismo con `status`, `email` o `password_hash`.
  const cambios: Record<string, string | null> = {};

  for (const campo of CAMPOS_EDITABLES) {
    if (!(campo in cuerpo)) continue;
    const valor = cuerpo[campo];

    if (valor !== null && typeof valor !== "string") {
      return NextResponse.json({ error: `El campo ${campo} no es válido` }, { status: 400 });
    }

    const limpio = typeof valor === "string" ? valor.trim() : "";

    if (campo === "full_name" && limpio.length < 3) {
      return NextResponse.json({ error: "El nombre es demasiado corto" }, { status: 400 });
    }
    if (limpio.length > LARGO_MAXIMO[campo]) {
      return NextResponse.json({ error: `El campo ${campo} es demasiado largo` }, { status: 400 });
    }

    cambios[campo] = limpio || null;
  }

  if (Object.keys(cambios).length === 0) {
    return NextResponse.json({ error: "No hay nada que actualizar" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("doctors")
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq("id", sesion.id)
    .select("id, email, full_name, phone, specialty, role, status, created_at")
    .single();

  if (error) {
    console.error("Error actualizando el perfil:", error);
    return NextResponse.json({ error: "No se pudo guardar tu perfil" }, { status: 500 });
  }

  return NextResponse.json({ perfil: data, message: "Perfil actualizado" });
}
