"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Layout,
  Menu,
  Result,
  Spin,
  Typography,
  theme,
} from "antd";
import {
  CalendarOutlined,
  CloseOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import type { MenuProps } from "antd";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { colors } from "@/theme/themeConfig";

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

const ANCHO_SIDER = 240;
const ANCHO_SIDER_PLEGADO = 80;

/**
 * Sólo las secciones que existen. El menú anterior listaba "Historial Clínico"
 * y "Mi Perfil", que no tienen página: llevaban a un 404.
 */
const ITEMS_MENU: MenuProps["items"] = [
  { key: "/cliente/dashboard", icon: <HomeOutlined />, label: "Inicio" },
  { key: "/cliente/citas", icon: <CalendarOutlined />, label: "Mis Citas" },
];

interface Paciente {
  id: string;
  full_name: string;
  status: string;
}

/**
 * Logo + menú, compartido por el Sider de escritorio y el Drawer móvil.
 * Fuera del componente de página: declararlo dentro del render crearía un
 * componente nuevo cada vez y remontaría el menú.
 */
function ContenidoDelMenu({
  compacto,
  plegado,
  seleccionado,
  alElegir,
}: {
  compacto: boolean;
  plegado: boolean;
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
        items={ITEMS_MENU}
        onClick={alElegir}
        style={{ background: "transparent", borderInlineEnd: 0 }}
      />
    </>
  );
}

export default function ClienteLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token } = theme.useToken();
  // Hook oficial de antd, en vez de un listener de resize hecho a mano.
  const screens = Grid.useBreakpoint();

  const [plegado, setPlegado] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [cargando, setCargando] = useState(true);
  const [sinAcceso, setSinAcceso] = useState<string | null>(null);

  const compacto = !screens.md;

  const cargarPaciente = useCallback(
    (vivo: () => boolean) =>
      fetch("/api/patient/me")
        .then(async (res) => {
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "No se pudo cargar tu perfil");
          return json.patient ?? json;
        })
        .then((datos: Paciente) => {
          if (!vivo()) return;
          // El middleware ya exige sesión; aquí se comprueba además que la
          // cuenta esté activa, que es un estado distinto.
          if (datos?.status !== "approved") {
            setSinAcceso("Tu cuenta todavía no está activa.");
            return;
          }
          setPaciente(datos);
        })
        .catch((error: unknown) => {
          if (!vivo()) return;
          console.error("Error cargando el perfil:", error);
          setSinAcceso(error instanceof Error ? error.message : "No se pudo cargar tu perfil");
        })
        .finally(() => {
          if (vivo()) setCargando(false);
        }),
    [],
  );

  useEffect(() => {
    let vivo = true;
    cargarPaciente(() => vivo);
    return () => {
      vivo = false;
    };
  }, [cargarPaciente]);

  const cerrarSesion = async () => {
    await createClient().auth.signOut();
    router.push("/login");
  };

  const menuUsuario: MenuProps["items"] = useMemo(
    () => [
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Cerrar Sesión",
        danger: true,
        onClick: cerrarSesion,
      },
    ],
    // cerrarSesion no cambia entre renders de forma significativa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const alElegirOpcion: MenuProps["onClick"] = ({ key }) => {
    router.push(key);
    if (compacto) setMenuMovilAbierto(false);
  };

  if (cargando) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ minHeight: "100vh", background: token.colorBgLayout }}
      >
        <Spin size="large" />
      </Flex>
    );
  }

  if (sinAcceso || !paciente) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh", padding: token.padding }}>
        <Result
          status="warning"
          title="No puedes entrar al portal"
          subTitle={sinAcceso ?? "No se encontró tu perfil."}
          extra={
            <Button type="primary" onClick={() => router.push("/login")}>
              Volver a iniciar sesión
            </Button>
          }
        />
      </Flex>
    );
  }

  const nombre = paciente.full_name?.trim() || "Paciente";
  const inicial = nombre.charAt(0).toUpperCase();

  const menu = (
    <ContenidoDelMenu
      compacto={compacto}
      plegado={plegado}
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
          // v6: `width` quedó deprecado y `bodyStyle` pasó a estilos semánticos.
          size={280}
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
                <Avatar
                  size={48}
                  style={{ backgroundColor: colors.primary, fontSize: token.fontSizeXL }}
                >
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
          <Text type="secondary">CliniKB {new Date().getFullYear()}</Text>
        </Footer>
      </Layout>
    </Layout>
  );
}
