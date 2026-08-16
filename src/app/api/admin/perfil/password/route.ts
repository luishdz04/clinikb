import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  COOKIE_SESION_DOCTOR,
  crearSesionDoctor,
  opcionesCookieSesion,
  verificarSesionDoctor,
} from "@/lib/auth/doctorSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cambio de contraseña del propio doctor.
 *
 * Pide la contraseña actual aunque la sesión ya esté abierta. No es un
 * trámite: si alguien deja el consultorio con la sesión iniciada, sin este
 * paso podría cambiar la contraseña y dejar fuera a la dueña de la cuenta.
 */

/** Mismo coste que se usó al crear las cuentas. */
const COSTE_BCRYPT = 10;
const LARGO_MINIMO = 8;

export async function POST(request: NextRequest) {
  const galletas = await cookies();
  const sesion = await verificarSesionDoctor(galletas.get(COOKIE_SESION_DOCTOR)?.value);
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 });
  }

  let actual: unknown;
  let nueva: unknown;
  try {
    ({ actual, nueva } = await request.json());
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  if (typeof actual !== "string" || typeof nueva !== "string" || !actual || !nueva) {
    return NextResponse.json(
      { error: "Escribe tu contraseña actual y la nueva" },
      { status: 400 },
    );
  }

  if (nueva.length < LARGO_MINIMO) {
    return NextResponse.json(
      { error: `La nueva contraseña debe tener al menos ${LARGO_MINIMO} caracteres` },
      { status: 400 },
    );
  }

  if (nueva === actual) {
    return NextResponse.json(
      { error: "La nueva contraseña debe ser distinta de la actual" },
      { status: 400 },
    );
  }

  const { data: doctor, error } = await supabase
    .from("doctors")
    .select("id, role, password_hash, status, _deleted")
    .eq("id", sesion.id)
    .single();

  if (error || !doctor) {
    return NextResponse.json({ error: "No se encontró tu cuenta" }, { status: 404 });
  }

  // Una cuenta desactivada no debería poder cambiar nada, aunque conserve una
  // cookie válida de antes de la baja.
  if (doctor._deleted || doctor.status !== "active") {
    return NextResponse.json({ error: "Cuenta inactiva" }, { status: 403 });
  }

  if (!(await bcrypt.compare(actual, doctor.password_hash))) {
    return NextResponse.json({ error: "La contraseña actual no es correcta" }, { status: 401 });
  }

  const { error: errorGuardado } = await supabase
    .from("doctors")
    .update({
      password_hash: await bcrypt.hash(nueva, COSTE_BCRYPT),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sesion.id);

  if (errorGuardado) {
    console.error("Error cambiando la contraseña:", errorGuardado);
    return NextResponse.json({ error: "No se pudo cambiar la contraseña" }, { status: 500 });
  }

  // La cookie se renueva para que a quien acaba de cambiarla no se le cierre
  // la sesión a media jornada.
  //
  // Aviso honesto: el token es autónomo —se verifica con una firma, sin
  // consultar la base— así que las sesiones abiertas en OTROS dispositivos
  // siguen siendo válidas hasta que venzan (8 horas). Invalidarlas al
  // instante exigiría consultar la base en cada petición del panel.
  const respuesta = NextResponse.json({ message: "Contraseña actualizada" });
  respuesta.cookies.set(
    COOKIE_SESION_DOCTOR,
    await crearSesionDoctor(doctor.id, doctor.role),
    opcionesCookieSesion(process.env.NODE_ENV === "production"),
  );

  return respuesta;
}
