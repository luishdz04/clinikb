"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Alert, Flex, Typography, App, theme } from "antd";
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import AuthShell from "@/components/layout/AuthShell";

const { Text } = Typography;

export default function LoginDoctorPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Error al iniciar sesión");
        return;
      }

      localStorage.setItem("doctor", JSON.stringify(result.doctor));

      message.success(`¡Bienvenido Dr(a). ${result.doctor.full_name}!`);
      router.push("/admin/pacientes");
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Panel de Administración"
      subtitle="Acceso para doctores y administradores"
    >
      <Flex vertical gap={token.margin}>
        {error && <Alert title={error} type="error" showIcon />}

        <Form name="login-doctor" onFinish={handleSubmit} layout="vertical" size="large">
          <Form.Item
            name="email"
            label="Correo Electrónico"
            rules={[
              { required: true, message: "Ingresa tu correo" },
              { type: "email", message: "Correo inválido" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="doctor@clinikb.com"
              autoComplete="email"
            />
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

        <Flex justify="center">
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
