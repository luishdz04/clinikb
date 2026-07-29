"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Alert, Flex, Typography, theme } from "antd";
import { LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import AuthShell from "@/components/layout/AuthShell";

const { Text } = Typography;

export default function AccesoMedicoPage() {
  const router = useRouter();
  const { token } = theme.useToken();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async ({ password }: { password: string }) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/doctor-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "No se pudo validar la clave");
        return;
      }

      // El guardia de /login/doctor lee la cookie en el servidor, así que hay
      // que refrescar el árbol de servidor antes de navegar.
      router.refresh();
      router.push("/login/doctor");
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Acceso Médico"
      subtitle="Esta área es exclusiva del personal de la clínica. Ingresa la clave de acceso para continuar."
    >
      <Flex vertical gap={token.margin}>
        {error && <Alert title={error} type="error" showIcon />}

        <Form name="doctor-gate" onFinish={handleSubmit} layout="vertical" size="large">
          <Form.Item
            name="password"
            label="Clave de acceso"
            rules={[{ required: true, message: "Ingresa la clave de acceso" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Clave proporcionada por la clínica"
              autoComplete="off"
              autoFocus
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              Continuar
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
