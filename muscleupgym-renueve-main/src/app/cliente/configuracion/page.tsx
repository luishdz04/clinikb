'use client';

import { Card, Typography, Form, Switch, Divider, Button, Select, Radio, message, Space } from 'antd';
import {
  BellOutlined,
  LockOutlined,
  GlobalOutlined,
  MoonOutlined,
  MailOutlined,
  MobileOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { colors } from '@/theme';
import { createClient } from '@/utils/supabase/client';

const { Title, Text, Paragraph } = Typography;

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Configuraciones de ejemplo
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    classReminders: true,
    paymentReminders: true,
    promotions: false,
    language: 'es',
    theme: 'dark',
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Aquí guardarías en Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Configuración guardada correctamente');
    } catch (error) {
      message.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: colors.text.primary }}>
          Configuración
        </Title>
        <Text style={{ color: colors.text.secondary }}>
          Personaliza tu experiencia en MuscleUp
        </Text>
      </div>

      <div style={{ maxWidth: 800 }}>
        {/* Notificaciones */}
        <Card
          title={
            <Space>
              <BellOutlined style={{ color: colors.brand.primary }} />
              <span>Notificaciones</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: colors.text.primary, display: 'block' }}>
                  <MailOutlined style={{ marginRight: 8 }} />
                  Notificaciones por Email
                </Text>
                <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                  Recibe actualizaciones importantes en tu correo
                </Text>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>

            <Divider style={{ margin: '8px 0', borderColor: colors.border.light }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: colors.text.primary, display: 'block' }}>
                  <MobileOutlined style={{ marginRight: 8 }} />
                  Notificaciones Push
                </Text>
                <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                  Recibe notificaciones en tu dispositivo
                </Text>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>

            <Divider style={{ margin: '8px 0', borderColor: colors.border.light }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: colors.text.primary, display: 'block' }}>
                  Recordatorios de Clases
                </Text>
                <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                  Te avisamos antes de tus clases programadas
                </Text>
              </div>
              <Switch
                checked={settings.classReminders}
                onChange={(checked) => handleSettingChange('classReminders', checked)}
              />
            </div>

            <Divider style={{ margin: '8px 0', borderColor: colors.border.light }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: colors.text.primary, display: 'block' }}>
                  Recordatorios de Pago
                </Text>
                <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                  Te notificamos antes de tu próximo pago
                </Text>
              </div>
              <Switch
                checked={settings.paymentReminders}
                onChange={(checked) => handleSettingChange('paymentReminders', checked)}
              />
            </div>

            <Divider style={{ margin: '8px 0', borderColor: colors.border.light }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: colors.text.primary, display: 'block' }}>
                  Promociones y Ofertas
                </Text>
                <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                  Recibe información sobre descuentos especiales
                </Text>
              </div>
              <Switch
                checked={settings.promotions}
                onChange={(checked) => handleSettingChange('promotions', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Preferencias */}
        <Card
          title={
            <Space>
              <GlobalOutlined style={{ color: colors.brand.primary }} />
              <span>Preferencias</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <Text strong style={{ color: colors.text.primary, display: 'block', marginBottom: 8 }}>
                Idioma
              </Text>
              <Select
                value={settings.language}
                onChange={(value) => handleSettingChange('language', value)}
                style={{ width: 200 }}
                options={[
                  { value: 'es', label: '🇲🇽 Español' },
                  { value: 'en', label: '🇺🇸 English' },
                ]}
              />
            </div>

            <div>
              <Text strong style={{ color: colors.text.primary, display: 'block', marginBottom: 8 }}>
                <MoonOutlined style={{ marginRight: 8 }} />
                Tema de la Aplicación
              </Text>
              <Radio.Group
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
              >
                <Radio.Button value="dark">🌙 Oscuro</Radio.Button>
                <Radio.Button value="light">☀️ Claro</Radio.Button>
                <Radio.Button value="auto">🔄 Automático</Radio.Button>
              </Radio.Group>
            </div>
          </div>
        </Card>

        {/* Seguridad */}
        <Card
          title={
            <Space>
              <LockOutlined style={{ color: colors.brand.primary }} />
              <span>Seguridad</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Button type="default">Cambiar Contraseña</Button>
            <Button type="default">Configurar Autenticación de Dos Factores</Button>
            <Divider style={{ borderColor: colors.border.light }} />
            <Button danger onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </Card>

        {/* Botón Guardar */}
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={handleSave}
          block
        >
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
