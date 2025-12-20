'use client';

import { Typography, Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, TeamOutlined, DollarOutlined, CalendarOutlined } from '@ant-design/icons';
import { colors } from '@/theme';

const { Title, Paragraph } = Typography;

export default function AdminDashboard() {
  return (
    <div>
      <Title level={2} style={{ color: colors.text.primary, marginBottom: 24 }}>
        Panel de Administración
      </Title>
      
      <Paragraph style={{ color: colors.text.secondary, marginBottom: 32 }}>
        Bienvenido al panel de administración de Muscle Up GYM
      </Paragraph>

      {/* Cards de estadísticas - Datos placeholder */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: colors.background.secondary, border: 'none' }}>
            <Statistic
              title="Total Clientes"
              value={0}
              prefix={<UserOutlined />}
              styles={{ content: { color: colors.brand.primary } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: colors.background.secondary, border: 'none' }}>
            <Statistic
              title="Empleados Activos"
              value={0}
              prefix={<TeamOutlined />}
              styles={{ content: { color: colors.state.info } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: colors.background.secondary, border: 'none' }}>
            <Statistic
              title="Ventas del Mes"
              value={0}
              prefix={<DollarOutlined />}
              styles={{ content: { color: colors.state.success } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: colors.background.secondary, border: 'none' }}>
            <Statistic
              title="Asistencias Hoy"
              value={0}
              prefix={<CalendarOutlined />}
              styles={{ content: { color: colors.state.infoLight } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Sección de bienvenida adicional */}
      <Card 
        style={{ 
          marginTop: 24, 
          background: colors.background.secondary,
          borderLeft: `4px solid ${colors.brand.primary}` 
        }}
      >
        <Title level={4} style={{ color: colors.text.primary }}>
          🎉 Panel de Administración Activo
        </Title>
        <Paragraph style={{ color: colors.text.secondary, marginBottom: 0 }}>
          El sistema está listo para configurar las secciones administrativas.
          Las secciones y funcionalidades se agregarán según los requerimientos.
        </Paragraph>
      </Card>
    </div>
  );
}
