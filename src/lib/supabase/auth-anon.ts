import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente con la clave pública, para operaciones de Auth que deben pasar por
 * el flujo normal de usuario: `signUp` y `resend`.
 *
 * No sirve el cliente admin: `admin.createUser()` crea al usuario en silencio,
 * sin disparar el correo de confirmación. Y no sirve el cliente de servidor con
 * cookies, porque el registro ocurre sin sesión y no queremos que un signUp
 * escriba cookies de sesión en la respuesta.
 */
export function createAuthAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !key) {
    console.error('Faltan credenciales públicas de Supabase');
    return null;
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Mensajes de Supabase Auth traducidos a algo que un paciente entienda. */
export function traducirErrorAuth(mensaje: string): string {
  const m = mensaje.toLowerCase();

  if (m.includes('for security purposes') || m.includes('rate limit') || m.includes('too many')) {
    return 'Espera un momento antes de pedir otro código.';
  }
  if (m.includes('already registered') || m.includes('already been registered')) {
    return 'Este correo electrónico ya está registrado.';
  }
  if (m.includes('invalid') && m.includes('token')) {
    return 'El código no es válido. Revísalo e intenta de nuevo.';
  }
  if (m.includes('expired')) {
    return 'El código ya venció. Pide uno nuevo.';
  }
  if (m.includes('password')) {
    return 'La contraseña no cumple los requisitos mínimos.';
  }
  return 'No se pudo completar la operación. Intenta de nuevo.';
}
