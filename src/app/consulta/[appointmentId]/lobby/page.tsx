"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  StreamCall,
  useCallStateHooks,
  VideoPreview,
  DeviceSettings,
} from "@stream-io/video-react-sdk";
import { Alert, Button, Card, Descriptions, Flex, Spin, Tag, Typography, theme } from "antd";
import { AudioOutlined, VideoCameraOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/es";
import { useConsulta } from "../ConsultaProvider";

dayjs.extend(customParseFormat);
dayjs.locale("es");

const { Title, Paragraph, Text } = Typography;

/**
 * Antesala de la consulta: se comprueban cámara y micrófono antes de entrar.
 *
 * Antes esto usaba `navigator.mediaDevices.getUserMedia` a pelo. El SDK expone
 * el estado real del permiso (`hasBrowserPermission`, `isPromptingPermission`),
 * que es lo que permite distinguir "el navegador está preguntando" de "el
 * usuario dijo que no" — importante porque el navegador sólo pregunta una vez.
 */
/**
 * El navegador devuelve un DOMException con distintos nombres según el motivo,
 * y cada uno se resuelve distinto. Un mensaje genérico deja a la persona sin
 * saber qué hacer.
 */
function explicarFalloDeMedios(error: unknown): string {
  const nombre = (error as { name?: string })?.name ?? "";
  switch (nombre) {
    case "NotAllowedError":
    case "SecurityError":
      return "Bloqueaste el acceso a la cámara o el micrófono. Abre el candado junto a la dirección del sitio, permítelos y recarga la página: el navegador sólo pregunta una vez.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No se encontró cámara o micrófono en este dispositivo. Conecta uno y recarga la página.";
    case "NotReadableError":
    case "AbortError":
      return "Otra aplicación está usando tu cámara o micrófono. Ciérrala y recarga la página.";
    default:
      return "No se pudo acceder a tu cámara o micrófono. Revisa los permisos del navegador y recarga la página.";
  }
}

function ContenidoLobby({ alEntrar }: { alEntrar: () => void }) {
  const { token } = theme.useToken();
  const { useCameraState, useMicrophoneState } = useCallStateHooks();

  const camara = useCameraState();
  const microfono = useMicrophoneState();
  const [falloMedios, setFalloMedios] = useState<string | null>(null);

  // Se enciende la vista previa al montar y se apaga al salir, para no dejar
  // la cámara prendida si la persona se arrepiente. Cada dispositivo va en su
  // propio catch: que falle el micrófono no debe impedir ver la cámara.
  useEffect(() => {
    camara.camera.enable().catch((e: unknown) => setFalloMedios(explicarFalloDeMedios(e)));
    microfono.microphone.enable().catch((e: unknown) => setFalloMedios(explicarFalloDeMedios(e)));
    return () => {
      camara.camera.disable().catch(() => {});
      microfono.microphone.disable().catch(() => {});
    };
    // Los managers son estables; volver a ejecutar esto apagaría la vista previa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const permisoPendiente = camara.isPromptingPermission || microfono.isPromptingPermission;

  return (
    <Flex vertical gap={token.margin}>
      <div style={{ borderRadius: token.borderRadiusLG, overflow: "hidden", background: "#000" }}>
        <VideoPreview />
      </div>

      {permisoPendiente && (
        <Alert
          type="info"
          showIcon
          title="Tu navegador está pidiendo permiso"
          description="Acepta el uso de cámara y micrófono para que te vean y te escuchen."
        />
      )}

      {falloMedios && (
        <Alert type="error" showIcon title="No podemos usar tu cámara o micrófono" description={falloMedios} />
      )}

      <Flex justify="space-between" align="center" gap={token.margin} wrap>
        <Flex gap={token.marginXS} wrap>
          <Tag
            icon={<VideoCameraOutlined />}
            color={camara.hasBrowserPermission ? "success" : "default"}
          >
            Cámara {camara.hasBrowserPermission ? "lista" : "sin permiso"}
          </Tag>
          <Tag
            icon={<AudioOutlined />}
            color={microfono.hasBrowserPermission ? "success" : "default"}
          >
            Micrófono {microfono.hasBrowserPermission ? "listo" : "sin permiso"}
          </Tag>
        </Flex>

        {/* Selector de cámara, micrófono y bocina que trae el SDK. */}
        <DeviceSettings />
      </Flex>

      <Button type="primary" size="large" block onClick={alEntrar} disabled={Boolean(falloMedios)}>
        Entrar a la consulta
      </Button>

      {falloMedios && (
        <Button type="link" block onClick={() => window.location.reload()}>
          Ya lo permití, recargar
        </Button>
      )}
    </Flex>
  );
}

export default function LobbyPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = use(params);
  const router = useRouter();
  const { token } = theme.useToken();
  const { cargando, error, acceso, call } = useConsulta();
  const [entrando, setEntrando] = useState(false);

  if (cargando) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (error || !acceso) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh", padding: token.padding }}>
        <Alert
          type="error"
          showIcon
          title="No puedes entrar a esta consulta"
          description={error ?? "Acceso no disponible"}
          style={{ maxWidth: 480 }}
        />
      </Flex>
    );
  }

  const cita = acceso.cita;
  const esDoctor = acceso.role === "doctor";

  return (
    <Flex
      justify="center"
      style={{ minHeight: "100vh", padding: token.paddingLG, background: token.colorBgLayout }}
    >
      <Flex vertical gap={token.margin} style={{ width: "100%", maxWidth: 760 }}>
        <div>
          <Title level={3} style={{ marginTop: 0, marginBottom: token.marginXXS }}>
            Antes de entrar
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Revisa que se te vea y se te escuche bien.
          </Paragraph>
        </div>

        {cita && (
          <Card size="small">
            <Descriptions
              size="small"
              column={{ xs: 1, sm: 2 }}
              items={[
                { key: "s", label: "Servicio", children: cita.servicio ?? "—" },
                {
                  key: "c",
                  label: esDoctor ? "Paciente" : "Te atiende",
                  children: (esDoctor ? cita.paciente : cita.doctor) ?? "—",
                },
                {
                  key: "f",
                  label: "Fecha",
                  children: cita.fecha
                    ? dayjs(cita.fecha, "YYYY-MM-DD").format("dddd D [de] MMMM")
                    : "—",
                },
                {
                  key: "h",
                  label: "Hora",
                  children: cita.hora ? dayjs(cita.hora, "HH:mm:ss").format("HH:mm") : "—",
                },
              ]}
            />
          </Card>
        )}

        <Card>
          {call ? (
            <StreamCall call={call}>
              <ContenidoLobby
                alEntrar={() => {
                  setEntrando(true);
                  router.push(`/consulta/${appointmentId}/sala`);
                }}
              />
            </StreamCall>
          ) : (
            <Flex align="center" justify="center" style={{ minHeight: 240 }}>
              <Spin />
            </Flex>
          )}
          {entrando && (
            <Text type="secondary" style={{ display: "block", marginTop: token.marginXS }}>
              Conectando...
            </Text>
          )}
        </Card>
      </Flex>
    </Flex>
  );
}
