"use client";

import Link from "next/link";
import { Result, Button, Typography, Alert, Flex, Space, theme } from "antd";
import {
  CheckCircleOutlined,
  HomeOutlined,
  LoginOutlined,
  PhoneOutlined,
  MailOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import AuthShell from "@/components/layout/AuthShell";

const { Paragraph, Text } = Typography;

const contactChannels = [
  { Icon: PhoneOutlined, label: "Teléfono", text: "866 159 7283", href: "tel:8661597283" },
  {
    Icon: MailOutlined,
    label: "Email",
    text: "contacto@clinikb.com",
    href: "mailto:contacto@clinikb.com",
  },
  {
    Icon: WhatsAppOutlined,
    label: "WhatsApp",
    text: "Enviar mensaje",
    href: "https://wa.me/528661597283",
    external: true,
  },
];

export default function RegistroExitoPage() {
  const { token } = theme.useToken();

  return (
    <AuthShell title="¡Registro Exitoso!" maxWidth={640}>
      <Result
        status="success"
        icon={<CheckCircleOutlined style={{ color: token.colorPrimary }} />}
        title={null}
        style={{ paddingTop: 0 }}
        subTitle={
          <Flex vertical gap={token.margin} style={{ textAlign: "start" }}>
            <Paragraph style={{ fontSize: token.fontSizeLG, marginBottom: 0 }}>
              Tu cuenta quedó activa. Ya puedes iniciar sesión y agendar tus citas.
            </Paragraph>

            <Alert
              type="warning"
              showIcon
              title="¿Necesitas atención urgente?"
              description={
                <Flex vertical gap={token.marginXS}>
                  <Text>Si requieres atención inmediata, contáctanos directamente:</Text>
                  {contactChannels.map(({ Icon, label, text, href, external }) => (
                    /*
                     * `wrap` es lo que salva la vista en celular: sin él, la
                     * etiqueta y el dato se quedan en un solo renglón y el
                     * texto se desborda de la tarjeta en pantallas angostas.
                     */
                    <Flex key={label} gap="small" align="center" wrap>
                      <Space size={4} align="center">
                        <Icon />
                        <Text strong>{label}:</Text>
                      </Space>
                      {/*
                       * Sin Typography.Link: dentro de un <a> de Next otro <a>
                       * rompería la hidratación. El color sale del token.
                       */}
                      <a
                        href={href}
                        style={{ color: token.colorLink, wordBreak: "break-word" }}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {text}
                      </a>
                    </Flex>
                  ))}
                </Flex>
              }
            />
          </Flex>
        }
        extra={
          // En celular los botones se apilan a ancho completo; en pantallas
          // grandes quedan lado a lado.
          <Flex gap={token.marginSM} wrap justify="center">
            <Link href="/login">
              <Button type="primary" size="large" icon={<LoginOutlined />}>
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/">
              <Button size="large" icon={<HomeOutlined />}>
                Volver al Inicio
              </Button>
            </Link>
          </Flex>
        }
      />
    </AuthShell>
  );
}
