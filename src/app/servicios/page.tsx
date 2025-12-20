"use client";

import { MainLayout } from "@/components/layout";
import { Typography, Row, Col, Card, Divider } from "antd";
import { psychologicalServices, medicalServices } from "@/data/services";

const { Title, Paragraph } = Typography;

export default function ServiciosPage() {
  return (
    <MainLayout>
      <section className="bg-white py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-8 text-center">
            <Title level={1} className="!text-4xl !font-bold !text-[#060807]">
              Nuestros <span className="text-[#55c5c4]">Servicios</span>
            </Title>
            <Paragraph className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
              Conoce nuestros servicios psicológicos y médicos. En la página de inicio encontrarás un resumen; aquí te presentamos los detalles.
            </Paragraph>
          </div>

          <Title level={2} className="!mt-4 !mb-6">Servicios Psicológicos</Title>
          <Row gutter={[24, 24]}>
            {psychologicalServices.map((service) => (
              <Col xs={24} lg={12} key={service.key}>
                <Card hoverable className="h-full">
                  <Title level={4} className="!mb-2">{service.title}</Title>
                  <Paragraph className="text-gray-700">{service.description}</Paragraph>
                  {service.bullets && (
                    <ul className="mt-2 list-disc pl-6 text-gray-700">
                      {service.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </Card>
              </Col>
            ))}
          </Row>

          <Divider className="my-10" />

          <Title level={2} className="!mt-4 !mb-6">Servicios Médicos</Title>
          <Row gutter={[24, 24]}>
            {medicalServices.map((service) => (
              <Col xs={24} lg={12} key={service.key}>
                <Card hoverable className="h-full">
                  <Title level={4} className="!mb-2">{service.title}</Title>
                  <Paragraph className="text-gray-700">{service.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>
    </MainLayout>
  );
}
