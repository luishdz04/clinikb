"use client";

import { Typography, Row, Col, Card, Button, Flex, theme } from "antd";
import Link from "next/link";
import { colors } from "@/theme/themeConfig";

const { Title, Paragraph, Text } = Typography;

const philosophy = [
  { term: "Respeto", detail: "Dignidad y autonomía de cada persona." },
  { term: "Honestidad", detail: "Transparencia en la comunicación y procesos de atención." },
  { term: "Ética", detail: "Rigurosidad en cada diagnóstico, tratamiento e interacción." },
];

export default function AboutSection() {
  const { token } = theme.useToken();

  return (
    <section
      style={{
        padding: `${token.sizeXXL * 1.5}px ${token.padding}px`,
        background: token.colorBgContainer,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Flex vertical align="center" style={{ marginBottom: token.marginXL }}>
          <Title level={2} style={{ marginTop: 0, textAlign: "center", color: colors.dark }}>
            ¿Quiénes <span style={{ color: token.colorPrimary }}>Somos</span>?
          </Title>
          <Paragraph
            type="secondary"
            style={{ fontSize: token.fontSizeLG, textAlign: "center", maxWidth: 768 }}
          >
            Somos un centro de atención médica y psicológica dedicado a la salud integral de
            la persona y la familia. Trabajamos de forma coordinada entre Medicina Familiar y
            Psicología para cuidar tu bienestar físico, emocional y social.
          </Paragraph>
        </Flex>

        <Row gutter={[token.size, token.size]}>
          <Col xs={24} lg={12}>
            <Card hoverable style={{ height: "100%" }}>
              <Title level={4} style={{ marginTop: 0, marginBottom: token.marginXS }}>
                Nuestro Equipo y Compromiso
              </Title>
              <Paragraph type="secondary">
                La calidad de nuestros servicios está garantizada por profesionales
                debidamente acreditados, con título y cédula profesional vigentes,
                comprometidos con la educación médica y psicológica continua.
              </Paragraph>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Esto asegura que cada paciente reciba atención basada en las mejores prácticas
                y el conocimiento más actualizado.
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card hoverable style={{ height: "100%" }}>
              <Title level={4} style={{ marginTop: 0, marginBottom: token.marginXS }}>
                Nuestra Filosofía
              </Title>
              <Flex vertical gap="small">
                {philosophy.map(({ term, detail }) => (
                  <Text key={term}>
                    <Text strong style={{ color: token.colorPrimary }}>
                      {term}:
                    </Text>{" "}
                    {detail}
                  </Text>
                ))}
              </Flex>
              <Paragraph
                italic
                type="secondary"
                style={{ marginTop: token.margin, marginBottom: 0 }}
              >
                “Somos un equipo profesional, ético y humano, dedicado a ser tu aliado de
                confianza en el cuidado de tu salud integral”.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Flex justify="center" style={{ marginTop: token.marginXL }}>
          <Link href="/nosotros">
            <Button type="primary" size="large">
              Conoce más
            </Button>
          </Link>
        </Flex>
      </div>
    </section>
  );
}
