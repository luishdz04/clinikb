'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Card, Alert, App } from 'antd';
import {
  LockOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from '@ant-design/icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { colors } from '@/theme';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

const { Title, Text } = Typography;

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const supabase = createClient();
  const { message } = App.useApp();

  useEffect(() => {
    const processRecoveryLink = async () => {
      try {
        // 1. Extraer tokens del hash de la URL
        const fragment = window.location.hash.substring(1);

        if (!fragment) {
          console.log('⚠️ [RESET-PASSWORD] No hay fragmento en URL');
          setError('El enlace de restablecimiento es inválido o ha expirado.');
          setValidSession(false);
          return;
        }

        const params = new URLSearchParams(fragment);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const type = params.get('type');

        console.log('🔐 [RESET-PASSWORD] Tokens extraídos:', {
          has_access_token: !!access_token,
          has_refresh_token: !!refresh_token,
          type,
          access_token_length: access_token?.length,
        });

        if (!access_token || type !== 'recovery') {
          console.error('❌ [RESET-PASSWORD] Tokens inválidos o tipo incorrecto');
          setError('El enlace de restablecimiento es inválido o ha expirado.');
          setValidSession(false);
          return;
        }

        // 2. Establecer la sesión manualmente con los tokens
        console.log('📝 [RESET-PASSWORD] Estableciendo sesión con tokens...');

        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token: refresh_token || '',
        });

        if (sessionError) {
          console.error('❌ [RESET-PASSWORD] Error al establecer sesión:', sessionError);
          setError('El enlace de restablecimiento es inválido o ha expirado.');
          setValidSession(false);
          return;
        }

        if (!data?.session) {
          console.error('❌ [RESET-PASSWORD] No se creó sesión');
          setError('El enlace de restablecimiento es inválido o ha expirado.');
          setValidSession(false);
          return;
        }

        console.log('✅ [RESET-PASSWORD] Sesión establecida:', {
          user_id: data.session.user.id,
          email: data.session.user.email,
        });

        // 3. Limpiar el hash de la URL
        if (window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        setValidSession(true);
      } catch (err) {
        console.error('💥 [RESET-PASSWORD] Error inesperado:', err);
        setError('Ocurrió un error al procesar el enlace.');
        setValidSession(false);
      }
    };

    processRecoveryLink();
  }, [supabase]);

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    setError('');
    setLoading(true);

    if (values.password !== values.confirmPassword) {
      setError('Las contraseñas no coinciden');
      message.error('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (values.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      message.error('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: values.password });

      if (error) throw error;

      setSuccess(true);
      message.success('Contraseña actualizada correctamente');

      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push('/cliente/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al restablecer contraseña');
      message.error(err.message || 'Error al restablecer contraseña');
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
          <LockOutlined
            style={{
              fontSize: 48,
              color: colors.brand.primary,
              marginBottom: 16,
            }}
          />
          <Title
            level={2}
            style={{
              color: colors.text.primary,
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            Nueva Contraseña
          </Title>
          <Text style={{ color: colors.text.secondary, fontSize: 16 }}>
            Ingresa tu nueva contraseña segura
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
                ¡Contraseña actualizada!
              </Title>
              <Text
                style={{
                  color: colors.text.secondary,
                  display: 'block',
                  marginBottom: 16,
                  fontSize: 16,
                }}
              >
                Tu contraseña ha sido cambiada correctamente
              </Text>
              <Text
                style={{
                  color: colors.text.muted,
                  display: 'block',
                  fontSize: 14,
                }}
              >
                Serás redirigido a tu dashboard en breve...
              </Text>
            </motion.div>
          ) : validSession ? (
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
                  name="password"
                  label={
                    <span style={{ color: colors.text.primary }}>Nueva contraseña</span>
                  }
                  rules={[
                    { required: true, message: 'Ingresa tu nueva contraseña' },
                    {
                      min: 8,
                      message: 'La contraseña debe tener al menos 8 caracteres',
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: colors.text.muted }} />}
                    placeholder="••••••••"
                    size="large"
                    disabled={loading}
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Form.Item
                  name="confirmPassword"
                  label={
                    <span style={{ color: colors.text.primary }}>
                      Confirmar contraseña
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Confirma tu contraseña' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Las contraseñas no coinciden'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: colors.text.muted }} />}
                    placeholder="••••••••"
                    size="large"
                    disabled={loading}
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
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
                    {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                  </Button>
                </Form.Item>
              </motion.div>
            </Form>
          ) : null}
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
