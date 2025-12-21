"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  App,
  Space,
  Badge,
  Tooltip,
  Descriptions,
  Statistic,
  Row,
  Col,
  Alert,
} from "antd";
import {
  ScheduleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EditOutlined,
  LinkOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Appointment } from "@/types/appointments";
import dayjs, { Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";

// Configurar dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");
const MONTERREY_TZ = "America/Monterrey";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Configuración de estados
const statusConfig = {
  pending: { color: "warning", label: "Pendiente", icon: <ClockCircleOutlined /> },
  confirmed: { color: "success", label: "Confirmada", icon: <CheckCircleOutlined /> },
  rejected: { color: "error", label: "Rechazada", icon: <CloseCircleOutlined /> },
  cancelled: { color: "default", label: "Cancelada", icon: <CloseCircleOutlined /> },
  completed: { color: "processing", label: "Completada", icon: <CheckCircleOutlined /> },
  no_show: { color: "error", label: "No Asistió", icon: <CloseCircleOutlined /> },
};

interface DoctorInfo {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export default function CitasPage() {
  const { message, modal } = App.useApp();
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"confirm" | "reject" | "cancel" | "complete" | "notes">("confirm");
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [rescheduleForm] = Form.useForm();

  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);

  useEffect(() => {
    const doctorStr = localStorage.getItem("doctor");
    if (doctorStr) {
      const doctorData = JSON.parse(doctorStr);
      setDoctor(doctorData);
    }
    // Cargar citas sin esperar al doctor
    fetchAppointments();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [doctor]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const url = doctor?.id 
        ? `/api/admin/appointments?doctor_id=${doctor.id}`
        : `/api/admin/appointments`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error al cargar las citas");
      }
      const data = await response.json();
      setAppointments(data.appointments || []);
      calculateStats(data.appointments || []);
    } catch (error) {
      console.error("Error loading appointments:", error);
      message.error("Error al cargar las citas");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointmentsData: Appointment[]) => {
    const stats = {
      total: appointmentsData.length,
      pending: appointmentsData.filter((a) => a.status === "pending").length,
      confirmed: appointmentsData.filter((a) => a.status === "confirmed").length,
      completed: appointmentsData.filter((a) => a.status === "completed").length,
      cancelled: appointmentsData.filter((a) => a.status === "cancelled" || a.status === "rejected").length,
    };
    setStats(stats);
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    if (dateFilter) {
      const filterDate = dateFilter.format("YYYY-MM-DD");
      filtered = filtered.filter((a) => a.appointment_date === filterDate);
    }

    // Ordenar por fecha y hora (más recientes primero)
    filtered.sort((a, b) => {
      const dateA = dayjs(`${a.appointment_date} ${a.start_time}`);
      const dateB = dayjs(`${b.appointment_date} ${b.start_time}`);
      return dateB.diff(dateA);
    });

    setFilteredAppointments(filtered);
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailsModalVisible(true);
  };

  const handleAction = (appointment: Appointment, type: "confirm" | "reject" | "cancel" | "complete" | "notes") => {
    setSelectedAppointment(appointment);
    setActionType(type);
    form.resetFields();
    setActionModalVisible(true);
  };

  const handleSubmitAction = async () => {
    try {
      const values = await form.validateFields();

      let endpoint = "";
      let payload: any = { appointment_id: selectedAppointment?.id };

      switch (actionType) {
        case "confirm":
          endpoint = "/api/admin/appointments/confirm";
          payload.meeting_link = values.meeting_link;
          break;
        case "reject":
          endpoint = "/api/admin/appointments/reject";
          payload.rejection_reason = values.reason;
          break;
        case "cancel":
          endpoint = "/api/admin/appointments/cancel";
          payload.cancellation_reason = values.reason;
          break;
        case "complete":
          endpoint = "/api/admin/appointments/complete";
          payload.doctor_notes = values.notes;
          break;
        case "notes":
          endpoint = "/api/admin/appointments/update-notes";
          payload.doctor_notes = values.notes;
          break;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al procesar la acción");
      }

      message.success(result.message);
      setActionModalVisible(false);
      fetchAppointments();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || "Error al procesar la acción");
    }
  };

  // Nuevo handler para aprobar cita
  const handleApprove = async (appointment: Appointment) => {
    try {
      const response = await fetch("/api/admin/appointments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appointment.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al aprobar la cita");
      }

      message.success("Cita aprobada y email enviado al paciente");
      fetchAppointments();
    } catch (error: any) {
      message.error(error.message || "Error al aprobar la cita");
    }
  };

  // Nuevo handler para rechazar cita (con modal)
  const handleReject = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    rejectForm.resetFields();
    setRejectModalVisible(true);
  };

  const handleSubmitReject = async () => {
    try {
      const values = await rejectForm.validateFields();

      const response = await fetch("/api/admin/appointments/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: selectedAppointment?.id,
          rejection_reason: values.reason,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al rechazar la cita");
      }

      message.success("Cita rechazada y email enviado al paciente");
      setRejectModalVisible(false);
      fetchAppointments();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || "Error al rechazar la cita");
    }
  };

  // Nuevo handler para reprogramar y aprobar cita
  const handleRescheduleAndApprove = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    rescheduleForm.resetFields();
    setRescheduleModalVisible(true);
  };

  const handleSubmitReschedule = async () => {
    try {
      const values = await rescheduleForm.validateFields();

      const response = await fetch("/api/admin/appointments/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedAppointment?.id,
          newDate: values.date.format("YYYY-MM-DD"),
          newTime: values.time.format("HH:mm"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al reprogramar la cita");
      }

      message.success("Cita reprogramada, aprobada y email enviado al paciente");
      setRescheduleModalVisible(false);
      fetchAppointments();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || "Error al reprogramar la cita");
    }
  };

  // Handler para generar sala de videollamada manualmente
  const handleGenerateRoom = async (appointment: Appointment) => {
    try {
      const response = await fetch("/api/video/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appointment.id,
          createdBy: appointment.doctor_id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al crear sala de videollamada");
      }

      message.success("Sala de videollamada creada exitosamente");
      fetchAppointments();
    } catch (error: any) {
      message.error(error.message || "Error al generar sala");
    }
  };

  const columns: ColumnsType<Appointment> = [
    {
      title: "Fecha y Hora",
      key: "datetime",
      render: (_, record) => {
        const date = dayjs(record.appointment_date).tz(MONTERREY_TZ);
        const startTime = dayjs(record.start_time, "HH:mm:ss");
        const endTime = dayjs(record.end_time, "HH:mm:ss");
        
        return (
          <div>
            <div className="font-semibold">
              <CalendarOutlined className="mr-1" />
              {date.format("DD/MM/YYYY")}
            </div>
            <div className="text-xs text-gray-500">
              <ClockCircleOutlined className="mr-1" />
              {startTime.format("HH:mm")} - {endTime.format("HH:mm")}
            </div>
          </div>
        );
      },
      sorter: (a, b) => {
        const dateA = dayjs(`${a.appointment_date} ${a.start_time}`);
        const dateB = dayjs(`${b.appointment_date} ${b.start_time}`);
        return dateA.diff(dateB);
      },
    },
    {
      title: "Paciente",
      key: "patient",
      render: (_, record) => (
        <div>
          <div className="font-semibold text-[#367c84]">
            <UserOutlined className="mr-1" />
            {record.patient?.full_name || "N/A"}
          </div>
          <div className="text-xs text-gray-500">
            <PhoneOutlined className="mr-1" />
            {record.patient?.phone || "N/A"}
          </div>
          <div className="text-xs text-gray-500">
            <MailOutlined className="mr-1" />
            {record.patient?.email || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Servicio",
      dataIndex: ["service", "title"],
      key: "service",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text || "N/A"}</div>
          <Tag color={record.service?.category === "Psicológica" ? "blue" : "green"}>
            {record.service?.category}
          </Tag>
        </div>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.label}
          </Tag>
        );
      },
      filters: [
        { text: "Pendiente", value: "pending" },
        { text: "Confirmada", value: "confirmed" },
        { text: "Rechazada", value: "rejected" },
        { text: "Cancelada", value: "cancelled" },
        { text: "Completada", value: "completed" },
        { text: "No Asistió", value: "no_show" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Modalidad",
      dataIndex: "modality",
      key: "modality",
      render: (modality: string, record) => (
        <div>
          <Tag color={modality === "online" ? "cyan" : "orange"}>
            {modality === "online" ? "🌐 Online" : "🏥 Presencial"}
          </Tag>
          {modality === "online" && (
            <div className="text-xs mt-1">
              {record.meeting_link ? (
                <Tag color="green" icon={<CheckCircleOutlined />}>Sala lista</Tag>
              ) : (
                <Tag color="default">Sin sala</Tag>
              )}
            </div>
          )}
        </div>
      ),
      filters: [
        { text: "Online", value: "online" },
        { text: "Presencial", value: "presencial" },
      ],
      onFilter: (value, record) => record.modality === value,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space orientation="vertical" size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="small"
          >
            Ver Detalles
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
                size="small"
                className="text-green-600"
              >
                Aprobar
              </Button>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleRescheduleAndApprove(record)}
                size="small"
                className="text-blue-600"
              >
                Cambiar Fecha y Aprobar
              </Button>
              <Button
                type="link"
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record)}
                danger
                size="small"
              >
                Rechazar
              </Button>
            </>
          )}
          {record.status === "confirmed" && (
            <>
              {record.modality === 'online' && !record.meeting_link && (
                <Button
                  type="link"
                  icon={<VideoCameraOutlined />}
                  onClick={() => handleGenerateRoom(record)}
                  size="small"
                  className="text-cyan-600"
                >
                  Generar Sala
                </Button>
              )}
              {record.modality === 'online' && record.meeting_link && (
                <Button
                  type="link"
                  icon={<VideoCameraOutlined />}
                  onClick={() => {
                    const url = new URL(record.meeting_link!);
                    const roomId = url.searchParams.get('room');
                    window.open(`/consulta/${record.id}/lobby?room=${roomId}&admin=true`, '_blank');
                  }}
                  size="small"
                  className="text-green-600"
                >
                  Unirse a Sala
                </Button>
              )}
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => handleAction(record, "complete")}
                size="small"
                className="text-blue-600"
              >
                Completar
              </Button>
              <Button
                type="link"
                icon={<CloseCircleOutlined />}
                onClick={() => handleAction(record, "cancel")}
                danger
                size="small"
              >
                Cancelar
              </Button>
            </>
          )}
          {(record.status === "confirmed" || record.status === "completed") && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleAction(record, "notes")}
              size="small"
            >
              Notas
            </Button>
          )}
        </Space>
      ),
      width: 150,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <Title level={2} className="!text-[#367c84] !mb-2">
          <ScheduleOutlined className="mr-2" />
          Gestión de Citas
        </Title>
        <Paragraph className="!mb-0 text-gray-600">
          Administra las citas médicas y psicológicas
        </Paragraph>
      </div>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card variant="borderless">
            <Statistic
              title="Total"
              value={stats.total}
              styles={{ content: { color: "#367c84" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5}>
          <Card variant="borderless">
            <Statistic
              title="Pendientes"
              value={stats.pending}
              styles={{ content: { color: "#faad14" } }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5}>
          <Card variant="borderless">
            <Statistic
              title="Confirmadas"
              value={stats.confirmed}
              styles={{ content: { color: "#52c41a" } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5}>
          <Card variant="borderless">
            <Statistic
              title="Completadas"
              value={stats.completed}
              styles={{ content: { color: "#1890ff" } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5}>
          <Card variant="borderless">
            <Statistic
              title="Canceladas"
              value={stats.cancelled}
              styles={{ content: { color: "#8c8c8c" } }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Space wrap>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
            placeholder="Filtrar por estado"
          >
            <Select.Option value="all">Todos los estados</Select.Option>
            <Select.Option value="pending">Pendiente</Select.Option>
            <Select.Option value="confirmed">Confirmada</Select.Option>
            <Select.Option value="rejected">Rechazada</Select.Option>
            <Select.Option value="cancelled">Cancelada</Select.Option>
            <Select.Option value="completed">Completada</Select.Option>
            <Select.Option value="no_show">No Asistió</Select.Option>
          </Select>
          <DatePicker
            value={dateFilter}
            onChange={setDateFilter}
            placeholder="Filtrar por fecha"
            format="DD/MM/YYYY"
          />
          <Button
            onClick={() => {
              setStatusFilter("all");
              setDateFilter(null);
            }}
          >
            Limpiar Filtros
          </Button>
        </Space>
      </Card>

      {/* Tabla de Citas */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredAppointments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} citas`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal de Detalles */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Detalles de la Cita</span>
          </Space>
        }
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Cerrar
          </Button>,
        ]}
        width={700}
      >
        {selectedAppointment && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Estado">
              <Tag
                icon={statusConfig[selectedAppointment.status as keyof typeof statusConfig].icon}
                color={statusConfig[selectedAppointment.status as keyof typeof statusConfig].color}
              >
                {statusConfig[selectedAppointment.status as keyof typeof statusConfig].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Fecha">
              {dayjs(selectedAppointment.appointment_date).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Hora">
              {dayjs(selectedAppointment.start_time, "HH:mm:ss").format("HH:mm")} -{" "}
              {dayjs(selectedAppointment.end_time, "HH:mm:ss").format("HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Paciente">
              <div>
                <div><UserOutlined /> {selectedAppointment.patient?.full_name}</div>
                <div><PhoneOutlined /> {selectedAppointment.patient?.phone}</div>
                <div><MailOutlined /> {selectedAppointment.patient?.email}</div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Servicio">
              <div>
                <div>{selectedAppointment.service?.title}</div>
                <Tag color={selectedAppointment.service?.category === "Psicológica" ? "blue" : "green"}>
                  {selectedAppointment.service?.category}
                </Tag>
              </div>
            </Descriptions.Item>
            {selectedAppointment.patient_notes && (
              <Descriptions.Item label="Notas del Paciente">
                {selectedAppointment.patient_notes}
              </Descriptions.Item>
            )}
            {selectedAppointment.doctor_notes && (
              <Descriptions.Item label="Notas del Doctor">
                {selectedAppointment.doctor_notes}
              </Descriptions.Item>
            )}
            {selectedAppointment.meeting_link && (
              <Descriptions.Item label="Link de Reunión">
                <a href={selectedAppointment.meeting_link} target="_blank" rel="noopener noreferrer">
                  <LinkOutlined /> Abrir Link
                </a>
              </Descriptions.Item>
            )}
            {selectedAppointment.rejection_reason && (
              <Descriptions.Item label="Razón de Rechazo">
                <Text type="danger">{selectedAppointment.rejection_reason}</Text>
              </Descriptions.Item>
            )}
            {selectedAppointment.cancellation_reason && (
              <Descriptions.Item label="Razón de Cancelación">
                <Text type="warning">{selectedAppointment.cancellation_reason}</Text>
              </Descriptions.Item>
            )}
            {selectedAppointment.confirmed_at && (
              <Descriptions.Item label="Confirmada el">
                {dayjs(selectedAppointment.confirmed_at).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            )}
            {selectedAppointment.cancelled_at && (
              <Descriptions.Item label="Cancelada el">
                {dayjs(selectedAppointment.cancelled_at).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Modal de Acciones */}
      <Modal
        title={
          actionType === "confirm"
            ? "Confirmar Cita"
            : actionType === "reject"
            ? "Rechazar Cita"
            : actionType === "cancel"
            ? "Cancelar Cita"
            : actionType === "complete"
            ? "Completar Cita"
            : "Agregar Notas"
        }
        open={actionModalVisible}
        onCancel={() => setActionModalVisible(false)}
        onOk={handleSubmitAction}
        okText={
          actionType === "confirm"
            ? "Confirmar"
            : actionType === "reject"
            ? "Rechazar"
            : actionType === "cancel"
            ? "Cancelar"
            : "Guardar"
        }
        cancelText="Cancelar"
        okButtonProps={{
          danger: actionType === "reject" || actionType === "cancel",
        }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          {actionType === "confirm" && (
            <Form.Item
              name="meeting_link"
              label="Link de Reunión"
              rules={[{ required: true, message: "Por favor ingresa el link de reunión" }]}
            >
              <Input
                prefix={<LinkOutlined />}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
              />
            </Form.Item>
          )}
          {(actionType === "reject" || actionType === "cancel") && (
            <Form.Item
              name="reason"
              label={actionType === "reject" ? "Razón de Rechazo" : "Razón de Cancelación"}
              rules={[{ required: true, message: "Por favor ingresa una razón" }]}
            >
              <TextArea
                rows={4}
                placeholder="Explica el motivo..."
              />
            </Form.Item>
          )}
          {(actionType === "complete" || actionType === "notes") && (
            <Form.Item
              name="notes"
              label="Notas del Doctor"
              rules={
                actionType === "complete"
                  ? [{ required: true, message: "Por favor agrega notas sobre la consulta" }]
                  : []
              }
            >
              <TextArea
                rows={4}
                placeholder="Notas sobre la consulta, diagnóstico, tratamiento, etc."
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Modal para Rechazar Cita */}
      <Modal
        title="Rechazar Cita"
        open={rejectModalVisible}
        onOk={handleSubmitReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="Rechazar"
        okButtonProps={{ danger: true }}
        cancelText="Cancelar"
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Motivo del Rechazo"
            rules={[{ required: true, message: "Por favor ingresa el motivo del rechazo" }]}
          >
            <TextArea
              rows={4}
              placeholder="Explica el motivo por el cual se rechaza la cita..."
            />
          </Form.Item>
        </Form>
        <Alert
          title="Información"
          description="El paciente recibirá un email notificando que su solicitud fue rechazada junto con el motivo."
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Modal>

      {/* Modal para Reprogramar y Aprobar Cita */}
      <Modal
        title="Reprogramar y Aprobar Cita"
        open={rescheduleModalVisible}
        onOk={handleSubmitReschedule}
        onCancel={() => setRescheduleModalVisible(false)}
        okText="Aprobar con Nueva Fecha"
        cancelText="Cancelar"
      >
        <Form form={rescheduleForm} layout="vertical">
          <Form.Item
            name="date"
            label="Nueva Fecha"
            rules={[{ required: true, message: "Por favor selecciona una fecha" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Seleccionar fecha"
            />
          </Form.Item>
          <Form.Item
            name="time"
            label="Nueva Hora"
            rules={[{ required: true, message: "Por favor selecciona una hora" }]}
          >
            <TimePicker
              style={{ width: "100%" }}
              format="HH:mm"
              placeholder="Seleccionar hora"
              minuteStep={15}
            />
          </Form.Item>
        </Form>
        <Alert
          title="Información"
          description="La cita será aprobada automáticamente con la nueva fecha y hora. El paciente recibirá un email de confirmación."
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Modal>
    </div>
  );
}
