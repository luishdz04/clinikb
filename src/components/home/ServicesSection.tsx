"use client";

import { Card, Typography, Row, Col, Flex, theme } from "antd";
import {
  HeartOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { psychologicalServices, medicalServices } from "@/data/services";
import { colors } from "@/theme/themeConfig";

const { Title, Paragraph } = Typography;

const servicesSummary = [
  { Icon: HeartOutlined, service: psychologicalServices[0] },
  { Icon: TeamOutlined, service: psychologicalServices[1] },
  { Icon: SafetyOutlined, service: psychologicalServices[2] },
  { Icon: MedicineBoxOutlined, service: medicalServices[0] },
  { Icon: ClockCircleOutlined, service: medicalServices[1] },
];

export default function ServicesSection() {
  const { token } = theme.useToken();

  return (
    <section
      style={{
        padding: `${token.sizeXXL * 1.5}px ${token.padding}px`,
        background: token.colorBgContainer,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Flex vertical align="center" style={{ marginBottom: token.marginXL * 1.5 }}>
          <Title level={2} style={{ marginTop: 0, textAlign: "center", color: colors.dark }}>
            Nuestros <span style={{ color: token.colorPrimary }}>Servicios</span>
          </Title>
          <Paragraph
            type="secondary"
            style={{ fontSize: token.fontSizeLG, textAlign: "center", maxWidth: 672 }}
          >
            Ofrecemos una amplia gama de servicios médicos para cuidar de ti y tu familia.
          </Paragraph>
        </Flex>

        <Row gutter={[token.size, token.size]}>
          {servicesSummary.map(({ Icon, service }) => (
            <Col xs={24} sm={12} lg={8} key={service.title}>
              <Card hoverable style={{ height: "100%", textAlign: "center" }}>
                <Icon
                  style={{
                    fontSize: token.fontSizeHeading1,
                    color: token.colorPrimary,
                    marginBottom: token.margin,
                  }}
                />
                <Title level={4} style={{ marginTop: 0, marginBottom: token.marginXS }}>
                  {service.title}
                </Title>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {service.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}
