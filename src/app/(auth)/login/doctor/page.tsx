"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, Typography, Alert, App } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function LoginDoctorPage() {
  const router = useRouter();
  const { message } = App.useApp();
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

      // Guardar sesión del doctor en localStorage
      localStorage.setItem("doctor", JSON.stringify(result.doctor));
      
      message.success(`¡Bienvenido Dr(a). ${result.doctor.full_name}!`);
      router.push("/admin/dashboard");
    } catch (error: any) {
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#367c84]/10 via-white to-[#dfc79c]/10 flex items-center justify-center py-12">
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
            <Title level={2} className="!mb-2 !text-[#367c84]">
              Panel de Administración
            </Title>
            <Text className="text-gray-600">Acceso para doctores y administradores</Text>
          </div>

          {error && (
            <Alert title={error} type="error" showIcon className="mb-4" />
          )}

          <Form
            name="login-doctor"
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
                placeholder="doctor@clinikb.com"
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
                className="w-full bg-[#367c84] hover:bg-[#2a6069]"
                loading={isLoading}
              >
                Iniciar Sesión
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center space-y-2">
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
