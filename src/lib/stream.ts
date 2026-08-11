import { StreamClient } from '@stream-io/node-sdk';

/**
 * Cliente de Stream para videollamadas.
 *
 * La validación de credenciales es PEREZOSA a propósito. Antes se lanzaba al
 * evaluar el módulo, y como Next evalúa todos los módulos al recolectar datos
 * de página, el build entero se caía si faltaban las claves — aunque nadie
 * fuera a usar videollamadas.
 *
 * Ahora sólo truena quien de verdad intenta usar el servicio, y el resto de la
 * app compila y funciona sin configurar Stream.
 */

let cliente: StreamClient | null = null;

/** ¿Están las credenciales? Útil para ocultar la función en vez de fallar. */
export function isStreamConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STREAM_API_KEY && process.env.STREAM_API_SECRET);
}

function getStreamClient(): StreamClient {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  const secret = process.env.STREAM_API_SECRET;

  if (!apiKey || !secret) {
    throw new Error(
      'Las videollamadas no están configuradas: faltan NEXT_PUBLIC_STREAM_API_KEY y STREAM_API_SECRET.',
    );
  }

  cliente ??= new StreamClient(apiKey, secret);
  return cliente;
}

// Generar token para usuario
export function generateUserToken(userId: string): string {
  return getStreamClient().generateUserToken({ user_id: userId });
}

// Crear o obtener call (sala de videollamada)
export async function createVideoCall(callId: string, createdBy: string) {
  const call = getStreamClient().video.call('default', callId);

  await call.getOrCreate({
    data: {
      created_by_id: createdBy,
    },
  });

  return call;
}

// Obtener grabaciones de una llamada
export async function getCallRecordings(callId: string) {
  const call = getStreamClient().video.call('default', callId);
  const recordings = await call.listRecordings();
  return recordings;
}
