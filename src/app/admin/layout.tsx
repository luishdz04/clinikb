"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Layout,
  Menu,
  Spin,
  Typography,
  theme,
} from "antd";
import {
  ClockCircleOutlined,
  CloseOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
  MenuOutlined,
  ScheduleOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import type { MenuProps } from "antd";
import Image from "next/image";
import { colors } from "@/theme/themeConfig";

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

const ANCHO_SIDER = 240;
const ANCHO_SIDER_PLEGADO = 80;

interface DoctorSesion {
  id: string;
  full_name?: string;
  role?: string;
}

/**
 * Sesión del doctor leída de localStorage con `useSyncExternalStore`, que es
 * la API de React para leer estado externo. Evita el `setState` dentro de un
 * efecto, que dispara renders en cascada.
 *
 * El centinela distingue el render del servidor (donde no hay localStorage) de
 * "no hay sesión": sin él, ambos casos valen null y la pantalla redirigiría al
 * login antes de hidratar.
 */
const SIN_HIDRATAR = "__sin_hidratar__";

function suscribirSesion(alCambiar: () => void) {
  window.addEventListener("storage", alCambiar);
  return () => window.removeEventListener("storage", alCambiar);
}

const leerSesion = () => localStorage.getItem("doctor");
const leerSesionServidor = () => SIN_HIDRATAR;

const ITEMS_BASE: MenuProps["items"] = [
  { key: "/admin/pacientes", icon: <TeamOutlined />, label: "Pacientes" },
];

const ITEMS_COMUNES: MenuProps["items"] = [
  { key: "/admin/mis-servicios", icon: <MedicineBoxOutlined />, label: "Mis Servicios" },
  { key: "/admin/horarios", icon: <ClockCircleOutlined />, label: "Horarios" },
  { key: "/admin/citas", icon: <ScheduleOutlined />, label: "Citas" },
  { key: "/admin/historial", icon: <FileTextOutlined />, label: "Historial Clínico" },
];

/** El catálogo de servicios sólo lo administra quien tiene rol admin. */
function itemsDelMenu(esAdmin: boolean): MenuProps["items"] {
  return [
    ...(ITEMS_BASE ?? []),
    ...(esAdmin
      ? [{ key: "/admin/servicios", icon: <SettingOutlined />, label: "Servicios" }]
      : []),
    ...(ITEMS_COMUNES ?? []),
  ];
}

/**
 * Logo + menú, compartido por el Sider de escritorio y el Drawer móvil.
 *
 * Vive fuera del componente de página a propósito: declararlo dentro del
 * render creaba un componente nuevo en cada render, lo que desmonta y vuelve a
 * montar el menú y le borra su estado interno.
 */
function ContenidoDelMenu({
  compacto,
  plegado,
  items,
  seleccionado,
  alElegir,
}: {
  compacto: boolean;
  plegado: boolean;
  items: MenuProps["items"];
  seleccionado: string;
  alElegir: MenuProps["onClick"];
}) {
  const tamanoLogo = compacto ? 80 : plegado ? 70 : 120;

  return (
    <>
      <Flex
        align="center"
        justify="center"
        style={{ height: compacto ? 100 : 140, padding: compacto ? 16 : 20 }}
      >
        <Image
          src="/images/logo/clinikb.png"
          alt="CliniKB"
          width={tamanoLogo}
          height={tamanoLogo}
          priority
          style={{ objectFit: "contain" }}
        />
      </Flex>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[seleccionado]}
        items={items}
        onClick={alElegir}
        style={{ background: "transparent", borderInlineEnd: 0 }}
      />
    </>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token } = theme.useToken();
  // Hook oficial de antd: sustituye al listener de resize hecho a mano.
  const screens = Grid.useBreakpoint();

  const [plegado, setPlegado] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const sesionCruda = useSyncExternalStore(suscribirSesion, leerSesion, leerSesionServidor);

  const hidratando = sesionCruda === SIN_HIDRATAR;

  const doctor = useMemo<DoctorSesion | null>(() => {
    if (hidratando || !sesionCruda) return null;
    try {
      return JSON.parse(sesionCruda) as DoctorSesion;
    } catch {
      return null;
    }
  }, [sesionCruda, hidratando]);

  // Sin sesión no hay panel que mostrar.
  useEffect(() => {
    if (!hidratando && !doctor) router.replace("/login/doctor");
  }, [hidratando, doctor, router]);

  // `md` es el corte de antd entre tableta y escritorio.
  const compacto = !screens.md;

  const items = useMemo(() => itemsDelMenu(doctor?.role === "admin"), [doctor?.role]);

  const menuUsuario: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar Sesión",
      danger: true,
      onClick: async () => {
        // La cookie de sesión es httpOnly, así que sólo el servidor puede
        // borrarla: limpiar localStorage por sí solo dejaría la sesión viva.
        await fetch("/api/logout-doctor", { method: "POST" }).catch(() => {});
        localStorage.removeItem("doctor");
        router.push("/login/doctor");
      },
    },
  ];

  const alElegirOpcion: MenuProps["onClick"] = ({ key }) => {
    router.push(key);
    if (compacto) setMenuMovilAbierto(false);
  };

  if (hidratando || !doctor) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh", background: token.colorBgLayout }}>
        <Spin size="large" />
      </Flex>
    );
  }

  const nombre = doctor.full_name || "Doctor";
  const inicial = doctor.full_name?.charAt(0).toUpperCase() || "D";

  const menu = (
    <ContenidoDelMenu
      compacto={compacto}
      plegado={plegado}
      items={items}
      seleccionado={pathname}
      alElegir={alElegirOpcion}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {compacto ? (
        <Drawer
          title={
            <Flex align="center" justify="space-between">
              <Text strong style={{ color: colors.primaryDark }}>
                Menú
              </Text>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setMenuMovilAbierto(false)}
                aria-label="Cerrar menú"
              />
            </Flex>
          }
          placement="left"
          closable={false}
          onClose={() => setMenuMovilAbierto(false)}
          open={menuMovilAbierto}
          // v6: `width` quedó deprecado; `size` acepta un número directo.
          size={280}
          // `bodyStyle` quedó deprecado en favor de los estilos semánticos.
          styles={{ body: { padding: 0, background: colors.primaryDark } }}
        >
          {menu}
        </Drawer>
      ) : (
        <Sider
          collapsible
          collapsed={plegado}
          onCollapse={setPlegado}
          width={ANCHO_SIDER}
          style={{
            background: colors.primaryDark,
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            insetInlineStart: 0,
            top: 0,
            bottom: 0,
          }}
        >
          {menu}
        </Sider>
      )}

      <Layout
        style={{
          marginInlineStart: compacto ? 0 : plegado ? ANCHO_SIDER_PLEGADO : ANCHO_SIDER,
          transition: "margin-inline-start 0.2s",
        }}
      >
        <Header
          style={{
            padding: `0 ${token.paddingLG}px`,
            background: token.colorBgContainer,
            boxShadow: token.boxShadowTertiary,
            position: "sticky",
            top: 0,
            zIndex: 1,
            height: 80,
            lineHeight: "normal",
          }}
        >
          <Flex align="center" justify="space-between" style={{ height: "100%" }}>
            {compacto ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMenuMovilAbierto(true)}
                aria-label="Abrir menú"
                style={{ fontSize: token.fontSizeLG }}
              />
            ) : (
              <span />
            )}

            <Dropdown menu={{ items: menuUsuario }} placement="bottomRight" trigger={["click"]}>
              <Flex
                align="center"
                gap={token.marginSM}
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
              >
                <Avatar size={48} style={{ backgroundColor: colors.primary, fontSize: token.fontSizeXL }}>
                  {inicial}
                </Avatar>
                {!compacto && <Text>{nombre}</Text>}
              </Flex>
            </Dropdown>
          </Flex>
        </Header>

        <Content
          style={{
            margin: compacto ? token.margin : token.marginLG,
            padding: compacto ? token.padding : token.paddingLG,
            minHeight: 280,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
          }}
        >
          {children}
        </Content>

        <Footer style={{ textAlign: "center", background: token.colorBgLayout }}>
          <Text type="secondary">
            CliniKB {new Date().getFullYear()} · Panel de Administración
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
}
