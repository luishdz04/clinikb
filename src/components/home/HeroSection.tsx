"use client";

import { Button, Typography, Space } from "antd";
import { CalendarOutlined, PhoneOutlined } from "@ant-design/icons";
import Image from "next/image";

const { Title, Paragraph } = Typography;

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#55c5c4]/10 via-white to-[#dfc79c]/10 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Contenido */}
          <div className="text-center lg:text-left">
            <Title level={1} className="!text-4xl !font-bold !text-[#060807] lg:!text-5xl">
              Tu Bienestar, Nuestra{" "}
              <span className="text-[#55c5c4]">Prioridad</span>
            </Title>
            <Paragraph className="mt-4 text-lg text-gray-600">
              Ofrecemos atención psicológica y médica integral. Nuestro equipo está 
              conformado por la Dra. Cynthia Kristell de Luna Hernández, Doctora en Psicología 
              con Maestría en Psicoterapia Cognitivo Conductual, y el Dr. Baldo Daniel 
              Martínez González, Especialista en Medicina Familiar.
            </Paragraph>
            <Space size="large" className="mt-8">
              <Button 
                type="primary" 
                size="large" 
                icon={<CalendarOutlined />}
                className="h-12 px-8 text-base"
              >
                Agendar Cita
              </Button>
              <Button 
                size="large" 
                icon={<PhoneOutlined />}
                className="h-12 px-8 text-base"
              >
                Contáctanos
              </Button>
            </Space>
          </div>

          {/* Imagen/Ilustración */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative h-80 w-80 lg:h-96 lg:w-96 overflow-hidden rounded-full shadow-2xl border-4 border-[#55c5c4]">
              <Image
                src="/images/team/psic.png"
                alt="Psic. Cynthia Kristell de Luna Hernández"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
