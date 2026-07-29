"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Alert, Divider, Flex, Typography, App, theme } from "antd";
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import AuthShell from "@/components/layout/AuthShell";

const { Text, Link: AntLink } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Error al iniciar sesión");
        return;
      }

      message.success("¡Bienvenido de nuevo!");
      router.push("/cliente/dashboard");
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell title="Portal de Pacientes" subtitle="Ingresa a tu cuenta">
      <Flex vertical gap={token.margin}>
        {error && <Alert title={error} type="error" showIcon />}

        <Form name="login-patient" onFinish={handleSubmit} layout="vertical" size="large">
          <Form.Item
            name="email"
            label="Correo Electrónico"
            rules={[
              { required: true, message: "Ingresa tu correo" },
              { type: "email", message: "Correo inválido" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="tu@email.com" autoComplete="email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[{ required: true, message: "Ingresa tu contraseña" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Tu contraseña"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>

        <Flex vertical align="center" gap={token.marginXS}>
          <Link href="/recuperar-password">
            <AntLink>¿Olvidaste tu contraseña?</AntLink>
          </Link>

          <Divider style={{ margin: `${token.marginXS}px 0` }} />

          <Text type="secondary">
            ¿No tienes cuenta?{" "}
            <Link href="/registro">
              <AntLink strong>Regístrate aquí</AntLink>
            </Link>
          </Text>

          <Link href="/">
            <Text type="secondary">
              <ArrowLeftOutlined /> Volver al inicio
            </Text>
          </Link>
        </Flex>
      </Flex>
    </AuthShell>
  );
}
