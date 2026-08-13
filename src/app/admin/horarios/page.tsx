"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  App,
  Badge,
  Checkbox,
  Button,
  Calendar,
  Card,
  Col,
  DatePicker,
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
  TimePicker,
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
  ThunderboltOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/es";
import Link from "next/link";
import type { AvailabilitySlot, Service } from "@/types/appointments";

// customParseFormat faltaba: sin él, dayjs("09:00:00", "HH:mm:ss") da Invalid
// Date y el formulario de edición aparecía con las horas vacías.
dayjs.extend(customParseFormat);
dayjs.locale("es");

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const FORMATO_FECHA = "YYYY-MM-DD";
const FORMATO_HORA = "HH:mm:ss";

/**
 * `slot_date`, `start_time` y `end_time` son columnas date/time SIN zona: son
 * horas de reloj de pared que ya significan hora de Monterrey. Convertirlas
 * de zona las desplaza — es lo que hacía que 09:00 se mostrara como 03:00 y
 * que la fecha se corriera un día en navegadores fuera de México.
 *
 * Sólo `created_at` y compañía son timestamptz y sí se convierten al mostrar.
 */
const leerFecha = (valor: string) => dayjs(valor, FORMATO_FECHA);
const leerHora = (valor: string) => dayjs(valor, FORMATO_HORA);

const MODALIDADES: Record<string, { texto: string; color: string }> = {
  online: { texto: "En línea", color: "blue" },
  presencial: { texto: "Presencial", color: "green" },
};

interface DoctorSesion {
  id: string;
  full_name?: string;
}

interface DatosHorarios {
  doctor: DoctorSesion;
  servicios: Service[];
  slots: AvailabilitySlot[];
}

class SinSesionError extends Error {}

function leerDoctor(): DoctorSesion | null {
  try {
    const bruto = localStorage.getItem("doctor");
    if (!bruto) return null;
    const d = JSON.parse(bruto);
    return d?.id ? d : null;
  } catch {
    return null;
  }
}

/**
 * Servicios del doctor y sus horarios del mes, en una sola lectura.
 * Sin estado dentro, para poder llamarla desde un efecto sin renders en cascada.
 */
async function obtenerDatos(mes: Dayjs): Promise<DatosHorarios> {
  const doctor = leerDoctor();
  if (!doctor) throw new SinSesionError();

  const desde = mes.startOf("month").format(FORMATO_FECHA);
  const hasta = mes.endOf("month").format(FORMATO_FECHA);

  const [resServicios, resSlots] = await Promise.all([
    fetch(`/api/admin/doctor-services?doctor_id=${doctor.id}`),
    fetch(
      `/api/admin/availability-slots?doctorId=${doctor.id}&startDate=${desde}&endDate=${hasta}`,
    ),
  ]);

  const jsonServicios = await resServicios.json();
  const jsonSlots = await resSlots.json();

  if (!resServicios.ok) throw new Error(jsonServicios.error || "Error al cargar tus servicios");
  if (!resSlots.ok) throw new Error(jsonSlots.error || "Error al cargar los horarios");

  // El endpoint devuelve la relación; aquí interesa el servicio en sí.
  const servicios = (jsonServicios.doctorServices ?? [])
    .map((ds: { service?: Service }) => ds.service)
    .filter((s: Service | undefined): s is Service => Boolean(s?.active));

  return {
    doctor,
    servicios,
    slots: jsonSlots.slots ?? jsonSlots ?? [],
  };
}

export default function HorariosPage() {
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const [doctor, setDoctor] = useState<DoctorSesion | null>(null);
  const [servicios, setServicios] = useState<Service[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [sinSesion, setSinSesion] = useState(false);

  const [mes, setMes] = useState<Dayjs>(() => dayjs());
  const [diaElegido, setDiaElegido] = useState<Dayjs>(() => dayjs());
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<AvailabilitySlot | null>(null);

  const [formLote] = Form.useForm();
  const [modalLote, setModalLote] = useState(false);
  const [generando, setGenerando] = useState(false);

  // El servicio elegido en el formulario limita las modalidades disponibles.
  const servicioElegido = Form.useWatch("serviceId", form);
  const servicioLote = Form.useWatch("serviceId", formLote);
  const loteRango = Form.useWatch("rango", formLote);
  const loteDias = Form.useWatch("weekdays", formLote);
  const loteFranja = Form.useWatch("franja", formLote);
  const loteBloque = Form.useWatch("blockMinutes", formLote);

  const aplicar = useCallback(
    (promesa: Promise<DatosHorarios>, vivo: () => boolean) =>
      promesa
        .then(({ doctor: d, servicios: s, slots: sl }) => {
          if (!vivo()) return;
          setDoctor(d);
          setServicios(s);
          setSlots(sl);
          setSinSesion(false);
        })
        .catch((error: unknown) => {
          if (!vivo()) return;
          if (error instanceof SinSesionError) {
            setSinSesion(true);
            return;
          }
          console.error("Error cargando horarios:", error);
          message.error(error instanceof Error ? error.message : "Error al cargar los horarios");
        })
        .finally(() => {
          if (vivo()) setLoading(false);
        }),
    [message],
  );

  useEffect(() => {
    let vivo = true;
    aplicar(obtenerDatos(mes), () => vivo);
    return () => {
      vivo = false;
    };
  }, [aplicar, mes]);

  const refrescar = () => {
    setLoading(true);
    aplicar(obtenerDatos(mes), () => true);
  };

  /** Horarios agrupados por fecha, para pintar el calendario sin recorrer todo. */
  const porFecha = useMemo(() => {
    const mapa = new Map<string, AvailabilitySlot[]>();
    for (const slot of slots) {
      const clave = slot.slot_date;
      mapa.set(clave, [...(mapa.get(clave) ?? []), slot]);
    }
    return mapa;
  }, [slots]);

  const slotsDelDia = porFecha.get(diaElegido.format(FORMATO_FECHA)) ?? [];

  const modalidadesPermitidas = useMemo(() => {
    const servicio = servicios.find((s) => s.id === servicioElegido);
    // Sin servicio elegido se ofrecen ambas; el CHECK de la base es el límite real.
    const claves = servicio?.available_modalities?.length
      ? servicio.available_modalities
      : Object.keys(MODALIDADES);
    return claves.map((k) => ({ value: k, label: MODALIDADES[k]?.texto ?? k }));
  }, [servicios, servicioElegido]);

  /** Mismo criterio que arriba, para el formulario de generación masiva. */
  const modalidadesLote = useMemo(() => {
    const servicio = servicios.find((s) => s.id === servicioLote);
    const claves = servicio?.available_modalities?.length
      ? servicio.available_modalities
      : Object.keys(MODALIDADES);
    return claves.map((k) => ({ value: k, label: MODALIDADES[k]?.texto ?? k }));
  }, [servicios, servicioLote]);

  /**
   * Cuántos bloques saldrían con lo capturado. Se calcula igual que en el
   * servidor para que el número que se ve antes de generar sea el real.
   */
  const previaLote = useMemo(() => {
    if (!loteRango?.[0] || !loteRango?.[1] || !loteFranja?.[0] || !loteFranja?.[1]) return null;
    if (!loteDias?.length || !loteBloque) return null;

    const minutos = (d: Dayjs) => d.hour() * 60 + d.minute();
    const inicioFranja = minutos(loteFranja[0]);
    const finFranja = minutos(loteFranja[1]);
    if (finFranja - inicioFranja < loteBloque) return { dias: 0, porDia: 0, total: 0 };

    const porDia = Math.floor((finFranja - inicioFranja) / loteBloque);

    let dias = 0;
    for (let d = loteRango[0].startOf("day"); !d.isAfter(loteRango[1], "day"); d = d.add(1, "day")) {
      if (loteDias.includes(d.day())) dias++;
    }
    return { dias, porDia, total: dias * porDia };
  }, [loteRango, loteDias, loteFranja, loteBloque]);

  // Por initialValues, no con setFieldsValue antes de abrir: en ese momento el
  // <Form> no está montado y antd avisa que la instancia no está conectada.
  const valoresLote = {
    serviceId: servicios[0]?.id,
    rango: [diaElegido, diaElegido.add(2, "week")],
    weekdays: [1, 2, 3, 4, 5],
    franja: [dayjs("09:00", "HH:mm"), dayjs("14:00", "HH:mm")],
    blockMinutes: servicios[0]?.duration_minutes ?? 60,
    maxAppointments: 1,
    modality: "online",
  };

  const abrirLote = () => setModalLote(true);

  const generarLote = async () => {
    let values;
    try {
      values = await formLote.validateFields();
    } catch {
      return;
    }
    if (!doctor) return;

    try {
      setGenerando(true);
      const res = await fetch("/api/admin/availability-slots/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor.id,
          serviceId: values.serviceId,
          startDate: values.rango[0].format(FORMATO_FECHA),
          endDate: values.rango[1].format(FORMATO_FECHA),
          weekdays: values.weekdays,
          dayStart: values.franja[0].format(FORMATO_HORA),
          dayEnd: values.franja[1].format(FORMATO_HORA),
          blockMinutes: values.blockMinutes,
          maxAppointments: values.maxAppointments,
          modality: values.modality,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al generar los horarios");

      if (json.creados === 0) message.warning(json.message);
      else message.success(json.message);

      setModalLote(false);
      refrescar();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al generar los horarios");
    } finally {
      setGenerando(false);
    }
  };

  const [fechaSugerida, setFechaSugerida] = useState<Dayjs | null>(null);

  const valoresHorario = editando
    ? {
        serviceId: editando.service_id,
        slotDate: leerFecha(editando.slot_date),
        timeRange: [leerHora(editando.start_time), leerHora(editando.end_time)],
        maxAppointments: editando.max_appointments,
        modality: editando.modality ?? "online",
        isAvailable: editando.is_available,
        notes: editando.notes ?? undefined,
      }
    : {
        slotDate: fechaSugerida ?? diaElegido,
        maxAppointments: 1,
        modality: "online",
        isAvailable: true,
      };

  const abrirNuevo = (fecha?: Dayjs) => {
    setEditando(null);
    setFechaSugerida(fecha ?? diaElegido);
    setModalAbierto(true);
  };

  const abrirEdicion = (slot: AvailabilitySlot) => {
    setEditando(slot);
    setModalAbierto(true);
  };

  const guardar = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    if (!doctor) return;

    // Nada de .tz() aquí: se manda el reloj de pared tal cual se capturó.
    const cuerpo = {
      doctorId: doctor.id,
      serviceId: values.serviceId,
      slotDate: values.slotDate.format(FORMATO_FECHA),
      startTime: values.timeRange[0].format(FORMATO_HORA),
      endTime: values.timeRange[1].format(FORMATO_HORA),
      maxAppointments: values.maxAppointments,
      modality: values.modality,
      notes: values.notes || null,
      isAvailable: values.isAvailable,
    };

    try {
      setGuardando(true);
      const res = await fetch("/api/admin/availability-slots", {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editando ? { ...cuerpo, id: editando.id } : cuerpo),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar el horario");
      message.success(editando ? "Horario actualizado" : "Horario creado");
      setModalAbierto(false);
      refrescar();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al guardar el horario");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = (slot: AvailabilitySlot) => {
    modal.confirm({
      title: "Eliminar horario",
      content: `${leerFecha(slot.slot_date).format("DD/MM/YYYY")} de ${leerHora(
        slot.start_time,
      ).format("HH:mm")} a ${leerHora(slot.end_time).format("HH:mm")}. Si ya tiene citas, no se podrá eliminar.`,
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/availability-slots?id=${slot.id}`, {
            method: "DELETE",
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Error al eliminar");
          message.success("Horario eliminado");
          refrescar();
        } catch (error) {
          message.error(error instanceof Error ? error.message : "Error al eliminar el horario");
        }
      },
    });
  };

  const alternarDisponible = async (slot: AvailabilitySlot) => {
    try {
      const res = await fetch("/api/admin/availability-slots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slot.id, isAvailable: !slot.is_available }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al cambiar la disponibilidad");
      refrescar();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al cambiar la disponibilidad");
    }
  };

  const columnas: ColumnsType<AvailabilitySlot> = [
    {
      title: "Fecha",
      dataIndex: "slot_date",
      key: "slot_date",
      sorter: (a, b) => a.slot_date.localeCompare(b.slot_date),
      defaultSortOrder: "ascend",
      render: (f: string) => leerFecha(f).format("ddd DD/MM/YYYY"),
    },
    {
      title: "Horario",
      key: "horario",
      render: (_, r) =>
        `${leerHora(r.start_time).format("HH:mm")} - ${leerHora(r.end_time).format("HH:mm")}`,
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
      title: "Cupo",
      dataIndex: "max_appointments",
      key: "max_appointments",
      align: "center",
      responsive: ["lg"],
    },
    {
      title: "Disponible",
      dataIndex: "is_available",
      key: "is_available",
      align: "center",
      render: (v: boolean, r) => (
        <Switch
          size="small"
          checked={v}
          onChange={() => alternarDisponible(r)}
          aria-label="Alternar disponibilidad"
        />
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right",
      render: (_, r) => (
        <Space size="small">
          <Tooltip title="Editar">
            <Button size="small" icon={<EditOutlined />} onClick={() => abrirEdicion(r)} />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => eliminar(r)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (sinSesion) {
    return (
      <Alert
        type="error"
        showIcon
        title="No se encontró tu sesión"
        description="Vuelve a iniciar sesión para administrar tus horarios."
        action={
          <Link href="/login/doctor">
            <Button size="small">Iniciar sesión</Button>
          </Link>
        }
      />
    );
  }

  const disponiblesDelMes = slots.filter((s) => s.is_available).length;

  return (
    <Flex vertical gap={token.marginLG}>
      <Flex justify="space-between" align="flex-start" gap={token.margin} wrap>
        <div>
          <Title level={2} style={{ marginTop: 0, marginBottom: token.marginXXS }}>
            Horarios de atención
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Los bloques que abres aquí son los que tus pacientes pueden reservar. Las horas son
            de Monterrey.
          </Paragraph>
        </div>
        <Space wrap>
          <Button
            size="large"
            icon={<ThunderboltOutlined />}
            onClick={abrirLote}
            disabled={servicios.length === 0}
          >
            Generar varios
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => abrirNuevo()}
            disabled={servicios.length === 0}
          >
            Nuevo horario
          </Button>
        </Space>
      </Flex>

      {servicios.length === 0 && !loading && (
        // Sin servicios propios no hay nada que ofrecer en un horario: la API
        // rechaza el alta, así que conviene decirlo antes de intentarlo.
        <Alert
          type="warning"
          showIcon
          title="Primero elige los servicios que ofreces"
          description="Un horario siempre corresponde a un servicio tuyo. Mientras no tengas ninguno marcado, no puedes abrir horarios."
          action={
            <Link href="/admin/mis-servicios">
              <Button size="small">Ir a Mis Servicios</Button>
            </Link>
          }
        />
      )}

      <Row gutter={[token.margin, token.margin]}>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title={`Horarios en ${mes.format("MMMM")}`}
              value={slots.length}
              loading={loading}
              styles={{ content: { color: token.colorPrimary } }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title="Disponibles"
              value={disponiblesDelMes}
              loading={loading}
              styles={{ content: { color: token.colorSuccess } }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title="Servicios que ofreces"
              value={servicios.length}
              loading={loading}
              styles={{ content: { color: token.colorInfo } }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[token.margin, token.margin]}>
        <Col xs={24} lg={15}>
          <Card
            title="Calendario"
            extra={
              <Button icon={<ReloadOutlined />} onClick={refrescar} loading={loading}>
                Actualizar
              </Button>
            }
          >
            <Calendar
              value={diaElegido}
              onSelect={(fecha) => setDiaElegido(fecha)}
              onPanelChange={(fecha) => {
                setMes(fecha);
                setDiaElegido(fecha);
              }}
              /*
               * `cellRender` (dateCellRender quedó deprecada) sustituye sólo el
               * CONTENIDO de la celda, no la celda entera: el número del día ya
               * lo pinta antd aparte. Devolver aquí `info.originNode` lo
               * duplicaba.
               */
              cellRender={(fecha, info) => {
                if (info.type !== "date") return info.originNode;
                const delDia = porFecha.get(fecha.format(FORMATO_FECHA)) ?? [];
                if (delDia.length === 0) return null;
                const libres = delDia.filter((s) => s.is_available).length;
                return (
                  <Flex justify="center">
                    <Badge
                      count={delDia.length}
                      color={libres > 0 ? token.colorSuccess : token.colorTextQuaternary}
                      size="small"
                    />
                  </Flex>
                );
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            title={diaElegido.format("dddd D [de] MMMM")}
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => abrirNuevo(diaElegido)}
                disabled={servicios.length === 0}
              >
                Agregar
              </Button>
            }
          >
            {slotsDelDia.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Sin horarios este día"
              />
            ) : (
              <Flex vertical gap={token.marginSM}>
                {slotsDelDia
                  .slice()
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map((slot) => {
                    const mod = slot.modality ? MODALIDADES[slot.modality] : undefined;
                    return (
                      <Card key={slot.id} size="small">
                        <Flex justify="space-between" align="flex-start" gap={token.marginXS} wrap>
                          <Flex vertical gap={2}>
                            <Text strong>
                              {leerHora(slot.start_time).format("HH:mm")} -{" "}
                              {leerHora(slot.end_time).format("HH:mm")}
                            </Text>
                            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                              {slot.service?.title ?? "Servicio no disponible"}
                            </Text>
                            <Space size={4} wrap>
                              {mod && <Tag color={mod.color}>{mod.texto}</Tag>}
                              <Tag color={slot.is_available ? "success" : "default"}>
                                {slot.is_available ? "Disponible" : "Cerrado"}
                              </Tag>
                              {slot.max_appointments > 1 && (
                                <Tag>Cupo {slot.max_appointments}</Tag>
                              )}
                            </Space>
                          </Flex>
                          <Space size="small">
                            <Tooltip title="Editar">
                              <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => abrirEdicion(slot)}
                              />
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => eliminar(slot)}
                              />
                            </Tooltip>
                          </Space>
                        </Flex>
                        {slot.notes && (
                          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                            {slot.notes}
                          </Text>
                        )}
                      </Card>
                    );
                  })}
              </Flex>
            )}
          </Card>
        </Col>
      </Row>

      <Card title={`Todos los horarios de ${mes.format("MMMM [de] YYYY")}`}>
        <Table
          columns={columnas}
          dataSource={slots}
          rowKey="id"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 10, hideOnSinglePage: true, responsive: true }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No hay horarios este mes"
              />
            ),
          }}
        />
      </Card>

      <Modal
        title={editando ? "Editar horario" : "Nuevo horario"}
        open={modalAbierto}
        onOk={guardar}
        onCancel={() => setModalAbierto(false)}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={guardando}
        width={560}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={valoresHorario}
          style={{ marginTop: token.margin }}
        >
          <Form.Item
            label="Servicio"
            name="serviceId"
            rules={[{ required: true, message: "Elige el servicio" }]}
          >
            <Select
              placeholder="Selecciona"
              options={servicios.map((s) => ({
                value: s.id,
                label: `${s.title} (${s.duration_minutes} min)`,
              }))}
            />
          </Form.Item>

          <Row gutter={token.margin}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Fecha"
                name="slotDate"
                rules={[{ required: true, message: "Elige la fecha" }]}
              >
                {/* DatePicker y no Calendar: es el control de un campo de fecha. */}
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  minDate={dayjs().startOf("day")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Horario"
                name="timeRange"
                rules={[{ required: true, message: "Indica el rango de horas" }]}
              >
                <TimePicker.RangePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  minuteStep={15}
                  order={false}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={token.margin}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Modalidad"
                name="modality"
                tooltip="Sólo se listan las que admite el servicio elegido."
                rules={[{ required: true, message: "Elige la modalidad" }]}
              >
                <Select options={modalidadesPermitidas} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Cupo"
                name="maxAppointments"
                tooltip="Cuántas citas caben en este bloque."
                rules={[{ required: true, message: "Indica el cupo" }]}
              >
                <InputNumber min={1} max={10} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Disponible" name="isAvailable" valuePropName="checked">
            <Switch checkedChildren="Sí" unCheckedChildren="No" />
          </Form.Item>

          <Form.Item label="Notas" name="notes">
            <TextArea rows={2} maxLength={300} showCount placeholder="Opcional." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Generar varios horarios"
        open={modalLote}
        onOk={generarLote}
        onCancel={() => setModalLote(false)}
        okText={previaLote?.total ? `Generar ${previaLote.total}` : "Generar"}
        cancelText="Cancelar"
        confirmLoading={generando}
        okButtonProps={{ disabled: !previaLote?.total }}
        width={620}
        destroyOnHidden
      >
        <Paragraph type="secondary">
          Define una regla y se crean todos los bloques de una vez. Los que se encimen con
          horarios que ya tengas se omiten, no se sobrescriben.
        </Paragraph>

        <Form form={formLote} layout="vertical" initialValues={valoresLote}>
          <Form.Item
            label="Servicio"
            name="serviceId"
            rules={[{ required: true, message: "Elige el servicio" }]}
          >
            <Select
              placeholder="Selecciona"
              options={servicios.map((s) => ({
                value: s.id,
                label: `${s.title} (${s.duration_minutes} min)`,
              }))}
              onChange={(id) => {
                // El bloque arranca igual a la duración del servicio: es lo que
                // hace que los horarios cuadren con la cita real.
                const s = servicios.find((x) => x.id === id);
                if (s) formLote.setFieldValue("blockMinutes", s.duration_minutes);
              }}
            />
          </Form.Item>

          <Form.Item
            label="Desde / hasta"
            name="rango"
            rules={[{ required: true, message: "Elige el rango de fechas" }]}
          >
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              minDate={dayjs().startOf("day")}
            />
          </Form.Item>

          <Form.Item
            label="Días de la semana"
            name="weekdays"
            rules={[{ required: true, message: "Elige al menos un día" }]}
          >
            <Checkbox.Group
              options={[
                { label: "Lun", value: 1 },
                { label: "Mar", value: 2 },
                { label: "Mié", value: 3 },
                { label: "Jue", value: 4 },
                { label: "Vie", value: 5 },
                { label: "Sáb", value: 6 },
                { label: "Dom", value: 0 },
              ]}
            />
          </Form.Item>

          <Row gutter={token.margin}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Franja del día"
                name="franja"
                tooltip="Se parte en bloques del tamaño indicado."
                rules={[{ required: true, message: "Indica la franja" }]}
              >
                <TimePicker.RangePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  minuteStep={15}
                  order={false}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Duración de cada bloque"
                name="blockMinutes"
                rules={[{ required: true, message: "Indica la duración" }]}
              >
                <InputNumber min={15} max={240} step={15} suffix="min" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={token.margin}>
            <Col xs={24} sm={12}>
              <Form.Item label="Modalidad" name="modality" rules={[{ required: true }]}>
                <Select options={modalidadesLote} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Cupo por bloque" name="maxAppointments" rules={[{ required: true }]}>
                <InputNumber min={1} max={10} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {previaLote && (
          <Alert
            type={previaLote.total ? "info" : "warning"}
            showIcon
            title={
              previaLote.total
                ? `Se generarán ${previaLote.total} horarios`
                : "Con estos datos no se genera ningún horario"
            }
            description={
              previaLote.total
                ? `${previaLote.porDia} bloque(s) por día en ${previaLote.dias} día(s).`
                : "Revisa que la franja sea más larga que un bloque y que haya días elegidos."
            }
          />
        )}
      </Modal>
    </Flex>
  );
}
