'use client';
import { useState, useEffect } from 'react';
import { Typography, Button, Row, Col, Card, Space, Divider } from 'antd';
import {
  SafetyOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  UserOutlined,
  LockOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useGymSettings } from '@/hooks/useGymSettings';
import { colors } from '@/theme';

const { Title, Paragraph, Text } = Typography;

export default function AvisoPrivacidad() {
  const [mounted, setMounted] = useState(false);
  const { settings } = useGymSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: colors.background.primary, color: colors.text.primary }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(to bottom, ${colors.background.secondary}, ${colors.background.primary})`,
        padding: '48px 24px',
        borderBottom: `1px solid ${colors.border.light}`,
      }}>
        <div className="max-w-5xl mx-auto">
          <Link href="/">
            <Button
              icon={<ArrowLeftOutlined />}
              style={{
                background: 'transparent',
                borderColor: colors.border.primary,
                color: colors.text.primary,
                marginBottom: '32px'
              }}
            >
              Volver al inicio
            </Button>
          </Link>

          <div className="text-center">
            <Space align="center" size="middle" style={{ marginBottom: '16px', justifyContent: 'center' }}>
              <SafetyOutlined style={{ fontSize: '48px', color: colors.brand.primary }} />
              <Title level={1} style={{ color: colors.text.primary, margin: 0, fontSize: 'clamp(32px, 5vw, 48px)' }}>
                Aviso de Privacidad
              </Title>
            </Space>

            <Paragraph style={{ color: colors.brand.primary, fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
              Tu salud y bienestar son nuestra misión
            </Paragraph>

            <Paragraph style={{ color: colors.text.secondary, fontSize: '16px', maxWidth: '800px', margin: '0 auto' }}>
              Tu privacidad es fundamental para nosotros. Este aviso explica cómo recopilamos, 
              usamos y protegemos tu información personal de acuerdo con la legislación mexicana vigente.
            </Paragraph>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          
          {/* Responsable */}
          <Card style={{ background: colors.background.secondary, border: `1px solid ${colors.border.light}` }}>
            <Space align="center" size="middle" style={{ marginBottom: '24px' }}>
              <FileTextOutlined style={{ fontSize: '28px', color: colors.brand.primary }} />
              <Title level={3} style={{ color: colors.brand.primary, margin: 0 }}>
                Responsable del Tratamiento
              </Title>
            </Space>

            <Card style={{ background: colors.background.tertiary, border: `1px solid ${colors.border.primary}` }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Paragraph style={{ color: colors.text.primary, lineHeight: 2 }}>
                    <Text strong style={{ color: colors.brand.primary }}>Razón Social:</Text> Muscle Up GYM<br />
                    <Text strong style={{ color: colors.brand.primary }}>Domicilio:</Text> {settings.gym_address}<br />
                    <Text strong style={{ color: colors.brand.primary }}>Responsable:</Text> Administración
                  </Paragraph>
                </Col>
                <Col xs={24} md={12}>
                  <Paragraph style={{ color: colors.text.primary, lineHeight: 2 }}>
                    <Text strong style={{ color: colors.brand.primary }}>Teléfono:</Text> {settings.gym_phone}<br />
                    <Text strong style={{ color: colors.brand.primary }}>Email:</Text> {settings.gym_email}<br />
                    <Text strong style={{ color: colors.brand.primary }}>Horario de atención:</Text> Lunes a Sábado
                  </Paragraph>
                </Col>
              </Row>
            </Card>
          </Card>

          {/* Finalidades */}
          <Card style={{ background: colors.background.secondary, border: `1px solid ${colors.border.light}` }}>
            <Space align="center" size="middle" style={{ marginBottom: '24px' }}>
              <UserOutlined style={{ fontSize: '28px', color: colors.brand.primary }} />
              <Title level={3} style={{ color: colors.brand.primary, margin: 0 }}>
                ¿Para qué fines utilizamos sus datos personales?
              </Title>
            </Space>

            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={5} style={{ color: colors.brand.light }}>Finalidades primarias (necesarias):</Title>
                <ul style={{ color: colors.text.secondary, lineHeight: 2 }}>
                  <li>Gestión y administración de membresías</li>
                  <li>Control de acceso mediante sistema biométrico</li>
                  <li>Comunicación sobre servicios, promociones y cambios de horario</li>
                  <li>Facturación y cobranza</li>
                  <li>Cumplimiento de obligaciones legales</li>
                </ul>
              </div>

              <div>
                <Title level={5} style={{ color: colors.brand.light }}>Finalidades secundarias (opcionales):</Title>
                <ul style={{ color: colors.text.secondary, lineHeight: 2 }}>
                  <li>Envío de publicidad y promociones personalizadas</li>
                  <li>Encuestas de satisfacción</li>
                  <li>Evaluaciones físicas y seguimiento de progreso</li>
                </ul>
              </div>
            </Space>
          </Card>

          {/* Datos Personales */}
          <Card style={{ background: colors.background.secondary, border: `1px solid ${colors.border.light}` }}>
            <Space align="center" size="middle" style={{ marginBottom: '24px' }}>
              <LockOutlined style={{ fontSize: '28px', color: colors.brand.primary }} />
              <Title level={3} style={{ color: colors.brand.primary, margin: 0 }}>
                Datos Personales que Recopilamos
              </Title>
            </Space>

            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              <Card style={{ background: colors.background.tertiary }}>
                <Title level={5} style={{ color: colors.brand.light }}>Datos de identificación:</Title>
                <Text style={{ color: colors.text.secondary }}>
                  Nombre completo, edad, sexo, fecha de nacimiento, RFC, domicilio, teléfono, correo electrónico
                </Text>
              </Card>

              <Card style={{ background: colors.background.tertiary }}>
                <Title level={5} style={{ color: colors.brand.light }}>Datos biométricos:</Title>
                <Text style={{ color: colors.text.secondary }}>
                  Huella digital (para control de acceso)
                </Text>
              </Card>

              <Card style={{ background: colors.background.tertiary }}>
                <Title level={5} style={{ color: colors.brand.light }}>Datos de salud (opcional):</Title>
                <Text style={{ color: colors.text.secondary }}>
                  Condiciones médicas relevantes para el ejercicio, alergias, lesiones previas
                </Text>
              </Card>

              <Card style={{ background: colors.background.tertiary }}>
                <Title level={5} style={{ color: colors.brand.light }}>Contacto de emergencia:</Title>
                <Text style={{ color: colors.text.secondary }}>
                  Nombre y teléfono de persona a contactar en caso de emergencia
                </Text>
              </Card>
            </Space>
          </Card>

          {/* Derechos ARCO */}
          <Card style={{ background: colors.background.secondary, border: `1px solid ${colors.border.light}` }}>
            <Space align="center" size="middle" style={{ marginBottom: '24px' }}>
              <InfoCircleOutlined style={{ fontSize: '28px', color: colors.brand.primary }} />
              <Title level={3} style={{ color: colors.brand.primary, margin: 0 }}>
                Tus Derechos (ARCO)
              </Title>
            </Space>

            <Paragraph style={{ color: colors.text.secondary, fontSize: '16px', lineHeight: 2 }}>
              Tienes derecho a <Text strong style={{ color: colors.brand.primary }}>Acceder, Rectificar, Cancelar u Oponerte</Text> al 
              tratamiento de tus datos personales. Para ejercer estos derechos, envía un correo a: <Text strong style={{ color: colors.brand.primary }}>{settings.gym_email}</Text>
            </Paragraph>

            <Divider style={{ borderColor: colors.border.light }} />

            <Paragraph style={{ color: colors.text.secondary, fontSize: '16px', lineHeight: 2 }}>
              <Text strong style={{ color: colors.brand.light }}>Revocación del consentimiento:</Text><br />
              Puedes revocar tu consentimiento en cualquier momento mediante solicitud por escrito a nuestra dirección o correo electrónico.
            </Paragraph>

            <Paragraph style={{ color: colors.text.secondary, fontSize: '16px', lineHeight: 2 }}>
              <Text strong style={{ color: colors.brand.light }}>Seguridad:</Text><br />
              Implementamos medidas de seguridad físicas, técnicas y administrativas para proteger tus datos contra acceso no autorizado, pérdida o uso indebido.
            </Paragraph>
          </Card>

          {/* Fecha de actualización */}
          <Card style={{ background: colors.background.tertiary, border: `1px solid ${colors.border.primary}`, textAlign: 'center' }}>
            <Text style={{ color: colors.text.muted }}>
              Última actualización: Diciembre 2025
            </Text>
          </Card>
        </Space>
      </div>
    </div>
  );
}
