"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, Typography, Alert, App } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function LoginPacientePage() {
  const router = useRouter();
  const { message } = App.useApp();
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
    } catch (error: any) {
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#55c5c4]/10 via-white to-[#dfc79c]/10 flex items-center justify-center py-12">
      <div className="mx-auto max-w-md px-4 w-full">
        <Card className="shadow-lg">
          <div className="text-center mb-6">
            <Link href="/">
              <Image
                src="/images/logo/clinikb.png"
                alt="CliniKB"
                width={80}
                height={80}
                className="mx-auto mb-4"
              />
            </Link>
            <Title level={2} className="!mb-2">
              Portal de Pacientes
            </Title>
            <Text className="text-gray-600">Ingresa a tu cuenta</Text>
          </div>

          {error && (
            <Alert title={error} type="error" showIcon className="mb-4" />
          )}

          <Form
            name="login-patient"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="Correo Electrónico"
              rules={[
                { required: true, message: "Ingresa tu correo" },
                { type: "email", message: "Correo inválido" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="tu@email.com"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Contraseña"
              rules={[{ required: true, message: "Ingresa tu contraseña" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Tu contraseña"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                loading={isLoading}
              >
                Iniciar Sesión
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center space-y-2">
            <div>
              <Link
                href="/recuperar-password"
                className="text-[#55c5c4] hover:text-[#367c84]"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="pt-2 border-t">
              <Text className="text-gray-600">
                ¿No tienes cuenta?{" "}
                <Link
                  href="/registro"
                  className="text-[#55c5c4] font-semibold hover:text-[#367c84]"
                >
                  Regístrate aquí
                </Link>
              </Text>
            </div>
            <div>
              <Link
                href="/login"
                className="text-gray-500 text-sm hover:text-gray-700"
              >
                ← Volver a opciones de login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
