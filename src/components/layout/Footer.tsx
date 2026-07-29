"use client";

import { Layout, Typography, Flex, Row, Col, Divider, theme } from "antd";
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
import { colors } from "@/theme/themeConfig";

const { Footer: AntFooter } = Layout;
const { Text, Title, Link: AntLink } = Typography;

const team = [
  {
    area: "Atención Médica",
    name: "Dr. Baldo Daniel Martínez González",
    details: ["Especialista en Medicina Familiar"],
  },
  {
    area: "Atención Psicológica",
    name: "Dra. Cynthia Kristell de Luna Hernández",
    details: ["Doctora en Psicología", "Maestría en Psicoterapia Cognitivo Conductual"],
  },
];

const contact = [
  { Icon: EnvironmentOutlined, text: "Juárez 145, San Buenaventura, Coahuila, México" },
  { Icon: PhoneOutlined, text: "866 159 7283" },
  { Icon: MailOutlined, text: "contacto@clinikb.com" },
];

const socials = [FacebookOutlined, InstagramOutlined, WhatsAppOutlined];

export default function Footer() {
  const { token } = theme.useToken();

  // El footer va sobre fondo oscuro, así que el texto no puede usar los
  // `type="secondary"` del tema claro.
  const muted = { color: "rgba(255,255,255,0.65)" };
  const faint = { color: "rgba(255,255,255,0.45)", fontSize: token.fontSizeSM };

  return (
    <AntFooter
      style={{
        background: colors.dark,
        padding: `${token.sizeXXL}px ${token.padding}px`,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Row gutter={[token.sizeXXL, token.sizeXXL]}>
          <Col xs={24} md={12} lg={6}>
            <Image
              src="/images/logo/clinikb.png"
              alt="CliniKB"
              width={120}
              height={120}
              style={{ borderRadius: "50%", marginBottom: token.margin }}
            />
            <Text style={muted}>
              Atención psicológica y médica de calidad. Tu bienestar es nuestra prioridad.
            </Text>
          </Col>

          <Col xs={24} md={12} lg={6}>
            <Title level={5} style={{ color: colors.gold, marginTop: 0 }}>
              Nuestro Equipo
            </Title>
            <Flex vertical gap="middle">
              {team.map(({ area, name, details }) => (
                <Flex vertical key={area}>
                  <Text strong style={{ color: token.colorPrimary }}>
                    {area}
                  </Text>
                  <Text style={muted}>{name}</Text>
                  {details.map((detail) => (
                    <Text key={detail} style={faint}>
                      {detail}
                    </Text>
                  ))}
                </Flex>
              ))}
            </Flex>
          </Col>

          <Col xs={24} md={12} lg={6}>
            <Title level={5} style={{ color: colors.gold, marginTop: 0 }}>
              Contacto
            </Title>
            <Flex vertical gap="small">
              {contact.map(({ Icon, text }) => (
                <Flex key={text} gap="small" align="start">
                  <Icon style={{ color: token.colorPrimary, marginTop: 4 }} />
                  <Text style={muted}>{text}</Text>
                </Flex>
              ))}
            </Flex>
          </Col>

          <Col xs={24} md={12} lg={6}>
            <Title level={5} style={{ color: colors.gold, marginTop: 0 }}>
              Síguenos
            </Title>
            <Flex gap="middle">
              {socials.map((Icon, index) => (
                <AntLink
                  key={index}
                  href="#"
                  style={{ fontSize: token.fontSizeHeading3, color: "rgba(255,255,255,0.65)" }}
                >
                  <Icon />
                </AntLink>
              ))}
            </Flex>
          </Col>
        </Row>

        <Divider style={{ borderColor: "rgba(255,255,255,0.15)", margin: `${token.marginXL}px 0` }} />

        <Flex justify="center" align="center" gap="small" wrap>
          <Text style={faint}>
            © {new Date().getFullYear()} CliniKB. Todos los derechos reservados.
          </Text>
          <Text style={faint}>·</Text>
          <Link href="/acceso-medico">
            <Text style={faint} underline>
              Acceso médico
            </Text>
          </Link>
        </Flex>
      </div>
    </AntFooter>
  );
}
