import { StreamClient } from '@stream-io/node-sdk';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const SECRET = process.env.STREAM_API_SECRET;

if (!API_KEY || !SECRET) {
  throw new Error('Stream API credentials not found in environment variables');
}

// Cliente de Stream para operaciones del servidor
export const streamServerClient = new StreamClient(API_KEY, SECRET);

// Generar token para usuario
export function generateUserToken(userId: string): string {
  return streamServerClient.generateUserToken({ user_id: userId });
}

// Crear o obtener call (sala de videollamada)
export async function createVideoCall(callId: string, createdBy: string) {
  const call = streamServerClient.video.call('default', callId);
  
  await call.getOrCreate({
    data: {
      created_by_id: createdBy,
    },
  });

  return call;
}

// Obtener grabaciones de una llamada
export async function getCallRecordings(callId: string) {
  const call = streamServerClient.video.call('default', callId);
  const recordings = await call.listRecordings();
  return recordings;
}
