"use client";

import Link from "next/link";
import Image from "next/image";
import { Result, Button, Typography, Card } from "antd";
import { CheckCircleOutlined, HomeOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function RegistroExitoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#55c5c4]/10 via-white to-[#dfc79c]/10 flex items-center justify-center py-12">
      <div className="mx-auto max-w-2xl px-4 w-full">
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
          </div>

          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: "#55c5c4" }} />}
            title={
              <Title level={2} className="!mb-0">
                ¡Registro Exitoso!
              </Title>
            }
            subTitle={
              <div className="text-left max-w-xl mx-auto mt-6">
                <Paragraph className="text-lg text-gray-700">
                  Tu solicitud de registro ha sido recibida correctamente.
                </Paragraph>

                <div className="bg-[#e6f7f7] border-2 border-[#55c5c4] rounded-lg p-6 my-6">
                  <Title level={4} className="!text-[#367c84] !mb-3">
                    📋 Estado de tu solicitud
                  </Title>
                  <Paragraph className="!mb-2 text-[#367c84]">
                    <strong>Estado:</strong> Pendiente de aprobación
                  </Paragraph>
                  <Paragraph className="!mb-0 text-[#367c84]">
                    Tu información está siendo revisada por nuestro equipo médico. 
                    Te notificaremos por correo electrónico una vez que tu cuenta sea aprobada.
                  </Paragraph>
                </div>

                <div className="bg-[#fef9e6] border-2 border-[#dfc79c] rounded-lg p-6 my-6">
                  <Title level={4} className="!text-[#845c24] !mb-3">
                    📞 ¿Necesitas atención urgente?
                  </Title>
                  <Paragraph className="!mb-2 text-gray-700">
                    Si requieres atención inmediata, puedes contactarnos directamente:
                  </Paragraph>
                  <ul className="list-none pl-0">
                    <li className="mb-2 text-gray-700">
                      <strong>📱 Teléfono:</strong>{" "}
                      <a 
                        href="tel:8661597283" 
                        className="text-[#55c5c4] hover:text-[#367c84] font-semibold"
                      >
                        866 159 7283
                      </a>
                    </li>
                    <li className="mb-2 text-gray-700">
                      <strong>📧 Email:</strong>{" "}
                      <a 
                        href="mailto:contacto@clinikb.com"
                        className="text-[#55c5c4] hover:text-[#367c84] font-semibold"
                      >
                        contacto@clinikb.com
                      </a>
                    </li>
                    <li className="text-gray-700">
                      <strong>💬 WhatsApp:</strong>{" "}
                      <a 
                        href="https://wa.me/528661597283"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#55c5c4] hover:text-[#367c84] font-semibold"
                      >
                        Enviar mensaje
                      </a>
                    </li>
                  </ul>
                </div>

                <Paragraph className="text-gray-600 text-center">
                  Recibirás un correo de confirmación cuando tu cuenta sea aprobada 
                  y podrás iniciar sesión para agendar tus citas.
                </Paragraph>
              </div>
            }
            extra={[
              <Link href="/" key="home">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<HomeOutlined />}
                  className="min-w-[200px]"
                >
                  Volver al Inicio
                </Button>
              </Link>,
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
