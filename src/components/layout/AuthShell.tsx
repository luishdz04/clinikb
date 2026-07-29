"use client";

import { Card, Typography, Flex, theme } from "antd";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { colors } from "@/theme/themeConfig";

const { Title, Text } = Typography;

interface AuthShellProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Ancho máximo de la tarjeta. */
  maxWidth?: number;
}

/**
 * Marco común de las pantallas de autenticación: fondo de marca, logo que
 * vuelve al inicio y tarjeta centrada.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  maxWidth = 420,
}: AuthShellProps) {
  const { token } = theme.useToken();

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        minHeight: "100vh",
        padding: `${token.sizeXXL}px ${token.padding}px`,
        backgroundImage: `linear-gradient(to bottom right, ${colors.primary}1a, ${colors.white} 50%, ${colors.gold}1a)`,
      }}
    >
      <div style={{ width: "100%", maxWidth }}>
        <Card style={{ boxShadow: token.boxShadowSecondary }}>
          <Flex vertical align="center" style={{ marginBottom: token.marginLG }}>
            <Link href="/" aria-label="Ir al inicio">
              <Image
                src="/images/logo/clinikb.png"
                alt="CliniKB"
                width={72}
                height={72}
                priority
                style={{ borderRadius: "50%" }}
              />
            </Link>
            <Title
              level={3}
              style={{ marginTop: token.margin, marginBottom: subtitle ? token.marginXXS : 0 }}
            >
              {title}
            </Title>
            {subtitle && (
              <Text type="secondary" style={{ textAlign: "center" }}>
                {subtitle}
              </Text>
            )}
          </Flex>

          {children}
        </Card>
      </div>
    </Flex>
  );
}
