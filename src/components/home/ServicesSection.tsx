"use client";

import { Card, Typography, Row, Col } from "antd";
import {
  HeartOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  TeamOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const services = [
  {
    icon: <HeartOutlined className="text-4xl text-[#55c5c4]" />,
    title: "Medicina General",
    description: "Atención médica integral para toda la familia con enfoque preventivo.",
  },
  {
    icon: <MedicineBoxOutlined className="text-4xl text-[#55c5c4]" />,
    title: "Especialidades",
    description: "Contamos con especialistas en diversas áreas de la medicina.",
  },
  {
    icon: <ExperimentOutlined className="text-4xl text-[#55c5c4]" />,
    title: "Laboratorio",
    description: "Análisis clínicos con tecnología de punta y resultados rápidos.",
  },
  {
    icon: <TeamOutlined className="text-4xl text-[#55c5c4]" />,
    title: "Atención Personalizada",
    description: "Cada paciente recibe un trato único y personalizado.",
  },
  {
    icon: <SafetyOutlined className="text-4xl text-[#55c5c4]" />,
    title: "Seguridad",
    description: "Protocolos estrictos de higiene y seguridad para tu tranquilidad.",
  },
  {
    icon: <ClockCircleOutlined className="text-4xl text-[#55c5c4]" />,
    title: "Horarios Flexibles",
    description: "Disponibilidad amplia para adaptarnos a tu agenda.",
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
          {services.map((service, index) => (
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
