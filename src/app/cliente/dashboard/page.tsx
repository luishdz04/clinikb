"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Flex,
  Result,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
  theme,
} from "antd";
import {
  CalendarOutlined,
  PlusOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/es";
import Link from "next/link";
import { calcularEdad } from "@/types/patient";

dayjs.extend(customParseFormat);
dayjs.locale("es");

const { Title, Paragraph, Text } = Typography;

const FORMATO_FECHA = "YYYY-MM-DD";
const FORMATO_HORA = "HH:mm:ss";

/** Columnas `date` y `time` sin zona: se leen tal cual, sin convertir. */
const leerFecha = (v?: string | null) => (v ? dayjs(v, FORMATO_FECHA) : null);
const leerHora = (v?: string | null) => (v ? dayjs(v, FORMATO_HORA) : null);

const ESTADOS: Record<string, { texto: string; color: string }> = {
  pending: { texto: "Por confirmar", color: "warning" },
  confirmed: { texto: "Confirmada", color: "success" },
  completed: { texto: "Completada", color: "processing" },
  rejected: { texto: "Rechazada", color: "error" },
  cancelled: { texto: "Cancelada", color: "default" },
  no_show: { texto: "No asistió", color: "error" },
};

interface Paciente {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender?: string | null;
  city?: string | null;
  state?: string | null;
  attention_type: string;
}

interface Cita {
  id: string;
  appointment_date: string;
  start_time: string;
  status: string;
  modality?: string | null;
  service?: { title?: string } | null;
  doctor?: { full_name?: string } | null;
}

async function obtenerDatos(): Promise<{ paciente: Paciente; citas: Cita[] }> {
  const [resMe, resCitas] = await Promise.all([
    fetch("/api/patient/me"),
    fetch("/api/patient/appointments"),
  ]);
  const jsonMe = await resMe.json();
  const jsonCitas = await resCitas.json();

  if (!resMe.ok) throw new Error(jsonMe.error || "No se pudo cargar tu perfil");

  return {
    paciente: jsonMe.patient,
    // Las citas no son críticas para pintar la pantalla: si fallan, se muestra
    // el resto en vez de dejar al paciente sin nada.
    citas: resCitas.ok ? (jsonCitas.appointments ?? []) : [],
  };
}

export default function DashboardPacientePage() {
  const { token } = theme.useToken();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(
    (vivo: () => boolean) =>
      obtenerDatos()
        .then(({ paciente: p, citas: c }) => {
          if (!vivo()) return;
          setPaciente(p);
          setCitas(c);
        })
        .catch((e: unknown) => {
          if (vivo()) setError(e instanceof Error ? e.message : "Error al cargar");
        })
        .finally(() => {
          if (vivo()) setCargando(false);
        }),
    [],
  );

  useEffect(() => {
    let vivo = true;
    cargar(() => vivo);
    return () => {
      vivo = false;
    };
  }, [cargar]);

  /** La siguiente cita que aún no pasó, que es lo que el paciente viene a ver. */
  const proxima = useMemo(() => {
    const ahora = dayjs();
    return citas
      .filter((c) => ["pending", "confirmed"].includes(c.status))
      .filter((c) => {
        const f = leerFecha(c.appointment_date);
        return f ? !f.isBefore(ahora, "day") : false;
      })
      .sort((a, b) =>
        `${a.appointment_date}${a.start_time}`.localeCompare(`${b.appointment_date}${b.start_time}`),
      )[0];
  }, [citas]);

  if (error) {
    return (
      <Result
        status="warning"
        title="No se pudieron cargar tus datos"
        subTitle={error}
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        }
      />
    );
  }

  const edad = calcularEdad(paciente?.date_of_birth);

  return (
    <Flex vertical gap={token.marginLG}>
      <div>
        <Title level={2} style={{ marginTop: 0, marginBottom: token.marginXXS }}>
          Hola{paciente ? `, ${paciente.full_name.trim().split(" ")[0]}` : ""}
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Aquí ves tu próxima cita y puedes agendar una nueva.
        </Paragraph>
      </div>

      <Row gutter={[token.margin, token.margin]}>
        <Col xs={24} lg={14}>
          <Card
            title="Tu próxima cita"
            loading={cargando}
            extra={
              <Link href="/cliente/citas">
                <Button type="link">Ver todas</Button>
              </Link>
            }
          >
            {proxima ? (
              <Flex vertical gap={token.margin}>
                <Flex justify="space-between" align="flex-start" gap={token.margin} wrap>
                  <Flex vertical gap={token.marginXXS}>
                    <Text strong style={{ fontSize: token.fontSizeLG }}>
                      {leerFecha(proxima.appointment_date)?.format("dddd D [de] MMMM")}
                    </Text>
                    <Text type="secondary">
                      {leerHora(proxima.start_time)?.format("HH:mm")} h ·{" "}
                      {proxima.service?.title ?? "Consulta"}
                    </Text>
                    {proxima.doctor?.full_name && (
                      <Text type="secondary">Te atiende {proxima.doctor.full_name}</Text>
                    )}
                  </Flex>
                  <Space direction="vertical" align="end">
                    <Tag color={ESTADOS[proxima.status]?.color}>
                      {ESTADOS[proxima.status]?.texto ?? proxima.status}
                    </Tag>
                    {proxima.modality && (
                      <Tag color={proxima.modality === "online" ? "blue" : "green"}>
                        {proxima.modality === "online" ? "En línea" : "Presencial"}
                      </Tag>
                    )}
                  </Space>
                </Flex>

                {proxima.status === "pending" && (
                  <Alert
                    type="info"
                    showIcon
                    title="Falta que la confirmen"
                    description="Te avisaremos por correo en cuanto tu cita quede confirmada."
                  />
                )}

                {proxima.status === "confirmed" && proxima.modality === "online" && (
                  <Link href={`/consulta/${proxima.id}/lobby`}>
                    <Button type="primary" icon={<VideoCameraOutlined />} size="large" block>
                      Entrar a la consulta
                    </Button>
                  </Link>
                )}
              </Flex>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No tienes citas próximas"
              >
                <Link href="/cliente/citas">
                  <Button type="primary" icon={<PlusOutlined />}>
                    Agendar una cita
                  </Button>
                </Link>
              </Empty>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Flex vertical gap={token.margin}>
            <Card loading={cargando}>
              <Statistic
                title="Citas registradas"
                value={citas.length}
                prefix={<CalendarOutlined />}
                styles={{ content: { color: token.colorPrimary } }}
              />
            </Card>
            <Card loading={cargando}>
              <Statistic
                title="Consultas completadas"
                value={citas.filter((c) => c.status === "completed").length}
                styles={{ content: { color: token.colorSuccess } }}
              />
            </Card>
          </Flex>
        </Col>
      </Row>

      <Card title="Tus datos" loading={cargando}>
        {paciente && (
          <Descriptions
            bordered
            size="small"
            column={{ xs: 1, sm: 1, md: 2 }}
            items={[
              { key: "n", label: "Nombre", children: paciente.full_name.trim() },
              {
                key: "f",
                label: "Nacimiento",
                children: `${leerFecha(paciente.date_of_birth)?.format("DD/MM/YYYY")}${
                  edad !== undefined ? ` · ${edad} años` : ""
                }`,
              },
              { key: "c", label: "Correo", children: paciente.email },
              { key: "t", label: "Teléfono", children: paciente.phone },
              { key: "g", label: "Género", children: paciente.gender || "—" },
              {
                key: "u",
                label: "Ubicación",
                children: [paciente.city, paciente.state].filter(Boolean).join(", ") || "—",
              },
              {
                key: "a",
                label: "Tipo de atención",
                span: "filled",
                children: (
                  <Tag color={paciente.attention_type === "Psicológica" ? "blue" : "green"}>
                    {paciente.attention_type}
                  </Tag>
                ),
              },
            ]}
          />
        )}
      </Card>
    </Flex>
  );
}
