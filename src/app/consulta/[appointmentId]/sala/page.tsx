"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Alert, Button, Flex, Spin, Typography, theme } from "antd";
import { useConsulta } from "../ConsultaProvider";

const { Text } = Typography;

/**
 * Interfaz de la llamada.
 *
 * Antes se leía `useCallCallingState()` y no se usaba para nada: si la
 * conexión se caía o el servidor reconectaba, la pantalla no decía nada y
 * parecía congelada.
 */
function LlamadaEnCurso({ alSalir }: { alSalir: () => void }) {
  const { token } = theme.useToken();
  const {
    useCallCallingState,
    useMicrophoneState,
    useCameraState,
    useRemoteParticipants,
  } = useCallStateHooks();
  const estado = useCallCallingState();
  const { isSpeakingWhileMuted } = useMicrophoneState();
  const { isMute: camaraApagada } = useCameraState();
  const remotos = useRemoteParticipants();

  if (estado === CallingState.JOINING) {
    return (
      <Flex vertical align="center" justify="center" gap={token.margin} style={{ height: "100vh" }}>
        <Spin size="large" />
        <Text style={{ color: "#fff" }}>Conectando con la consulta...</Text>
      </Flex>
    );
  }

  if (estado === CallingState.LEFT) {
    return (
      <Flex vertical align="center" justify="center" gap={token.margin} style={{ height: "100vh" }}>
        <Text style={{ color: "#fff" }}>Saliste de la consulta.</Text>
        <Button onClick={alSalir}>Volver</Button>
      </Flex>
    );
  }

  return (
    <Flex vertical style={{ height: "100vh", background: "#000" }}>
      {estado === CallingState.RECONNECTING && (
        // Una caída pasajera no termina la llamada: el SDK reintenta y la
        // persona necesita saber que está esperando, no que se congeló.
        <Alert
          type="warning"
          showIcon
          banner
          title="Se perdió la conexión. Reintentando..."
        />
      )}
      {estado === CallingState.OFFLINE && (
        <Alert type="error" showIcon banner title="Sin conexión a internet" />
      )}
      {isSpeakingWhileMuted && (
        <Alert type="info" showIcon banner title="Estás hablando con el micrófono apagado" />
      )}
      <AvisoAutoplay />

      {/*
        Sin nadie más y sin cámara propia, SpeakerLayout no tiene nada que
        pintar y la pantalla queda en negro sin explicación. El mensaje va
        encima, no en lugar del layout, para que aparezca el video en cuanto
        alguien se conecte.
      */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <SpeakerLayout />

        {remotos.length === 0 && (
          <Flex
            vertical
            align="center"
            justify="center"
            gap={token.marginXS}
            style={{ position: "absolute", inset: 0, pointerEvents: "none", textAlign: "center", padding: token.padding }}
          >
            <Spin />
            <Text style={{ color: "#fff", fontSize: token.fontSizeLG }}>
              Esperando a que se conecte la otra persona
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.65)" }}>
              Puedes quedarte en esta pantalla; entrará automáticamente.
            </Text>
          </Flex>
        )}

        {camaraApagada && remotos.length > 0 && (
          <Flex
            align="center"
            justify="center"
            style={{ position: "absolute", insetInlineStart: 0, bottom: 0, padding: token.paddingXS, pointerEvents: "none" }}
          >
            <Text style={{ color: "rgba(255,255,255,0.65)" }}>Tu cámara está apagada</Text>
          </Flex>
        )}
      </div>

      <Flex justify="center" style={{ padding: token.padding, background: "rgba(0,0,0,0.7)" }}>
        <CallControls onLeave={alSalir} />
      </Flex>
    </Flex>
  );
}

/**
 * El navegador bloquea el audio hasta que la persona interactúa con la página.
 * Sin esto, el paciente entra, no oye nada y no sabe por qué: hace falta un
 * gesto suyo para reanudarlo.
 */
function AvisoAutoplay() {
  const { useIsAutoplayBlocked } = useCallStateHooks();
  const call = useCall();
  const bloqueado = useIsAutoplayBlocked();

  if (!bloqueado) return null;

  return (
    <Alert
      type="warning"
      showIcon
      banner
      title="Tu navegador bloqueó el audio"
      action={
        <Button size="small" onClick={() => call?.resumeAudio().catch(console.error)}>
          Activar sonido
        </Button>
      }
    />
  );
}

export default function SalaPage() {
  const router = useRouter();
  const { token } = theme.useToken();
  const { cargando, error, acceso, call } = useConsulta();
  const [uniendose, setUniendose] = useState(true);
  const [errorUnion, setErrorUnion] = useState<string | null>(null);

  // Unirse es lo que conecta el WebRTC. La limpieza antes leía `call` del
  // closure, donde valía null, así que nunca corría: al salir, la cámara y el
  // micrófono seguían publicando.
  useEffect(() => {
    if (!call) return;
    let activo = true;

    call
      .join({ create: true })
      .catch((e: unknown) => {
        console.error("Error al unirse a la llamada:", e);
        if (activo) setErrorUnion("No se pudo conectar con la consulta.");
      })
      .finally(() => {
        if (activo) setUniendose(false);
      });

    return () => {
      activo = false;
      call.leave().catch(() => {});
    };
  }, [call]);

  if (cargando || (uniendose && !errorUnion)) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh", background: "#000" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  const problema = error ?? errorUnion;
  if (problema || !acceso || !call) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh", padding: token.padding }}>
        <Alert
          type="error"
          showIcon
          title="No se pudo abrir la consulta"
          description={problema ?? "Acceso no disponible"}
          action={<Button size="small" onClick={() => router.back()}>Volver</Button>}
          style={{ maxWidth: 480 }}
        />
      </Flex>
    );
  }

  return (
    <StreamCall call={call}>
      <LlamadaEnCurso alSalir={() => router.push("/")} />
    </StreamCall>
  );
}
