"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Descriptions,
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
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/es";

dayjs.extend(customParseFormat);
dayjs.locale("es");

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const FORMATO_FECHA = "YYYY-MM-DD";

/** `visit_date` y `next_visit_date` son `date`: sin zona, no se convierten. */
const leerFecha = (v?: string | null) => (v ? dayjs(v, FORMATO_FECHA) : null);

type TipoAtencion = "Psicológica" | "Médica";

interface PacienteBreve {
  id: string;
  full_name: string;
  attention_type: TipoAtencion;
  date_of_birth?: string;
}

interface Expediente {
  id: string;
  patient_id: string;
  visit_date: string;
  chief_complaint?: string | null;
  diagnosis: string;
  differential_diagnosis?: string | null;
  treatment_plan?: string | null;
  prescriptions?: string | null;
  recommendations?: string | null;
  next_visit_date?: string | null;
  follow_up_notes?: string | null;
  // Signos vitales (atención médica)
  blood_pressure?: string | null;
  heart_rate?: number | null;
  temperature?: number | null;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  physical_examination?: string | null;
  // Antecedentes
  current_illness?: string | null;
  medical_history?: string | null;
  family_history?: string | null;
  allergies?: string | null;
  current_medications?: string | null;
  // Examen mental (atención psicológica)
  mental_status?: string | null;
  mood?: string | null;
  affect?: string | null;
  thought_process?: string | null;
  thought_content?: string | null;
  perception?: string | null;
  cognition?: string | null;
  insight?: string | null;
  judgment?: string | null;
  risk_assessment?: string | null;
  patient?: { full_name?: string; attention_type?: TipoAtencion } | null;
}

/** Campos de texto largo, agrupados como se capturan en consulta. */
const ANTECEDENTES: [keyof Expediente, string][] = [
  ["current_illness", "Padecimiento actual"],
  ["medical_history", "Antecedentes personales"],
  ["family_history", "Antecedentes familiares"],
  ["allergies", "Alergias"],
  ["current_medications", "Medicación actual"],
];

const EXAMEN_MENTAL: [keyof Expediente, string][] = [
  ["mental_status", "Estado mental"],
  ["mood", "Estado de ánimo"],
  ["affect", "Afecto"],
  ["thought_process", "Curso del pensamiento"],
  ["thought_content", "Contenido del pensamiento"],
  ["perception", "Sensopercepción"],
  ["cognition", "Cognición"],
  ["insight", "Introspección"],
  ["judgment", "Juicio"],
  ["risk_assessment", "Valoración de riesgo"],
];

const PLAN: [keyof Expediente, string][] = [
  ["differential_diagnosis", "Diagnóstico diferencial"],
  ["treatment_plan", "Plan de tratamiento"],
  ["prescriptions", "Prescripciones"],
  ["recommendations", "Recomendaciones"],
  ["follow_up_notes", "Notas de seguimiento"],
];

async function obtenerExpedientes(): Promise<Expediente[]> {
  const res = await fetch("/api/admin/medical-records");
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al cargar los expedientes");
  return json.records ?? json ?? [];
}

async function obtenerPacientes(): Promise<PacienteBreve[]> {
  const res = await fetch("/api/admin/patients");
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al cargar los pacientes");
  return (json.patients ?? []).filter(
    (p: { status?: string }) => p.status === "approved",
  );
}

export default function HistorialPage() {
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [pacientes, setPacientes] = useState<PacienteBreve[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroPaciente, setFiltroPaciente] = useState<string>("all");

  const [verDetalle, setVerDetalle] = useState<Expediente | null>(null);
  const [modalForm, setModalForm] = useState(false);
  const [editando, setEditando] = useState<Expediente | null>(null);

  // El tipo de atención del paciente elegido decide qué secciones se piden:
  // un examen mental en una consulta médica sobra, y los signos vitales en una
  // psicológica también.
  const pacienteElegido = Form.useWatch("patient_id", form);
  const peso = Form.useWatch("weight", form);
  const talla = Form.useWatch("height", form);

  const tipoAtencion = useMemo<TipoAtencion | null>(() => {
    const p = pacientes.find((x) => x.id === pacienteElegido);
    return p?.attention_type ?? null;
  }, [pacientes, pacienteElegido]);

  // El IMC no se captura: se deriva de peso y talla, así no puede contradecirlos.
  const imc = useMemo(() => {
    if (!peso || !talla) return null;
    const metros = Number(talla) / 100;
    if (metros <= 0) return null;
    return Number((Number(peso) / (metros * metros)).toFixed(2));
  }, [peso, talla]);

  const cargar = useCallback(
    (vivo: () => boolean) =>
      Promise.all([obtenerExpedientes(), obtenerPacientes()])
        .then(([exp, pac]) => {
          if (!vivo()) return;
          setExpedientes(exp);
          setPacientes(pac);
        })
        .catch((error: unknown) => {
          console.error("Error cargando el historial:", error);
          if (vivo()) {
            message.error(error instanceof Error ? error.message : "Error al cargar");
          }
        })
        .finally(() => {
          if (vivo()) setLoading(false);
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

  const refrescar = () => {
    setLoading(true);
    cargar(() => true);
  };

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return expedientes.filter((e) => {
      if (filtroPaciente !== "all" && e.patient_id !== filtroPaciente) return false;
      if (!q) return true;
      return [e.patient?.full_name, e.diagnosis, e.chief_complaint].some((v) =>
        v?.toLowerCase().includes(q),
      );
    });
  }, [expedientes, busqueda, filtroPaciente]);

  const esteMes = expedientes.filter((e) =>
    leerFecha(e.visit_date)?.isSame(dayjs(), "month"),
  ).length;

  // Igual que en las otras pantallas: por initialValues, no con setFieldsValue
  // antes de que el <Form> exista.
  const valoresIniciales = editando
    ? {
        ...editando,
        visit_date: leerFecha(editando.visit_date),
        next_visit_date: leerFecha(editando.next_visit_date),
      }
    : { visit_date: dayjs() };

  const abrirNuevo = () => {
    setEditando(null);
    setModalForm(true);
  };

  const abrirEdicion = (e: Expediente) => {
    setEditando(e);
    setModalForm(true);
  };

  const eliminar = (e: Expediente) =>
    modal.confirm({
      title: "Eliminar expediente",
      content: `Se borrará la nota clínica de ${
        e.patient?.full_name ?? "el paciente"
      } del ${leerFecha(e.visit_date)?.format("DD/MM/YYYY")}. Esta acción no se puede deshacer.`,
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/medical-records?id=${e.id}`, { method: "DELETE" });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Error al eliminar");
          message.success("Expediente eliminado");
          refrescar();
        } catch (error) {
          message.error(error instanceof Error ? error.message : "Error al eliminar");
        }
      },
    });

  const guardar = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;

    const cuerpo = {
      ...values,
      visit_date: values.visit_date.format(FORMATO_FECHA),
      next_visit_date: values.next_visit_date
        ? values.next_visit_date.format(FORMATO_FECHA)
        : null,
      bmi: imc,
      ...(editando ? { id: editando.id } : {}),
    };

    try {
      setGuardando(true);
      const res = await fetch("/api/admin/medical-records", {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      message.success(editando ? "Expediente actualizado" : "Expediente creado");
      setModalForm(false);
      refrescar();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const columnas: ColumnsType<Expediente> = [
    {
      title: "Fecha",
      dataIndex: "visit_date",
      key: "visit_date",
      sorter: (a, b) => a.visit_date.localeCompare(b.visit_date),
      defaultSortOrder: "descend",
      render: (v: string) => leerFecha(v)?.format("DD/MM/YYYY"),
    },
    {
      title: "Paciente",
      key: "paciente",
      render: (_, r) => (
        <Flex vertical>
          <Text strong>{r.patient?.full_name?.trim() ?? "—"}</Text>
          {r.patient?.attention_type && (
            <Tag
              color={r.patient.attention_type === "Psicológica" ? "blue" : "green"}
              style={{ marginTop: 2, alignSelf: "flex-start" }}
            >
              {r.patient.attention_type}
            </Tag>
          )}
        </Flex>
      ),
    },
    {
      title: "Motivo",
      dataIndex: "chief_complaint",
      key: "chief_complaint",
      responsive: ["lg"],
      render: (v?: string | null) => v || "—",
    },
    {
      title: "Diagnóstico",
      dataIndex: "diagnosis",
      key: "diagnosis",
      responsive: ["md"],
    },
    {
      title: "Próxima visita",
      dataIndex: "next_visit_date",
      key: "next_visit_date",
      responsive: ["lg"],
      render: (v?: string | null) => leerFecha(v)?.format("DD/MM/YYYY") ?? "—",
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right",
      render: (_, r) => (
        <Space size="small">
          <Tooltip title="Ver expediente">
            <Button size="small" icon={<FileTextOutlined />} onClick={() => setVerDetalle(r)} />
          </Tooltip>
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

  /** Renderiza sólo los campos con contenido: un expediente lleno de guiones no se lee. */
  const seccionConTexto = (titulo: string, campos: [keyof Expediente, string][], e: Expediente) => {
    const conValor = campos.filter(([k]) => e[k]);
    if (conValor.length === 0) return null;
    return {
      key: titulo,
      label: titulo,
      children: (
        <Descriptions column={1} size="small" bordered
          items={conValor.map(([k, etiqueta]) => ({
            key: String(k),
            label: etiqueta,
            children: String(e[k]),
          }))}
        />
      ),
    };
  };

  const camposTexto = (campos: [keyof Expediente, string][]) =>
    campos.map(([nombre, etiqueta]) => (
      <Form.Item key={String(nombre)} label={etiqueta} name={nombre as string}>
        <TextArea rows={2} maxLength={2000} />
      </Form.Item>
    ));

  return (
    <Flex vertical gap={token.marginLG}>
      <Flex justify="space-between" align="flex-start" gap={token.margin} wrap>
        <div>
          <Title level={2} style={{ marginTop: 0, marginBottom: token.marginXXS }}>
            Historial clínico
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Notas de consulta de tus pacientes. Sólo tú ves tus expedientes.
          </Paragraph>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={abrirNuevo}
          disabled={pacientes.length === 0}
        >
          Nueva nota
        </Button>
      </Flex>

      <Row gutter={[token.margin, token.margin]}>
        <Col xs={12} lg={8}>
          <Card>
            <Statistic title="Expedientes" value={expedientes.length} loading={loading}
              styles={{ content: { color: token.colorPrimary } }} />
          </Card>
        </Col>
        <Col xs={12} lg={8}>
          <Card>
            <Statistic title="Este mes" value={esteMes} loading={loading}
              styles={{ content: { color: token.colorInfo } }} />
          </Card>
        </Col>
        <Col xs={12} lg={8}>
          <Card>
            <Statistic
              title="Pacientes con expediente"
              value={new Set(expedientes.map((e) => e.patient_id)).size}
              loading={loading}
              styles={{ content: { color: token.colorSuccess } }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Flex gap={token.margin} wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Buscar por paciente, diagnóstico o motivo"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ flex: "1 1 260px" }}
          />
          <Select
            value={filtroPaciente}
            onChange={setFiltroPaciente}
            showSearch
            optionFilterProp="label"
            style={{ flex: "0 1 260px", minWidth: 200 }}
            options={[
              { value: "all", label: "Todos los pacientes" },
              ...pacientes.map((p) => ({ value: p.id, label: p.full_name.trim() })),
            ]}
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
                description={
                  expedientes.length ? "Ningún expediente coincide" : "Aún no hay notas clínicas"
                }
              />
            ),
          }}
        />
      </Card>

      {/* Detalle */}
      <Modal
        title={
          verDetalle
            ? `${verDetalle.patient?.full_name?.trim()} · ${leerFecha(verDetalle.visit_date)?.format("DD/MM/YYYY")}`
            : "Expediente"
        }
        open={Boolean(verDetalle)}
        onCancel={() => setVerDetalle(null)}
        footer={<Button onClick={() => setVerDetalle(null)}>Cerrar</Button>}
        width={800}
      >
        {verDetalle && (
          <Flex vertical gap={token.margin}>
            <Descriptions
              bordered
              size="small"
              column={{ xs: 1, md: 2 }}
              items={[
                { key: "m", label: "Motivo", span: "filled", children: verDetalle.chief_complaint || "—" },
                { key: "d", label: "Diagnóstico", span: "filled", children: verDetalle.diagnosis },
                {
                  key: "p",
                  label: "Próxima visita",
                  children: leerFecha(verDetalle.next_visit_date)?.format("DD/MM/YYYY") ?? "—",
                },
              ]}
            />

            {verDetalle.patient?.attention_type === "Médica" &&
              (verDetalle.blood_pressure || verDetalle.heart_rate || verDetalle.weight) && (
                <Descriptions
                  title="Signos vitales"
                  bordered
                  size="small"
                  column={{ xs: 1, sm: 2, md: 3 }}
                  items={[
                    { key: "ta", label: "Presión", children: verDetalle.blood_pressure || "—" },
                    { key: "fc", label: "Frecuencia", children: verDetalle.heart_rate ? `${verDetalle.heart_rate} lpm` : "—" },
                    { key: "t", label: "Temperatura", children: verDetalle.temperature ? `${verDetalle.temperature} °C` : "—" },
                    { key: "pe", label: "Peso", children: verDetalle.weight ? `${verDetalle.weight} kg` : "—" },
                    { key: "ta2", label: "Talla", children: verDetalle.height ? `${verDetalle.height} cm` : "—" },
                    { key: "imc", label: "IMC", children: verDetalle.bmi ?? "—" },
                  ]}
                />
              )}

            <Collapse
              items={[
                seccionConTexto("Antecedentes", ANTECEDENTES, verDetalle),
                ...(verDetalle.patient?.attention_type === "Psicológica"
                  ? [seccionConTexto("Examen mental", EXAMEN_MENTAL, verDetalle)]
                  : [seccionConTexto("Exploración física", [["physical_examination", "Exploración"]], verDetalle)]),
                seccionConTexto("Plan y seguimiento", PLAN, verDetalle),
              ].filter((x): x is NonNullable<typeof x> => Boolean(x))}
            />
          </Flex>
        )}
      </Modal>

      {/* Alta y edición */}
      <Modal
        title={editando ? "Editar expediente" : "Nueva nota clínica"}
        open={modalForm}
        onOk={guardar}
        onCancel={() => setModalForm(false)}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={guardando}
        width={860}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={valoresIniciales}>
          <Row gutter={token.margin}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Paciente"
                name="patient_id"
                rules={[{ required: true, message: "Elige al paciente" }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Selecciona"
                  disabled={Boolean(editando)}
                  options={pacientes.map((p) => ({
                    value: p.id,
                    label: `${p.full_name.trim()} (${p.attention_type})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Fecha de la consulta"
                name="visit_date"
                rules={[{ required: true, message: "Indica la fecha" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Próxima visita" name="next_visit_date">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Motivo de consulta" name="chief_complaint">
            <TextArea rows={2} maxLength={500} />
          </Form.Item>

          <Form.Item
            label="Diagnóstico"
            name="diagnosis"
            rules={[{ required: true, message: "El diagnóstico es obligatorio" }]}
          >
            <TextArea rows={2} maxLength={1000} />
          </Form.Item>

          <Tabs
            items={[
              {
                key: "antecedentes",
                label: "Antecedentes",
                children: <>{camposTexto(ANTECEDENTES)}</>,
              },
              // Las secciones específicas dependen del tipo de atención del
              // paciente: pedir examen mental en una consulta médica sobra.
              ...(tipoAtencion === "Psicológica"
                ? [
                    {
                      key: "mental",
                      label: "Examen mental",
                      children: <>{camposTexto(EXAMEN_MENTAL)}</>,
                    },
                  ]
                : []),
              ...(tipoAtencion === "Médica"
                ? [
                    {
                      key: "vitales",
                      label: "Signos vitales",
                      children: (
                        <>
                          <Row gutter={token.margin}>
                            <Col xs={12} md={8}>
                              <Form.Item label="Presión arterial" name="blood_pressure">
                                <Input placeholder="120/80" />
                              </Form.Item>
                            </Col>
                            <Col xs={12} md={8}>
                              <Form.Item label="Frecuencia cardiaca" name="heart_rate">
                                <InputNumber min={20} max={250} suffix="lpm" style={{ width: "100%" }} />
                              </Form.Item>
                            </Col>
                            <Col xs={12} md={8}>
                              <Form.Item label="Temperatura" name="temperature">
                                <InputNumber min={30} max={45} step={0.1} suffix="°C" style={{ width: "100%" }} />
                              </Form.Item>
                            </Col>
                            <Col xs={12} md={8}>
                              <Form.Item label="Peso" name="weight">
                                <InputNumber min={1} max={400} step={0.1} suffix="kg" style={{ width: "100%" }} />
                              </Form.Item>
                            </Col>
                            <Col xs={12} md={8}>
                              <Form.Item label="Talla" name="height">
                                <InputNumber min={30} max={250} step={0.5} suffix="cm" style={{ width: "100%" }} />
                              </Form.Item>
                            </Col>
                            <Col xs={12} md={8}>
                              <Form.Item
                                label="IMC"
                                tooltip="Se calcula solo con el peso y la talla; no se captura para que no pueda contradecirlos."
                              >
                                <Input readOnly value={imc ?? ""} placeholder="—" />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Form.Item label="Exploración física" name="physical_examination">
                            <TextArea rows={3} maxLength={2000} />
                          </Form.Item>
                        </>
                      ),
                    },
                  ]
                : []),
              {
                key: "plan",
                label: "Plan y seguimiento",
                children: <>{camposTexto(PLAN)}</>,
              },
            ]}
          />
        </Form>
      </Modal>
    </Flex>
  );
}
