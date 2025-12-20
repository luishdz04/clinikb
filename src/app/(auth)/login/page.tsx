"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, Typography, Button, Row, Col } from "antd";
import { UserOutlined, MedicineBoxOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#55c5c4]/10 via-white to-[#dfc79c]/10 flex items-center justify-center py-12">
      <div className="mx-auto max-w-4xl px-4 w-full">
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/images/logo/clinikb.png"
              alt="CliniKB"
              width={100}
              height={100}
              className="mx-auto mb-6"
            />
          </Link>
          <Title level={2} className="!mb-2">
            Iniciar Sesión
          </Title>
          <Text className="text-gray-600 text-lg">
            Selecciona tu tipo de cuenta
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Link href="/login/paciente">
              <Card
                hoverable
                className="h-full shadow-lg border-2 border-transparent hover:border-[#55c5c4] transition-all"
              >
                <div className="text-center py-8">
                  <div className="mb-6">
                    <UserOutlined
                      style={{
                        fontSize: "64px",
                        color: "#55c5c4",
                      }}
                    />
                  </div>
                  <Title level={3} className="!mb-3">
                    Soy Paciente
                  </Title>
                  <Text className="text-gray-600 text-base">
                    Accede a tu portal de paciente para gestionar tus citas y consultar
                    tu historial médico.
                  </Text>
                  <div className="mt-6">
                    <Button
                      type="primary"
                      size="large"
                      icon={<UserOutlined />}
                      className="w-full"
                    >
                      Iniciar Sesión como Paciente
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          </Col>

          <Col xs={24} md={12}>
            <Link href="/login/doctor">
              <Card
                hoverable
                className="h-full shadow-lg border-2 border-transparent hover:border-[#367c84] transition-all"
              >
                <div className="text-center py-8">
                  <div className="mb-6">
                    <MedicineBoxOutlined
                      style={{
                        fontSize: "64px",
                        color: "#367c84",
                      }}
                    />
                  </div>
                  <Title level={3} className="!mb-3">
                    Soy Doctor/Admin
                  </Title>
                  <Text className="text-gray-600 text-base">
                    Accede al panel de administración para gestionar pacientes y
                    consultas.
                  </Text>
                  <div className="mt-6">
                    <Button
                      type="default"
                      size="large"
                      icon={<MedicineBoxOutlined />}
                      className="w-full border-[#367c84] text-[#367c84] hover:bg-[#367c84] hover:text-white"
                    >
                      Iniciar Sesión como Doctor
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          </Col>
        </Row>

        <div className="mt-8 text-center">
          <Text className="text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-[#55c5c4] font-semibold">
              Regístrate como Paciente
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}
