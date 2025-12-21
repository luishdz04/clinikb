"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  App,
  Space,
  Row,
  Col,
  Descriptions,
  Tag,
  Tabs,
  InputNumber,
  Divider,
} from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { MedicalRecord } from "@/types/appointments";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Patient {
  id: string;
  full_name: string;
  email: string;
  attention_type: "Psicológica" | "Médica";
}

interface DoctorInfo {
  id: string;
  full_name: string;
  email: string;
}

export default function HistorialClinicoPage() {
  const { message, modal } = App.useApp();
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [selectedPatientType, setSelectedPatientType] = useState<"Psicológica" | "Médica" | null>(
    null
  );
  const [form] = Form.useForm();

  useEffect(() => {
    const doctorStr = localStorage.getItem("doctor");
    if (doctorStr) {
      const doctorData = JSON.parse(doctorStr);
      setDoctor(doctorData);
    }
  }, []);

  useEffect(() => {
    if (doctor?.id) {
      fetchRecords();
      fetchPatients();
    }
  }, [doctor]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/medical-records?doctor_id=${doctor?.id}`);
      if (!response.ok) {
        throw new Error("Error al cargar registros");
      }
      const data = await response.json();
      setRecords(data.records || []);
    } catch (error) {
      console.error("Error loading records:", error);
      message.error("Error al cargar el historial clínico");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/admin/patients");
      if (!response.ok) {
        throw new Error("Error al cargar pacientes");
      }
      const data = await response.json();
      // Solo pacientes aprobados
      const approvedPatients = data.patients.filter((p: any) => p.status === "approved");
      setPatients(approvedPatients);
    } catch (error) {
      console.error("Error loading patients:", error);
    }
  };

  const handleCreate = () => {
    setEditingRecord(null);
    setSelectedPatientType(null);
    form.resetFields();
    setFormModalVisible(true);
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setSelectedPatientType(record.patient?.attention_type || null);
    form.setFieldsValue({
      patient_id: record.patient_id,
      visit_date: dayjs(record.visit_date),
      chief_complaint: record.chief_complaint,
      blood_pressure: record.blood_pressure,
      heart_rate: record.heart_rate,
      temperature: record.temperature,
      weight: record.weight,
      height: record.height,
      current_illness: record.current_illness,
      medical_history: record.medical_history,
      family_history: record.family_history,
      allergies: record.allergies,
      current_medications: record.current_medications,
      mental_status: record.mental_status,
      mood: record.mood,
      affect: record.affect,
      thought_process: record.thought_process,
      thought_content: record.thought_content,
      risk_assessment: record.risk_assessment,
      physical_examination: record.physical_examination,
      diagnosis: record.diagnosis,
      differential_diagnosis: record.differential_diagnosis,
      treatment_plan: record.treatment_plan,
      prescriptions: record.prescriptions,
      recommendations: record.recommendations,
      next_visit_date: record.next_visit_date ? dayjs(record.next_visit_date) : null,
      follow_up_notes: record.follow_up_notes,
    });
    setFormModalVisible(true);
  };

  const handleDelete = (record: MedicalRecord) => {
    modal.confirm({
      title: "Eliminar Registro",
      content: "¿Estás seguro de eliminar este registro médico? Esta acción no se puede deshacer.",
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const response = await fetch(`/api/admin/medical-records?id=${record.id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Error al eliminar");
          }

          message.success("Registro eliminado exitosamente");
          fetchRecords();
        } catch (error: any) {
          message.error(error.message || "Error al eliminar registro");
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Calcular BMI si hay peso y altura
      let bmi = null;
      if (values.weight && values.height) {
        const heightInMeters = values.height / 100;
        bmi = values.weight / (heightInMeters * heightInMeters);
        bmi = Math.round(bmi * 100) / 100; // 2 decimales
      }

      const payload = {
        ...values,
        doctor_id: doctor?.id,
        visit_date: values.visit_date.format("YYYY-MM-DD"),
        next_visit_date: values.next_visit_date ? values.next_visit_date.format("YYYY-MM-DD") : null,
        bmi,
      };

      const url = "/api/admin/medical-records";
      const method = editingRecord ? "PUT" : "POST";

      if (editingRecord) {
        payload.id = editingRecord.id;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al guardar");
      }

      message.success(result.message);
      setFormModalVisible(false);
      fetchRecords();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || "Error al guardar registro");
    }
  };

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    setSelectedPatientType(patient?.attention_type || null);
  };

  const handleViewDetails = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setDetailsModalVisible(true);
  };

  const columns: ColumnsType<MedicalRecord> = [
    {
      title: "Fecha",
      dataIndex: "visit_date",
      key: "visit_date",
      render: (date: string) => (
        <div>
          <CalendarOutlined className="mr-1" />
          {dayjs(date).format("DD/MM/YYYY")}
        </div>
      ),
      sorter: (a, b) => dayjs(a.visit_date).diff(dayjs(b.visit_date)),
    },
    {
      title: "Paciente",
      key: "patient",
      render: (_, record) => (
        <div>
          <div className="font-semibold text-[#367c84]">
            <UserOutlined className="mr-1" />
            {record.patient?.full_name}
          </div>
          <Tag color={record.patient?.attention_type === "Psicológica" ? "blue" : "green"}>
            {record.patient?.attention_type}
          </Tag>
        </div>
      ),
    },
    {
      title: "Motivo de Consulta",
      dataIndex: "chief_complaint",
      key: "chief_complaint",
      ellipsis: true,
      render: (text) => text || <Text type="secondary">No especificado</Text>,
    },
    {
      title: "Diagnóstico",
      dataIndex: "diagnosis",
      key: "diagnosis",
      ellipsis: true,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="small"
          >
            Ver
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Editar
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            size="small"
          >
            Eliminar
          </Button>
        </Space>
      ),
      width: 200,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Title level={2} className="!text-[#367c84] !mb-2">
            <FileTextOutlined className="mr-2" />
            Historial Clínico
          </Title>
          <Paragraph className="!mb-0 text-gray-600">
            Registros médicos y psicológicos de los pacientes
          </Paragraph>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
          Nuevo Registro
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal de Formulario */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>{editingRecord ? "Editar Registro Médico" : "Nuevo Registro Médico"}</span>
          </Space>
        }
        open={formModalVisible}
        onCancel={() => setFormModalVisible(false)}
        onOk={handleSubmit}
        okText="Guardar"
        cancelText="Cancelar"
        width={900}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="patient_id"
                label="Paciente"
                rules={[{ required: true, message: "Selecciona un paciente" }]}
              >
                <Select
                  placeholder="Seleccionar paciente"
                  showSearch
                  optionFilterProp="children"
                  onChange={handlePatientChange}
                  disabled={!!editingRecord}
                >
                  {patients.map((patient) => (
                    <Select.Option key={patient.id} value={patient.id}>
                      {patient.full_name} - {patient.attention_type}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="visit_date"
                label="Fecha de Visita"
                rules={[{ required: true, message: "Ingresa la fecha de visita" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="chief_complaint" label="Motivo de Consulta">
            <TextArea rows={2} placeholder="Motivo principal de la consulta" />
          </Form.Item>

          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: "Signos Vitales",
                children: (
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="blood_pressure" label="Presión Arterial">
                        <Input placeholder="120/80" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="heart_rate" label="Frecuencia Cardíaca (bpm)">
                        <InputNumber style={{ width: "100%" }} min={0} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="temperature" label="Temperatura (°C)">
                        <InputNumber style={{ width: "100%" }} min={0} step={0.1} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="weight" label="Peso (kg)">
                        <InputNumber style={{ width: "100%" }} min={0} step={0.1} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="height" label="Altura (cm)">
                        <InputNumber style={{ width: "100%" }} min={0} step={0.1} />
                      </Form.Item>
                    </Col>
                  </Row>
                ),
              },
              {
                key: "2",
                label: "Historia Clínica",
                children: (
                  <>
                    <Form.Item name="current_illness" label="Padecimiento Actual">
                      <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="medical_history" label="Antecedentes Médicos">
                      <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="family_history" label="Antecedentes Familiares">
                      <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="allergies" label="Alergias">
                      <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="current_medications" label="Medicamentos Actuales">
                      <TextArea rows={2} />
                    </Form.Item>
                  </>
                ),
              },
              ...(selectedPatientType === "Psicológica"
                ? [
                    {
                      key: "3",
                      label: "Evaluación Psicológica",
                      children: (
                        <>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="mental_status" label="Estado Mental">
                                <TextArea rows={2} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="mood" label="Estado de Ánimo">
                                <TextArea rows={2} />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="affect" label="Afecto">
                                <TextArea rows={2} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="thought_process" label="Proceso de Pensamiento">
                                <TextArea rows={2} />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Form.Item name="thought_content" label="Contenido del Pensamiento">
                            <TextArea rows={2} />
                          </Form.Item>
                          <Form.Item name="risk_assessment" label="Evaluación de Riesgo">
                            <TextArea rows={3} placeholder="Riesgo suicida, homicida, etc." />
                          </Form.Item>
                        </>
                      ),
                    },
                  ]
                : []),
              ...(selectedPatientType === "Médica"
                ? [
                    {
                      key: "4",
                      label: "Examen Físico",
                      children: (
                        <Form.Item name="physical_examination" label="Examen Físico">
                          <TextArea rows={6} />
                        </Form.Item>
                      ),
                    },
                  ]
                : []),
              {
                key: "5",
                label: "Diagnóstico y Tratamiento",
                children: (
                  <>
                    <Form.Item
                      name="diagnosis"
                      label="Diagnóstico"
                      rules={[{ required: true, message: "El diagnóstico es requerido" }]}
                    >
                      <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="differential_diagnosis" label="Diagnóstico Diferencial">
                      <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="treatment_plan" label="Plan de Tratamiento">
                      <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="prescriptions" label="Recetas">
                      <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="recommendations" label="Recomendaciones">
                      <TextArea rows={2} />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: "6",
                label: "Seguimiento",
                children: (
                  <>
                    <Form.Item name="next_visit_date" label="Próxima Cita">
                      <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="follow_up_notes" label="Notas de Seguimiento">
                      <TextArea rows={3} />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Modal>

      {/* Modal de Detalles */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Detalles del Registro Médico</span>
          </Space>
        }
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Cerrar
          </Button>,
        ]}
        width={900}
      >
        {selectedRecord && (
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: "Información General",
                children: (
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Paciente" span={2}>
                      <UserOutlined className="mr-1" />
                      <strong>{selectedRecord.patient?.full_name}</strong>
                      <Tag className="ml-2" color={selectedRecord.patient?.attention_type === "Psicológica" ? "blue" : "green"}>
                        {selectedRecord.patient?.attention_type}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Fecha de Visita">
                      {dayjs(selectedRecord.visit_date).format("DD/MM/YYYY")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Doctor">
                      {selectedRecord.doctor?.full_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Motivo de Consulta" span={2}>
                      {selectedRecord.chief_complaint || "No especificado"}
                    </Descriptions.Item>
                    {selectedRecord.blood_pressure && (
                      <Descriptions.Item label="Presión Arterial">
                        <HeartOutlined className="mr-1" />
                        {selectedRecord.blood_pressure}
                      </Descriptions.Item>
                    )}
                    {selectedRecord.heart_rate && (
                      <Descriptions.Item label="Frecuencia Cardíaca">
                        {selectedRecord.heart_rate} bpm
                      </Descriptions.Item>
                    )}
                    {selectedRecord.temperature && (
                      <Descriptions.Item label="Temperatura">
                        {selectedRecord.temperature} °C
                      </Descriptions.Item>
                    )}
                    {selectedRecord.weight && (
                      <Descriptions.Item label="Peso">
                        {selectedRecord.weight} kg
                      </Descriptions.Item>
                    )}
                    {selectedRecord.height && (
                      <Descriptions.Item label="Altura">
                        {selectedRecord.height} cm
                      </Descriptions.Item>
                    )}
                    {selectedRecord.bmi && (
                      <Descriptions.Item label="IMC">
                        {selectedRecord.bmi}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                ),
              },
              {
                key: "2",
                label: "Historia y Evaluación",
                children: (
                  <div className="space-y-4">
                    {selectedRecord.current_illness && (
                      <div>
                        <Text strong>Padecimiento Actual:</Text>
                        <Paragraph>{selectedRecord.current_illness}</Paragraph>
                      </div>
                    )}
                    {selectedRecord.medical_history && (
                      <div>
                        <Text strong>Antecedentes Médicos:</Text>
                        <Paragraph>{selectedRecord.medical_history}</Paragraph>
                      </div>
                    )}
                    {selectedRecord.allergies && (
                      <div>
                        <Text strong>
                          <AlertOutlined className="mr-1" />
                          Alergias:
                        </Text>
                        <Paragraph className="text-red-600">{selectedRecord.allergies}</Paragraph>
                      </div>
                    )}
                    {selectedRecord.mental_status && (
                      <div>
                        <Text strong>Estado Mental:</Text>
                        <Paragraph>{selectedRecord.mental_status}</Paragraph>
                      </div>
                    )}
                    {selectedRecord.risk_assessment && (
                      <div>
                        <Text strong className="text-red-600">
                          <AlertOutlined className="mr-1" />
                          Evaluación de Riesgo:
                        </Text>
                        <Paragraph className="text-red-600">{selectedRecord.risk_assessment}</Paragraph>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "3",
                label: "Diagnóstico y Tratamiento",
                children: (
                  <div className="space-y-4">
                    <div>
                      <Text strong>Diagnóstico:</Text>
                      <Paragraph className="text-[#367c84] text-lg font-semibold">
                        {selectedRecord.diagnosis}
                      </Paragraph>
                    </div>
                    {selectedRecord.differential_diagnosis && (
                      <div>
                        <Text strong>Diagnóstico Diferencial:</Text>
                        <Paragraph>{selectedRecord.differential_diagnosis}</Paragraph>
                      </div>
                    )}
                    {selectedRecord.treatment_plan && (
                      <div>
                        <Text strong>Plan de Tratamiento:</Text>
                        <Paragraph>{selectedRecord.treatment_plan}</Paragraph>
                      </div>
                    )}
                    {selectedRecord.prescriptions && (
                      <div>
                        <Text strong>
                          <MedicineBoxOutlined className="mr-1" />
                          Recetas:
                        </Text>
                        <Paragraph>{selectedRecord.prescriptions}</Paragraph>
                      </div>
                    )}
                    {selectedRecord.recommendations && (
                      <div>
                        <Text strong>Recomendaciones:</Text>
                        <Paragraph>{selectedRecord.recommendations}</Paragraph>
                      </div>
                    )}
                    {selectedRecord.next_visit_date && (
                      <div>
                        <Text strong>Próxima Cita:</Text>
                        <Paragraph>
                          <CalendarOutlined className="mr-1" />
                          {dayjs(selectedRecord.next_visit_date).format("DD/MM/YYYY")}
                        </Paragraph>
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}
