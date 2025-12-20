"use client";

import { useState, useEffect } from "react";
import { Typography, Card, Checkbox, Button, Space, App, Spin, Alert, Divider } from "antd";
import { MedicineBoxOutlined, SaveOutlined } from "@ant-design/icons";
import type { Service } from "@/types/appointments";

const { Title, Paragraph, Text } = Typography;

export default function MisServiciosPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [doctorId, setDoctorId] = useState<string>("");

  useEffect(() => {
    const doctor = localStorage.getItem("doctor");
    if (doctor) {
      const parsedDoctor = JSON.parse(doctor);
      setDoctorId(parsedDoctor.id);
      fetchData(parsedDoctor.id);
    }
  }, []);

  const fetchData = async (docId: string) => {
    try {
      setLoading(true);

      // Obtener todos los servicios
      const servicesRes = await fetch('/api/services');
      const servicesData = await servicesRes.json();

      // Obtener servicios del doctor
      const doctorServicesRes = await fetch(`/api/admin/doctor-services?doctor_id=${docId}`);
      const doctorServicesData = await doctorServicesRes.json();

      setServices(servicesData.services || []);
      
      const activeServiceIds = (doctorServicesData.doctorServices || [])
        .map((ds: any) => ds.service_id);
      setSelectedServices(activeServiceIds);
    } catch (error) {
      console.error("Error loading data:", error);
      message.error("Error al cargar los servicios");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch('/api/admin/doctor-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          serviceIds: selectedServices,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar');
      }

      message.success('Servicios actualizados exitosamente');
    } catch (error: any) {
      console.error("Error saving services:", error);
      message.error(error.message || 'Error al guardar servicios');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const psychologicalServices = services.filter(s => s.category === 'Psicológica');
  const medicalServices = services.filter(s => s.category === 'Médica');

  return (
    <div>
      <div className="mb-6">
        <Title level={2} className="!text-[#367c84] !mb-2">
          <MedicineBoxOutlined className="mr-2" />
          Mis Servicios
        </Title>
        <Paragraph className="text-gray-600">
          Selecciona los servicios que ofreces a tus pacientes
        </Paragraph>
      </div>

      <Alert
        title="Importante"
        description="Los pacientes solo podrán agendar citas para los servicios que tengas activos aquí."
        type="info"
        showIcon
        className="mb-6"
      />

      <Card>
        <Space orientation="vertical" style={{ width: '100%' }} size="large">
          {/* Servicios Psicológicos */}
          <div>
            <Title level={4} className="!text-[#55c5c4] !mb-4">
              Servicios Psicológicos
            </Title>
            <Space orientation="vertical" style={{ width: '100%' }}>
              {psychologicalServices.map((service) => (
                <Card
                  key={service.id}
                  size="small"
                  hoverable
                  className={selectedServices.includes(service.id) ? 'border-[#55c5c4]' : ''}
                  onClick={() => handleToggleService(service.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Space align="start">
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleToggleService(service.id)}
                    />
                    <div>
                      <Text strong className="text-[#367c84]">
                        {service.title}
                      </Text>
                      <div className="text-gray-600 text-sm mt-1">
                        {service.description}
                      </div>
                      <div className="text-gray-500 text-xs mt-2">
                        Duración: {service.duration_minutes} minutos
                      </div>
                    </div>
                  </Space>
                </Card>
              ))}
            </Space>
          </div>

          <Divider />

          {/* Servicios Médicos */}
          <div>
            <Title level={4} className="!text-[#55c5c4] !mb-4">
              Servicios Médicos
            </Title>
            <Space orientation="vertical" style={{ width: '100%' }}>
              {medicalServices.map((service) => (
                <Card
                  key={service.id}
                  size="small"
                  hoverable
                  className={selectedServices.includes(service.id) ? 'border-[#55c5c4]' : ''}
                  onClick={() => handleToggleService(service.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Space align="start">
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleToggleService(service.id)}
                    />
                    <div>
                      <Text strong className="text-[#367c84]">
                        {service.title}
                      </Text>
                      <div className="text-gray-600 text-sm mt-1">
                        {service.description}
                      </div>
                      <div className="text-gray-500 text-xs mt-2">
                        Duración: {service.duration_minutes} minutos
                      </div>
                    </div>
                  </Space>
                </Card>
              ))}
            </Space>
          </div>

          <Divider />

          {/* Botón Guardar */}
          <div className="text-right">
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
              style={{ backgroundColor: '#55c5c4', borderColor: '#55c5c4' }}
            >
              Guardar Cambios
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
}
