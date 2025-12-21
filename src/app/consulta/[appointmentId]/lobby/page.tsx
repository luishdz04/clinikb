"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Typography, Space, Alert, Spin } from "antd";
import {
  VideoCameraOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraAddOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface AppointmentData {
  id: string;
  appointment_date: string;
  start_time: string;
  modality: string;
  service: {
    title: string;
  };
  doctor: {
    full_name: string;
  };
  patient: {
    full_name: string;
  };
}

export default function LobbyPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");
  const isAdmin = searchParams.get("admin") === "true"; // Detectar si viene desde admin
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaPermissions, setMediaPermissions] = useState({
    video: false,
    audio: false,
  });

  useEffect(() => {
    loadAppointmentData();
    checkMediaPermissions();
  }, [appointmentId]);

  const loadAppointmentData = async () => {
    try {
      // Usar ruta de admin si viene desde admin, sino usar ruta de paciente
      const apiPath = isAdmin 
        ? `/api/admin/appointments/${appointmentId}`
        : `/api/patient/appointments/${appointmentId}`;
      
      const response = await fetch(apiPath);
      if (response.ok) {
        const data = await response.json();
        setAppointment(data);
      } else {
        setError("No se pudo cargar la información de la cita");
      }
    } catch (err) {
      console.error("Error loading appointment:", err);
      setError("Error al cargar la cita");
    } finally {
      setLoading(false);
    }
  };

  const checkMediaPermissions = async () => {
    try {
      // Verificar si hay dispositivos disponibles
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("MediaDevices API not supported");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      setMediaPermissions({ video: true, audio: true });
      
      // Detener el stream después de verificar permisos
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.warn("No se pudieron verificar los dispositivos. Stream.io los verificará al entrar:", err);
      // No marcamos error, Stream.io manejará los permisos en la sala
    }
  };

  const handleJoinMeeting = () => {
    if (!roomId) {
      setError("No se encontró el ID de la sala");
      return;
    }
    router.push(`/consulta/${appointmentId}/sala?room=${roomId}`);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
        <Alert
          title="Error"
          description={error || "No se pudo cargar la información"}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <Card 
        style={{ 
          maxWidth: "600px", 
          width: "100%",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <VideoCameraAddOutlined style={{ fontSize: "64px", color: "#667eea" }} />
            <Title level={2} style={{ marginTop: "16px", marginBottom: "8px" }}>
              Sala de Espera
            </Title>
            <Text type="secondary">
              Prepárate para unirte a tu consulta
            </Text>
          </div>

          <Card type="inner" style={{ backgroundColor: "#f5f5f5" }}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div>
                <Text strong>Servicio:</Text>
                <br />
                <Text>{appointment.service.title}</Text>
              </div>
              <div>
                <Text strong>Doctor:</Text>
                <br />
                <Text>{appointment.doctor.full_name}</Text>
              </div>
              <div>
                <Text strong>Fecha:</Text>
                <br />
                <Text>
                  {new Date(appointment.appointment_date).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {" - "}
                  {appointment.start_time}
                </Text>
              </div>
            </Space>
          </Card>

          <Card type="inner">
            <Title level={5}>Estado de tu equipo</Title>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Space>
                  {mediaPermissions.video ? (
                    <VideoCameraOutlined style={{ fontSize: "20px", color: "#52c41a" }} />
                  ) : (
                    <VideoCameraOutlined style={{ fontSize: "20px", color: "#ff4d4f" }} />
                  )}
                  <Text>Cámara</Text>
                </Space>
                <Text type={mediaPermissions.video ? "success" : "danger"}>
                  {mediaPermissions.video ? "Disponible" : "Sin acceso"}
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Space>
                  {mediaPermissions.audio ? (
                    <AudioOutlined style={{ fontSize: "20px", color: "#52c41a" }} />
                  ) : (
                    <AudioMutedOutlined style={{ fontSize: "20px", color: "#ff4d4f" }} />
                  )}
                  <Text>Micrófono</Text>
                </Space>
                <Text type={mediaPermissions.audio ? "success" : "danger"}>
                  {mediaPermissions.audio ? "Disponible" : "Sin acceso"}
                </Text>
              </div>
            </Space>
          </Card>

          {(!mediaPermissions.video || !mediaPermissions.audio) && (
            <Alert
              message="Permisos necesarios"
              description="Por favor permite el acceso a tu cámara y micrófono para poder unirte a la videollamada."
              type="warning"
              showIcon
            />
          )}

          <Button
            type="primary"
            size="large"
            block
            onClick={handleJoinMeeting}
            disabled={!mediaPermissions.video || !mediaPermissions.audio}
            icon={<VideoCameraOutlined />}
            style={{ 
              height: "50px",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            Unirse a la Consulta
          </Button>

          <Text type="secondary" style={{ textAlign: "center", display: "block", fontSize: "12px" }}>
            Al unirte, aceptas compartir tu cámara y micrófono con el doctor
          </Text>
        </Space>
      </Card>
    </div>
  );
}
