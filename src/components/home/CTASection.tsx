"use client";

import { Button, Typography, Space } from "antd";
import { CalendarOutlined, WhatsAppOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function CTASection() {
  return (
    <section className="bg-gradient-to-r from-[#55c5c4] to-[#367c84] py-16 lg:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
        <Title level={2} className="!text-3xl !font-bold !text-white lg:!text-4xl">
          ¿Listo para cuidar tu salud?
        </Title>
        <Paragraph className="mt-4 text-lg text-white/90">
          Agenda tu cita hoy mismo y da el primer paso hacia una vida más saludable.
          Nuestro equipo está listo para atenderte.
        </Paragraph>
        <Space size="large" className="mt-8">
          <Button 
            size="large" 
            icon={<CalendarOutlined />}
            className="h-12 border-white bg-white px-8 text-base text-[#367c84] hover:!bg-white/90 hover:!text-[#367c84]"
          >
            Agendar Cita
          </Button>
          <Button 
            size="large" 
            icon={<WhatsAppOutlined />}
            className="h-12 border-white px-8 text-base text-white hover:!bg-white/10 hover:!text-white"
            ghost
          >
            WhatsApp
          </Button>
        </Space>
      </div>
    </section>
  );
}
