"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Button,
  Table,
  Tag,
  Modal,
  Descriptions,
  App,
  Space,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Tabs,
  Timeline,
  Empty,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  HomeOutlined,
  HeartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Appointment } from "@/types/appointments";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  referral_source: string | null;
  attention_type: "Psicológica" | "Médica";
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  approved_at: string | null;
  created_at: string;
}

interface PatientWithStats extends Patient {
  appointments?: Appointment[];
  stats?: {
    total: number;
    completed: number;
    confirmed: number;
    cancelled: number;
  };
}

const statusConfig = {
  pending: { color: "warning", label: "Pendiente" },
  approved: { color: "success", label: "Aprobado" },
  rejected: { color: "error", label: "Rechazado" },
};

const appointmentStatusConfig = {
  pending: { color: "warning", label: "Pendiente" },
  confirmed: { color: "success", label: "Confirmada" },
  rejected: { color: "error", label: "Rechazada" },
  cancelled: { color: "default", label: "Cancelada" },
  completed: { color: "processing", label: "Completada" },
  no_show: { color: "error", label: "No Asistió" },
};

export default function PacientesPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithStats | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Filtros
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [attentionTypeFilter, setAttentionTypeFilter] = useState<string>("all");

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchText, statusFilter, attentionTypeFilter]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/patients");
      if (!response.ok) {
        throw new Error("Error al cargar pacientes");
      }
      const data = await response.json();
      setPatients(data.patients || []);
      calculateStats(data.patients || []);
    } catch (error) {
      console.error("Error loading patients:", error);
      message.error("Error al cargar pacientes");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (patientsData: Patient[]) => {
    setStats({
      total: patientsData.length,
      pending: patientsData.filter((p) => p.status === "pending").length,
      approved: patientsData.filter((p) => p.status === "approved").length,
      rejected: patientsData.filter((p) => p.status === "rejected").length,
    });
  };

  const filterPatients = () => {
    let filtered = [...patients];

    // Filtro de búsqueda
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.full_name.toLowerCase().includes(search) ||
          p.email.toLowerCase().includes(search) ||
          p.phone.includes(search)
      );
    }

    // Filtro de estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Filtro de tipo de atención
    if (attentionTypeFilter !== "all") {
      filtered = filtered.filter((p) => p.attention_type === attentionTypeFilter);
    }

    // Ordenar por fecha de creación (más recientes primero)
    filtered.sort((a, b) => dayjs(b.created_at).diff(dayjs(a.created_at)));

    setFilteredPatients(filtered);
  };

  const fetchPatientAppointments = async (patientId: string) => {
    try {
      setLoadingAppointments(true);
      const response = await fetch(`/api/admin/patients/appointments?patient_id=${patientId}`);
      if (!response.ok) {
        throw new Error("Error al cargar citas del paciente");
      }
      const data = await response.json();
      setPatientAppointments(data.appointments || []);
      
      // Calcular estadísticas de citas
      const appointmentsData = data.appointments || [];
      const stats = {
        total: appointmentsData.length,
        completed: appointmentsData.filter((a: Appointment) => a.status === "completed").length,
        confirmed: appointmentsData.filter((a: Appointment) => a.status === "confirmed").length,
        cancelled: appointmentsData.filter(
          (a: Appointment) => a.status === "cancelled" || a.status === "rejected"
        ).length,
      };

      if (selectedPatient) {
        setSelectedPatient({
          ...selectedPatient,
          appointments: appointmentsData,
          stats,
        });
      }
    } catch (error) {
      console.error("Error loading patient appointments:", error);
      message.error("Error al cargar las citas del paciente");
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setDetailsModalVisible(true);
    fetchPatientAppointments(patient.id);
  };

  const calculateAge = (dateOfBirth: string) => {
    return dayjs().diff(dayjs.utc(dateOfBirth), "year");
  };

  const columns: ColumnsType<Patient> = [
    {
      title: "Paciente",
      key: "patient",
      render: (_, record) => (
        <div>
          <div className="font-semibold text-[#367c84]">
            <UserOutlined className="mr-1" />
            {record.full_name}
          </div>
          <div className="text-xs text-gray-500">
            {calculateAge(record.date_of_birth)} años
            {record.gender && ` • ${record.gender}`}
          </div>
        </div>
      ),
    },
    {
      title: "Contacto",
      key: "contact",
      render: (_, record) => (
        <div>
          <div className="text-xs">
            <PhoneOutlined className="mr-1" />
            {record.phone}
          </div>
          <div className="text-xs text-gray-500">
            <MailOutlined className="mr-1" />
            {record.email}
          </div>
        </div>
      ),
    },
    {
      title: "Ubicación",
      dataIndex: "city",
      key: "location",
      render: (_, record) => (
        <div className="text-xs">
          {record.city && record.state ? (
            <>
              <HomeOutlined className="mr-1" />
              {record.city}, {record.state}
            </>
          ) : (
            <Text type="secondary">No especificado</Text>
          )}
        </div>
      ),
    },
    {
      title: "Tipo de Atención",
      dataIndex: "attention_type",
      key: "attention_type",
      render: (type: string) => (
        <Tag color={type === "Psicológica" ? "blue" : "green"}>{type}</Tag>
      ),
      filters: [
        { text: "Psicológica", value: "Psicológica" },
        { text: "Médica", value: "Médica" },
      ],
      onFilter: (value, record) => record.attention_type === value,
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
      filters: [
        { text: "Pendiente", value: "pending" },
        { text: "Aprobado", value: "approved" },
        { text: "Rechazado", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Fecha de Registro",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => (
        <div className="text-xs">
          <CalendarOutlined className="mr-1" />
          {dayjs(date).format("DD/MM/YYYY")}
        </div>
      ),
      sorter: (a, b) => dayjs(a.created_at).diff(dayjs(b.created_at)),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          size="small"
        >
          Ver Detalles
        </Button>
      ),
      width: 130,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <Title level={2} className="!text-[#367c84] !mb-2">
          <UserOutlined className="mr-2" />
          Gestión de Pacientes
        </Title>
        <Paragraph className="!mb-0 text-gray-600">
          Administra la información y expedientes de los pacientes
        </Paragraph>
      </div>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card variant="borderless">
            <Statistic
              title="Total Pacientes"
              value={stats.total}
              styles={{ content: { color: "#367c84" } }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card variant="borderless">
            <Statistic
              title="Pendientes"
              value={stats.pending}
              styles={{ content: { color: "#faad14" } }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card variant="borderless">
            <Statistic
              title="Aprobados"
              value={stats.approved}
              styles={{ content: { color: "#52c41a" } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card variant="borderless">
            <Statistic
              title="Rechazados"
              value={stats.rejected}
              styles={{ content: { color: "#ff4d4f" } }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Space wrap>
          <Search
            placeholder="Buscar por nombre, email o teléfono"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Select.Option value="all">Todos los estados</Select.Option>
            <Select.Option value="pending">Pendiente</Select.Option>
            <Select.Option value="approved">Aprobado</Select.Option>
            <Select.Option value="rejected">Rechazado</Select.Option>
          </Select>
          <Select
            value={attentionTypeFilter}
            onChange={setAttentionTypeFilter}
            style={{ width: 150 }}
          >
            <Select.Option value="all">Todas las atenciones</Select.Option>
            <Select.Option value="Psicológica">Psicológica</Select.Option>
            <Select.Option value="Médica">Médica</Select.Option>
          </Select>
        </Space>
      </Card>

      {/* Tabla de Pacientes */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredPatients}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} pacientes`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal de Detalles del Paciente */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            <span>Perfil del Paciente</span>
          </Space>
        }
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedPatient(null);
          setPatientAppointments([]);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailsModalVisible(false);
              setSelectedPatient(null);
              setPatientAppointments([]);
            }}
          >
            Cerrar
          </Button>,
        ]}
        width={900}
      >
        {selectedPatient && (
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: "Información Personal",
                children: (
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Nombre Completo" span={2}>
                      <strong>{selectedPatient.full_name}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Estado">
                      <Tag color={statusConfig[selectedPatient.status].color}>
                        {statusConfig[selectedPatient.status].label}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tipo de Atención">
                      <Tag
                        color={
                          selectedPatient.attention_type === "Psicológica" ? "blue" : "green"
                        }
                      >
                        {selectedPatient.attention_type}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Fecha de Nacimiento">
                      {dayjs.utc(selectedPatient.date_of_birth).format("DD/MM/YYYY")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Edad">
                      {calculateAge(selectedPatient.date_of_birth)} años
                    </Descriptions.Item>
                    <Descriptions.Item label="Género" span={2}>
                      {selectedPatient.gender || "No especificado"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email" span={2}>
                      <MailOutlined className="mr-1" />
                      {selectedPatient.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Teléfono" span={2}>
                      <PhoneOutlined className="mr-1" />
                      {selectedPatient.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dirección" span={2}>
                      {selectedPatient.address || "No especificada"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ciudad">
                      {selectedPatient.city || "No especificada"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Estado">
                      {selectedPatient.state || "No especificado"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Código Postal" span={2}>
                      {selectedPatient.postal_code || "No especificado"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Contacto de Emergencia" span={2}>
                      <HeartOutlined className="mr-1" />
                      {selectedPatient.emergency_contact_name || "No especificado"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Teléfono de Emergencia" span={2}>
                      <PhoneOutlined className="mr-1" />
                      {selectedPatient.emergency_contact_phone || "No especificado"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Fuente de Referencia" span={2}>
                      {selectedPatient.referral_source || "No especificado"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Fecha de Registro" span={2}>
                      {dayjs(selectedPatient.created_at).format("DD/MM/YYYY HH:mm")}
                    </Descriptions.Item>
                    {selectedPatient.approved_at && (
                      <Descriptions.Item label="Fecha de Aprobación" span={2}>
                        {dayjs(selectedPatient.approved_at).format("DD/MM/YYYY HH:mm")}
                      </Descriptions.Item>
                    )}
                    {selectedPatient.rejection_reason && (
                      <Descriptions.Item label="Razón de Rechazo" span={2}>
                        <Text type="danger">{selectedPatient.rejection_reason}</Text>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                ),
              },
              {
                key: "2",
                label: (
                  <span>
                    Historial de Citas
                    {selectedPatient.stats && (
                      <Tag className="ml-2" color="blue">
                        {selectedPatient.stats.total}
                      </Tag>
                    )}
                  </span>
                ),
                children: loadingAppointments ? (
                  <div className="text-center py-8">Cargando citas...</div>
                ) : patientAppointments.length > 0 ? (
                  <>
                    {/* Estadísticas de Citas */}
                    {selectedPatient.stats && (
                      <Row gutter={16} className="mb-4">
                        <Col span={8}>
                          <Card size="small">
                            <Statistic
                              title="Total"
                              value={selectedPatient.stats.total}
                              styles={{ content: { fontSize: 20 } }}
                              prefix={<MedicineBoxOutlined />}
                            />
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card size="small">
                            <Statistic
                              title="Completadas"
                              value={selectedPatient.stats.completed}
                              styles={{ content: { fontSize: 20, color: "#52c41a" } }}
                              prefix={<CheckCircleOutlined />}
                            />
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card size="small">
                            <Statistic
                              title="Confirmadas"
                              value={selectedPatient.stats.confirmed}
                              styles={{ content: { fontSize: 20, color: "#1890ff" } }}
                              prefix={<CalendarOutlined />}
                            />
                          </Card>
                        </Col>
                      </Row>
                    )}

                    {/* Timeline de Citas */}
                    <Timeline
                      items={patientAppointments.map((appointment) => ({
                        color:
                          appointment.status === "completed"
                            ? "green"
                            : appointment.status === "confirmed"
                            ? "blue"
                            : appointment.status === "cancelled" ||
                              appointment.status === "rejected"
                            ? "red"
                            : "gray",
                        children: (
                          <div>
                            <div className="font-semibold">
                              {dayjs(appointment.appointment_date).format("DD/MM/YYYY")} •{" "}
                              {dayjs(appointment.start_time, "HH:mm:ss").format("HH:mm")}
                            </div>
                            <div className="text-sm">
                              {appointment.service?.title}
                              <Tag
                                className="ml-2"
                                color={
                                  appointmentStatusConfig[
                                    appointment.status as keyof typeof appointmentStatusConfig
                                  ].color
                                }
                              >
                                {
                                  appointmentStatusConfig[
                                    appointment.status as keyof typeof appointmentStatusConfig
                                  ].label
                                }
                              </Tag>
                            </div>
                            {appointment.doctor_notes && (
                              <div className="text-xs text-gray-600 mt-1">
                                <strong>Notas:</strong> {appointment.doctor_notes}
                              </div>
                            )}
                          </div>
                        ),
                      }))}
                    />
                  </>
                ) : (
                  <Empty description="Este paciente aún no tiene citas registradas" />
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}
