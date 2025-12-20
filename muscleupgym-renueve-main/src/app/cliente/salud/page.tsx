'use client';

import { Card, Typography, Row, Col, Progress, Descriptions, Tag, Button, Empty } from 'antd';
import {
  HeartOutlined,
  AlertOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  UserOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { colors } from '@/theme';

const { Title, Text, Paragraph } = Typography;

// Datos de ejemplo - se conectarán a Supabase
const healthData = {
  bloodType: 'O+',
  medicalCondition: 'Ninguna',
  allergies: 'Ninguna conocida',
  medications: 'Ninguno',
  emergencyContact: {
    name: 'María García',
    phone: '+52 866 123 4567',
    relationship: 'Madre',
  },
  physicalStats: {
    height: 175,
    weight: 78,
    bmi: 25.5,
    lastUpdate: '2025-11-23',
  },
};

function getBmiStatus(bmi: number) {
  if (bmi < 18.5) return { text: 'Bajo peso', color: 'warning' };
  if (bmi < 25) return { text: 'Normal', color: 'success' };
  if (bmi < 30) return { text: 'Sobrepeso', color: 'warning' };
  return { text: 'Obesidad', color: 'error' };
}

export default function SaludPage() {
  const bmiStatus = getBmiStatus(healthData.physicalStats.bmi);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: colors.text.primary }}>
          Salud
        </Title>
        <Text style={{ color: colors.text.secondary }}>
          Tu información médica y de emergencia
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Contacto de Emergencia */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <PhoneOutlined style={{ marginRight: 8, color: colors.state.error }} />
                Contacto de Emergencia
              </span>
            }
            extra={<Button type="link" icon={<EditOutlined />}>Editar</Button>}
          >
            <div
              style={{
                background: colors.state.error + '10',
                padding: 16,
                borderRadius: 8,
                marginBottom: 16,
                border: `1px solid ${colors.state.error}30`,
              }}
            >
              <Text style={{ color: colors.state.error, fontSize: 12, display: 'block', marginBottom: 8 }}>
                <AlertOutlined style={{ marginRight: 4 }} />
                En caso de emergencia, contactar a:
              </Text>
              <Title level={4} style={{ margin: 0, color: colors.text.primary }}>
                {healthData.emergencyContact.name}
              </Title>
              <Text style={{ color: colors.text.secondary }}>
                {healthData.emergencyContact.relationship}
              </Text>
            </div>
            <Button type="primary" icon={<PhoneOutlined />} block>
              {healthData.emergencyContact.phone}
            </Button>
          </Card>
        </Col>

        {/* Información Médica */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <MedicineBoxOutlined style={{ marginRight: 8, color: colors.state.info }} />
                Información Médica
              </span>
            }
            extra={<Button type="link" icon={<EditOutlined />}>Editar</Button>}
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item
                label={
                  <span style={{ color: colors.text.muted }}>
                    <HeartOutlined style={{ marginRight: 4 }} />
                    Tipo de Sangre
                  </span>
                }
              >
                <Tag color="red" style={{ fontSize: 16, padding: '4px 12px' }}>
                  {healthData.bloodType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: colors.text.muted }}>Condición Médica</span>}>
                <Text style={{ color: colors.text.primary }}>{healthData.medicalCondition}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: colors.text.muted }}>Alergias</span>}>
                <Text style={{ color: colors.text.primary }}>{healthData.allergies}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: colors.text.muted }}>Medicamentos</span>}>
                <Text style={{ color: colors.text.primary }}>{healthData.medications}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Estadísticas Físicas */}
        <Col xs={24}>
          <Card
            title="Estadísticas Físicas"
            extra={
              <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                Última actualización: {healthData.physicalStats.lastUpdate}
              </Text>
            }
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: 24, background: colors.background.tertiary, borderRadius: 12 }}>
                  <Text style={{ color: colors.text.muted, display: 'block', marginBottom: 8 }}>Altura</Text>
                  <Title level={2} style={{ margin: 0, color: colors.brand.primary }}>
                    {healthData.physicalStats.height}
                  </Title>
                  <Text style={{ color: colors.text.muted }}>cm</Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: 24, background: colors.background.tertiary, borderRadius: 12 }}>
                  <Text style={{ color: colors.text.muted, display: 'block', marginBottom: 8 }}>Peso</Text>
                  <Title level={2} style={{ margin: 0, color: colors.brand.primary }}>
                    {healthData.physicalStats.weight}
                  </Title>
                  <Text style={{ color: colors.text.muted }}>kg</Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: 24, background: colors.background.tertiary, borderRadius: 12 }}>
                  <Text style={{ color: colors.text.muted, display: 'block', marginBottom: 8 }}>IMC</Text>
                  <Title level={2} style={{ margin: 0, color: colors.brand.primary }}>
                    {healthData.physicalStats.bmi}
                  </Title>
                  <Tag color={bmiStatus.color}>{bmiStatus.text}</Tag>
                </div>
              </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
              <Text style={{ color: colors.text.secondary, display: 'block', marginBottom: 8 }}>
                Índice de Masa Corporal (IMC)
              </Text>
              <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ flex: 1, height: 8, background: colors.state.info, borderRadius: '4px 0 0 4px' }} />
                <div style={{ flex: 1, height: 8, background: colors.state.success }} />
                <div style={{ flex: 1, height: 8, background: colors.state.warning }} />
                <div style={{ flex: 1, height: 8, background: colors.state.error, borderRadius: '0 4px 4px 0' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ color: colors.text.muted, fontSize: 10 }}>Bajo peso</Text>
                <Text style={{ color: colors.text.muted, fontSize: 10 }}>Normal</Text>
                <Text style={{ color: colors.text.muted, fontSize: 10 }}>Sobrepeso</Text>
                <Text style={{ color: colors.text.muted, fontSize: 10 }}>Obesidad</Text>
              </div>
            </div>

            <Button type="primary" style={{ marginTop: 24 }}>
              Actualizar Medidas
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
