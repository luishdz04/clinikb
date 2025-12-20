'use client';

import { Card, Typography, Row, Col, Form, Input, Select, Button, Avatar, Divider, Tag, Descriptions, Upload, message } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  EditOutlined,
  CameraOutlined,
  SaveOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { colors } from '@/theme';
import { createClient } from '@/utils/supabase/client';

const { Title, Text } = Typography;

export default function MiPerfilPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [form] = Form.useForm();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        form.setFieldsValue({
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
        });
      }
    };
    getUser();
  }, [supabase.auth, form]);

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone,
        },
      });

      if (error) throw error;

      message.success('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error: any) {
      message.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const userMetadata = user?.user_metadata || {};
  const initials = `${(userMetadata.first_name || 'U').charAt(0)}${(userMetadata.last_name || '').charAt(0)}`.toUpperCase();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: colors.text.primary }}>
          Mi Perfil
        </Title>
        <Text style={{ color: colors.text.secondary }}>
          Administra tu información personal
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Card de perfil */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  size={100}
                  style={{
                    backgroundColor: colors.brand.primary,
                    color: colors.text.inverse,
                    fontSize: 36,
                  }}
                  src={userMetadata.avatar_url}
                >
                  {initials}
                </Avatar>
                <Button
                  type="primary"
                  shape="circle"
                  size="small"
                  icon={<CameraOutlined />}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                  }}
                />
              </div>
              <Title level={4} style={{ margin: '16px 0 4px', color: colors.text.primary }}>
                {userMetadata.first_name} {userMetadata.last_name}
              </Title>
              <Tag color="success">Cliente Activo</Tag>
            </div>

            <Divider style={{ borderColor: colors.border.light }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MailOutlined style={{ color: colors.text.muted }} />
                <Text style={{ color: colors.text.secondary }}>{user?.email}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PhoneOutlined style={{ color: colors.text.muted }} />
                <Text style={{ color: colors.text.secondary }}>
                  {userMetadata.phone || 'No registrado'}
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarOutlined style={{ color: colors.text.muted }} />
                <Text style={{ color: colors.text.secondary }}>
                  Miembro desde: {new Date(user?.created_at || '').toLocaleDateString()}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Formulario de edición */}
        <Col xs={24} lg={16}>
          <Card
            title="Información Personal"
            extra={
              !isEditing ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </Button>
              ) : null
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              disabled={!isEditing}
            >
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="firstName"
                    label="Nombre(s)"
                    rules={[{ required: true, message: 'Campo requerido' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Tu nombre" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lastName"
                    label="Apellidos"
                    rules={[{ required: true, message: 'Campo requerido' }]}
                  >
                    <Input placeholder="Tus apellidos" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="email" label="Correo Electrónico">
                    <Input prefix={<MailOutlined />} disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="phone" label="Teléfono / WhatsApp">
                    <Input prefix={<PhoneOutlined />} placeholder="+52 123 456 7890" />
                  </Form.Item>
                </Col>
              </Row>

              {isEditing && (
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                  >
                    Guardar Cambios
                  </Button>
                  <Button onClick={() => setIsEditing(false)}>Cancelar</Button>
                </div>
              )}
            </Form>
          </Card>

          {/* Información adicional - Solo lectura */}
          <Card title="Información de Contacto de Emergencia" style={{ marginTop: 24 }}>
            <Descriptions column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Nombre de Contacto">
                {userMetadata.emergency_contact_name || 'No registrado'}
              </Descriptions.Item>
              <Descriptions.Item label="Teléfono de Emergencia">
                {userMetadata.emergency_contact_phone || 'No registrado'}
              </Descriptions.Item>
              <Descriptions.Item label="Condición Médica">
                {userMetadata.medical_condition || 'Ninguna'}
              </Descriptions.Item>
              <Descriptions.Item label="Tipo de Sangre">
                {userMetadata.blood_type || 'No especificado'}
              </Descriptions.Item>
            </Descriptions>
            <Button type="link" style={{ padding: 0, marginTop: 8 }}>
              Actualizar información de emergencia
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
