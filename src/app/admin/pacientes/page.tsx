"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Flex,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  MailOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
import { calcularEdad, type FamilyMember, type Patient } from "@/types/patient";

dayjs.extend(utc);
dayjs.locale("es");

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

type EstadoPaciente = Patient["status"];

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  status: string;
  modality?: string | null;
  service?: { title?: string; category?: string; duration_minutes?: number } | null;
}

/**
 * Estados de la cuenta.
 *
 * `pending` ya NO significa "esperando aprobación del médico": desde que la
 * verificación por código completa el registro, quiere decir que la persona se
 * registró pero nunca escribió el código que le llegó por correo.
 */
const ESTADOS: Record<EstadoPaciente, { texto: string; color: string; icono: ReactNode }> = {
  pending: { texto: "Sin verificar", color: "warning", icono: <MailOutlined /> },
  approved: { texto: "Activa", color: "success", icono: <CheckCircleOutlined /> },
  rejected: { texto: "Rechazada", color: "error", icono: <CloseCircleOutlined /> },
};

const ESTADOS_CITA: Record<string, { texto: string; color: string }> = {
  pending: { texto: "Pendiente", color: "warning" },
  confirmed: { texto: "Confirmada", color: "success" },
  rejected: { texto: "Rechazada", color: "error" },
  cancelled: { texto: "Cancelada", color: "default" },
  completed: { texto: "Completada", color: "processing" },
  no_show: { texto: "No asistió", color: "error" },
};

const DECLARACION_FAMILIAR: Record<string, { texto: string; color: string }> = {
  registrada: { texto: "Registrada", color: "success" },
  sin_familiares: { texto: "No tiene familiares que registrar", color: "default" },
  no_desea_compartir: { texto: "Prefirió no compartirla", color: "warning" },
};

const COLUMNAS_FAMILIA: ColumnsType<FamilyMember> = [
  { title: "Nombre", dataIndex: "full_name", key: "full_name" },
  { title: "Parentesco", dataIndex: "relationship", key: "relationship" },
  {
    title: "Edad",
    dataIndex: "age",
    key: "age",
    render: (edad?: number) => (edad != null ? `${edad} años` : "—"),
  },
  {
    title: "Ocupación",
    dataIndex: "occupation",
    key: "occupation",
    render: (v?: string) => v || "—",
  },
];

const COLUMNAS_CITAS: ColumnsType<Appointment> = [
  {
    title: "Fecha",
    dataIndex: "appointment_date",
    key: "appointment_date",
    render: (f: string) => dayjs.utc(f).format("DD/MM/YYYY"),
  },
  { title: "Hora", dataIndex: "start_time", key: "start_time" },
  {
    title: "Servicio",
    key: "service",
    render: (_, r) => r.service?.title || "—",
  },
  {
    title: "Modalidad",
    dataIndex: "modality",
    key: "modality",
    responsive: ["sm"],
    render: (m?: string | null) => m || "—",
  },
  {
    title: "Estado",
    dataIndex: "status",
    key: "status",
    render: (s: string) => {
      const e = ESTADOS_CITA[s];
      return e ? <Tag color={e.color}>{e.texto}</Tag> : <Tag>{s}</Tag>;
    },
  },
];

/** Lecturas puras de la API: sin estado, para poder llamarlas desde efectos. */
async function obtenerPacientes(): Promise<Patient[]> {
  const res = await fetch("/api/admin/patients");
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al cargar pacientes");
  return json.patients ?? [];
}

async function obtenerCitas(patientId: string): Promise<Appointment[]> {
  const res = await fetch(`/api/admin/patients/appointments?patient_id=${patientId}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al cargar citas");
  return json.appointments ?? [];
}

export default function PacientesPage() {
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("all");
  const [filtroAtencion, setFiltroAtencion] = useState<string>("all");

  const [selected, setSelected] = useState<Patient | null>(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [loadingCitas, setLoadingCitas] = useState(false);

  const [rejectModal, setRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const stats = {
    total: patients.length,
    pending: patients.filter((p) => p.status === "pending").length,
    approved: patients.filter((p) => p.status === "approved").length,
    rejected: patients.filter((p) => p.status === "rejected").length,
  };

  // Los setState viven en callbacks de la promesa, no en el cuerpo del efecto:
  // hacerlo síncrono ahí provoca renders en cascada.
  const aplicar = useCallback(
    (promesa: Promise<Patient[]>, vivo: () => boolean) =>
      promesa
        .then((lista) => {
          if (vivo()) setPatients(lista);
        })
        .catch((error: unknown) => {
          console.error("Error fetching patients:", error);
          if (vivo()) {
            message.error(error instanceof Error ? error.message : "Error al cargar pacientes");
          }
        })
        .finally(() => {
          if (vivo()) setLoading(false);
        }),
    [message],
  );

  useEffect(() => {
    let vivo = true;
    aplicar(obtenerPacientes(), () => vivo);
    return () => {
      vivo = false;
    };
  }, [aplicar]);

  const refrescar = () => {
    setLoading(true);
    aplicar(obtenerPacientes(), () => true);
  };

  /** Filtrado derivado: no se guarda una segunda lista que pueda desfasarse. */
  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return patients.filter((p) => {
      if (filtroEstado !== "all" && p.status !== filtroEstado) return false;
      if (filtroAtencion !== "all" && p.attention_type !== filtroAtencion) return false;
      if (!q) return true;
      return [p.full_name, p.email, p.phone].some((v) => v?.toLowerCase().includes(q));
    });
  }, [patients, busqueda, filtroEstado, filtroAtencion]);

  const doctorId = () => {
    try {
      return JSON.parse(localStorage.getItem("doctor") || "{}").id as string | undefined;
    } catch {
      return undefined;
    }
  };

  const verFicha = (patient: Patient) => {
    setSelected(patient);
    setDetailsModal(true);
    setCitas([]);
    setLoadingCitas(true);
    obtenerCitas(patient.id)
      .then(setCitas)
      .catch((e: unknown) => {
        console.error("Error fetching appointments:", e);
        message.error("No se pudieron cargar las citas del paciente");
      })
      .finally(() => setLoadingCitas(false));
  };

  const activar = (patient: Patient) => {
    modal.confirm({
      title: "Activar cuenta",
      content: `${patient.full_name.trim()} no ha verificado su correo. ¿Activar su cuenta manualmente? Podrá iniciar sesión sin escribir el código.`,
      okText: "Activar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setActionLoading(true);
          const res = await fetch("/api/admin/approve-patient", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId: patient.id, doctorId: doctorId() }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Error al activar");
          message.success("Cuenta activada");
          refrescar();
        } catch (error) {
          message.error(error instanceof Error ? error.message : "Error al activar la cuenta");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const confirmarRechazo = async () => {
    if (!selected || !rejectionReason.trim()) {
      message.warning("Ingresa el motivo del rechazo");
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/reject-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selected.id,
          doctorId: doctorId(),
          rejectionReason,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al rechazar");
      message.success("Cuenta rechazada");
      setRejectModal(false);
      refrescar();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al rechazar");
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnsType<Patient> = [
    {
      title: "Nombre",
      dataIndex: "full_name",
      key: "full_name",
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
      render: (n: string) => <Text strong>{n.trim()}</Text>,
    },
    { title: "Correo", dataIndex: "email", key: "email", responsive: ["md"] },
    { title: "Teléfono", dataIndex: "phone", key: "phone", responsive: ["lg"] },
    {
      title: "Atención",
      dataIndex: "attention_type",
      key: "attention_type",
      responsive: ["sm"],
      render: (t: string) => <Tag color={t === "Psicológica" ? "blue" : "green"}>{t}</Tag>,
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (s: EstadoPaciente) => {
        const e = ESTADOS[s];
        return e ? <Tag color={e.color} icon={e.icono}>{e.texto}</Tag> : <Tag>{s}</Tag>;
      },
    },
    {
      title: "Registro",
      dataIndex: "created_at",
      key: "created_at",
      responsive: ["md"],
      render: (f: string) => dayjs(f).format("DD/MM/YYYY"),
      sorter: (a, b) => dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf(),
      defaultSortOrder: "descend",
    },
    {
      title: "Acciones",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <Space size="small" wrap>
          <Button size="small" icon={<EyeOutlined />} onClick={() => verFicha(record)}>
            Ver
          </Button>
          {record.status === "pending" && (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => activar(record)}
              loading={actionLoading}
            >
              Activar
            </Button>
          )}
          {record.status !== "rejected" && (
            <Button
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setSelected(record);
                setRejectionReason("");
                setRejectModal(true);
              }}
              loading={actionLoading}
            >
              Rechazar
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const tarjetas = [
    { titulo: "Total de pacientes", valor: stats.total, icono: <UserOutlined />, color: token.colorPrimary },
    { titulo: "Sin verificar", valor: stats.pending, icono: <MailOutlined />, color: token.colorWarning },
    { titulo: "Cuentas activas", valor: stats.approved, icono: <CheckCircleOutlined />, color: token.colorSuccess },
    { titulo: "Rechazadas", valor: stats.rejected, icono: <CloseCircleOutlined />, color: token.colorError },
  ];

  const fichaItems = selected
    ? [
        { key: "n", label: "Nombre", children: selected.full_name.trim() },
        { key: "e", label: "Correo", children: selected.email },
        { key: "t", label: "Teléfono", children: selected.phone },
        {
          key: "f",
          label: "Nacimiento",
          children: `${dayjs.utc(selected.date_of_birth).format("DD/MM/YYYY")} · ${
            calcularEdad(selected.date_of_birth) ?? "?"
          } años`,
        },
        { key: "g", label: "Género", children: selected.gender || "—" },
        { key: "ec", label: "Estado civil", children: selected.marital_status || "—" },
        { key: "es", label: "Estudios", children: selected.education_level || "—" },
        { key: "r", label: "Religión", children: selected.religion || "—" },
        {
          key: "d",
          label: "Dirección",
          span: "filled" as const,
          children:
            [selected.address, selected.city, selected.state, selected.postal_code]
              .filter(Boolean)
              .join(", ") || "—",
        },
        {
          key: "ce",
          label: "Contacto de emergencia",
          span: "filled" as const,
          children:
            [selected.emergency_contact_name, selected.emergency_contact_phone]
              .filter(Boolean)
              .join(" · ") || "—",
        },
        {
          key: "en",
          label: "Enfermedades recurrentes",
          span: "filled" as const,
          children: selected.recurrent_illnesses || "—",
        },
        {
          key: "ob",
          label: "Objetivos en consulta",
          span: "filled" as const,
          children: selected.consultation_goals || "—",
        },
        { key: "rf", label: "Nos conoció por", children: selected.referral_source || "—" },
        {
          key: "at",
          label: "Atención",
          children: (
            <Tag color={selected.attention_type === "Psicológica" ? "blue" : "green"}>
              {selected.attention_type}
            </Tag>
          ),
        },
        {
          key: "st",
          label: "Estado de la cuenta",
          span: "filled" as const,
          children: (() => {
            const e = ESTADOS[selected.status];
            return (
              <Space wrap>
                {e && <Tag color={e.color} icon={e.icono}>{e.texto}</Tag>}
                {selected.rejection_reason && (
                  <Text type="secondary">Motivo: {selected.rejection_reason}</Text>
                )}
              </Space>
            );
          })(),
        },
      ]
    : [];

  return (
    <Flex vertical gap={token.marginLG}>
      <div>
        <Title level={2} style={{ marginTop: 0, marginBottom: token.marginXXS }}>
          Pacientes
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Cuentas, fichas de ingreso e historial de citas.
        </Paragraph>
      </div>

      <Row gutter={[token.margin, token.margin]}>
        {tarjetas.map(({ titulo, valor, icono, color }) => (
          <Col xs={12} lg={6} key={titulo}>
            <Card>
              <Statistic
                title={titulo}
                value={valor}
                prefix={icono}
                loading={loading}
                styles={{ content: { color } }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Flex gap={token.margin} wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Buscar por nombre, correo o teléfono"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ flex: "1 1 260px" }}
          />
          <Select
            value={filtroEstado}
            onChange={setFiltroEstado}
            style={{ flex: "0 1 200px", minWidth: 160 }}
            options={[
              { value: "all", label: "Todos los estados" },
              ...(Object.keys(ESTADOS) as EstadoPaciente[]).map((k) => ({
                value: k,
                label: ESTADOS[k].texto,
              })),
            ]}
          />
          <Select
            value={filtroAtencion}
            onChange={setFiltroAtencion}
            style={{ flex: "0 1 200px", minWidth: 160 }}
            options={[
              { value: "all", label: "Todas las atenciones" },
              { value: "Psicológica", label: "Psicológica" },
              { value: "Médica", label: "Médica" },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={refrescar} loading={loading}>
            Actualizar
          </Button>
        </Flex>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={visibles}
          rowKey="id"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 10, showSizeChanger: true, responsive: true }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  patients.length ? "Ningún paciente coincide con los filtros" : "Aún no hay pacientes"
                }
              />
            ),
          }}
        />
      </Card>

      <Modal
        title={selected ? `Ficha de ${selected.full_name.trim()}` : "Ficha del paciente"}
        open={detailsModal}
        onCancel={() => setDetailsModal(false)}
        footer={<Button onClick={() => setDetailsModal(false)}>Cerrar</Button>}
        width={820}
      >
        {selected && (
          <Tabs
            items={[
              {
                key: "ficha",
                label: (
                  <Space size={4}>
                    <UserOutlined />
                    Ficha
                  </Space>
                ),
                children: (
                  <Flex vertical gap={token.marginLG}>
                    {/* `span: 'filled'` en los campos largos en vez de un número
                        fijo: con `column` responsivo, un span mayor al número de
                        columnas dispara un warning de antd en móvil. */}
                    <Descriptions
                      bordered
                      size="small"
                      column={{ xs: 1, sm: 1, md: 2 }}
                      items={fichaItems}
                    />

                    <Flex vertical gap={token.marginSM}>
                      <Flex align="center" gap={token.marginXS} wrap>
                        <Text strong>Estructura familiar</Text>
                        {(() => {
                          const d = selected.family_structure_status
                            ? DECLARACION_FAMILIAR[selected.family_structure_status]
                            : undefined;
                          return d ? <Tag color={d.color}>{d.texto}</Tag> : <Tag>Sin declarar</Tag>;
                        })()}
                      </Flex>

                      {selected.family_members?.length ? (
                        <Table<FamilyMember>
                          columns={COLUMNAS_FAMILIA}
                          dataSource={selected.family_members}
                          rowKey="id"
                          size="small"
                          pagination={false}
                          scroll={{ x: "max-content" }}
                        />
                      ) : (
                        <Text type="secondary">
                          {selected.family_structure_reason
                            ? `Motivo: ${selected.family_structure_reason}`
                            : "No se registraron integrantes."}
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                ),
              },
              {
                key: "citas",
                label: (
                  <Space size={4}>
                    <CalendarOutlined />
                    Citas {citas.length > 0 && `(${citas.length})`}
                  </Space>
                ),
                children: (
                  <Table<Appointment>
                    columns={COLUMNAS_CITAS}
                    dataSource={citas}
                    rowKey="id"
                    size="small"
                    loading={loadingCitas}
                    pagination={{ pageSize: 5, hideOnSinglePage: true }}
                    scroll={{ x: "max-content" }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Este paciente no tiene citas"
                        />
                      ),
                    }}
                  />
                ),
              },
            ]}
          />
        )}
      </Modal>

      <Modal
        title="Rechazar cuenta"
        open={rejectModal}
        onOk={confirmarRechazo}
        onCancel={() => setRejectModal(false)}
        okText="Rechazar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true, loading: actionLoading }}
      >
        <Flex vertical gap={token.margin}>
          <Text>
            ¿Rechazar la cuenta de <Text strong>{selected?.full_name.trim()}</Text>? No podrá
            iniciar sesión.
          </Text>
          <Flex vertical gap={token.marginXXS}>
            <Text strong>Motivo</Text>
            <TextArea
              rows={4}
              maxLength={500}
              showCount
              placeholder="Se guarda en el expediente del paciente."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </Flex>
        </Flex>
      </Modal>
    </Flex>
  );
}
