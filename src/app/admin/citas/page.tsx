"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  TimePicker,
  Tooltip,
  Typography,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  SwapOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/es";
import Link from "next/link";

dayjs.extend(customParseFormat);
dayjs.locale("es");

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const FORMATO_FECHA = "YYYY-MM-DD";
const FORMATO_HORA = "HH:mm:ss";

/**
 * `appointment_date` es `date` y `start_time`/`end_time` son `time` sin zona:
 * horas de reloj de pared que ya significan hora de Monterrey. Convertirlas
 * desplazaba el valor — la versión anterior aplicaba `.tz()` y en un navegador
 * fuera de México la fecha de la cita salía un día antes.
 */
const leerFecha = (v: string) => dayjs(v, FORMATO_FECHA);
const leerHora = (v: string) => dayjs(v, FORMATO_HORA);

type EstadoCita = "pending" | "confirmed" | "rejected" | "cancelled" | "completed" | "no_show";

const ESTADOS: Record<EstadoCita, { texto: string; color: string; icono: ReactNode }> = {
  pending: { texto: "Por confirmar", color: "warning", icono: <CalendarOutlined /> },
  confirmed: { texto: "Confirmada", color: "success", icono: <CheckCircleOutlined /> },
  completed: { texto: "Completada", color: "processing", icono: <CheckOutlined /> },
  rejected: { texto: "Rechazada", color: "error", icono: <CloseCircleOutlined /> },
  cancelled: { texto: "Cancelada", color: "default", icono: <StopOutlined /> },
  no_show: { texto: "No asistió", color: "error", icono: <StopOutlined /> },
};

const MODALIDADES: Record<string, { texto: string; color: string }> = {
  online: { texto: "En línea", color: "blue" },
  presencial: { texto: "Presencial", color: "green" },
};

interface Cita {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: EstadoCita;
  modality?: string | null;
  patient_notes?: string | null;
  doctor_notes?: string | null;
  meeting_link?: string | null;
  rejection_reason?: string | null;
  cancellation_reason?: string | null;
  patient?: { full_name?: string; email?: string; phone?: string } | null;
  service?: { title?: string; duration_minutes?: number } | null;
}

type Accion = "aprobar" | "rechazar" | "reagendar" | "cancelar" | "completar" | "notas";

/** Lectura pura, sin estado, para poder llamarla desde un efecto. */
async function obtenerCitas(): Promise<Cita[]> {
  const res = await fetch("/api/admin/appointments");
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al cargar las citas");
  return json.appointments ?? json ?? [];
}

export default function CitasPage() {
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const [formRechazo] = Form.useForm();
  const [formCancelacion] = Form.useForm();
  const [formReagenda] = Form.useForm();
  const [formNotas] = Form.useForm();

  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("all");
  const [filtroFecha, setFiltroFecha] = useState<Dayjs | null>(null);

  const [seleccionada, setSeleccionada] = useState<Cita | null>(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [accionAbierta, setAccionAbierta] = useState<Accion | null>(null);

  const aplicar = useCallback(
    (promesa: Promise<Cita[]>, vivo: () => boolean) =>
      promesa
        .then((lista) => {
          if (vivo()) setCitas(lista);
        })
        .catch((error: unknown) => {
          console.error("Error cargando citas:", error);
          if (vivo()) {
            message.error(error instanceof Error ? error.message : "Error al cargar las citas");
          }
        })
        .finally(() => {
          if (vivo()) setLoading(false);
        }),
    [message],
  );

  useEffect(() => {
    let vivo = true;
    aplicar(obtenerCitas(), () => vivo);
    return () => {
      vivo = false;
    };
  }, [aplicar]);

  const refrescar = () => {
    setLoading(true);
    aplicar(obtenerCitas(), () => true);
  };

  const stats = {
    pendientes: citas.filter((c) => c.status === "pending").length,
    confirmadas: citas.filter((c) => c.status === "confirmed").length,
    completadas: citas.filter((c) => c.status === "completed").length,
    canceladas: citas.filter((c) => ["cancelled", "rejected", "no_show"].includes(c.status)).length,
  };

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return citas.filter((c) => {
      if (filtroEstado !== "all" && c.status !== filtroEstado) return false;
      if (filtroFecha && c.appointment_date !== filtroFecha.format(FORMATO_FECHA)) return false;
      if (!q) return true;
      return [c.patient?.full_name, c.patient?.email, c.service?.title].some((v) =>
        v?.toLowerCase().includes(q),
      );
    });
  }, [citas, busqueda, filtroEstado, filtroFecha]);

  // No se tocan los formularios aquí: cuando esto corre, el <Form> todavía no
  // está montado y antd avisa que la instancia de useForm no está conectada.
  // Cada modal se destruye al cerrarse y recibe sus valores por initialValues.
  const abrirAccion = (cita: Cita, accion: Accion) => {
    setSeleccionada(cita);
    setAccionAbierta(accion);
  };

  /** Un solo camino para todas las acciones, con el mismo manejo de error. */
  const ejecutar = async (url: string, cuerpo: object, exito: string) => {
    try {
      setProcesando(true);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo completar la acción");
      message.success(exito);
      setAccionAbierta(null);
      refrescar();
      return true;
    } catch (error) {
      message.error(error instanceof Error ? error.message : "No se pudo completar la acción");
      return false;
    } finally {
      setProcesando(false);
    }
  };

  const aprobar = (cita: Cita) =>
    modal.confirm({
      title: "Confirmar cita",
      content: `${cita.patient?.full_name ?? "El paciente"} recibirá un correo con la confirmación${
        cita.modality === "online" ? " y el enlace de la videollamada" : ""
      }.`,
      okText: "Confirmar",
      cancelText: "Cancelar",
      // Siempre `approve`, nunca `confirm`: los dos dejaban la cita en
      // "confirmed", pero sólo approve avisa al paciente y crea la sala. Según
      // qué botón se presionara, el paciente se enteraba o no.
      onOk: () =>
        ejecutar(
          "/api/admin/appointments/approve",
          { appointmentId: cita.id },
          "Cita confirmada",
        ),
    });

  const columnas: ColumnsType<Cita> = [
    {
      title: "Fecha y hora",
      key: "cuando",
      sorter: (a, b) =>
        `${a.appointment_date}${a.start_time}`.localeCompare(`${b.appointment_date}${b.start_time}`),
      defaultSortOrder: "ascend",
      render: (_, r) => (
        <Flex vertical>
          <Text strong>{leerFecha(r.appointment_date).format("ddd DD/MM/YYYY")}</Text>
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {leerHora(r.start_time).format("HH:mm")} - {leerHora(r.end_time).format("HH:mm")}
          </Text>
        </Flex>
      ),
    },
    {
      title: "Paciente",
      key: "paciente",
      render: (_, r) => (
        <Flex vertical>
          <Text>{r.patient?.full_name?.trim() ?? "—"}</Text>
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {r.patient?.phone ?? r.patient?.email ?? ""}
          </Text>
        </Flex>
      ),
    },
    {
      title: "Servicio",
      key: "servicio",
      responsive: ["md"],
      render: (_, r) => r.service?.title ?? "—",
    },
    {
      title: "Modalidad",
      dataIndex: "modality",
      key: "modality",
      responsive: ["lg"],
      render: (m?: string | null) => {
        const e = m ? MODALIDADES[m] : undefined;
        return e ? <Tag color={e.color}>{e.texto}</Tag> : <Tag>Sin definir</Tag>;
      },
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (s: EstadoCita) => {
        const e = ESTADOS[s];
        return e ? <Tag color={e.color} icon={e.icono}>{e.texto}</Tag> : <Tag>{s}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right",
      render: (_, r) => (
        <Space size="small" wrap>
          <Tooltip title="Ver detalle">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSeleccionada(r);
                setModalDetalle(true);
              }}
            />
          </Tooltip>

          {r.status === "pending" && (
            <>
              <Tooltip title="Confirmar">
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => aprobar(r)}
                  loading={procesando}
                />
              </Tooltip>
              <Tooltip title="Proponer otro horario">
                <Button
                  size="small"
                  icon={<SwapOutlined />}
                  onClick={() => abrirAccion(r, "reagendar")}
                />
              </Tooltip>
              <Tooltip title="Rechazar">
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => abrirAccion(r, "rechazar")}
                />
              </Tooltip>
            </>
          )}

          {r.status === "confirmed" && (
            <>
              {r.modality === "online" && (
                <Tooltip title="Entrar a la consulta">
                  <Link href={`/consulta/${r.id}/lobby`} target="_blank">
                    <Button size="small" type="primary" icon={<VideoCameraOutlined />} />
                  </Link>
                </Tooltip>
              )}
              <Tooltip title="Marcar como completada">
                <Button
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => abrirAccion(r, "completar")}
                />
              </Tooltip>
              <Tooltip title="Cancelar">
                <Button
                  size="small"
                  danger
                  icon={<StopOutlined />}
                  onClick={() => abrirAccion(r, "cancelar")}
                />
              </Tooltip>
            </>
          )}

          <Tooltip title="Notas de la consulta">
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => abrirAccion(r, "notas")}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const tarjetas = [
    { titulo: "Por confirmar", valor: stats.pendientes, color: token.colorWarning },
    { titulo: "Confirmadas", valor: stats.confirmadas, color: token.colorSuccess },
    { titulo: "Completadas", valor: stats.completadas, color: token.colorInfo },
    { titulo: "Canceladas o rechazadas", valor: stats.canceladas, color: token.colorTextSecondary },
  ];

  return (
    <Flex vertical gap={token.marginLG}>
      <div>
        <Title level={2} style={{ marginTop: 0, marginBottom: token.marginXXS }}>
          Citas
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Solicitudes de tus pacientes sobre los{" "}
          <Link href="/admin/horarios" style={{ color: token.colorLink }}>
            horarios que abriste
          </Link>
          . Las horas son de Monterrey.
        </Paragraph>
      </div>

      <Row gutter={[token.margin, token.margin]}>
        {tarjetas.map(({ titulo, valor, color }) => (
          <Col xs={12} lg={6} key={titulo}>
            <Card>
              <Statistic title={titulo} value={valor} loading={loading} styles={{ content: { color } }} />
            </Card>
          </Col>
        ))}
      </Row>

      {stats.pendientes > 0 && (
        <Alert
          type="info"
          showIcon
          title={
            stats.pendientes === 1
              ? "Tienes una cita por confirmar"
              : `Tienes ${stats.pendientes} citas por confirmar`
          }
          description="Mientras no las confirmes, el paciente no recibe el aviso ni el enlace de la videollamada."
        />
      )}

      <Card>
        <Flex gap={token.margin} wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Buscar por paciente o servicio"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ flex: "1 1 240px" }}
          />
          <Select
            value={filtroEstado}
            onChange={setFiltroEstado}
            style={{ flex: "0 1 200px", minWidth: 170 }}
            options={[
              { value: "all", label: "Todos los estados" },
              ...(Object.keys(ESTADOS) as EstadoCita[]).map((k) => ({
                value: k,
                label: ESTADOS[k].texto,
              })),
            ]}
          />
          <DatePicker
            value={filtroFecha}
            onChange={setFiltroFecha}
            format="DD/MM/YYYY"
            placeholder="Filtrar por fecha"
            style={{ flex: "0 1 190px" }}
          />
          <Button icon={<ReloadOutlined />} onClick={refrescar} loading={loading}>
            Actualizar
          </Button>
        </Flex>
      </Card>

      <Card>
        <Table
          columns={columnas}
          dataSource={visibles}
          rowKey="id"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 10, showSizeChanger: true, responsive: true }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={citas.length ? "Ninguna cita coincide con los filtros" : "Aún no hay citas"}
              />
            ),
          }}
        />
      </Card>

      {/* Detalle */}
      <Modal
        title="Detalle de la cita"
        open={modalDetalle}
        onCancel={() => setModalDetalle(false)}
        footer={<Button onClick={() => setModalDetalle(false)}>Cerrar</Button>}
        width={700}
      >
        {seleccionada && (
          <Descriptions
            bordered
            size="small"
            column={{ xs: 1, sm: 1, md: 2 }}
            items={[
              { key: "p", label: "Paciente", children: seleccionada.patient?.full_name?.trim() ?? "—" },
              { key: "t", label: "Teléfono", children: seleccionada.patient?.phone ?? "—" },
              { key: "e", label: "Correo", span: "filled", children: seleccionada.patient?.email ?? "—" },
              { key: "s", label: "Servicio", children: seleccionada.service?.title ?? "—" },
              {
                key: "d",
                label: "Duración",
                children: seleccionada.service?.duration_minutes
                  ? `${seleccionada.service.duration_minutes} min`
                  : "—",
              },
              {
                key: "f",
                label: "Fecha",
                children: leerFecha(seleccionada.appointment_date).format("dddd D [de] MMMM [de] YYYY"),
              },
              {
                key: "h",
                label: "Horario",
                children: `${leerHora(seleccionada.start_time).format("HH:mm")} - ${leerHora(
                  seleccionada.end_time,
                ).format("HH:mm")}`,
              },
              {
                key: "m",
                label: "Modalidad",
                children: (() => {
                  const e = seleccionada.modality ? MODALIDADES[seleccionada.modality] : undefined;
                  return e ? <Tag color={e.color}>{e.texto}</Tag> : <Tag>Sin definir</Tag>;
                })(),
              },
              {
                key: "st",
                label: "Estado",
                children: (() => {
                  const e = ESTADOS[seleccionada.status];
                  return e ? <Tag color={e.color} icon={e.icono}>{e.texto}</Tag> : null;
                })(),
              },
              {
                key: "np",
                label: "Nota del paciente",
                span: "filled",
                children: seleccionada.patient_notes || "—",
              },
              {
                key: "nd",
                label: "Tus notas",
                span: "filled",
                children: seleccionada.doctor_notes || "—",
              },
              ...(seleccionada.rejection_reason
                ? [
                    {
                      key: "mr",
                      label: "Motivo del rechazo",
                      span: "filled" as const,
                      children: seleccionada.rejection_reason,
                    },
                  ]
                : []),
              ...(seleccionada.cancellation_reason
                ? [
                    {
                      key: "mc",
                      label: "Motivo de cancelación",
                      span: "filled" as const,
                      children: seleccionada.cancellation_reason,
                    },
                  ]
                : []),
            ]}
          />
        )}
      </Modal>

      {/* Rechazar */}
      <Modal
        title="Rechazar cita"
        open={accionAbierta === "rechazar"}
        onCancel={() => setAccionAbierta(null)}
        okText="Rechazar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true, loading: procesando }}
        destroyOnHidden
        onOk={async () => {
          const v = await formRechazo.validateFields().catch(() => null);
          if (!v || !seleccionada) return;
          await ejecutar(
            "/api/admin/appointments/reject",
            { appointmentId: seleccionada.id, rejectionReason: v.motivo },
            "Cita rechazada",
          );
        }}
      >
        <Paragraph type="secondary">El paciente recibirá el motivo por correo.</Paragraph>
        <Form form={formRechazo} layout="vertical">
          <Form.Item
            label="Motivo"
            name="motivo"
            rules={[{ required: true, message: "Escribe el motivo" }]}
          >
            <TextArea rows={4} maxLength={500} showCount placeholder="Por qué no puedes atenderla." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reagendar */}
      <Modal
        title="Proponer otro horario"
        open={accionAbierta === "reagendar"}
        onCancel={() => setAccionAbierta(null)}
        okText="Reagendar y confirmar"
        cancelText="Cancelar"
        okButtonProps={{ loading: procesando }}
        destroyOnHidden
        onOk={async () => {
          const v = await formReagenda.validateFields().catch(() => null);
          if (!v || !seleccionada) return;
          await ejecutar(
            "/api/admin/appointments/reschedule",
            {
              appointmentId: seleccionada.id,
              newDate: v.fecha.format(FORMATO_FECHA),
              newTime: v.hora.format(FORMATO_HORA),
            },
            "Cita reagendada y confirmada",
          );
        }}
      >
        <Paragraph type="secondary">
          La cita queda confirmada en el nuevo horario y el paciente recibe el aviso.
        </Paragraph>
        <Form
          form={formReagenda}
          layout="vertical"
          initialValues={{
            fecha: seleccionada ? leerFecha(seleccionada.appointment_date) : undefined,
            hora: seleccionada ? leerHora(seleccionada.start_time) : undefined,
          }}
        >
          <Row gutter={token.margin}>
            <Col xs={24} sm={12}>
              <Form.Item label="Nueva fecha" name="fecha" rules={[{ required: true, message: "Elige la fecha" }]}>
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" minDate={dayjs().startOf("day")} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Nueva hora" name="hora" rules={[{ required: true, message: "Elige la hora" }]}>
                <TimePicker style={{ width: "100%" }} format="HH:mm" minuteStep={15} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Cancelar */}
      <Modal
        title="Cancelar cita"
        open={accionAbierta === "cancelar"}
        onCancel={() => setAccionAbierta(null)}
        okText="Cancelar la cita"
        cancelText="Volver"
        okButtonProps={{ danger: true, loading: procesando }}
        destroyOnHidden
        onOk={async () => {
          const v = await formCancelacion.validateFields().catch(() => null);
          if (!v || !seleccionada) return;
          await ejecutar(
            "/api/admin/appointments/cancel",
            { appointmentId: seleccionada.id, cancellationReason: v.motivo },
            "Cita cancelada",
          );
        }}
      >
        <Form form={formCancelacion} layout="vertical">
          <Form.Item
            label="Motivo de la cancelación"
            name="motivo"
            rules={[{ required: true, message: "Escribe el motivo" }]}
          >
            <TextArea rows={4} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* Completar */}
      <Modal
        title="Marcar como completada"
        open={accionAbierta === "completar"}
        onCancel={() => setAccionAbierta(null)}
        okText="Marcar completada"
        cancelText="Cancelar"
        okButtonProps={{ loading: procesando }}
        onOk={async () => {
          if (!seleccionada) return;
          await ejecutar(
            "/api/admin/appointments/complete",
            { appointmentId: seleccionada.id },
            "Cita marcada como completada",
          );
        }}
      >
        <Text>
          ¿Confirmas que la consulta con{" "}
          <Text strong>{seleccionada?.patient?.full_name?.trim()}</Text> ya se realizó?
        </Text>
      </Modal>

      {/* Notas */}
      <Modal
        title="Notas de la consulta"
        open={accionAbierta === "notas"}
        onCancel={() => setAccionAbierta(null)}
        okText="Guardar"
        cancelText="Cancelar"
        okButtonProps={{ loading: procesando }}
        destroyOnHidden
        onOk={async () => {
          const v = await formNotas.validateFields().catch(() => null);
          if (!v || !seleccionada) return;
          await ejecutar(
            "/api/admin/appointments/update-notes",
            { appointmentId: seleccionada.id, doctorNotes: v.notes ?? "" },
            "Notas guardadas",
          );
        }}
      >
        <Paragraph type="secondary">Sólo tú las ves. El paciente no recibe estas notas.</Paragraph>
        <Form
          form={formNotas}
          layout="vertical"
          initialValues={{ notes: seleccionada?.doctor_notes ?? "" }}
        >
          <Form.Item label="Notas" name="notes">
            <TextArea rows={5} maxLength={2000} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
}
