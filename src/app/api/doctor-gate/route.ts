import { NextRequest, NextResponse } from "next/server";
import {
  buildGateCookie,
  isGateMisconfigured,
  isGatePasswordValid,
  DOCTOR_GATE_COOKIE,
} from "@/lib/auth/doctorGate";

/** Valida la clave de acceso al portal médico y entrega la cookie del portón. */
export async function POST(request: NextRequest) {
  if (isGateMisconfigured()) {
    return NextResponse.json(
      { error: "El acceso médico no está configurado. Falta DOCTOR_PORTAL_PASSWORD." },
      { status: 503 }
    );
  }

  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json({ error: "Ingresa la clave de acceso" }, { status: 400 });
  }

  if (!isGatePasswordValid(password)) {
    return NextResponse.json({ error: "Clave de acceso incorrecta" }, { status: 401 });
  }

  const cookie = buildGateCookie();
  if (!cookie) {
    return NextResponse.json({ error: "El acceso médico no está configurado." }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookie);
  return response;
}

/** Revoca el permiso del portón. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(DOCTOR_GATE_COOKIE);
  return response;
}
