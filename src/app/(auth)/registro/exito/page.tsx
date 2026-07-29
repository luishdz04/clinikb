"use client";

import Link from "next/link";
import { Result, Button, Typography, Alert, Flex, theme } from "antd";
import {
  CheckCircleOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import AuthShell from "@/components/layout/AuthShell";

const { Paragraph, Text, Link: AntLink } = Typography;

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
              Tu solicitud de registro ha sido recibida correctamente.
            </Paragraph>

            <Alert
              type="info"
              showIcon
              title="Estado de tu solicitud"
              description={
                <Flex vertical gap={token.marginXXS}>
                  <Text>
                    <Text strong>Estado:</Text> Pendiente de aprobación
                  </Text>
                  <Text>
                    Tu información está siendo revisada por nuestro equipo médico. Te
                    notificaremos por correo electrónico una vez que tu cuenta sea aprobada.
                  </Text>
                </Flex>
              }
            />

            <Alert
              type="warning"
              showIcon
              title="¿Necesitas atención urgente?"
              description={
                <Flex vertical gap={token.marginXS}>
                  <Text>Si requieres atención inmediata, puedes contactarnos directamente:</Text>
                  {contactChannels.map(({ Icon, label, text, href, external }) => (
                    <Flex key={label} gap="small" align="center">
                      <Icon />
                      <Text strong>{label}:</Text>
                      <AntLink
                        href={href}
                        {...(external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {text}
                      </AntLink>
                    </Flex>
                  ))}
                </Flex>
              }
            />

            <Paragraph type="secondary" style={{ textAlign: "center", marginBottom: 0 }}>
              Recibirás un correo de confirmación cuando tu cuenta sea aprobada y podrás
              iniciar sesión para agendar tus citas.
            </Paragraph>
          </Flex>
        }
        extra={
          <Link href="/">
            <Button type="primary" size="large" icon={<HomeOutlined />}>
              Volver al Inicio
            </Button>
          </Link>
        }
      />
    </AuthShell>
  );
}
