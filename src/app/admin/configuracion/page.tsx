"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Flex,
  Modal,
  Result,
  Space,
  Steps,
  Tag,
  Typography,
  theme,
} from "antd";
import {
  CheckCircleOutlined,
  GoogleOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

const { Title, Paragraph, Text } = Typography;

interface EstadoGoogle {
  conectado: boolean;
  configurado: boolean;
  email?: string | null;
  desde?: string | null;
}

/** Mensajes con los que vuelve el callback de Google. */
const AVISOS: Record<
  string,
  { tipo: "success" | "error" | "warning"; titulo: string; texto: string }
> = {
  conectado: {
    tipo: "success",
    titulo: "Cuenta conectada",
    texto: "A partir de ahora las citas en línea generan su sala de Google Meet.",
  },
  cancelado: {
    tipo: "warning",
    titulo: "Autorización cancelada",
    texto: "No se conectó ninguna cuenta. Puedes intentarlo de nuevo cuando quieras.",
  },
  "estado-invalido": {
    tipo: "error",
    titulo: "La autorización no se pudo verificar",
    texto: "Vuelve a empezar el proceso desde este panel.",
  },
  "sin-configurar": {
    tipo: "error",
    titulo: "Faltan las credenciales de Google",
    texto: "Configura GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REDIRECT_URI en el servidor.",
  },
  error: {
    tipo: "error",
    titulo: "No se pudo conectar la cuenta",
    texto: "Revisa que la cuenta tenga permiso sobre el calendario e inténtalo otra vez.",
  },
};

/** La URL no cambia sola mientras la página está abierta: no hay a qué suscribirse. */
const sinCambios = () => () => {};
const leerResultado = () => new URLSearchParams(window.location.search).get("google") ?? "";
const leerResultadoServidor = () => "";

export default function ConfiguracionPage() {
  const { token } = theme.useToken();
  const [estado, setEstado] = useState<EstadoGoogle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [desconectando, setDesconectando] = useState(false);
  const [modal, contextoModal] = Modal.useModal();

  // El resultado se lee de la URL en el cliente, no con `useSearchParams`: así
  // la página no necesita un límite de Suspense para prerenderizarse. Va por
  // `useSyncExternalStore` para no tener que asignar estado desde un efecto.
  const resultado = useSyncExternalStore(sinCambios, leerResultado, leerResultadoServidor);
  const aviso = AVISOS[resultado] ?? null;

  const cargar = useCallback(async () => {
    const res = await fetch("/api/admin/google");
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "No se pudo leer la configuración");
    return json as EstadoGoogle;
  }, []);

  useEffect(() => {
    let vivo = true;
    cargar()
      .then((e) => vivo && setEstado(e))
      .catch((e: unknown) => vivo && setError(e instanceof Error ? e.message : "Error al cargar"))
      .finally(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, [cargar]);

  const desconectar = () => {
    modal.confirm({
      title: "¿Desconectar la cuenta de Google?",
      content:
        "Las citas ya confirmadas conservan su enlace, pero las nuevas citas en línea dejarán de generar sala hasta que vuelvas a conectar una cuenta.",
      okText: "Desconectar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        setDesconectando(true);
        try {
          const res = await fetch("/api/admin/google", { method: "DELETE" });
          if (!res.ok) throw new Error((await res.json()).error);
          setEstado(await cargar());
        } catch (e) {
          setError(e instanceof Error ? e.message : "No se pudo desconectar");
        } finally {
          setDesconectando(false);
        }
      },
    });
  };

  if (error && !estado) {
    return (
      <Result
        status="warning"
        title="No se pudo cargar la configuración"
        subTitle={error}
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        }
      />
    );
  }

  return (
    <Flex vertical gap={token.marginLG}>
      {contextoModal}

      <div>
        <Title level={2} style={{ marginTop: 0, marginBottom: token.marginXXS }}>
          Configuración
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Integraciones de la clínica con servicios externos.
        </Paragraph>
      </div>

      {aviso && (
        <Alert
          type={aviso.tipo}
          showIcon
          closable
          title={aviso.titulo}
          description={aviso.texto}
        />
      )}

      <Card
        loading={cargando}
        title={
          <Space>
            <VideoCameraOutlined />
            Consultas en línea · Google Meet
          </Space>
        }
        extra={
          estado?.conectado ? (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Conectada
            </Tag>
          ) : (
            <Tag color="default">Sin conectar</Tag>
          )
        }
      >
        <Flex vertical gap={token.margin}>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Al confirmar una cita en línea se crea un evento en el calendario de esta cuenta
            con su sala de Meet, y la invitación le llega al paciente y al doctor por correo.
          </Paragraph>

          {!estado?.configurado && (
            <Alert
              type="error"
              showIcon
              title="Faltan las credenciales del servidor"
              description="Antes de conectar la cuenta hay que definir GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REDIRECT_URI en las variables de entorno."
            />
          )}

          {estado?.conectado ? (
            <>
              <Descriptions
                bordered
                size="small"
                column={1}
                items={[
                  { key: "c", label: "Cuenta", children: estado.email || "—" },
                  {
                    key: "d",
                    label: "Conectada desde",
                    children: estado.desde
                      ? dayjs(estado.desde).format("D [de] MMMM [de] YYYY, HH:mm")
                      : "—",
                  },
                ]}
              />
              <Space wrap>
                <Button
                  icon={<GoogleOutlined />}
                  href="/api/admin/google/conectar"
                  // Navegación normal, no fetch: la autorización pasa por Google.
                >
                  Volver a autorizar
                </Button>
                <Button danger loading={desconectando} onClick={desconectar}>
                  Desconectar
                </Button>
              </Space>
            </>
          ) : (
            <>
              <Steps
                orientation="vertical"
                size="small"
                current={-1}
                items={[
                  {
                    title: "Autoriza la cuenta de la clínica",
                    description:
                      "Inicia sesión con el correo desde el que quieres que salgan las invitaciones.",
                  },
                  {
                    title: "Acepta el permiso de calendario",
                    description: "CliniKB sólo puede crear y editar los eventos que genera.",
                  },
                  {
                    title: "Listo",
                    description: "Las citas en línea empiezan a generar su enlace de Meet.",
                  },
                ]}
              />
              <div>
                <Button
                  type="primary"
                  size="large"
                  icon={<GoogleOutlined />}
                  disabled={!estado?.configurado}
                  href="/api/admin/google/conectar"
                >
                  Conectar cuenta de Google
                </Button>
              </div>
            </>
          )}

          {error && <Text type="danger">{error}</Text>}
        </Flex>
      </Card>
    </Flex>
  );
}
