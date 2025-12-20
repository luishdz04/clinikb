'use client';

import { useState } from 'react';
import { Form, Input, Button, Typography, Card, Alert, App } from 'antd';
import {
  MailOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { colors } from '@/theme';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const { message } = App.useApp();

  const handleSubmit = async (values: { email: string }) => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el correo');
      }

      setSuccess(true);
      setEmail(values.email);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo de restablecimiento');
      message.error(err.message || 'Error al enviar el correo de restablecimiento');
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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background animated gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.03 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          width: '150%',
          height: '150%',
          background: `radial-gradient(circle at 50% 50%, ${colors.brand.primary}15, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: 480,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Back Button */}
        <div style={{ marginBottom: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            type="text"
            onClick={() => router.push('/login')}
            style={{
              color: colors.text.secondary,
            }}
          >
            Volver al login
          </Button>
        </div>

        {/* Logo y título */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Image
              src="/logos/logo.png"
              alt="Muscle Up GYM"
              width={160}
              height={160}
              style={{ margin: '0 auto 16px', objectFit: 'contain' }}
              priority
            />
          </motion.div>
          <Title
            level={2}
            style={{
              color: colors.text.primary,
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            ¿Olvidaste tu contraseña?
          </Title>
          <Text style={{ color: colors.text.secondary, fontSize: 16 }}>
            No te preocupes, te enviaremos instrucciones para restablecerla
          </Text>
        </div>

        {/* Card del formulario */}
        <Card
          style={{
            background: colors.background.secondary,
            border: `2px solid ${colors.brand.primary}40`,
            borderRadius: 16,
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.5),
              0 0 80px rgba(255, 204, 0, 0.1)
            `,
          }}
          styles={{
            body: { padding: 32 },
          }}
        >
          {/* Error Alert */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setError('')}
                  style={{ marginBottom: 24 }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success State */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', padding: '32px 0' }}
            >
              <CheckCircleOutlined
                style={{
                  fontSize: 80,
                  color: colors.state.success,
                  marginBottom: 16,
                }}
              />
              <Title level={3} style={{ color: colors.text.primary, marginBottom: 16 }}>
                ¡Correo enviado!
              </Title>
              <Text
                style={{
                  color: colors.text.secondary,
                  display: 'block',
                  marginBottom: 24,
                  fontSize: 16,
                }}
              >
                Hemos enviado las instrucciones para restablecer tu contraseña a{' '}
                <strong style={{ color: colors.brand.primary }}>{email}</strong>
              </Text>
              <Text
                style={{
                  color: colors.text.muted,
                  display: 'block',
                  fontSize: 14,
                }}
              >
                Revisa tu bandeja de entrada y tu carpeta de spam. El enlace expirará en
                24 horas.
              </Text>
            </motion.div>
          ) : (
            /* Form */
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              requiredMark={false}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Form.Item
                  name="email"
                  label={
                    <span style={{ color: colors.text.primary }}>
                      Correo Electrónico
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Ingresa tu correo' },
                    { type: 'email', message: 'Ingresa un correo válido' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: colors.text.muted }} />}
                    placeholder="tu@email.com"
                    size="large"
                    disabled={loading}
                  />
                </Form.Item>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={loading}
                    style={{
                      height: 48,
                      fontWeight: 700,
                      fontSize: 16,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    {loading ? 'Enviando...' : 'Enviar instrucciones'}
                  </Button>
                </Form.Item>
              </motion.div>
            </Form>
          )}
        </Card>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text
            style={{
              color: colors.text.muted,
              fontSize: 14,
              fontStyle: 'italic',
            }}
          >
            "Tu salud y bienestar son nuestra misión"
          </Text>
        </div>
      </motion.div>
    </div>
  );
}
