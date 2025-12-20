"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Calendar,
  Badge,
  Modal,
  Form,
  TimePicker,
  Select,
  InputNumber,
  Input,
  Button,
  Space,
  Table,
  Tag,
  App,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";

// Configurar dayjs para zona horaria de Monterrey
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");
const MONTERREY_TZ = "America/Monterrey";

const { Title } = Typography;
const { TextArea } = Input;

interface Service {
  id: string;
  key: string;
  title: string;
  category: string;
  duration_minutes: number;
}

interface AvailabilitySlot {
  id: string;
  doctor_id: string;
  service_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_appointments: number;
  notes?: string;
  service?: Service;
}

interface DoctorInfo {
  id: string;
  full_name: string;
  email: string;
}

export default function HorariosPage() {
  const { message, modal } = App.useApp();
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs().tz(MONTERREY_TZ));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Cargar información del doctor
  useEffect(() => {
    const doctorStr = localStorage.getItem("doctor");
    if (doctorStr) {
      const doctorData = JSON.parse(doctorStr);
      setDoctor(doctorData);
    }
  }, []);

  // Cargar servicios del doctor
  useEffect(() => {
    if (doctor?.id) {
      fetchDoctorServices();
    }
  }, [doctor]);

  // Cargar slots del mes actual
  useEffect(() => {
    if (doctor?.id && selectedDate) {
      fetchSlots();
    }
  }, [doctor, selectedDate]);

  const fetchDoctorServices = async () => {
    try {
      const response = await fetch(
        `/api/admin/doctor-services?doctor_id=${doctor?.id}`
      );
      if (response.ok) {
        const data = await response.json();
        // Extraer solo los servicios del array doctorServices
        const servicesList = data.doctorServices?.map((ds: any) => ds.service) || [];
        setServices(servicesList);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      message.error("Error al cargar los servicios");
    }
  };

  const fetchSlots = async () => {
    if (!doctor?.id) return;

    setLoading(true);
    try {
      const startDate = selectedDate.startOf("month").format("YYYY-MM-DD");
      const endDate = selectedDate.endOf("month").format("YYYY-MM-DD");

      const response = await fetch(
        `/api/admin/availability-slots?doctorId=${doctor.id}&startDate=${startDate}&endDate=${endDate}`
      );

      if (response.ok) {
        const data = await response.json();
        setSlots(data);
      } else {
        message.error("Error al cargar los horarios");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      message.error("Error al cargar los horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const handleOpenModal = (date?: Dayjs, slot?: AvailabilitySlot) => {
    if (slot) {
      // Editar slot existente
      setEditingSlot(slot);
      form.setFieldsValue({
        serviceId: slot.service_id,
        slotDate: dayjs(slot.slot_date).tz(MONTERREY_TZ),
        timeRange: [
          dayjs(slot.start_time, "HH:mm:ss").tz(MONTERREY_TZ),
          dayjs(slot.end_time, "HH:mm:ss").tz(MONTERREY_TZ),
        ],
        maxAppointments: slot.max_appointments,
        notes: slot.notes,
      });
    } else {
      // Nuevo slot
      setEditingSlot(null);
      form.setFieldsValue({
        slotDate: date || selectedDate,
        maxAppointments: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlot(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const slotDate = values.slotDate.tz(MONTERREY_TZ).format("YYYY-MM-DD");
      const startTime = values.timeRange[0].tz(MONTERREY_TZ).format("HH:mm:ss");
      const endTime = values.timeRange[1].tz(MONTERREY_TZ).format("HH:mm:ss");

      const payload = {
        doctorId: doctor?.id,
        serviceId: values.serviceId,
        slotDate,
        startTime,
        endTime,
        maxAppointments: values.maxAppointments,
        notes: values.notes,
      };

      let response;
      if (editingSlot) {
        // Actualizar
        response = await fetch("/api/admin/availability-slots", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingSlot.id, ...payload }),
        });
      } else {
        // Crear
        response = await fetch("/api/admin/availability-slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        message.success(
          editingSlot
            ? "Horario actualizado exitosamente"
            : "Horario creado exitosamente"
        );
        handleCloseModal();
        fetchSlots();
      } else {
        const error = await response.json();
        message.error(error.error || "Error al guardar el horario");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Error al procesar el formulario");
    }
  };

  const handleDelete = (slot: AvailabilitySlot) => {
    modal.confirm({
      title: "¿Eliminar horario?",
      content: `¿Estás seguro de eliminar el horario de ${slot.service?.title} el ${dayjs(
        slot.slot_date
      ).format("DD/MM/YYYY")} de ${slot.start_time.substring(0, 5)} a ${slot.end_time.substring(0, 5)}?`,
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const response = await fetch(
            `/api/admin/availability-slots?id=${slot.id}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            message.success("Horario eliminado exitosamente");
            fetchSlots();
          } else {
            const error = await response.json();
            message.error(error.error || "Error al eliminar el horario");
          }
        } catch (error) {
          console.error("Error deleting slot:", error);
          message.error("Error al eliminar el horario");
        }
      },
    });
  };

  const handleToggleAvailability = async (slot: AvailabilitySlot) => {
    try {
      const response = await fetch("/api/admin/availability-slots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: slot.id,
          isAvailable: !slot.is_available,
        }),
      });

      if (response.ok) {
        message.success(
          slot.is_available
            ? "Horario marcado como no disponible"
            : "Horario marcado como disponible"
        );
        fetchSlots();
      } else {
        const error = await response.json();
        message.error(error.error || "Error al actualizar disponibilidad");
      }
    } catch (error) {
      console.error("Error toggling availability:", error);
      message.error("Error al actualizar disponibilidad");
    }
  };

  // Obtener slots para una fecha específica
  const getSlotsByDate = (date: Dayjs) => {
    const dateStr = date.format("YYYY-MM-DD");
    return slots.filter((slot) => slot.slot_date === dateStr);
  };

  // Obtener slots del día seleccionado
  const selectedDaySlots = getSlotsByDate(selectedDate);

  // Renderizar contenido de celda del calendario
  const dateCellRender = (date: Dayjs) => {
    const daySlots = getSlotsByDate(date);
    if (daySlots.length === 0) return null;

    return (
      <ul className="space-y-1">
        {daySlots.slice(0, 2).map((slot) => (
          <li key={slot.id}>
            <Badge
              status={slot.is_available ? "success" : "default"}
              text={
                <span className="text-xs">
                  {slot.start_time.substring(0, 5)} - {slot.service?.title?.substring(0, 15)}
                </span>
              }
            />
          </li>
        ))}
        {daySlots.length > 2 && (
          <li className="text-xs text-gray-500">+{daySlots.length - 2} más</li>
        )}
      </ul>
    );
  };

  const columns = [
    {
      title: "Servicio",
      dataIndex: ["service", "title"],
      key: "service",
      render: (text: string, record: AvailabilitySlot) => (
        <Space orientation="vertical" size={0}>
          <span className="font-medium">{text}</span>
          <Tag color={record.service?.category === "Psicológica" ? "blue" : "green"}>
            {record.service?.category}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Horario",
      key: "time",
      render: (_: any, record: AvailabilitySlot) => (
        <Space>
          <ClockCircleOutlined />
          <span>
            {record.start_time.substring(0, 5)} - {record.end_time.substring(0, 5)}
          </span>
        </Space>
      ),
    },
    {
      title: "Capacidad",
      dataIndex: "max_appointments",
      key: "capacity",
      render: (max: number) => `${max} cita${max !== 1 ? "s" : ""}`,
    },
    {
      title: "Estado",
      dataIndex: "is_available",
      key: "status",
      render: (available: boolean) => (
        <Tag color={available ? "success" : "default"}>
          {available ? "Disponible" : "No disponible"}
        </Tag>
      ),
    },
    {
      title: "Notas",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
      render: (notes: string) => notes || "-",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: AvailabilitySlot) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(undefined, record)}
          >
            Editar
          </Button>
          <Button
            type="link"
            onClick={() => handleToggleAvailability(record)}
          >
            {record.is_available ? "Desactivar" : "Activar"}
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  if (!doctor) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2}>Gestión de Horarios</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal(selectedDate)}
          disabled={services.length === 0}
        >
          Crear Horario
        </Button>
      </div>

      {services.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Primero debes seleccionar los servicios que ofreces en la sección{" "}
              <strong>Mis Servicios</strong>
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <Card className="lg:col-span-2">
          <Calendar
            value={selectedDate}
            onSelect={handleDateSelect}
            cellRender={dateCellRender}
          />
        </Card>

        {/* Resumen del día */}
        <Card
          title={
            <span>
              Horarios del {selectedDate.format("DD/MM/YYYY")}
            </span>
          }
          extra={
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal(selectedDate)}
              disabled={services.length === 0}
            >
              Agregar
            </Button>
          }
        >
          {loading ? (
            <div className="text-center py-8">
              <Spin />
            </div>
          ) : selectedDaySlots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay horarios para este día</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDaySlots.map((slot) => (
                <Card
                  key={slot.id}
                  size="small"
                  className="shadow-sm"
                  extra={
                    <Space size="small">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenModal(undefined, slot)}
                      />
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(slot)}
                      />
                    </Space>
                  }
                >
                  <Space orientation="vertical" size={2} className="w-full">
                    <span className="font-medium">{slot.service?.title}</span>
                    <Space size="small">
                      <ClockCircleOutlined />
                      <span className="text-sm">
                        {slot.start_time.substring(0, 5)} -{" "}
                        {slot.end_time.substring(0, 5)}
                      </span>
                    </Space>
                    <Tag
                      color={slot.is_available ? "success" : "default"}
                      className="w-fit"
                    >
                      {slot.is_available ? "Disponible" : "No disponible"}
                    </Tag>
                    {slot.notes && (
                      <p className="text-xs text-gray-500 mt-1">{slot.notes}</p>
                    )}
                  </Space>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Tabla de todos los horarios del mes */}
      <Card title="Todos los horarios del mes">
        <Table
          columns={columns}
          dataSource={slots}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} horarios`,
          }}
        />
      </Card>

      {/* Modal de crear/editar */}
      <Modal
        title={editingSlot ? "Editar Horario" : "Crear Nuevo Horario"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        okText={editingSlot ? "Actualizar" : "Crear"}
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-6">
          <Form.Item
            name="serviceId"
            label="Servicio"
            rules={[{ required: true, message: "Selecciona un servicio" }]}
          >
            <Select placeholder="Selecciona el servicio">
              {services.map((service) => (
                <Select.Option key={service.id} value={service.id}>
                  {service.title} ({service.duration_minutes} min) -{" "}
                  <Tag color={service.category === "Psicológica" ? "blue" : "green"}>
                    {service.category}
                  </Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="slotDate"
            label="Fecha"
            rules={[{ required: true, message: "Selecciona una fecha" }]}
          >
            <Calendar fullscreen={false} />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="Horario"
            rules={[{ required: true, message: "Selecciona el horario" }]}
          >
            <TimePicker.RangePicker
              format="HH:mm"
              minuteStep={15}
              placeholder={["Hora inicio", "Hora fin"]}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="maxAppointments"
            label="Número máximo de citas"
            rules={[
              { required: true, message: "Ingresa el número de citas" },
              { type: "number", min: 1, message: "Mínimo 1 cita" },
            ]}
          >
            <InputNumber min={1} max={10} className="w-full" />
          </Form.Item>

          <Form.Item name="notes" label="Notas (opcional)">
            <TextArea
              rows={3}
              placeholder="Notas adicionales sobre este horario..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
