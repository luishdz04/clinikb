import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const DOCTOR_GATE_COOKIE = "clinikb_doctor_gate";

/** Duración del permiso de acceso al portal médico. */
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas

function getGatePassword(): string | null {
  const value = process.env.DOCTOR_PORTAL_PASSWORD;
  return value && value.length > 0 ? value : null;
}

/**
 * Token que se guarda en la cookie.
 *
 * Es un HMAC de la contraseña, no la contraseña: así la cookie no puede
 * fabricarse a mano sin conocer el valor de `DOCTOR_PORTAL_PASSWORD`.
 */
function buildToken(password: string): string {
  return createHmac("sha256", password).update("clinikb-doctor-gate").digest("hex");
}

/** Comparación en tiempo constante, para no filtrar información por timing. */
function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function isGatePasswordValid(candidate: string): boolean {
  const password = getGatePassword();
  if (!password) return false;
  return safeEquals(candidate, password);
}

export function buildGateCookie() {
  const password = getGatePassword();
  if (!password) return null;

  return {
    name: DOCTOR_GATE_COOKIE,
    value: buildToken(password),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

/** Indica si la petición actual ya pasó el portón. */
export async function hasDoctorGateAccess(): Promise<boolean> {
  const password = getGatePassword();
  // Sin contraseña configurada no se puede validar nada: se deniega el acceso
  // en vez de dejar el portal abierto por omisión.
  if (!password) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(DOCTOR_GATE_COOKIE)?.value;
  if (!token) return false;

  return safeEquals(token, buildToken(password));
}

/** True si falta configurar `DOCTOR_PORTAL_PASSWORD` en el entorno. */
export function isGateMisconfigured(): boolean {
  return getGatePassword() === null;
}
