'use client';

import { 
  Layout, 
  Menu, 
  Card, 
  Button, 
  Table, 
  Tag, 
  Space, 
  Avatar,
  Statistic,
  Row,
  Col,
  Progress,
  Typography,
  Dropdown,
  Badge,
  Input
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  SettingOutlined,
  BellOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DollarOutlined,
  RiseOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import type { MenuProps } from 'antd';
import { colors } from '@/theme';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// Datos de ejemplo para la tabla de miembros
const membersData = [
  {
    key: '1',
    name: 'Luis Diego De Luna',
    email: 'ing.luisdeluna@outlook.com',
    membership: 'Premium',
    status: 'active',
    joinDate: '2025-11-23',
  },
  {
    key: '2',
    name: 'Diego De Luna',
    email: 'diegoluna@uadec.edu.mx',
    membership: 'Básico',
    status: 'active',
    joinDate: '2025-12-06',
  },
  {
    key: '3',
    name: 'María García',
    email: 'maria.garcia@email.com',
    membership: 'Premium',
    status: 'expired',
    joinDate: '2025-10-15',
  },
];

const columns = [
  {
    title: 'Miembro',
    dataIndex: 'name',
    key: 'name',
    render: (text: string, record: any) => (
      <Space>
        <Avatar style={{ backgroundColor: colors.brand.primary, color: colors.text.inverse }}>{text.charAt(0)}</Avatar>
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
        </div>
      </Space>
    ),
  },
  {
    title: 'Membresía',
    dataIndex: 'membership',
    key: 'membership',
    render: (text: string) => (
      <Tag color={text === 'Premium' ? 'gold' : 'default'}>{text}</Tag>
    ),
  },
  {
    title: 'Estado',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag color={status === 'active' ? 'green' : 'red'}>
        {status === 'active' ? 'Activo' : 'Vencido'}
      </Tag>
    ),
  },
  {
    title: 'Fecha de Ingreso',
    dataIndex: 'joinDate',
    key: 'joinDate',
  },
  {
    title: 'Acciones',
    key: 'actions',
    render: () => (
      <Space>
        <Button type="link" size="small">Ver</Button>
        <Button type="link" size="small">Editar</Button>
      </Space>
    ),
  },
];

const menuItems: MenuProps['items'] = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: 'members',
    icon: <TeamOutlined />,
    label: 'Miembros',
  },
  {
    key: 'schedule',
    icon: <CalendarOutlined />,
    label: 'Horarios',
  },
  {
    key: 'payments',
    icon: <DollarOutlined />,
    label: 'Pagos',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Configuración',
  },
];

export default function DemoAntdPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: colors.background.secondary,
          borderRight: `1px solid ${colors.border.light}`,
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: `1px solid ${colors.border.light}`
        }}>
          <Title level={4} style={{ color: colors.brand.primary, margin: 0 }}>
            {collapsed ? 'MU' : 'MuscleUp'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          style={{ background: 'transparent', borderRight: 0 }}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header style={{ 
          padding: '0 24px', 
          background: colors.background.secondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${colors.border.light}`
        }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: colors.text.primary }}
            />
            <Input
              placeholder="Buscar..."
              prefix={<SearchOutlined style={{ color: colors.text.muted }} />}
              style={{ width: 300 }}
            />
          </Space>
          <Space size="large">
            <Badge count={5}>
              <Button type="text" icon={<BellOutlined style={{ fontSize: 20, color: colors.text.primary }} />} />
            </Badge>
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: 'Mi Perfil' },
                  { key: 'logout', label: 'Cerrar Sesión', danger: true },
                ],
              }}
            >
              <Avatar style={{ backgroundColor: colors.brand.primary, color: colors.text.inverse, cursor: 'pointer' }}>
                <UserOutlined />
              </Avatar>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content style={{ margin: 24, overflow: 'auto' }}>
          {/* Stats Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Miembros Activos"
                  value={156}
                  prefix={<TeamOutlined style={{ color: colors.brand.primary }} />}
                  suffix={
                    <Text type="success" style={{ fontSize: 14 }}>
                      <RiseOutlined /> +12%
                    </Text>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Ingresos del Mes"
                  value={45680}
                  prefix={<DollarOutlined style={{ color: colors.state.success }} />}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Clases Hoy"
                  value={8}
                  prefix={<CalendarOutlined style={{ color: colors.state.info }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Asistencia Hoy"
                  value={73}
                  prefix={<FireOutlined style={{ color: colors.brand.primary }} />}
                  suffix="%"
                />
                <Progress percent={73} showInfo={false} strokeColor={colors.brand.primary} />
              </Card>
            </Col>
          </Row>

          {/* Members Table */}
          <Card 
            title="Miembros Recientes" 
            extra={
              <Button type="primary" icon={<UserOutlined />}>
                Nuevo Miembro
              </Button>
            }
          >
            <Table 
              columns={columns} 
              dataSource={membersData} 
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}
