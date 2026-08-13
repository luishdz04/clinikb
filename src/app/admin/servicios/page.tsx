"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import type { Service } from "@/types/appointments";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const CATEGORIAS = ["Psicológica", "Médica"] as const;

const MODALIDADES = [
  { value: "online", label: "En línea" },
  { value: "presencial", label: "Presencial" },
] as const;

const ETIQUETA_MODALIDAD: Record<string, { texto: string; color: string }> = {
  online: { texto: "En línea", color: "blue" },
  presencial: { texto: "Presencial", color: "green" },
};

/** Lectura pura: sin estado, para poder llamarla desde un efecto. */
async function obtenerServicios(): Promise<Service[]> {
  const res = await fetch("/api/services");
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al cargar servicios");
  return json.services ?? [];
}

/** Deriva la clave a partir del título: minúsculas, sin acentos, con guiones. */
function generarClave(titulo: string): string {
  return titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ServiciosPage() {
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Service | null>(null);

  const aplicar = useCallback(
    (promesa: Promise<Service[]>, vivo: () => boolean) =>
      promesa
        .then((lista) => {
          if (vivo()) setServices(lista);
        })
        .catch((error: unknown) => {
          console.error("Error fetching services:", error);
          if (vivo()) {
            message.error(error instanceof Error ? error.message : "Error al cargar servicios");
          }
        })
        .finally(() => {
          if (vivo()) setLoading(false);
        }),
    [message],
  );

  useEffect(() => {
    let vivo = true;
    aplicar(obtenerServicios(), () => vivo);
    return () => {
      vivo = false;
    };
  }, [aplicar]);

  const refrescar = () => {
    setLoading(true);
    aplicar(obtenerServicios(), () => true);
  };

  const activos = services.filter((s) => s.active);
  const sinDoctor = activos.filter((s) => (s.doctor_count ?? 0) === 0);

  // Los valores van por initialValues y no con setFieldsValue: al abrir, el
  // <Form> todavía no está montado y antd avisa que la instancia de useForm no
  // está conectada. El modal se destruye al cerrarse, así que remonta limpio.
  const valoresIniciales = editando
    ? { ...editando, available_modalities: editando.available_modalities ?? [] }
    : {
        category: CATEGORIAS[0],
        duration_minutes: 60,
        available_modalities: ["online", "presencial"],
        active: true,
      };

  const abrirNuevo = () => {
    setEditando(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (service: Service) => {
    setEditando(service);
    setModalAbierto(true);
  };

  const desactivar = (service: Service) => {
    modal.confirm({
      title: "Desactivar servicio",
      content: `"${service.title}" dejará de aparecer para agendar. Las citas ya creadas no se tocan.`,
      okText: "Desactivar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const res = await fetch(`/api/services?id=${service.id}`, { method: "DELETE" });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Error al desactivar");
          message.success("Servicio desactivado");
          refrescar();
        } catch (error) {
          message.error(error instanceof Error ? error.message : "Error al desactivar");
        }
      },
    });
  };

  const guardar = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return; // Errores de validación: antd ya los muestra en el formulario.
    }

    try {
      setGuardando(true);
      const esEdicion = Boolean(editando);
      const res = await fetch("/api/services", {
        method: esEdicion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(esEdicion ? { ...values, id: editando?.id } : values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      message.success(json.message || (esEdicion ? "Servicio actualizado" : "Servicio creado"));
      setModalAbierto(false);
      refrescar();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al guardar el servicio");
    } finally {
      setGuardando(false);
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
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {record.key}
          </Text>
        </Flex>
      ),
    },
    {
      title: "Categoría",
      dataIndex: "category",
      key: "category",
      responsive: ["sm"],
      filters: CATEGORIAS.map((c) => ({ text: c, value: c })),
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
    {
      title: "Doctores",
      dataIndex: "doctor_count",
      key: "doctor_count",
      align: "center",
      sorter: (a, b) => (a.doctor_count ?? 0) - (b.doctor_count ?? 0),
      render: (n: number | undefined, record) => {
        const total = n ?? 0;
        // Sin doctor asignado el servicio existe pero nadie lo puede agendar:
        // conviene que salte a la vista desde el catálogo.
        if (total === 0 && record.active) {
          return (
            <Tooltip title="Nadie ofrece este servicio: los pacientes no pueden agendarlo. Asígnalo desde Mis Servicios.">
              <Tag color="warning" icon={<WarningOutlined />}>
                Ninguno
              </Tag>
            </Tooltip>
          );
        }
        return (
          <Tag icon={<TeamOutlined />} color={total > 0 ? "default" : undefined}>
            {total}
          </Tag>
        );
      },
    },
    {
      title: "Estado",
      dataIndex: "active",
      key: "active",
      filters: [
        { text: "Activo", value: true },
        { text: "Inactivo", value: false },
      ],
      onFilter: (value, record) => record.active === value,
      render: (active: boolean) => (
        <Tag color={active ? "success" : "default"}>{active ? "Activo" : "Inactivo"}</Tag>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar">
            <Button size="small" icon={<EditOutlined />} onClick={() => abrirEdicion(record)} />
          </Tooltip>
          {record.active && (
            <Tooltip title="Desactivar">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => desactivar(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const tarjetas = [
    { titulo: "Servicios activos", valor: activos.length, color: token.colorPrimary },
    {
      titulo: "Psicológica",
      valor: activos.filter((s) => s.category === "Psicológica").length,
      color: token.colorInfo,
    },
    {
      titulo: "Médica",
      valor: activos.filter((s) => s.category === "Médica").length,
      color: token.colorSuccess,
    },
    { titulo: "Sin doctor asignado", valor: sinDoctor.length, color: token.colorWarning },
  ];

  return (
    <Flex vertical gap={token.marginLG}>
      <Flex justify="space-between" align="flex-start" gap={token.margin} wrap>
        <div>
          <Title level={2} style={{ marginTop: 0, marginBottom: token.marginXXS }}>
            Catálogo de servicios
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Todo lo que la clínica ofrece. Cada doctor elige cuáles atiende en{" "}
            <Link href="/admin/mis-servicios" style={{ color: token.colorLink }}>
              Mis Servicios
            </Link>
            .
          </Paragraph>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={abrirNuevo}>
          Nuevo servicio
        </Button>
      </Flex>

      <Row gutter={[token.margin, token.margin]}>
        {tarjetas.map(({ titulo, valor, color }) => (
          <Col xs={12} lg={6} key={titulo}>
            <Card>
              <Statistic title={titulo} value={valor} loading={loading} styles={{ content: { color } }} />
            </Card>
          </Col>
        ))}
      </Row>

      {sinDoctor.length > 0 && (
        /*
         * El enlace va en el slot `action` como Button y no como texto dentro
         * de la descripción: sobre el fondo del Alert de advertencia —que sale
         * del colorWarning de marca, un dorado oscuro— un enlace de color
         * quedaba con muy poco contraste.
         */
        <Alert
          type="warning"
          showIcon
          title={
            sinDoctor.length === 1
              ? "Hay un servicio activo que nadie ofrece"
              : `Hay ${sinDoctor.length} servicios activos que nadie ofrece`
          }
          description={
            <Flex vertical gap={token.marginXS}>
              <Text>
                No aparecen al agendar porque ningún doctor los tiene marcados:{" "}
                {sinDoctor.map((s) => s.title).join(", ")}.
              </Text>
              <Text type="secondary">
                Cada doctor marca los suyos desde su propia cuenta. En Mis Servicios sólo puedes
                activar los que tú atiendes.
              </Text>
            </Flex>
          }
          action={
            <Link href="/admin/mis-servicios">
              <Button size="small">Ir a Mis Servicios</Button>
            </Link>
          }
        />
      )}

      <Card
        extra={
          <Button icon={<ReloadOutlined />} onClick={refrescar} loading={loading}>
            Actualizar
          </Button>
        }
        title="Servicios"
      >
        <Table
          columns={columns}
          dataSource={services}
          rowKey="id"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 10, hideOnSinglePage: true, responsive: true }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Aún no hay servicios en el catálogo"
              />
            ),
          }}
        />
      </Card>

      <Modal
        title={editando ? `Editar ${editando.title}` : "Nuevo servicio"}
        open={modalAbierto}
        onOk={guardar}
        onCancel={() => setModalAbierto(false)}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={guardando}
        width={620}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={valoresIniciales}
          style={{ marginTop: token.margin }}
        >
          <Form.Item
            label="Título"
            name="title"
            rules={[{ required: true, message: "Escribe el título del servicio" }]}
          >
            <Input
              placeholder="Terapia Individual"
              onChange={(e) => {
                // La clave sólo se autogenera al crear: cambiarla en un servicio
                // existente rompería las referencias que ya la usan.
                if (!editando) form.setFieldValue("key", generarClave(e.target.value));
              }}
            />
          </Form.Item>

          <Form.Item
            label="Clave"
            name="key"
            tooltip="Identificador interno. No se puede cambiar una vez creado el servicio."
            rules={[
              { required: true, message: "La clave es obligatoria" },
              {
                pattern: /^[a-z0-9-]+$/,
                message: "Sólo minúsculas, números y guiones",
              },
            ]}
          >
            <Input placeholder="terapia-individual" disabled={Boolean(editando)} />
          </Form.Item>

          <Form.Item label="Descripción" name="description">
            <TextArea rows={3} maxLength={500} showCount placeholder="Qué incluye el servicio." />
          </Form.Item>

          <Row gutter={token.margin}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Categoría"
                name="category"
                rules={[{ required: true, message: "Elige la categoría" }]}
              >
                <Select options={CATEGORIAS.map((c) => ({ value: c, label: c }))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Duración"
                name="duration_minutes"
                rules={[{ required: true, message: "Indica la duración" }]}
              >
                <InputNumber
                  min={15}
                  max={240}
                  step={15}
                  suffix="min"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Modalidades"
            name="available_modalities"
            tooltip="Cómo se puede tomar el servicio."
            rules={[{ required: true, message: "Elige al menos una modalidad" }]}
          >
            <Select mode="multiple" options={[...MODALIDADES]} placeholder="Selecciona" />
          </Form.Item>

          <Form.Item label="Activo" name="active" valuePropName="checked">
            <Switch checkedChildren="Sí" unCheckedChildren="No" />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
}
