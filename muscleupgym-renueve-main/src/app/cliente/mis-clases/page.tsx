'use client';

import { Card, Typography, Button, Tag, Tabs, List, Avatar, Empty, Row, Col, Badge, Segmented } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { colors } from '@/theme';

const { Title, Text } = Typography;

// Datos de ejemplo
const myClasses = [
  {
    id: 1,
    name: 'Spinning Intenso',
    instructor: 'Carlos Mendoza',
    time: '07:00 AM',
    date: '2025-12-07',
    day: 'Hoy',
    duration: '45 min',
    room: 'Sala A',
    spots: 3,
    enrolled: true,
  },
  {
    id: 2,
    name: 'Yoga Flow',
    instructor: 'Ana García',
    time: '06:00 PM',
    date: '2025-12-08',
    day: 'Mañana',
    duration: '60 min',
    room: 'Sala B',
    spots: 5,
    enrolled: true,
  },
  {
    id: 3,
    name: 'CrossFit',
    instructor: 'Miguel Torres',
    time: '08:00 AM',
    date: '2025-12-09',
    day: 'Lun 9',
    duration: '50 min',
    room: 'Área CrossFit',
    spots: 2,
    enrolled: true,
  },
];

const availableClasses = [
  {
    id: 4,
    name: 'Zumba',
    instructor: 'Laura Pérez',
    time: '05:00 PM',
    date: '2025-12-07',
    day: 'Hoy',
    duration: '45 min',
    room: 'Sala C',
    spots: 8,
    enrolled: false,
  },
  {
    id: 5,
    name: 'Boxeo Fitness',
    instructor: 'Roberto Sánchez',
    time: '07:00 PM',
    date: '2025-12-07',
    day: 'Hoy',
    duration: '50 min',
    room: 'Área Combat',
    spots: 4,
    enrolled: false,
  },
  {
    id: 6,
    name: 'Pilates Mat',
    instructor: 'Ana García',
    time: '09:00 AM',
    date: '2025-12-08',
    day: 'Mañana',
    duration: '55 min',
    room: 'Sala B',
    spots: 6,
    enrolled: false,
  },
  {
    id: 7,
    name: 'HIIT Express',
    instructor: 'Miguel Torres',
    time: '12:00 PM',
    date: '2025-12-08',
    day: 'Mañana',
    duration: '30 min',
    room: 'Sala A',
    spots: 10,
    enrolled: false,
  },
];

const pastClasses = [
  {
    id: 101,
    name: 'Spinning Intenso',
    instructor: 'Carlos Mendoza',
    date: '2025-12-05',
    completed: true,
  },
  {
    id: 102,
    name: 'Yoga Flow',
    instructor: 'Ana García',
    date: '2025-12-04',
    completed: true,
  },
  {
    id: 103,
    name: 'CrossFit',
    instructor: 'Miguel Torres',
    date: '2025-12-03',
    completed: false,
  },
];

interface ClassItemProps {
  item: typeof myClasses[0];
  showEnrollButton?: boolean;
}

function ClassItem({ item, showEnrollButton = false }: ClassItemProps) {
  return (
    <List.Item
      actions={
        showEnrollButton
          ? [
              <Button key="enroll" type="primary" icon={<PlusOutlined />}>
                Inscribirse
              </Button>,
            ]
          : [
              <Button key="cancel" type="text" danger>
                Cancelar
              </Button>,
            ]
      }
    >
      <List.Item.Meta
        avatar={
          <Avatar
            size={48}
            style={{
              backgroundColor: item.enrolled ? colors.brand.primary + '20' : colors.background.tertiary,
              color: item.enrolled ? colors.brand.primary : colors.text.muted,
            }}
            icon={<CalendarOutlined />}
          />
        }
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text strong style={{ color: colors.text.primary, fontSize: 16 }}>
              {item.name}
            </Text>
            <Tag color="default">{item.duration}</Tag>
            {item.spots <= 3 && (
              <Tag color="warning">¡{item.spots} lugares!</Tag>
            )}
          </div>
        }
        description={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ color: colors.text.muted }}>
                <UserOutlined style={{ marginRight: 4 }} />
                {item.instructor}
              </span>
              <span style={{ color: colors.text.muted }}>
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {item.room}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag color="blue">{item.day}</Tag>
              <span style={{ color: colors.text.secondary }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {item.time}
              </span>
              <span style={{ color: colors.text.muted }}>
                <TeamOutlined style={{ marginRight: 4 }} />
                {item.spots} disponibles
              </span>
            </div>
          </div>
        }
      />
    </List.Item>
  );
}

export default function MisClasesPage() {
  const [activeTab, setActiveTab] = useState('mis-clases');

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: colors.text.primary }}>
          Mis Clases
        </Title>
        <Text style={{ color: colors.text.secondary }}>
          Administra tus clases y encuentra nuevas actividades
        </Text>
      </div>

      {/* Stats rápidos */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={8}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: colors.text.muted, fontSize: 12 }}>Inscrito</Text>
              <Title level={3} style={{ margin: 0, color: colors.brand.primary }}>
                {myClasses.length}
              </Title>
            </div>
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: colors.text.muted, fontSize: 12 }}>Completadas</Text>
              <Title level={3} style={{ margin: 0, color: colors.state.success }}>
                {pastClasses.filter(c => c.completed).length}
              </Title>
            </div>
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: colors.text.muted, fontSize: 12 }}>Disponibles</Text>
              <Title level={3} style={{ margin: 0, color: colors.state.info }}>
                {availableClasses.length}
              </Title>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'mis-clases',
              label: (
                <span>
                  <CheckCircleOutlined />
                  Mis Clases ({myClasses.length})
                </span>
              ),
              children: (
                <List
                  itemLayout="horizontal"
                  dataSource={myClasses}
                  renderItem={(item) => <ClassItem item={item} />}
                  locale={{ emptyText: <Empty description="No tienes clases programadas" /> }}
                />
              ),
            },
            {
              key: 'disponibles',
              label: (
                <span>
                  <PlusOutlined />
                  Disponibles ({availableClasses.length})
                </span>
              ),
              children: (
                <List
                  itemLayout="horizontal"
                  dataSource={availableClasses}
                  renderItem={(item) => <ClassItem item={item} showEnrollButton />}
                />
              ),
            },
            {
              key: 'historial',
              label: (
                <span>
                  <ClockCircleOutlined />
                  Historial
                </span>
              ),
              children: (
                <List
                  itemLayout="horizontal"
                  dataSource={pastClasses}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{
                              backgroundColor: item.completed
                                ? colors.state.success + '20'
                                : colors.state.error + '20',
                              color: item.completed ? colors.state.success : colors.state.error,
                            }}
                            icon={item.completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                          />
                        }
                        title={
                          <Text style={{ color: colors.text.primary }}>{item.name}</Text>
                        }
                        description={
                          <Text style={{ color: colors.text.muted }}>
                            {item.instructor} • {item.date}
                          </Text>
                        }
                      />
                      <Tag color={item.completed ? 'success' : 'default'}>
                        {item.completed ? 'Completada' : 'No asistió'}
                      </Tag>
                    </List.Item>
                  )}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
