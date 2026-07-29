"use client";

import { MainLayout } from "@/components/layout";
import { Typography, Row, Col, Card, Alert, Flex, ConfigProvider, theme } from "antd";
import Image from "next/image";
import BulletList from "@/components/ui/BulletList";
import { colors } from "@/theme/themeConfig";

const { Title, Paragraph, Text, Link: AntLink } = Typography;

const parentingTopics = [
  "Comunicación efectiva",
  "Límites: cómo ponerlos y mantenerlos",
  "Aceptación a cambios",
  "Problemas de conducta",
  "Roles familiares",
  "Crianza monoparental",
];

const coupleTopics = [
  "Aceptación del otro",
  "Roles",
  "Problemas de comunicación",
  "Sexualidad",
  "Infidelidad",
  "Celos",
];

const medicalServices = [
  "Consulta médica de rutina",
  "Seguimiento a pacientes diabéticos e hipertensos",
];

function ProfilePhoto({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const { token } = theme.useToken();

  return (
    <Flex justify="center">
      <div
        style={{
          position: "relative",
          width: "min(100%, 384px)",
          aspectRatio: "1",
          borderRadius: token.borderRadiusLG,
          overflow: "hidden",
          border: `4px solid ${token.colorPrimary}`,
          boxShadow: token.boxShadowSecondary,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 992px) 100vw, 384px"
          style={{ objectFit: "cover", objectPosition: "center top" }}
          priority={priority}
        />
      </div>
    </Flex>
  );
}

export default function NosotrosPage() {
  const { token } = theme.useToken();
  const gutter: [number, number] = [token.size, token.size];

  return (
    <MainLayout>
      <section
        style={{
          padding: `${token.sizeXXL * 1.5}px ${token.padding}px`,
          background: token.colorBgContainer,
        }}
      >
        <Flex vertical gap={token.sizeXXL} style={{ maxWidth: 1280, margin: "0 auto" }}>
          <Flex vertical align="center">
            <Title level={1} style={{ marginTop: 0, textAlign: "center", color: colors.dark }}>
              ¿Quiénes <span style={{ color: token.colorPrimary }}>Somos</span>?
            </Title>
            <Paragraph
              type="secondary"
              style={{ fontSize: token.fontSizeLG, textAlign: "center", maxWidth: 768 }}
            >
              Somos un centro de atención médica y psicológica dedicado a la salud integral de
              la persona y la familia. Nos establecimos con la misión de ofrecer un espacio
              seguro y profesional donde la Medicina Familiar y la Psicología trabajan de
              manera coordinada para atender el bienestar físico, emocional y social de
              nuestros pacientes.
            </Paragraph>
          </Flex>

          {/* Dra. Cynthia */}
          <Row gutter={gutter} align="middle">
            <Col xs={24} lg={12}>
              <Card style={{ height: "100%" }}>
                <Title level={3} style={{ marginTop: 0, marginBottom: token.marginXS }}>
                  Dra. Cynthia Kristell de Luna Hernández
                </Title>
                <Paragraph type="secondary">
                  Doctora en Psicología, cédula federal 14612615, con sólida formación
                  académica y amplia experiencia en el abordaje integral de la salud mental y
                  emocional.
                </Paragraph>
                <Paragraph type="secondary">
                  Actualmente cursa una Maestría en Psicoterapia Cognitivo Conductual, lo que
                  garantiza el conocimiento y aplicación de técnicas terapéuticas actualizadas
                  y efectivas.
                </Paragraph>
                <Alert
                  title="Tu aliada profesional"
                  description="Si eliges a la Dra. Cynthia como tu terapeuta, se convertirá en tu aliada profesional que te guiará a alcanzar tu bienestar biopsicosocial."
                  type="success"
                  showIcon
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <ProfilePhoto
                src="/images/cynthia/perfil.jpg"
                alt="Dra. Cynthia Kristell de Luna Hernández"
                priority
              />
            </Col>
          </Row>

          {/* Servicios psicológicos */}
          <Row gutter={gutter}>
            <Col xs={24} lg={12}>
              <Flex vertical gap={token.size}>
                <Card>
                  <Title level={4} style={{ marginTop: 0, marginBottom: token.marginXS }}>
                    Terapia individual
                  </Title>
                  <Paragraph type="secondary">
                    Te ayudo a descubrir por dónde deseas iniciar tu proceso, ofreciéndote un
                    espacio de confianza 100% confidencial, libre de etiquetas y prejuicios,
                    sin moverte de casa (requiere dispositivo y conexión a internet).
                  </Paragraph>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    Duración de la consulta de 45 a 60 minutos.
                  </Paragraph>
                </Card>
                <Card>
                  <Title level={4} style={{ marginTop: 0, marginBottom: token.marginXS }}>
                    Acompañamiento en crianza
                  </Title>
                  <Paragraph type="secondary">
                    Consulta para trabajar desafíos relacionados al cuidado y bienestar de tus
                    hijos en temas tales como:
                  </Paragraph>
                  <BulletList items={parentingTopics} />
                </Card>
              </Flex>
            </Col>

            <Col xs={24} lg={12}>
              <Flex vertical gap={token.size}>
                <Card>
                  <Title level={4} style={{ marginTop: 0, marginBottom: token.marginXS }}>
                    Terapia de pareja
                  </Title>
                  <Paragraph type="secondary">
                    Enfocada en guiar a parejas hacia la resolución de conflictos, atravesar
                    crisis y recuperar una convivencia saludable.
                  </Paragraph>
                  <Paragraph type="secondary">Problemas comunes a trabajar:</Paragraph>
                  <BulletList items={coupleTopics} />
                </Card>
                <Alert
                  title="Importante"
                  type="warning"
                  showIcon
                  description={
                    <Flex vertical gap={token.marginXS}>
                      <Text>
                        Si te encuentras en una situación de urgencia, comunícate al{" "}
                        <Text strong>911</Text> o acude al centro de salud más cercano para
                        atención inmediata. No contamos con servicios de urgencia.
                      </Text>
                      <Text>
                        Líneas de emergencia:{" "}
                        {/* El enlace hereda el color de texto del tema y pasa a
                            turquesa en hover: sobre el fondo del Alert, el
                            `colorLink` por defecto no contrastaba bien. */}
                        <ConfigProvider
                          theme={{
                            token: {
                              colorLink: token.colorText,
                              colorLinkHover: token.colorPrimary,
                              colorLinkActive: token.colorPrimary,
                            },
                          }}
                        >
                          <AntLink
                            href="http://enterapia.co/lineas-emergencia/"
                            target="_blank"
                            rel="noopener noreferrer"
                            strong
                            underline
                          >
                            enterapia.co/lineas-emergencia
                          </AntLink>
                        </ConfigProvider>
                        . Llama al 911.
                      </Text>
                      <Text>
                        Si estás luchando con pensamientos suicidas, solicita turno en un
                        centro especializado, preferentemente de forma presencial.
                      </Text>
                    </Flex>
                  }
                />
              </Flex>
            </Col>
          </Row>

          {/* Dr. Baldo */}
          <Row gutter={gutter} align="middle">
            <Col xs={24} lg={12}>
              <Flex vertical gap={token.size}>
                <Card>
                  <Title level={3} style={{ marginTop: 0, marginBottom: token.marginXS }}>
                    Dr. Baldo Daniel Martínez González
                  </Title>
                  <Paragraph type="secondary">
                    Médico egresado por la Universidad Autónoma de Nuevo León y Especialista en
                    Medicina Familiar por la Universidad de Monterrey.
                  </Paragraph>
                  <Paragraph type="secondary">
                    Certificado por el Consejo Mexicano de Certificación en Medicina Familiar,
                    A.C., lo que avala su alta eficiencia y compromiso profesional.
                  </Paragraph>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    Si buscas un médico de cabecera altamente calificado y con profunda
                    vocación humana para el cuidado integral de la salud familiar, el Dr. Baldo
                    Daniel es tu opción ideal.
                  </Paragraph>
                </Card>
                <Card>
                  <Title level={4} style={{ marginTop: 0, marginBottom: token.marginXS }}>
                    Servicios Médicos
                  </Title>
                  <BulletList items={medicalServices} />
                </Card>
              </Flex>
            </Col>
            <Col xs={24} lg={12}>
              <ProfilePhoto
                src="/images/baldo/perfil.jpg"
                alt="Dr. Baldo Daniel Martínez González"
              />
            </Col>
          </Row>
        </Flex>
      </section>
    </MainLayout>
  );
}
