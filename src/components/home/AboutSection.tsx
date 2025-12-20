"use client";

import { Typography, Row, Col, Card, Button } from "antd";
import Link from "next/link";

const { Title, Paragraph } = Typography;

export default function AboutSection() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-10 text-center">
          <Title level={2} className="!text-3xl !font-bold !text-[#060807]">
            ¿Quiénes <span className="text-[#55c5c4]">Somos</span>?
          </Title>
          <Paragraph className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
            Somos un centro de atención médica y psicológica dedicado a la salud integral
            de la persona y la familia. Trabajamos de forma coordinada entre Medicina
            Familiar y Psicología para cuidar tu bienestar físico, emocional y social.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card hoverable className="h-full transition-all hover:shadow-lg">
              <Title level={4} className="!mb-2">Nuestro Equipo y Compromiso</Title>
              <Paragraph className="text-gray-600">
                La calidad de nuestros servicios está garantizada por profesionales
                debidamente acreditados, con título y cédula profesional vigentes,
                comprometidos con la educación médica y psicológica continua.
              </Paragraph>
              <Paragraph className="text-gray-600">
                Esto asegura que cada paciente reciba atención basada en las mejores
                prácticas y el conocimiento más actualizado.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card hoverable className="h-full transition-all hover:shadow-lg">
              <Title level={4} className="!mb-2">Nuestra Filosofía</Title>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <span className="font-medium text-[#55c5c4]">Respeto:</span>
                  {" "}Dignidad y autonomía de cada persona.
                </li>
                <li>
                  <span className="font-medium text-[#55c5c4]">Honestidad:</span>
                  {" "}Transparencia en la comunicación y procesos de atención.
                </li>
                <li>
                  <span className="font-medium text-[#55c5c4]">Ética:</span>
                  {" "}Rigurosidad en cada diagnóstico, tratamiento e interacción.
                </li>
              </ul>
              <Paragraph className="mt-4 italic text-gray-600">
                “Somos un equipo profesional, ético y humano, dedicado a ser tu aliado
                de confianza en el cuidado de tu salud integral”.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <div className="mt-10 text-center">
          <Link href="/nosotros">
            <Button type="primary" className="px-8 h-11">
              Conoce más
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
