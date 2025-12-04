"use client";

import { Layout, Typography, Space, Divider } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";

const { Footer: AntFooter } = Layout;
const { Text, Title } = Typography;

export default function Footer() {
  return (
    <AntFooter className="bg-[#060807] px-4 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo y descripción */}
          <div>
            <Image
              src="/images/logo/clinikb.png"
              alt="CliniKB Logo"
              width={150}
              height={60}
              className="mb-4"
            />
            <p className="text-gray-400">
              Atención psicológica y médica de calidad. Tu bienestar es nuestra prioridad.
            </p>
          </div>

          {/* Nuestro Equipo */}
          <div>
            <h4 className="text-[#dfc79c] font-semibold text-lg mb-4">
              Nuestro Equipo
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-[#55c5c4] font-medium">Atención Médica</p>
                <p className="text-gray-400 text-sm">Dr. Baldo Daniel Martínez González</p>
                <p className="text-gray-500 text-xs">Especialista en Medicina Familiar</p>
              </div>
              <div>
                <p className="text-[#55c5c4] font-medium">Atención Psicológica</p>
                <p className="text-gray-400 text-sm">Dra. Cynthia Kristell de Luna Hernández</p>
                <p className="text-gray-500 text-xs">Doctora en Psicología</p>
                <p className="text-gray-500 text-xs">Maestría en Psicoterapia Cognitivo Conductual</p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-[#dfc79c] font-semibold text-lg mb-4">
              Contacto
            </h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-start gap-2">
                <EnvironmentOutlined className="text-[#55c5c4] mt-1" />
                <span>Juárez 145, San Buenaventura, Coahuila, México</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneOutlined className="text-[#55c5c4]" />
                <span>(123) 456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <MailOutlined className="text-[#55c5c4]" />
                <span>contacto@clinikb.com</span>
              </div>
            </div>
          </div>

          {/* Redes sociales */}
          <div>
            <h4 className="text-[#dfc79c] font-semibold text-lg mb-4">
              Síguenos
            </h4>
            <div className="flex gap-4">
              <a href="#" className="text-2xl text-gray-400 hover:text-[#55c5c4] transition-colors">
                <FacebookOutlined />
              </a>
              <a href="#" className="text-2xl text-gray-400 hover:text-[#55c5c4] transition-colors">
                <InstagramOutlined />
              </a>
              <a href="#" className="text-2xl text-gray-400 hover:text-[#55c5c4] transition-colors">
                <WhatsAppOutlined />
              </a>
            </div>
          </div>
        </div>

        <Divider className="border-gray-700 my-8" />

        <div className="text-center">
          <p className="text-gray-500">
            © {new Date().getFullYear()} CliniKB. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </AntFooter>
  );
}
