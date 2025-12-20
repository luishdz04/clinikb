"use client";

import { Card, Typography, Row, Col } from "antd";
import {
  HeartOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { psychologicalServices, medicalServices } from "@/data/services";

const { Title, Paragraph } = Typography;

const servicesSummary = [
  {
    icon: <HeartOutlined className="text-4xl text-[#55c5c4]" />,
    title: psychologicalServices[0].title,
    description: psychologicalServices[0].description,
  },
  {
    icon: <TeamOutlined className="text-4xl text-[#55c5c4]" />,
    title: psychologicalServices[1].title,
    description: psychologicalServices[1].description,
  },
  {
    icon: <SafetyOutlined className="text-4xl text-[#55c5c4]" />,
    title: psychologicalServices[2].title,
    description: psychologicalServices[2].description,
  },
  {
    icon: <MedicineBoxOutlined className="text-4xl text-[#55c5c4]" />,
    title: medicalServices[0].title,
    description: medicalServices[0].description,
  },
  {
    icon: <ClockCircleOutlined className="text-4xl text-[#55c5c4]" />,
    title: medicalServices[1].title,
    description: medicalServices[1].description,
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <Title level={2} className="!text-3xl !font-bold !text-[#060807]">
            Nuestros <span className="text-[#55c5c4]">Servicios</span>
          </Title>
          <Paragraph className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Ofrecemos una amplia gama de servicios médicos para cuidar de ti y tu familia.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {servicesSummary.map((service, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card 
                hoverable 
                className="h-full text-center transition-all hover:shadow-lg hover:border-[#55c5c4]"
              >
                <div className="mb-4">{service.icon}</div>
                <Title level={4} className="!mb-2">
                  {service.title}
                </Title>
                <Paragraph className="text-gray-600">
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
