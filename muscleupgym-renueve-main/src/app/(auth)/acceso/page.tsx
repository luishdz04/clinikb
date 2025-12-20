'use client';

import { useState } from 'react';
import { Form, Input, Button, Typography, Card, App } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { colors } from '@/theme';

const { Text, Title } = Typography;

interface AccessFormData {
  password: string;
}

export default function AccesoAdminPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const { message } = App.useApp();

  const handleAccess = async (values: AccessFormData) => {
    setLoading(true);
    try {
      // Validar contraseña de acceso con la API
      const response = await fetch('/api/validate-admin-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: values.password }),
      });

      const data = await response.json();

      if (data.success) {
        message.success('Acceso concedido');
        // Redirigir al login de empleados
        router.push('/login/empleados');
      } else {
        message.error('Contraseña de acceso incorrecta');
        form.resetFields();
      }
    } catch (error) {
      message.error('Error al validar acceso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${colors.background.primary} 0%, ${colors.background.secondary} 100%)`,
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo y título */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image
            src="/logos/logo.png"
            alt="Muscle Up GYM"
            width={180}
            height={180}
            style={{ margin: '0 auto 16px', objectFit: 'contain' }}
            priority
          />
          <Title level={3} style={{ color: colors.brand.primary, margin: '0 0 8px 0' }}>
            Acceso Restringido
          </Title>
          <Text style={{ color: colors.text.muted, fontSize: 16 }}>
            Ingresa la contraseña de acceso al panel administrativo
          </Text>
        </div>

        {/* Card del formulario */}
        <Card
          style={{
            background: colors.background.secondary,
            border: `1px solid ${colors.border.light}`,
            borderRadius: 16,
          }}
          styles={{
            body: { padding: 32 }
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAccess}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              name="password"
              label={<span style={{ color: colors.text.primary }}>Contraseña de Acceso</span>}
              rules={[{ required: true, message: 'Ingresa la contraseña de acceso' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: colors.text.muted }} />}
                placeholder="••••••••"
                size="large"
                autoFocus
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  height: 48,
                  fontWeight: 600,
                  fontSize: 16,
                }}
              >
                Acceder
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Text style={{ color: colors.text.muted, fontSize: 12 }}>
            © 2025 Muscle Up GYM. Panel de Administración
          </Text>
        </div>
      </div>
    </div>
  );
}
