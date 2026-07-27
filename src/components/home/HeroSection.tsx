"use client";

import { Button, Typography, Flex, Row, Col, theme } from "antd";
import { CalendarOutlined, PhoneOutlined } from "@ant-design/icons";
import Image from "next/image";
import { colors } from "@/theme/themeConfig";

const { Title, Paragraph } = Typography;

export default function HeroSection() {
  const { token } = theme.useToken();

  return (
    <section
      style={{
        padding: `${token.sizeXXL * 1.5}px ${token.padding}px`,
        backgroundImage: `linear-gradient(to bottom right, ${colors.primary}1a, ${colors.white} 50%, ${colors.gold}1a)`,
      }}
    >
      <Row
        gutter={[token.sizeXXL, token.sizeXXL]}
        align="middle"
        style={{ maxWidth: 1280, margin: "0 auto" }}
      >
        <Col xs={24} lg={12}>
          <Title level={1} style={{ marginTop: 0, color: colors.dark }}>
            Tu Bienestar, Nuestra{" "}
            <span style={{ color: token.colorPrimary }}>Prioridad</span>
          </Title>
          <Paragraph type="secondary" style={{ fontSize: token.fontSizeLG }}>
            Ofrecemos atención psicológica y médica integral. Nuestro equipo está
            conformado por la Dra. Cynthia Kristell de Luna Hernández, Doctora en
            Psicología con Maestría en Psicoterapia Cognitivo Conductual, y el Dr. Baldo
            Daniel Martínez González, Especialista en Medicina Familiar.
          </Paragraph>
          <Flex gap="middle" wrap style={{ marginTop: token.marginXL }}>
            <Button type="primary" size="large" icon={<CalendarOutlined />}>
              Agendar Cita
            </Button>
            <Button size="large" icon={<PhoneOutlined />}>
              Contáctanos
            </Button>
          </Flex>
        </Col>

        <Col xs={24} lg={12}>
          <Flex justify="center">
            <div
              style={{
                position: "relative",
                width: "min(100%, 384px)",
                aspectRatio: "1",
                borderRadius: "50%",
                overflow: "hidden",
                border: `4px solid ${token.colorPrimary}`,
                boxShadow: token.boxShadowSecondary,
              }}
            >
              <Image
                src="/images/team/psic.png"
                alt="Psic. Cynthia Kristell de Luna Hernández"
                fill
                sizes="(max-width: 992px) 100vw, 384px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          </Flex>
        </Col>
      </Row>
    </section>
  );
}
