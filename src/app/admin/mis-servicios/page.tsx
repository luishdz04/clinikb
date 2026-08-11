"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, SaveOutlined, UndoOutlined } from "@ant-design/icons";
import Link from "next/link";
import type { Service } from "@/types/appointments";

const { Title, Paragraph, Text } = Typography;

const ETIQUETA_MODALIDAD: Record<string, { texto: string; color: string }> = {
  online: { texto: "En línea", color: "blue" },
  presencial: { texto: "Presencial", color: "green" },
};

interface DatosIniciales {
  doctorId: string;
  servicios: Service[];
  seleccionados: string[];
}

/** Marca que no hay sesión de doctor, para distinguirlo de un fallo de red. */
class SinSesionError extends Error {}

function leerDoctorId(): string | null {
  try {
    return JSON.parse(localStorage.getItem("doctor") || "{}").id ?? null;
  } catch {
    return null;
  }
}

/**
 * Catálogo + lo que ya ofrece este doctor, en una sola lectura.
 *
 * La sesión se lee aquí dentro y no en el efecto: hacerlo allá obligaría a un
 * `setState` síncrono, que dispara renders en cascada.
 */
async function obtenerDatos(): Promise<DatosIniciales> {
  const doctorId = leerDoctorId();
  if (!doctorId) throw new SinSesionError();

  const [resServicios, resMios] = await Promise.all([
    fetch("/api/services"),
    fetch(`/api/admin/doctor-services?doctor_id=${doctorId}`),
  ]);

  const jsonServicios = await resServicios.json();
  const jsonMios = await resMios.json();

  if (!resServicios.ok) throw new Error(jsonServicios.error || "Error al cargar servicios");
  if (!resMios.ok) throw new Error(jsonMios.error || "Error al cargar tus servicios");

  return {
    doctorId,
    // Sólo el catálogo activo: no tiene sentido ofrecer algo dado de baja.
    servicios: (jsonServicios.services ?? []).filter((s: Service) => s.active),
    seleccionados: (jsonMios.doctorServices ?? []).map(
      (ds: { service_id: string }) => ds.service_id,
    ),
  };
}

export default function MisServiciosPage() {
  const { message } = App.useApp();
  const { token } = theme.useToken();

  const [services, setServices] = useState<Service[]>([]);
  const [seleccion, setSeleccion] = useState<string[]>([]);
  /** Lo que hay guardado en la base, para saber si quedan cambios pendientes. */
  const [guardado, setGuardado] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [sinSesion, setSinSesion] = useState(false);

  const aplicar = useCallback(
    (promesa: Promise<DatosIniciales>, vivo: () => boolean) =>
      promesa
        .then(({ doctorId: id, servicios, seleccionados }) => {
          if (!vivo()) return;
          setDoctorId(id);
          setSinSesion(false);
          setServices(servicios);
          setSeleccion(seleccionados);
          setGuardado(seleccionados);
        })
        .catch((error: unknown) => {
          if (!vivo()) return;
          if (error instanceof SinSesionError) {
            setSinSesion(true);
            return;
          }
          console.error("Error loading data:", error);
          message.error(error instanceof Error ? error.message : "Error al cargar los servicios");
        })
        .finally(() => {
          if (vivo()) setLoading(false);
        }),
    [message],
  );

  useEffect(() => {
    let vivo = true;
    aplicar(obtenerDatos(), () => vivo);
    return () => {
      vivo = false;
    };
  }, [aplicar]);

  const recargar = () => {
    setLoading(true);
    aplicar(obtenerDatos(), () => true);
  };

  /** Cambios sin guardar: compara sin depender del orden. */
  const hayCambios = useMemo(() => {
    if (seleccion.length !== guardado.length) return true;
    const guardadoSet = new Set(guardado);
    return seleccion.some((id) => !guardadoSet.has(id));
  }, [seleccion, guardado]);

  const guardar = async () => {
    if (!doctorId) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/doctor-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, serviceIds: seleccion }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      setGuardado(seleccion);
      message.success("Tus servicios se actualizaron");
    } catch (error) {
      console.error("Error saving services:", error);
      message.error(error instanceof Error ? error.message : "Error al guardar tus servicios");
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<Service> = [
    {
      title: "Servicio",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (titulo: string, record) => (
        <Flex vertical>
          <Text strong>{titulo}</Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {record.description}
            </Text>
          )}
        </Flex>
      ),
    },
    {
      title: "Categoría",
      dataIndex: "category",
      key: "category",
      responsive: ["sm"],
      filters: [
        { text: "Psicológica", value: "Psicológica" },
        { text: "Médica", value: "Médica" },
      ],
      onFilter: (value, record) => record.category === value,
      render: (c: string) => <Tag color={c === "Psicológica" ? "blue" : "green"}>{c}</Tag>,
    },
    {
      title: "Duración",
      dataIndex: "duration_minutes",
      key: "duration_minutes",
      responsive: ["md"],
      sorter: (a, b) => a.duration_minutes - b.duration_minutes,
      render: (min: number) => `${min} min`,
    },
    {
      title: "Modalidades",
      dataIndex: "available_modalities",
      key: "available_modalities",
      responsive: ["lg"],
      render: (mods?: string[]) =>
        mods?.length ? (
          <Space size={4} wrap>
            {mods.map((m) => {
              const e = ETIQUETA_MODALIDAD[m];
              return (
                <Tag key={m} color={e?.color}>
                  {e?.texto ?? m}
                </Tag>
              );
            })}
          </Space>
        ) : (
          <Tag>Sin definir</Tag>
        ),
    },
  ];

  if (sinSesion) {
    return (
      <Alert
        type="error"
        showIcon
        title="No se encontró tu sesión"
        description="Vuelve a iniciar sesión para elegir los servicios que ofreces."
        action={
          <Link href="/login/doctor">
            <Button size="small">Iniciar sesión</Button>
          </Link>
        }
      />
    );
  }

  return (
    <Flex vertical gap={token.marginLG}>
      <div>
        <Title level={2} style={{ marginTop: 0, marginBottom: token.marginXXS }}>
          Mis servicios
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Marca los que tú atiendes. Salen del{" "}
          <Link href="/admin/servicios" style={{ color: token.colorLink }}>
            catálogo de servicios
          </Link>
          , y los pacientes sólo pueden agendar los que dejes marcados.
        </Paragraph>
      </div>

      <Row gutter={[token.margin, token.margin]}>
        <Col xs={12} lg={8}>
          <Card>
            <Statistic
              title="Servicios que ofreces"
              value={seleccion.length}
              suffix={`/ ${services.length}`}
              loading={loading}
              styles={{ content: { color: token.colorPrimary } }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={8}>
          <Card>
            <Statistic
              title="Cambios sin guardar"
              value={hayCambios ? "Sí" : "No"}
              loading={loading}
              styles={{ content: { color: hayCambios ? token.colorWarning : token.colorSuccess } }}
            />
          </Card>
        </Col>
      </Row>

      {seleccion.length === 0 && !loading && (
        <Alert
          type="warning"
          showIcon
          title="No ofreces ningún servicio"
          description="Mientras no marques al menos uno, los pacientes no podrán agendar contigo."
        />
      )}

      <Card
        title="Catálogo activo"
        extra={
          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={recargar} loading={loading}>
              Actualizar
            </Button>
            <Button
              icon={<UndoOutlined />}
              onClick={() => setSeleccion(guardado)}
              disabled={!hayCambios || saving}
            >
              Descartar
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={guardar}
              loading={saving}
              disabled={!hayCambios}
            >
              Guardar
            </Button>
          </Space>
        }
      >
        {/*
         * Table con rowSelection en vez de tarjetas clicables hechas a mano:
         * es el patrón oficial de antd para "elige varios de una lista", y de
         * paso trae orden, filtros y selección múltiple sin código extra.
         */}
        <Table
          columns={columns}
          dataSource={services}
          rowKey="id"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={false}
          rowSelection={{
            selectedRowKeys: seleccion,
            onChange: (keys) => setSeleccion(keys as string[]),
          }}
          onRow={(record) => ({
            // Toda la fila alterna la selección: apuntarle a la casilla en
            // celular es incómodo.
            onClick: () =>
              setSeleccion((prev) =>
                prev.includes(record.id)
                  ? prev.filter((id) => id !== record.id)
                  : [...prev, record.id],
              ),
            style: { cursor: "pointer" },
          })}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No hay servicios activos en el catálogo"
              />
            ),
          }}
        />
      </Card>
    </Flex>
  );
}
