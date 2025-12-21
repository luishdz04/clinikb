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
  DatePicker,
  TimePicker,
  App,
  Space,
  Descriptions,
  Statistic,
  Row,
  Col,
  Select,
  Empty,
  Spin,
  Calendar,
  Badge,
  Tabs,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MedicineBoxOutlined,
  SendOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Appointment } from "@/types/appointments";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");
const MONTERREY_TZ = "America/Monterrey";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Service {
  id: string;
  title: string;
  category: string;
  duration_minutes: number;
  available_modalities?: string[];
}

interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
}

interface AvailableSlot {
  id: string;
  doctor_id: string;
  service_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  modality?: string;
  doctor?: Doctor;
  service?: Service;
}

interface DaySlots {
  [date: string]: AvailableSlot[];
}

const statusConfig = {
  pending: { color: "warning", label: "Pendiente", icon: <ClockCircleOutlined /> },
  confirmed: { color: "success", label: "Confirmada", icon: <CheckCircleOutlined /> },
  rejected: { color: "error", label: "Rechazada", icon: <CloseCircleOutlined /> },
  cancelled: { color: "default", label: "Cancelada", icon: <CloseCircleOutlined /> },
  completed: { color: "processing", label: "Completada", icon: <CheckCircleOutlined /> },
  no_show: { color: "error", label: "No Asistió", icon: <CloseCircleOutlined /> },
};

export default function MisCitasPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingMode, setBookingMode] = useState<"calendar" | "request">("calendar");
  
  // Datos para agendar
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [daySlots, setDaySlots] = useState<DaySlots>({});
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Dayjs>(dayjs());
  
  const [form] = Form.useForm();
  const [patientId, setPatientId] = useState<string | null>(null);

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchPatientData();
  }, []);

  useEffect(() => {
    if (patientId) {
      fetchAppointments();
      fetchServices();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const response = await fetch("/api/patient/me");
      if (!response.ok) throw new Error("Error al cargar datos");
      const data = await response.json();
      setPatientId(data.patient.id);
    } catch (error) {
      console.error("Error loading patient data:", error);
      message.error("Error al cargar información del paciente");
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patient/appointments`);
      if (!response.ok) throw new Error("Error al cargar citas");
      const data = await response.json();
      setAppointments(data.appointments || []);
      calculateStats(data.appointments || []);
    } catch (error) {
      console.error("Error loading appointments:", error);
      message.error("Error al cargar tus citas");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Error al cargar servicios");
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const fetchAvailableSlotsForMonth = async (month: Dayjs) => {
    try {
      setLoadingSlots(true);
      const startDate = month.startOf("month").format("YYYY-MM-DD");
      const endDate = month.endOf("month").format("YYYY-MM-DD");
      
      const response = await fetch(
        `/api/patient/available-slots/month?start_date=${startDate}&end_date=${endDate}`
      );
      
      if (!response.ok) throw new Error("Error al cargar horarios");
      const data = await response.json();
      
      // Agrupar slots por fecha
      const grouped: DaySlots = {};
      (data.slots || []).forEach((slot: AvailableSlot) => {
        const dateKey = slot.slot_date;
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(slot);
      });
      
      setDaySlots(grouped);
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error("Error loading slots:", error);
      setDaySlots({});
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const calculateStats = (appointmentsData: Appointment[]) => {
    setStats({
      total: appointmentsData.length,
      pending: appointmentsData.filter((a) => a.status === "pending").length,
      confirmed: appointmentsData.filter((a) => a.status === "confirmed").length,
      completed: appointmentsData.filter((a) => a.status === "completed").length,
    });
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailsModalVisible(true);
  };

  const handleStartBooking = () => {
    setBookingMode("calendar");
    setSelectedDate(dayjs());
    setSelectedSlot(null);
    setCalendarMonth(dayjs());
    form.resetFields();
    setBookingModalVisible(true);
    fetchAvailableSlotsForMonth(dayjs());
  };

  const handleMonthChange = (date: Dayjs) => {
    setCalendarMonth(date);
    fetchAvailableSlotsForMonth(date);
  };

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
  };

  const handleSwitchToRequest = () => {
    setBookingMode("request");
    setSelectedSlot(null);
    form.resetFields();
  };

  const handleBookAppointment = async () => {
    try {
      const values = await form.validateFields();
      
      if (bookingMode === "calendar") {
        // Agendar con horario disponible
        if (!selectedSlot || !selectedDate) {
          message.error("Por favor selecciona un horario");
          return;
        }

        const payload = {
          service_id: selectedSlot.service_id,
          slot_id: selectedSlot.id,
          appointment_date: selectedDate.format("YYYY-MM-DD"),
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
          doctor_id: selectedSlot.doctor_id,
          patient_notes: values.notes,
        };

        const response = await fetch("/api/patient/appointments/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Error al agendar cita");
        }

        message.success("¡Cita agendada exitosamente!");
      } else {
        // Solicitar cita sin horario fijo
        const payload = {
          modality: values.modality,
          service_id: values.service_id,
          preferred_date: values.preferred_date?.format("YYYY-MM-DD"),
          preferred_time: values.preferred_time?.format("HH:mm"),
          patient_notes: values.notes,
        };

        const response = await fetch("/api/patient/appointments/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Error al solicitar cita");
        }

        message.success("¡Solicitud enviada! El doctor te contactará para confirmar.");
      }
      
      setBookingModalVisible(false);
      fetchAppointments();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(error.message || "Error al procesar la solicitud");
    }
  };

  const columns: ColumnsType<Appointment> = [
    {
      title: "Fecha",
      key: "date",
      render: (_, record) => (
        <div>
          <div className="font-semibold">
            <CalendarOutlined className="mr-1" />
            {dayjs.utc(record.appointment_date).format("DD/MM/YYYY")}
          </div>
          <div className="text-xs text-gray-500">
            <ClockCircleOutlined className="mr-1" />
            {dayjs(record.start_time, "HH:mm:ss").format("HH:mm")}
          </div>
        </div>
      ),
      sorter: (a, b) => dayjs(a.appointment_date).diff(dayjs(b.appointment_date)),
    },
    {
      title: "Servicio",
      dataIndex: ["service", "title"],
      key: "service",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
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
        { text: "Completada", value: "completed" },
      ],
      onFilter: (value, record) => record.status === value,
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
            Ver Detalles
          </Button>
          {record.modality === 'online' && record.status === 'confirmed' && record.meeting_link && (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                const url = new URL(record.meeting_link!);
                const roomId = url.searchParams.get('room');
                window.location.href = `/consulta/${record.id}/lobby?room=${roomId}`;
              }}
              style={{ backgroundColor: "#52c41a" }}
            >
              🎥 Unirse
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Title level={2} className="!text-[#55c5c4] !mb-2">
            <CalendarOutlined className="mr-2" />
            Mis Citas
          </Title>
          <Paragraph className="!mb-0 text-gray-600">
            Gestiona tus citas médicas y psicológicas
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleStartBooking}
          size="large"
          style={{ backgroundColor: "#55c5c4" }}
        >
          Agendar Nueva Cita
        </Button>
      </div>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card variant="borderless">
            <Statistic
              title="Total de Citas"
              value={stats.total}
              styles={{ content: { color: "#55c5c4" } }}
              prefix={<CalendarOutlined />}
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
              title="Confirmadas"
              value={stats.confirmed}
              styles={{ content: { color: "#52c41a" } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card variant="borderless">
            <Statistic
              title="Completadas"
              value={stats.completed}
              styles={{ content: { color: "#1890ff" } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabla de Citas */}
      <Card>
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} citas`,
          }}
          locale={{
            emptyText: (
              <Empty
                description="No tienes citas registradas"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleStartBooking}
                  style={{ backgroundColor: "#55c5c4" }}
                >
                  Agendar Mi Primera Cita
                </Button>
              </Empty>
            ),
          }}
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
          selectedAppointment?.modality === 'online' && 
          selectedAppointment?.status === 'confirmed' && 
          selectedAppointment?.meeting_link && (
            <Button 
              key="join"
              type="primary"
              onClick={() => {
                const url = new URL(selectedAppointment.meeting_link!);
                const roomId = url.searchParams.get('room');
                window.location.href = `/consulta/${selectedAppointment.id}/lobby?room=${roomId}`;
              }}
              style={{ backgroundColor: "#52c41a" }}
            >
              🎥 Unirse a la Videollamada
            </Button>
          ),
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Cerrar
          </Button>,
        ]}
        width={600}
      >
        {selectedAppointment && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Estado">
              <Tag
                icon={statusConfig[selectedAppointment.status as keyof typeof statusConfig].icon}
                color={statusConfig[selectedAppointment.status as keyof typeof statusConfig].color}
              >
                {statusConfig[selectedAppointment.status as keyof typeof statusConfig].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Fecha">
              {dayjs.utc(selectedAppointment.appointment_date).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Hora">
              {dayjs(selectedAppointment.start_time, "HH:mm:ss").format("HH:mm")} -{" "}
              {dayjs(selectedAppointment.end_time, "HH:mm:ss").format("HH:mm")}
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
              <Descriptions.Item label="Tus Notas">
                {selectedAppointment.patient_notes}
              </Descriptions.Item>
            )}
            {selectedAppointment.meeting_link && (
              <Descriptions.Item label="Link de Reunión">
                <a
                  href={selectedAppointment.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#55c5c4]"
                >
                  Abrir Link de Videollamada
                </a>
              </Descriptions.Item>
            )}
            {selectedAppointment.doctor_notes && (
              <Descriptions.Item label="Notas del Doctor">
                {selectedAppointment.doctor_notes}
              </Descriptions.Item>
            )}
            {selectedAppointment.rejection_reason && (
              <Descriptions.Item label="Razón de Rechazo">
                <Text type="danger">{selectedAppointment.rejection_reason}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Modal para Agendar Cita */}
      <Modal
        title={
          <Space>
            <PlusOutlined />
            <span>Agendar Nueva Cita</span>
          </Space>
        }
        open={bookingModalVisible}
        onCancel={() => setBookingModalVisible(false)}
        onOk={handleBookAppointment}
        okText={bookingMode === "calendar" ? "Confirmar Cita" : "Enviar Solicitud"}
        cancelText="Cancelar"
        width={1000}
        okButtonProps={{ 
          disabled: bookingMode === "calendar" ? !selectedSlot : false,
          style: { backgroundColor: "#55c5c4" } 
        }}
      >
        <Form form={form} layout="vertical">
          <Tabs
            activeKey={bookingMode}
            onChange={(key) => setBookingMode(key as "calendar" | "request")}
            items={[
              {
                key: "calendar",
                label: (
                  <span>
                    <CalendarOutlined className="mr-1" />
                    Ver Horarios Disponibles
                  </span>
                ),
              },
              {
                key: "request",
                label: (
                  <span>
                    <SendOutlined className="mr-1" />
                    Solicitar Cita
                  </span>
                ),
              },
            ]}
          />

          {bookingMode === "calendar" ? (
            <div className="mt-4">
              <Row gutter={16}>
                {/* Columna izquierda: Calendario */}
                <Col span={14}>
                  {loadingSlots ? (
                    <div className="text-center py-20">
                      <Spin size="large" />
                      <div className="mt-4">Cargando horarios...</div>
                    </div>
                  ) : (
                    <Calendar
                      fullscreen={false}
                      value={selectedDate}
                      onSelect={handleDateSelect}
                      onPanelChange={handleMonthChange}
                      cellRender={(current, info) => {
                        if (info.type !== 'date') return info.originNode;
                        
                        const dateKey = current.format("YYYY-MM-DD");
                        const slotsForDay = daySlots[dateKey] || [];
                        
                        if (slotsForDay.length > 0) {
                          return (
                            <div className="ant-picker-cell-inner">
                              {current.date()}
                              <Badge 
                                count={slotsForDay.length} 
                                style={{ backgroundColor: "#55c5c4", marginTop: 4 }}
                                title={`${slotsForDay.length} horarios disponibles`}
                              />
                            </div>
                          );
                        }
                        return (
                          <div className="ant-picker-cell-inner">
                            {current.date()}
                          </div>
                        );
                      }}
                      disabledDate={(current) => {
                        if (!current) return true;
                        const dateKey = current.format("YYYY-MM-DD");
                        const isPast = current < dayjs().startOf("day");
                        const hasSlots = daySlots[dateKey]?.length > 0;
                        return isPast || !hasSlots;
                      }}
                    />
                  )}
                  
                  {Object.keys(daySlots).length === 0 && !loadingSlots && (
                    <div className="text-center mt-4 p-4 bg-gray-50 rounded-lg">
                      <Text type="secondary">
                        No hay horarios disponibles este mes.{" "}
                        <Button 
                          type="link" 
                          onClick={handleSwitchToRequest}
                          className="p-0"
                        >
                          Solicita una cita
                        </Button>
                      </Text>
                    </div>
                  )}
                </Col>

                {/* Columna derecha: Horarios del día seleccionado */}
                <Col span={10}>
                  <div className="border-l pl-4">
                    <Text strong className="text-base">
                      Horarios para {selectedDate.format("DD/MM/YYYY")}:
                    </Text>
                    
                    {(() => {
                      const dateKey = selectedDate.format("YYYY-MM-DD");
                      const slotsForDay = daySlots[dateKey] || [];
                      
                      if (slotsForDay.length === 0) {
                        return (
                          <Empty
                            className="mt-4"
                            description="No hay horarios disponibles"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          >
                            <Button 
                              type="primary" 
                              onClick={handleSwitchToRequest}
                              style={{ backgroundColor: "#55c5c4" }}
                            >
                              Solicitar Cita
                            </Button>
                          </Empty>
                        );
                      }

                      return (
                        <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
                          {slotsForDay.map((slot) => (
                            <Card
                              key={slot.id}
                              hoverable
                              onClick={() => handleSlotSelect(slot)}
                              className={`cursor-pointer ${
                                selectedSlot?.id === slot.id
                                  ? "!border-2 !border-[#55c5c4] !bg-[#55c5c4]/10"
                                  : "border"
                              }`}
                              size="small"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-semibold text-base">
                                    <ClockCircleOutlined className="mr-2" />
                                    {dayjs(slot.start_time, "HH:mm:ss").format("HH:mm")} -{" "}
                                    {dayjs(slot.end_time, "HH:mm:ss").format("HH:mm")}
                                  </div>
                                  <div className="mt-2 flex gap-2">
                                    <Tag color={slot.service?.category === "Psicológica" ? "blue" : "green"}>
                                      {slot.service?.title}
                                    </Tag>
                                    <Tag color={slot.modality === 'online' ? 'cyan' : 'orange'}>
                                      {slot.modality === 'online' ? '💻 Online' : '🏥 Presencial'}
                                    </Tag>
                                  </div>
                                  {slot.doctor && (
                                    <div className="text-sm text-gray-600 mt-1">
                                      {slot.doctor.full_name}
                                    </div>
                                  )}
                                </div>
                                {selectedSlot?.id === slot.id && (
                                  <div className="ml-2">
                                    <CheckCircleOutlined 
                                      className="text-[#55c5c4]" 
                                      style={{ fontSize: 24 }}
                                    />
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </Col>
              </Row>

              {/* Notas adicionales */}
              {selectedSlot && (
                <Form.Item 
                  name="notes" 
                  label="Notas adicionales (opcional)" 
                  className="mt-4 mb-0"
                >
                  <TextArea
                    rows={2}
                    placeholder="¿Hay algo que el doctor deba saber?"
                  />
                </Form.Item>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <Text type="secondary" className="block mb-4">
                Si no encuentras un horario disponible, puedes enviar una solicitud y el doctor te contactará para coordinar la cita.
              </Text>
              
              <Form.Item
                name="service_id"
                label="Tipo de servicio"
                rules={[{ required: true, message: "Selecciona un servicio" }]}
              >
                <Select
                  placeholder="Elige el tipo de consulta"
                  size="large"
                  onChange={() => {
                    // Resetear modalidad cuando cambia el servicio
                    form.setFieldsValue({ modality: undefined });
                  }}
                  options={services.map((service) => ({
                    label: `${service.title} (${service.category})`,
                    value: service.id,
                  }))}
                />
              </Form.Item>

              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.service_id !== currentValues.service_id}>
                {({ getFieldValue }) => {
                  const selectedServiceId = getFieldValue('service_id');
                  const selectedService = services.find(s => s.id === selectedServiceId);
                  const modalities = selectedService?.available_modalities || ['online', 'presencial'];
                  
                  return (
                    <Form.Item
                      name="modality"
                      label="Modalidad preferida"
                      rules={[{ required: true, message: "Selecciona la modalidad" }]}
                    >
                      <Select
                        placeholder="¿Cómo prefieres tu cita?"
                        size="large"
                        disabled={!selectedServiceId}
                        options={modalities.map((mod: string) => ({
                          label: mod === 'online' ? '💻 En línea (videollamada)' : '🏥 Presencial',
                          value: mod,
                        }))}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="preferred_date"
                    label="Fecha preferida (opcional)"
                  >
                    <DatePicker
                      className="w-full"
                      size="large"
                      format="DD/MM/YYYY"
                      disabledDate={(current) =>
                        current && current < dayjs().startOf("day")
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="preferred_time"
                    label="Hora preferida (opcional)"
                  >
                    <TimePicker
                      className="w-full"
                      size="large"
                      format="HH:mm"
                      placeholder="Selecciona la hora"
                      minuteStep={15}
                      showNow={false}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="notes"
                label="Información adicional"
              >
                <TextArea
                  rows={3}
                  placeholder="Describe tu necesidad o preferencias de horario..."
                />
              </Form.Item>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
}
