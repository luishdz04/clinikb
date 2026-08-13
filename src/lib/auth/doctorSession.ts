/**
 * Sesión del personal médico.
 *
 * Antes el login devolvía los datos del doctor en JSON y el navegador los
 * guardaba en localStorage. Eso no es una sesión: el `doctorId` que llegaba a
 * la API era un dato que ponía el cliente, así que cualquiera podía inventarlo
 * y la API entera quedaba abierta.
 *
 * Ahora el login firma un token y lo deja en una cookie httpOnly, que el
 * navegador no puede leer ni alterar. El servidor verifica la firma en cada
 * petición.
 *
 * Se usa Web Crypto (HMAC-SHA256) y no `jsonwebtoken` a propósito: esto corre
 * también en el middleware, que va en runtime edge y no tiene módulos de Node.
 */

export const COOKIE_SESION_DOCTOR = "clinikb_doctor";

/** Ocho horas: una jornada. Después hay que volver a entrar. */
const VIGENCIA_SEGUNDOS = 8 * 60 * 60;

export interface SesionDoctor {
  /** doctors.id */
  id: string;
  role: string;
  /** Vencimiento en segundos desde epoch. */
  exp: number;
}

function secreto(): string {
  const valor = process.env.DOCTOR_SESSION_SECRET;
  if (!valor || valor.length < 32) {
    throw new Error(
      "Falta DOCTOR_SESSION_SECRET (mínimo 32 caracteres). Sin él no se pueden firmar sesiones.",
    );
  }
  return valor;
}

const aBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const textoABase64Url = (texto: string) =>
  aBase64Url(new TextEncoder().encode(texto));

function base64UrlATexto(valor: string): string {
  const relleno = valor.replace(/-/g, "+").replace(/_/g, "/");
  return atob(relleno + "=".repeat((4 - (relleno.length % 4)) % 4));
}

async function clave(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secreto()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function firmar(cuerpo: string): Promise<string> {
  const firma = await crypto.subtle.sign("HMAC", await clave(), new TextEncoder().encode(cuerpo));
  return aBase64Url(new Uint8Array(firma));
}

/** Devuelve el token que va dentro de la cookie. */
export async function crearSesionDoctor(id: string, role: string): Promise<string> {
  const datos: SesionDoctor = {
    id,
    role,
    exp: Math.floor(Date.now() / 1000) + VIGENCIA_SEGUNDOS,
  };
  const cuerpo = textoABase64Url(JSON.stringify(datos));
  return `${cuerpo}.${await firmar(cuerpo)}`;
}

/**
 * Verifica firma y vigencia. Devuelve null ante cualquier problema: un token
 * manipulado y uno vencido se tratan igual, sin dar pistas.
 */
export async function verificarSesionDoctor(token?: string | null): Promise<SesionDoctor | null> {
  if (!token) return null;

  const [cuerpo, firma] = token.split(".");
  if (!cuerpo || !firma) return null;

  try {
    const esperada = await firmar(cuerpo);
    // Comparación de longitud constante: evita filtrar la firma por tiempos.
    if (firma.length !== esperada.length) return null;
    let iguales = 0;
    for (let i = 0; i < firma.length; i++) iguales |= firma.charCodeAt(i) ^ esperada.charCodeAt(i);
    if (iguales !== 0) return null;

    const datos = JSON.parse(base64UrlATexto(cuerpo)) as SesionDoctor;
    if (!datos?.id || typeof datos.exp !== "number") return null;
    if (datos.exp * 1000 < Date.now()) return null;

    return datos;
  } catch {
    return null;
  }
}

/** Opciones de la cookie. `httpOnly` es lo que impide leerla desde el navegador. */
export function opcionesCookieSesion(produccion: boolean) {
  return {
    httpOnly: true,
    secure: produccion,
    sameSite: "lax" as const,
    path: "/",
    maxAge: VIGENCIA_SEGUNDOS,
  };
}
