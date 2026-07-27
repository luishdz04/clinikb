"use client";

import { Button, Typography, Flex, ConfigProvider, theme } from "antd";
import { CalendarOutlined, WhatsAppOutlined } from "@ant-design/icons";
import { colors } from "@/theme/themeConfig";

const { Title, Paragraph } = Typography;

/**
 * Tokens locales para los botones sobre el degradado de marca.
 *
 * En antd v6 los colores de Button se resuelven con variables CSS propias, así
 * que hay que configurarlos como tokens: cualquier override externo pierde.
 */
const onBrandTheme = {
  components: {
    Button: {
      // Sólido blanco
      defaultBg: colors.white,
      defaultColor: colors.primaryDark,
      defaultBorderColor: colors.white,
      defaultHoverBg: colors.white,
      defaultHoverColor: colors.dark,
      defaultHoverBorderColor: colors.white,
      defaultActiveBg: colors.white,
      defaultActiveColor: colors.primaryDark,
      defaultActiveBorderColor: colors.white,
      // Fantasma (borde y texto blancos)
      defaultGhostColor: colors.white,
      defaultGhostBorderColor: colors.white,
    },
  },
};

export default function CTASection() {
  const { token } = theme.useToken();

  return (
    <section
      style={{
        padding: `${token.sizeXXL * 1.5}px ${token.padding}px`,
        // Va de `primaryDark` a `primaryDeep`: sobre `primary` el texto blanco
        // daría 2.06:1 y no pasaría WCAG AA.
        backgroundImage: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryDeep})`,
      }}
    >
      <Flex
        vertical
        align="center"
        gap="small"
        style={{ maxWidth: 896, margin: "0 auto", textAlign: "center" }}
      >
        <Title level={2} style={{ marginTop: 0, color: colors.white }}>
          ¿Listo para cuidar tu salud?
        </Title>
        <Paragraph style={{ fontSize: token.fontSizeLG, color: colors.white, marginBottom: 0 }}>
          Agenda tu cita hoy mismo y da el primer paso hacia una vida más saludable. Nuestro
          equipo está listo para atenderte.
        </Paragraph>

        <ConfigProvider theme={onBrandTheme}>
          <Flex gap="middle" wrap justify="center" style={{ marginTop: token.marginXL }}>
            <Button size="large" icon={<CalendarOutlined />}>
              Agendar Cita
            </Button>
            <Button size="large" ghost icon={<WhatsAppOutlined />}>
              WhatsApp
            </Button>
          </Flex>
        </ConfigProvider>
      </Flex>
    </section>
  );
}
