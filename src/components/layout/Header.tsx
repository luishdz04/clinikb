"use client";

import { Layout, Menu, Button, Flex, Dropdown, Row, Col, theme } from "antd";
import type { MenuProps } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  MenuOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import MaterialSymbol from "@/components/ui/MaterialSymbol";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

const { Header: AntHeader } = Layout;

/** Fuente única de las entradas de navegación: label, icono y ruta juntos. */
const navItems = [
  { key: "home", href: "/", label: "Inicio", icon: <HomeOutlined /> },
  { key: "services", href: "/servicios", label: "Servicios", icon: <MedicineBoxOutlined /> },
  { key: "about", href: "/nosotros", label: "Nosotros", icon: <UserOutlined /> },
] as const;

const menuItems: MenuProps["items"] = navItems.map(({ key, href, label, icon }) => ({
  key,
  icon,
  label: <Link href={href}>{label}</Link>,
}));

/**
 * Marca el item activo con el símbolo `self_improvement` a la derecha del texto.
 *
 * Sustituye a la barra inferior por defecto del Menu horizontal, que se
 * desactiva con el token `activeBarHeight: 0` (ver themeConfig).
 */
function withActiveMark(
  items: MenuProps["items"],
  activeKey: string | undefined
): MenuProps["items"] {
  if (!activeKey) return items;
  return navItems.map(({ key, href, label, icon }) => ({
    key,
    icon,
    label: (
      <Link href={href}>
        {label}
        {key === activeKey && (
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

/**
 * En vista compacta no caben logo + dos botones + disparador, así que
 * "Iniciar Sesión" baja al desplegable junto a la navegación.
 */
const compactExtraItems: MenuProps["items"] = [
  { type: "divider" },
  { key: "login", icon: <LoginOutlined />, label: <Link href="/login">Iniciar Sesión</Link> },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { token } = theme.useToken();

  const handleClick = useCallback<NonNullable<MenuProps["onClick"]>>(
    ({ key }) => {
      const target = navItems.find((item) => item.key === key);
      if (target) router.push(target.href);
    },
    [router]
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
            items={withActiveMark(menuItems, selectedKeys[0])}
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
            <Dropdown
              menu={{
                items: [...(menuItems ?? []), ...(compactExtraItems ?? [])],
                selectedKeys,
                onClick: handleClick,
              }}
              trigger={["click"]}
            >
              <Button type="text" aria-label="Abrir menú" icon={<MenuOutlined />} />
            </Dropdown>
          </Flex>
        </Col>
      </Row>
    </AntHeader>
  );
}
