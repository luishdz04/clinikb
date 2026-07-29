"use client";

import { Layout, Menu, Button, Flex, Drawer, Row, Col, Divider, Typography, theme } from "antd";
import type { MenuProps } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import MaterialSymbol from "@/components/ui/MaterialSymbol";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

/** Fuente única de las entradas de navegación: label, icono y ruta juntos. */
const navItems = [
  { key: "home", href: "/", label: "Inicio", icon: <HomeOutlined /> },
  { key: "services", href: "/servicios", label: "Servicios", icon: <MedicineBoxOutlined /> },
  { key: "about", href: "/nosotros", label: "Nosotros", icon: <UserOutlined /> },
] as const;

/**
 * Construye los items del Menu, marcando el activo con el símbolo
 * `self_improvement`. Sustituye a la barra inferior por defecto del menú
 * horizontal, desactivada con el token `activeBarHeight: 0` (ver themeConfig).
 */
function buildMenuItems(activeKey?: string, showMark = true): MenuProps["items"] {
  return navItems.map(({ key, href, label, icon }) => ({
    key,
    icon,
    label: (
      <Link href={href}>
        {label}
        {showMark && key === activeKey && (
          <MaterialSymbol
            name="self_improvement"
            size="1.15em"
            style={{ marginInlineStart: 8 }}
          />
        )}
      </Link>
    ),
  }));
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { token } = theme.useToken();

  // Guardamos la ruta en la que se abrió el drawer en vez de un booleano: así
  // cualquier navegación (incluido el botón atrás) lo cierra al derivarse en
  // render, sin necesidad de un efecto que sincronice estado.
  const [openedAtPath, setOpenedAtPath] = useState<string | null>(null);
  const drawerOpen = openedAtPath === pathname;

  const openDrawer = useCallback(() => setOpenedAtPath(pathname), [pathname]);
  const closeDrawer = useCallback(() => setOpenedAtPath(null), []);

  const handleClick = useCallback<NonNullable<MenuProps["onClick"]>>(
    ({ key }) => {
      const target = navItems.find((item) => item.key === key);
      if (target) router.push(target.href);
      closeDrawer();
    },
    [router, closeDrawer]
  );

  // El item activo se deriva de la ruta: sin estado local que se desincronice.
  const selectedKeys = useMemo(() => {
    const match = navItems.find(({ href }) =>
      href === "/" ? pathname === "/" : pathname.startsWith(href)
    );
    return match ? [match.key] : [];
  }, [pathname]);

  return (
    <AntHeader
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 64,
        lineHeight: "normal",
        padding: `0 ${token.padding}px`,
        background: token.colorBgContainer,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      {/*
        El responsive se resuelve con la rejilla de antd: `span={0}` equivale a
        `display:none`. Es CSS, así que no parpadea en SSR, y no compite con los
        estilos internos de los componentes como haría una clase utilitaria.
        Las columnas suman 24 en cada breakpoint: xs 10+0+0+14, lg 4+12+8+0.
      */}
      <Row align="middle" wrap={false} style={{ height: "100%" }}>
        <Col xs={10} lg={4}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
            <Image
              src="/images/logo/clinikb.png"
              alt="CliniKB"
              width={44}
              height={44}
              priority
              style={{ borderRadius: "50%" }}
            />
          </Link>
        </Col>

        <Col xs={0} lg={12}>
          {/* `flex: 1` + `minWidth: 0` es el patrón que documenta antd para que
              el Menu colapse bien dentro de un contenedor flex. */}
          <Menu
            mode="horizontal"
            selectedKeys={selectedKeys}
            items={buildMenuItems(selectedKeys[0])}
            onClick={handleClick}
            style={{ flex: 1, minWidth: 0, justifyContent: "center", borderBottom: "none" }}
          />
        </Col>

        <Col xs={0} lg={8}>
          <Flex gap="small" justify="end">
            <Link href="/login">
              <Button size="large">Iniciar Sesión</Button>
            </Link>
            <Link href="/registro">
              <Button type="primary" size="large">
                Agendar Cita
              </Button>
            </Link>
          </Flex>
        </Col>

        <Col xs={14} lg={0}>
          <Flex gap="small" align="center" justify="end">
            <Link href="/registro">
              <Button type="primary">Agendar Cita</Button>
            </Link>
            <Button
              type="text"
              aria-label="Abrir menú"
              icon={<MenuOutlined />}
              onClick={openDrawer}
            />
          </Flex>
        </Col>
      </Row>

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        placement="right"
        // `size` sustituye a `width`/`height`, deprecados en v6. Acepta string
        // desde 6.2.0, así se adapta a pantallas angostas (por defecto 378px).
        size="min(320px, 82vw)"
        title={
          <Flex align="center" gap="small">
            <Image
              src="/images/logo/clinikb.png"
              alt=""
              width={32}
              height={32}
              style={{ borderRadius: "50%" }}
            />
            <Text strong>CliniKB</Text>
          </Flex>
        }
        // El Menu trae su propio padding; el del body lo dejaría descuadrado.
        styles={{ body: { padding: 0 } }}
        footer={
          <Flex vertical gap="small">
            <Link href="/registro" onClick={closeDrawer}>
              <Button type="primary" size="large" block>
                Agendar Cita
              </Button>
            </Link>
            <Link href="/login" onClick={closeDrawer}>
              <Button size="large" block>
                Iniciar Sesión
              </Button>
            </Link>
          </Flex>
        }
      >
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={buildMenuItems(selectedKeys[0], false)}
          onClick={handleClick}
          style={{ borderInlineEnd: "none" }}
        />
        <Divider style={{ marginBlock: token.marginXS }} />
        <Flex vertical gap={4} style={{ padding: `0 ${token.padding}px` }}>
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            866 159 7283
          </Text>
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Juárez 145, San Buenaventura, Coahuila
          </Text>
        </Flex>
      </Drawer>
    </AntHeader>
  );
}
