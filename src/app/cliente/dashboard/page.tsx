"use client";

import { useState, useEffect } from "react";
import { Typography, Card, Row, Col, Alert, Spin, Descriptions, Tag } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined, CalendarOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import { createClient } from "@/lib/supabase/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";

dayjs.extend(utc);
dayjs.locale("es");

const { Title, Paragraph } = Typography;

interface PatientData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender?: string;
  attention_type: string;
  status: string;
  city?: string;
  state?: string;
}

export default function ClienteDashboard() {
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setPatient(data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!patient) {
    return (
      <Alert
        title="Error"
        description="No se pudieron cargar tus datos"
        type="error"
        showIcon
      />
    );
  }

  const age = patient.date_of_birth
    ? dayjs().diff(dayjs.utc(patient.date_of_birth), "year")
    : null;

  return (
    <div>
      <Title level={2} className="!text-[#55c5c4] !mb-6">
        Bienvenido, {patient.full_name}
      </Title>

      <Alert
        title="¡Cuenta Aprobada!"
        description="Tu cuenta ha sido aprobada. Ahora puedes acceder a todos los servicios de CliniKB."
        type="success"
        showIcon
        className="mb-6"
      />

      <Row gutter={[16, 16]}>
        {/* Información Personal */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <UserOutlined className="mr-2" />
                Información Personal
              </span>
            }
            className="h-full"
          >
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Nombre Completo">
                {patient.full_name}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Nacimiento">
                {dayjs.utc(patient.date_of_birth).format("DD/MM/YYYY")}
                {age && ` (${age} años)`}
              </Descriptions.Item>
              {patient.gender && (
                <Descriptions.Item label="Género">
                  {patient.gender}
                </Descriptions.Item>
              )}
              {patient.city && patient.state && (
                <Descriptions.Item label="Ubicación">
                  {patient.city}, {patient.state}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Información de Contacto */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <PhoneOutlined className="mr-2" />
                Información de Contacto
              </span>
            }
            className="h-full"
          >
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={<span><MailOutlined className="mr-1" />Email</span>}>
                <a href={`mailto:${patient.email}`} className="text-[#55c5c4]">
                  {patient.email}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label={<span><PhoneOutlined className="mr-1" />Teléfono</span>}>
                <a href={`tel:${patient.phone}`} className="text-[#55c5c4]">
                  {patient.phone}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label={<span><PhoneOutlined className="mr-1" />WhatsApp</span>}>
                <a
                  href={`https://wa.me/${patient.phone?.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#55c5c4]"
                >
                  Enviar mensaje
                </a>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Tipo de Atención */}
        <Col xs={24}>
          <Card
            title={
              <span>
                <MedicineBoxOutlined className="mr-2" />
                Mi Plan de Atención
              </span>
            }
          >
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Tipo de Atención">
                <Tag
                  color={patient.attention_type === "Psicológica" ? "blue" : "green"}
                  className="text-base px-3 py-1"
                >
                  {patient.attention_type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Especialista Asignado">
                {patient.attention_type === "Psicológica"
                  ? "Dra. Cynthia Kristell de Luna Hernández"
                  : "Dr. Baldo Daniel Martínez González"}
              </Descriptions.Item>
              <Descriptions.Item label="Estado de Cuenta">
                <Tag color="success" icon={<CalendarOutlined />}>
                  Activa
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Información adicional */}
      <Card className="mt-6 border-l-4 border-l-[#55c5c4]">
        <Title level={4} className="!text-[#367c84] !mb-3">
          📅 Próximos Pasos
        </Title>
        <Paragraph className="text-gray-700 mb-2">
          1. Completa tu perfil con información adicional si es necesario
        </Paragraph>
        <Paragraph className="text-gray-700 mb-2">
          2. Agenda tu primera cita desde el menú "Mis Citas"
        </Paragraph>
        <Paragraph className="text-gray-700 mb-0">
          3. Consulta tu historial clínico cuando necesites
        </Paragraph>
      </Card>

      {/* Contacto de Emergencia */}
      <Card className="mt-6 bg-[#fef9e6]">
        <Title level={4} className="!text-[#845c24] !mb-3">
          📞 Contacto de Emergencia
        </Title>
        <Paragraph className="text-gray-700 mb-2">
          Si necesitas atención urgente, contáctanos directamente:
        </Paragraph>
        <ul className="list-none pl-0">
          <li className="mb-2">
            <strong>Teléfono:</strong>{" "}
            <a href="tel:8661597283" className="text-[#55c5c4] font-semibold">
              866 159 7283
            </a>
          </li>
          <li>
            <strong>WhatsApp:</strong>{" "}
            <a
              href="https://wa.me/528661597283"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#55c5c4] font-semibold"
            >
              Enviar mensaje
            </a>
          </li>
        </ul>
      </Card>
    </div>
  );
}
