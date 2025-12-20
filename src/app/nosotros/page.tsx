"use client";

import { MainLayout } from "@/components/layout";
import { Typography, Row, Col, Card, Alert } from "antd";
import Image from "next/image";

const { Title, Paragraph } = Typography;

export default function NosotrosPage() {
  return (
    <MainLayout>
      <section className="bg-white py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-8 text-center">
            <Title level={1} className="!text-4xl !font-bold !text-[#060807]">
              ¿Quiénes <span className="text-[#55c5c4]">Somos</span>?
            </Title>
            <Paragraph className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
              Somos un centro de atención médica y psicológica dedicado a la salud integral
              de la persona y la familia. Nos establecimos con la misión de ofrecer un espacio
              seguro y profesional donde la Medicina Familiar y la Psicología trabajan de manera
              coordinada para atender el bienestar físico, emocional y social de nuestros pacientes.
            </Paragraph>
          </div>

          {/* Resúmenes profesionales */}
          <Row gutter={[24, 24]} align="top">
            {/* Dra. Cynthia */}
            <Col xs={24} lg={12}>
              <Card className="h-full">
                <Title level={3} className="!mb-2">Dra. Cynthia Kristell de Luna Hernández</Title>
                <Paragraph className="text-gray-700">
                  Doctora en Psicología, cédula federal 14612615, con sólida formación académica y amplia
                  experiencia en el abordaje integral de la salud mental y emocional.
                </Paragraph>
                <Paragraph className="text-gray-700">
                  Actualmente cursa una Maestría en Psicoterapia Cognitivo Conductual, lo que garantiza el
                  conocimiento y aplicación de técnicas terapéuticas actualizadas y efectivas.
                </Paragraph>
                <Alert
                  className="mt-2"
                  title="Tu aliada profesional"
                  description="Si eliges a la Dra. Cynthia como tu terapeuta, se convertirá en tu aliada profesional que te guiará a alcanzar tu bienestar biopsicosocial."
                  type="success"
                  showIcon
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <div className="flex justify-center lg:justify-end">
                <div className="relative h-80 w-80 lg:h-96 lg:w-96 overflow-hidden rounded-xl shadow-2xl border-4 border-[#55c5c4]">
                  <Image
                    src="/images/team/psic.png"
                    alt="Dra. Cynthia Kristell de Luna Hernández"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </Col>
          </Row>

          {/* Servicios psicológicos */}
          <div className="mt-12">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card>
                  <Title level={4} className="!mb-2">Terapia individual</Title>
                  <Paragraph className="text-gray-700">
                    Te ayudo a descubrir por dónde deseas iniciar tu proceso, ofreciéndote un espacio de confianza
                    100% confidencial, libre de etiquetas y prejuicios, sin moverte de casa (requiere dispositivo y conexión a internet).
                  </Paragraph>
                  <Paragraph className="text-gray-600">Duración de la consulta de 45 a 60 minutos.</Paragraph>
                </Card>
                <Card className="mt-6">
                  <Title level={4} className="!mb-2">Acompañamiento en crianza</Title>
                  <Paragraph className="text-gray-700">
                    Consulta para trabajar desafíos relacionados al cuidado y bienestar de tus hijos en temas tales como:
                  </Paragraph>
                  <ul className="space-y-1 text-gray-700">
                    <li>- Comunicación efectiva</li>
                    <li>- Límites: cómo ponerlos y mantenerlos</li>
                    <li>- Aceptación a cambios</li>
                    <li>- Problemas de conducta</li>
                    <li>- Roles familiares</li>
                    <li>- Crianza monoparental</li>
                  </ul>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card>
                  <Title level={4} className="!mb-2">Terapia de pareja</Title>
                  <Paragraph className="text-gray-700">
                    Enfocada en guiar a parejas hacia la resolución de conflictos, atravesar crisis y recuperar una convivencia saludable.
                  </Paragraph>
                  <Paragraph className="text-gray-700">Problemas comunes a trabajar:</Paragraph>
                  <ul className="space-y-1 text-gray-700">
                    <li>- Aceptación del otro</li>
                    <li>- Roles</li>
                    <li>- Problemas de comunicación</li>
                    <li>- Sexualidad</li>
                    <li>- Infidelidad</li>
                    <li>- Celos</li>
                  </ul>
                </Card>
                <Card className="mt-6">
                  <Alert
                    title="Importante"
                    description={
                      <div className="space-y-2">
                        <p>
                          Si te encuentras en una situación de urgencia, comunícate al <strong>911</strong> o acude al
                          centro de salud más cercano para atención inmediata. No contamos con servicios de urgencia.
                        </p>
                        <p>
                          Líneas de emergencia: <a href="http://enterapia.co/lineas-emergencia/" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#845c24] underline hover:text-[#5b5035]">enterapia.co/lineas-emergencia</a>. Llama al 911.
                        </p>
                        <p>
                          Si estás luchando con pensamientos suicidas, solicita turno en un centro especializado, preferentemente de forma presencial.
                        </p>
                      </div>
                    }
                    type="warning"
                    showIcon
                  />
                </Card>
              </Col>
            </Row>
          </div>

          {/* Servicios médicos y perfil del Dr. Baldo */}
          <div className="mt-12">
            <Row gutter={[24, 24]} align="top">
              <Col xs={24} lg={12}>
                <Card className="h-full">
                  <Title level={3} className="!mb-2">Dr. Baldo Daniel Martínez González</Title>
                  <Paragraph className="text-gray-700">
                    Médico egresado por la Universidad Autónoma de Nuevo León y Especialista en Medicina Familiar
                    por la Universidad de Monterrey.
                  </Paragraph>
                  <Paragraph className="text-gray-700">
                    Certificado por el Consejo Mexicano de Certificación en Medicina Familiar, A.C., lo que avala su
                    alta eficiencia y compromiso profesional.
                  </Paragraph>
                  <Paragraph className="text-gray-700">
                    Si buscas un médico de cabecera altamente calificado y con profunda vocación humana para el cuidado
                    integral de la salud familiar, el Dr. Baldo Daniel es tu opción ideal.
                  </Paragraph>
                </Card>
                <Card className="mt-6">
                  <Title level={4} className="!mb-2">Servicios Médicos</Title>
                  <ul className="space-y-1 text-gray-700">
                    <li>- Consulta médica de rutina</li>
                    <li>- Seguimiento a pacientes diabéticos e hipertensos</li>
                  </ul>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                {/* Placeholder para foto del Dr. Baldo */}
                <div className="flex justify-center lg:justify-end">
                  <div className="flex h-80 w-80 lg:h-96 lg:w-96 items-center justify-center rounded-xl border-4 border-dashed border-[#55c5c4] bg-gray-50 text-center shadow-sm">
                    <span className="px-6 text-gray-500">Foto del Dr. Baldo próximamente</span>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
