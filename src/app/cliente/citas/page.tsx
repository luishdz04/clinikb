"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  App,
  Badge,
  Button,
  Calendar,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Segmented,
  Select,
  Space,
  Spin,
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
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
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

/** Columnas `date` y `time` sin zona: se leen tal cual. */
const leerFecha = (v?: string | null) => (v ? dayjs(v, FORMATO_FECHA) : null);
const leerHora = (v?: string | null) => (v ? dayjs(v, FORMATO_HORA) : null);

const ESTADOS: Record<string, { texto: string; color: string }> = {
  pending: { texto: "Por confirmar", color: "warning" },
  confirmed: { texto: "Confirmada", color: "success" },
  completed: { texto: "Completada", color: "processing" },
  rejected: { texto: "Rechazada", color: "error" },
  cancelled: { texto: "Cancelada", color: "default" },
  no_show: { texto: "No asististe", color: "error" },
};

const MODALIDADES: Record<string, { texto: string; color: string }> = {
  online: { texto: "En línea", color: "blue" },
  presencial: { texto: "Presencial", color: "green" },
};

interface Servicio {
  id: string;
  title: string;
  category: string;
  duration_minutes: number;
  active?: boolean;
  available_modalities?: string[];
}

interface Slot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  modality?: string | null;
  service_id: string;
  doctor?: { full_name?: string } | null;
  service?: { title?: string; duration_minutes?: number } | null;
}

interface Cita {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  modality?: string | null;
  patient_notes?: string | null;
  rejection_reason?: string | null;
  cancellation_reason?: string | null;
  service?: { title?: string } | null;
  doctor?: { full_name?: string } | null;
}

async function obtenerCitas(): Promise<Cita[]> {
  const res = await fetch("/api/patient/appointments");
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al cargar tus citas");
  return json.appointments ?? [];
}

async function obtenerServicios(): Promise<Servicio[]> {
  const res = await fetch("/api/services");
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al cargar los servicios");
  return (json.services ?? []).filter((s: Servicio) => s.active !== false);
}

async function obtenerSlots(mes: Dayjs): Promise<Slot[]> {
  const desde = mes.startOf("month").format(FORMATO_FECHA);
  const hasta = mes.endOf("month").format(FORMATO_FECHA);
  const res = await fetch(
    `/api/patient/available-slots/month?start_date=${desde}&end_date=${hasta}`,
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al cargar los horarios");
  return json.slots ?? [];
}

export default function CitasPacientePage() {
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const [formSolicitud] = Form.useForm();

  const [citas, setCitas] = useState<Cita[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [modalAgendar, setModalAgendar] = useState(false);
  const [modo, setModo] = useState<"calendario" | "solicitud">("calendario");
  const [servicioElegido, setServicioElegido] = useState<string | null>(null);
  const [notas, setNotas] = useState("");

  const [mes, setMes] = useState<Dayjs>(() => dayjs());
  const [dia, setDia] = useState<Dayjs>(() => dayjs());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [slotElegido, setSlotElegido] = useState<Slot | null>(null);

  const [detalle, setDetalle] = useState<Cita | null>(null);

  const cargar = useCallback(
    (vivo: () => boolean) =>
      Promise.all([obtenerCitas(), obtenerServicios()])
        .then(([c, s]) => {
          if (!vivo()) return;
          setCitas(c);
          setServicios(s);
        })
        .catch((e: unknown) => {
          if (vivo()) message.error(e instanceof Error ? e.message : "Error al cargar");
        })
        .finally(() => {
          if (vivo()) setCargando(false);
        }),
    [message],
  );

  useEffect(() => {
    let vivo = true;
    cargar(() => vivo);
    return () => {
      vivo = false;
    };
  }, [cargar]);

  // Los horarios se piden sólo cuando el modal está abierto en modo calendario:
  // no tiene sentido traerlos mientras el paciente sólo mira su lista.
  useEffect(() => {
    if (!modalAgendar || modo !== "calendario") return;
    let vivo = true;
    // El spinner lo encienden los manejadores que disparan esta carga (abrir el
    // modal, cambiar de mes o de modo): hacerlo aquí sería un setState síncrono
    // dentro del efecto y encadenaría renders.
    obtenerSlots(mes)
      .then((s) => {
        if (vivo) setSlots(s);
      })
      .catch(() => {
        if (vivo) setSlots([]);
      })
      .finally(() => {
        if (vivo) setCargandoSlots(false);
      });
    return () => {
      vivo = false;
    };
  }, [modalAgendar, modo, mes]);

  const stats = {
    total: citas.length,
    pendientes: citas.filter((c) => c.status === "pending").length,
    confirmadas: citas.filter((c) => c.status === "confirmed").length,
    completadas: citas.filter((c) => c.status === "completed").length,
  };

  /** Sólo los horarios del servicio elegido; sin servicio, ninguno. */
  const slotsDelServicio = useMemo(
    () => (servicioElegido ? slots.filter((s) => s.service_id === servicioElegido) : []),
    [slots, servicioElegido],
  );

  const porFecha = useMemo(() => {
    const mapa = new Map<string, Slot[]>();
    for (const s of slotsDelServicio) {
      mapa.set(s.slot_date, [...(mapa.get(s.slot_date) ?? []), s]);
    }
    return mapa;
  }, [slotsDelServicio]);

  const slotsDelDia = (porFecha.get(dia.format(FORMATO_FECHA)) ?? []).slice().sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );

  const modalidadesDelServicio = useMemo(() => {
    const s = servicios.find((x) => x.id === servicioElegido);
    const claves = s?.available_modalities?.length
      ? s.available_modalities
      : Object.keys(MODALIDADES);
    return claves.map((k) => ({ value: k, label: MODALIDADES[k]?.texto ?? k }));
  }, [servicios, servicioElegido]);

  const abrirAgendar = () => {
    setModo("calendario");
    setServicioElegido(null);
    setSlotElegido(null);
    setNotas("");
    setDia(dayjs());
    setMes(dayjs());
    setCargandoSlots(true);
    formSolicitud.resetFields();
    setModalAgendar(true);
  };

  const reservar = async () => {
    if (!slotElegido || !servicioElegido) return;
    try {
      setEnviando(true);
      const res = await fetch("/api/patient/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Sólo esto: la fecha, la hora y el doctor los toma el servidor del
          // horario elegido.
          service_id: servicioElegido,
          slot_id: slotElegido.id,
          patient_notes: notas || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo reservar");
      message.success(json.message || "Solicitud enviada");
      setModalAgendar(false);
      setCargando(true);
      cargar(() => true);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "No se pudo reservar");
    } finally {
      setEnviando(false);
    }
  };

  const solicitar = async () => {
    const v = await formSolicitud.validateFields().catch(() => null);
    if (!v) return;
    try {
      setEnviando(true);
      const res = await fetch("/api/patient/appointments/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: v.service_id,
          modality: v.modality,
          preferred_date: v.preferred_date ? v.preferred_date.format(FORMATO_FECHA) : null,
          preferred_time: v.preferred_time ? v.preferred_time.format(FORMATO_HORA) : null,
          patient_notes: v.patient_notes || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo enviar la solicitud");
      message.success(json.message || "Solicitud enviada");
      setModalAgendar(false);
      setCargando(true);
      cargar(() => true);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "No se pudo enviar la solicitud");
    } finally {
      setEnviando(false);
    }
  };

  const columnas: ColumnsType<Cita> = [
    {
      title: "Fecha y hora",
      key: "cuando",
      sorter: (a, b) =>
        `${a.appointment_date}${a.start_time}`.localeCompare(`${b.appointment_date}${b.start_time}`),
      defaultSortOrder: "descend",
      render: (_, r) => (
        <Flex vertical>
          <Text strong>{leerFecha(r.appointment_date)?.format("ddd DD/MM/YYYY")}</Text>
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {leerHora(r.start_time)?.format("HH:mm")} h
          </Text>
        </Flex>
      ),
    },
    { title: "Servicio", key: "servicio", render: (_, r) => r.service?.title ?? "—" },
    {
      title: "Te atiende",
      key: "doctor",
      responsive: ["md"],
      render: (_, r) => r.doctor?.full_name ?? "—",
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
      render: (s: string) => (
        <Tag color={ESTADOS[s]?.color}>{ESTADOS[s]?.texto ?? s}</Tag>
      ),
    },
    {
      title: "",
      key: "acciones",
      fixed: "right",
      render: (_, r) => (
        <Space size="small">
          <Tooltip title="Ver detalle">
            <Button size="small" icon={<EyeOutlined />} onClick={() => setDetalle(r)} />
          </Tooltip>
          {r.status === "confirmed" && r.modality === "online" && (
            <Tooltip title="Entrar a la consulta">
              <Link href={`/consulta/${r.id}/lobby`}>
                <Button size="small" type="primary" icon={<VideoCameraOutlined />} />
              </Link>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Flex vertical gap={token.marginLG}>
      <Flex justify="space-between" align="flex-start" gap={token.margin} wrap>
        <div>
          <Title level={2} style={{ marginTop: 0, marginBottom: token.marginXXS }}>
            Mis citas
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Agenda una consulta y sigue el estado de las que ya pediste.
          </Paragraph>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={abrirAgendar}>
          Agendar cita
        </Button>
      </Flex>

      <Row gutter={[token.margin, token.margin]}>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="Total" value={stats.total} loading={cargando}
              styles={{ content: { color: token.colorPrimary } }} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="Por confirmar" value={stats.pendientes} loading={cargando}
              styles={{ content: { color: token.colorWarning } }} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="Confirmadas" value={stats.confirmadas} loading={cargando}
              styles={{ content: { color: token.colorSuccess } }} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="Completadas" value={stats.completadas} loading={cargando}
              styles={{ content: { color: token.colorInfo } }} />
          </Card>
        </Col>
      </Row>

      <Card
        title="Historial de citas"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setCargando(true);
              cargar(() => true);
            }}
            loading={cargando}
          >
            Actualizar
          </Button>
        }
      >
        <Table
          columns={columnas}
          dataSource={citas}
          rowKey="id"
          loading={cargando}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 10, hideOnSinglePage: true, responsive: true }}
          locale={{
            emptyText: (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aún no tienes citas">
                <Button type="primary" icon={<PlusOutlined />} onClick={abrirAgendar}>
                  Agendar la primera
                </Button>
              </Empty>
            ),
          }}
        />
      </Card>

      {/* Agendar */}
      <Modal
        title="Agendar una cita"
        open={modalAgendar}
        onCancel={() => setModalAgendar(false)}
        width={820}
        footer={
          modo === "calendario"
            ? [
                <Button key="c" onClick={() => setModalAgendar(false)}>
                  Cancelar
                </Button>,
                <Button
                  key="ok"
                  type="primary"
                  loading={enviando}
                  disabled={!slotElegido}
                  onClick={reservar}
                >
                  Reservar este horario
                </Button>,
              ]
            : [
                <Button key="c" onClick={() => setModalAgendar(false)}>
                  Cancelar
                </Button>,
                <Button key="ok" type="primary" loading={enviando} onClick={solicitar}>
                  Enviar solicitud
                </Button>,
              ]
        }
      >
        <Flex vertical gap={token.margin}>
          <Segmented
            block
            value={modo}
            onChange={(v) => {
              if (v === "calendario") setCargandoSlots(true);
              setModo(v as "calendario" | "solicitud");
            }}
            options={[
              { label: "Elegir de los horarios abiertos", value: "calendario" },
              { label: "Pedir otro horario", value: "solicitud" },
            ]}
          />

          {modo === "calendario" ? (
            <Flex vertical gap={token.margin}>
              <Select
                placeholder="Primero elige el servicio"
                value={servicioElegido}
                onChange={(v) => {
                  setServicioElegido(v);
                  setSlotElegido(null);
                }}
                options={servicios.map((s) => ({
                  value: s.id,
                  label: `${s.title} (${s.duration_minutes} min)`,
                }))}
              />

              {!servicioElegido ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Elige un servicio para ver los horarios disponibles"
                />
              ) : (
                <Row gutter={[token.margin, token.margin]}>
                  <Col xs={24} md={14}>
                    <Spin spinning={cargandoSlots}>
                      <Calendar
                        fullscreen={false}
                        value={dia}
                        onSelect={(f) => {
                          setDia(f);
                          setSlotElegido(null);
                        }}
                        onPanelChange={(f) => {
                          setCargandoSlots(true);
                          setMes(f);
                        }}
                        // Sólo hacia adelante: no se agenda en el pasado.
                        disabledDate={(f) => f.isBefore(dayjs(), "day")}
                        cellRender={(f, info) => {
                          if (info.type !== "date") return info.originNode;
                          const n = porFecha.get(f.format(FORMATO_FECHA))?.length ?? 0;
                          if (!n) return null;
                          return (
                            <Flex justify="center">
                              <Badge count={n} color={token.colorSuccess} size="small" />
                            </Flex>
                          );
                        }}
                      />
                    </Spin>
                  </Col>

                  <Col xs={24} md={10}>
                    <Card size="small" title={dia.format("dddd D [de] MMMM")}>
                      {slotsDelDia.length === 0 ? (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Sin horarios este día"
                        />
                      ) : (
                        <Radio.Group
                          value={slotElegido?.id}
                          onChange={(e) =>
                            setSlotElegido(slotsDelDia.find((s) => s.id === e.target.value) ?? null)
                          }
                          style={{ width: "100%" }}
                        >
                          <Flex vertical gap={token.marginXS}>
                            {slotsDelDia.map((s) => {
                              const mod = s.modality ? MODALIDADES[s.modality] : undefined;
                              return (
                                <Radio.Button
                                  key={s.id}
                                  value={s.id}
                                  style={{ height: "auto", padding: token.paddingXS }}
                                >
                                  <Flex vertical>
                                    <Text strong>
                                      {leerHora(s.start_time)?.format("HH:mm")} -{" "}
                                      {leerHora(s.end_time)?.format("HH:mm")}
                                    </Text>
                                    <Space size={4} wrap>
                                      {mod && <Tag color={mod.color}>{mod.texto}</Tag>}
                                      {s.doctor?.full_name && (
                                        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                                          {s.doctor.full_name}
                                        </Text>
                                      )}
                                    </Space>
                                  </Flex>
                                </Radio.Button>
                              );
                            })}
                          </Flex>
                        </Radio.Group>
                      )}
                    </Card>
                  </Col>

                  <Col xs={24}>
                    <TextArea
                      rows={2}
                      maxLength={500}
                      showCount
                      placeholder="¿Algo que quieras contarle al doctor antes de la consulta? (opcional)"
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                    />
                  </Col>
                </Row>
              )}
            </Flex>
          ) : (
            <Flex vertical gap={token.marginXS}>
              <Alert
                type="info"
                showIcon
                title="Sin horario fijo"
                description="Manda tu preferencia y el doctor te propondrá una hora concreta."
              />
              <Form form={formSolicitud} layout="vertical">
                <Form.Item
                  label="Servicio"
                  name="service_id"
                  rules={[{ required: true, message: "Elige el servicio" }]}
                >
                  <Select
                    placeholder="Selecciona"
                    onChange={(v) => setServicioElegido(v)}
                    options={servicios.map((s) => ({
                      value: s.id,
                      label: `${s.title} (${s.duration_minutes} min)`,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  label="Modalidad"
                  name="modality"
                  rules={[{ required: true, message: "Elige la modalidad" }]}
                >
                  <Select placeholder="Selecciona" options={modalidadesDelServicio} />
                </Form.Item>

                <Row gutter={token.margin}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Día que prefieres" name="preferred_date">
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        minDate={dayjs().startOf("day")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Hora que prefieres" name="preferred_time">
                      <TimePicker style={{ width: "100%" }} format="HH:mm" minuteStep={15} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Comentarios" name="patient_notes">
                  <TextArea rows={3} maxLength={500} showCount />
                </Form.Item>
              </Form>
            </Flex>
          )}
        </Flex>
      </Modal>

      {/* Detalle */}
      <Modal
        title="Detalle de tu cita"
        open={Boolean(detalle)}
        onCancel={() => setDetalle(null)}
        footer={<Button onClick={() => setDetalle(null)}>Cerrar</Button>}
        width={640}
      >
        {detalle && (
          <Descriptions
            bordered
            size="small"
            column={{ xs: 1, sm: 1, md: 2 }}
            items={[
              { key: "s", label: "Servicio", span: "filled", children: detalle.service?.title ?? "—" },
              {
                key: "f",
                label: "Fecha",
                children: leerFecha(detalle.appointment_date)?.format("dddd D [de] MMMM"),
              },
              {
                key: "h",
                label: "Horario",
                children: `${leerHora(detalle.start_time)?.format("HH:mm")} - ${leerHora(
                  detalle.end_time,
                )?.format("HH:mm")}`,
              },
              { key: "d", label: "Te atiende", children: detalle.doctor?.full_name ?? "—" },
              {
                key: "m",
                label: "Modalidad",
                children: (() => {
                  const e = detalle.modality ? MODALIDADES[detalle.modality] : undefined;
                  return e ? <Tag color={e.color}>{e.texto}</Tag> : <Tag>Sin definir</Tag>;
                })(),
              },
              {
                key: "e",
                label: "Estado",
                span: "filled",
                children: <Tag color={ESTADOS[detalle.status]?.color}>{ESTADOS[detalle.status]?.texto}</Tag>,
              },
              ...(detalle.patient_notes
                ? [{ key: "n", label: "Tu comentario", span: "filled" as const, children: detalle.patient_notes }]
                : []),
              ...(detalle.rejection_reason
                ? [{ key: "r", label: "Motivo del rechazo", span: "filled" as const, children: detalle.rejection_reason }]
                : []),
              ...(detalle.cancellation_reason
                ? [{ key: "c", label: "Motivo de cancelación", span: "filled" as const, children: detalle.cancellation_reason }]
                : []),
            ]}
          />
        )}
      </Modal>
    </Flex>
  );
}
