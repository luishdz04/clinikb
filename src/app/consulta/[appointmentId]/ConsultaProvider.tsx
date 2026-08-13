"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { StreamVideo, StreamVideoClient, type Call } from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

/**
 * Contexto de una consulta en línea.
 *
 * Vive en el layout, encima del lobby y de la sala, por dos razones: el SDK
 * pide un solo cliente por sesión —no uno por pantalla—, y así el lobby puede
 * previsualizar cámara y micrófono con el mismo objeto de llamada que la sala
 * usará después, sin reconectar al pasar de una a otra.
 */

export interface DatosCita {
  fecha: string | null;
  hora: string | null;
  modalidad: string | null;
  servicio: string | null;
  doctor: string | null;
  paciente: string | null;
}

interface Acceso {
  token: string;
  userId: string;
  userName: string;
  role: "paciente" | "doctor";
  roomId: string;
  apiKey: string;
  cita: DatosCita | null;
}

interface ValorContexto {
  cargando: boolean;
  error: string | null;
  acceso: Acceso | null;
  call: Call | null;
}

const ContextoConsulta = createContext<ValorContexto>({
  cargando: true,
  error: null,
  acceso: null,
  call: null,
});

export const useConsulta = () => useContext(ContextoConsulta);

/** Una sola petición autenticada resuelve identidad, permiso, sala y datos. */
async function pedirAcceso(appointmentId: string): Promise<Acceso> {
  const res = await fetch("/api/video/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appointmentId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "No se pudo acceder a la consulta");
  return json as Acceso;
}

export function ConsultaProvider({
  appointmentId,
  children,
}: {
  appointmentId: string;
  children: ReactNode;
}) {
  const [acceso, setAcceso] = useState<Acceso | null>(null);
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1) Identidad y permiso. Los setState van en callbacks de la promesa, no en
  //    el cuerpo del efecto, para no encadenar renders.
  useEffect(() => {
    let vivo = true;
    pedirAcceso(appointmentId)
      .then((datos) => {
        if (vivo) setAcceso(datos);
      })
      .catch((e: unknown) => {
        if (vivo) setError(e instanceof Error ? e.message : "Error al acceder");
      })
      .finally(() => {
        if (vivo) setCargando(false);
      });
    return () => {
      vivo = false;
    };
  }, [appointmentId]);

  // 2) Cliente. El constructor es síncrono, así que basta la limpieza con
  //    disconnectUser: sin bandera de montaje, según las reglas del SDK.
  useEffect(() => {
    if (!acceso) return;

    // El tokenProvider se define DENTRO del efecto a propósito: uno declarado
    // fuera cambia de identidad en cada render y recrearía el cliente. Y va
    // como provider y no como token fijo para que el SDK renueve solo cuando
    // vence — una consulta larga se caía sin poder reconectar.
    const tokenProvider = async () => (await pedirAcceso(appointmentId)).token;

    // Nota: la auditoría de Stream sugiere ajustar `setDisconnectionTimeout`,
    // pero esta versión del SDK (1.39.x) no lo expone en las opciones del
    // cliente. Se deja el valor por defecto; la reconexión se comunica en la
    // interfaz a través del estado de la llamada.
    const c = new StreamVideoClient({
      apiKey: acceso.apiKey,
      user: { id: acceso.userId, name: acceso.userName },
      tokenProvider,
    });
    // El SDK exige este patrón: constructor síncrono + useState + limpieza con
    // disconnectUser. La alternativa que evitaría este aviso (useMemo) está
    // documentada como rota en Strict Mode: la limpieza desconecta la misma
    // instancia que se reutiliza al remontar y deja el cliente muerto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClient(c);

    return () => {
      c.disconnectUser().catch(console.error);
      setClient(null);
    };
  }, [acceso, appointmentId]);

  // 3) Objeto de llamada, sin unirse todavía: el lobby lo usa para probar
  //    cámara y micro, y la sala es la que llama a join().
  useEffect(() => {
    if (!client || !acceso) return;
    const c = client.call("default", acceso.roomId);
    // Igual que arriba: client.call() es síncrono y el objeto debe quedar en
    // estado para que lobby y sala compartan la misma llamada.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCall(c);
    return () => {
      setCall(null);
    };
  }, [client, acceso]);

  return (
    <ContextoConsulta.Provider value={{ cargando, error, acceso, call }}>
      {client ? <StreamVideo client={client}>{children}</StreamVideo> : children}
    </ContextoConsulta.Provider>
  );
}
