'use client';

import { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Card, App } from 'antd';
import {
  LockOutlined,
  MailOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { colors } from '@/theme';
import { createClient } from '@/utils/supabase/client';

const { Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginEmpleadosPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const supabase = createClient();
  const { message } = App.useApp();

  const handleLogin = async (values: LoginFormData) => {
    setLoading(true);
    try {
      // Validar credenciales contra la tabla employees
      const response = await fetch('/api/login-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        message.error(data.error || 'Correo o contraseña incorrectos');
        return;
      }

      if (data.success && data.employee) {
        message.success('¡Bienvenido al panel de administración!');
        // Usar window.location para un redirect más robusto
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 500);
      } else {
        message.error('No tienes permisos para acceder al panel de administración');
      }
    } catch (error: any) {
      message.error('Error al iniciar sesión. Intenta de nuevo.');
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
          <Text style={{ color: colors.brand.primary, fontSize: 24, fontWeight: 700, display: 'block', marginBottom: 8 }}>
            Panel de Administración
          </Text>
          <Text style={{ color: colors.text.muted, fontSize: 16 }}>
            Acceso solo para empleados autorizados
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
            onFinish={handleLogin}
            autoComplete="off"
            requiredMark={false}
            initialValues={{ remember: true }}
          >
            <Form.Item
              name="email"
              label={<span style={{ color: colors.text.primary }}>Correo Electrónico</span>}
              rules={[
                { required: true, message: 'Ingresa tu correo' },
                { type: 'email', message: 'Ingresa un correo válido' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: colors.text.muted }} />}
                placeholder="empleado@muscleupgym.fitness"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ color: colors.text.primary }}>Contraseña</span>}
              rules={[{ required: true, message: 'Ingresa tu contraseña' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: colors.text.muted }} />}
                placeholder="••••••••"
                size="large"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>
                    <Text style={{ color: colors.text.secondary }}>Recordarme</Text>
                  </Checkbox>
                </Form.Item>
                <Link
                  href="/forgot-password"
                  style={{ color: colors.brand.primary, fontSize: 14 }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </Form.Item>

            <Form.Item style={{ marginBottom: 16 }}>
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
                Iniciar Sesión
              </Button>
            </Form.Item>

            {/* Botón de regreso a inicio */}
            <Form.Item style={{ marginBottom: 0 }}>
              <Link href="/" style={{ textDecoration: 'none', display: 'block' }}>
                <Button
                  type="default"
                  size="large"
                  block
                  icon={<ArrowLeftOutlined />}
                  style={{
                    height: 48,
                    fontWeight: 500,
                    fontSize: 16,
                    color: colors.text.secondary,
                    borderColor: colors.border.secondary,
                  }}
                >
                  Regresar a inicio
                </Button>
              </Link>
            </Form.Item>
          </Form>
        </Card>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Text style={{ color: colors.text.muted, fontSize: 12 }}>
            © 2025 Muscle Up GYM. Todos los derechos reservados.
          </Text>
        </div>
      </div>
    </div>
  );
}
