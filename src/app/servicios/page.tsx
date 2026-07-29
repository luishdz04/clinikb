"use client";

import { MainLayout } from "@/components/layout";
import { Typography, Row, Col, Card, Divider, Flex, theme } from "antd";
import BulletList from "@/components/ui/BulletList";
import { psychologicalServices, medicalServices } from "@/data/services";
import type { ServiceItem } from "@/data/services";
import { colors } from "@/theme/themeConfig";

const { Title, Paragraph } = Typography;

function ServiceGroup({ heading, services }: { heading: string; services: ServiceItem[] }) {
  const { token } = theme.useToken();

  return (
    <Flex vertical gap={token.margin}>
      <Title level={2} style={{ margin: 0 }}>
        {heading}
      </Title>
      <Row gutter={[token.size, token.size]}>
        {services.map((service) => (
          <Col xs={24} lg={12} key={service.key}>
            <Card hoverable style={{ height: "100%" }}>
              <Title level={4} style={{ marginTop: 0, marginBottom: token.marginXS }}>
                {service.title}
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: service.bullets ? undefined : 0 }}>
                {service.description}
              </Paragraph>
              {service.bullets && <BulletList items={service.bullets} />}
            </Card>
          </Col>
        ))}
      </Row>
    </Flex>
  );
}

export default function ServiciosPage() {
  const { token } = theme.useToken();

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
              Nuestros <span style={{ color: token.colorPrimary }}>Servicios</span>
            </Title>
            <Paragraph
              type="secondary"
              style={{ fontSize: token.fontSizeLG, textAlign: "center", maxWidth: 768 }}
            >
              Conoce nuestros servicios psicológicos y médicos. En la página de inicio
              encontrarás un resumen; aquí te presentamos los detalles.
            </Paragraph>
          </Flex>

          <ServiceGroup heading="Servicios Psicológicos" services={psychologicalServices} />

          <Divider style={{ margin: 0 }} />

          <ServiceGroup heading="Servicios Médicos" services={medicalServices} />
        </Flex>
      </section>
    </MainLayout>
  );
}
