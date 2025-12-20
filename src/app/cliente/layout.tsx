"use client";

import { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Spin, theme, Drawer } from "antd";
import {
  DashboardOutlined,
  CalendarOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import type { MenuProps } from "antd";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

const menuItems: MenuProps["items"] = [
  {
    key: "/cliente/dashboard",
    icon: <DashboardOutlined />,
    label: "Inicio",
  },
  {
    key: "/cliente/citas",
    icon: <CalendarOutlined />,
    label: "Mis Citas",
  },
  {
    key: "/cliente/historial",
    icon: <FileTextOutlined />,
    label: "Historial Clínico",
  },
  {
    key: "/cliente/perfil",
    icon: <UserOutlined />,
    label: "Mi Perfil",
  },
];

interface ClienteLayoutProps {
  children: React.ReactNode;
}

export default function ClienteLayout({ children }: ClienteLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const getPatient = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.log("No user session found, redirecting...");
          router.replace("/login/paciente");
          return;
        }

        // Obtener datos del paciente
        const { data: patientData, error } = await supabase
          .from("patients")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error || !patientData) {
          console.error("Error al obtener datos del paciente:", error);
          router.replace("/login/paciente");
          return;
        }

        // Verificar que está aprobado
        if (patientData.status !== "approved") {
          console.log("Patient not approved, redirecting...");
          await supabase.auth.signOut();
          router.replace("/login/paciente");
          return;
        }

        console.log("Patient data loaded:", patientData.full_name);
        setPatient(patientData);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener datos del paciente:", error);
        router.replace("/login/paciente");
      }
    };
    getPatient();
  }, [router, supabase]);

  const handleMenuClick = (e: { key: string }) => {
    router.push(e.key);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login/paciente");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "perfil",
      icon: <UserOutlined />,
      label: "Mi Perfil",
      onClick: () => router.push("/cliente/perfil"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar Sesión",
      danger: true,
      onClick: handleLogout,
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f5",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const userName = patient?.full_name || "Paciente";
  const userInitial = patient?.full_name?.charAt(0).toUpperCase() || "P";

  // Componente del menú reutilizable
  const MenuContent = () => (
    <>
      {/* Logo */}
      <div
        style={{
          height: isMobile ? 100 : 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "16px" : "20px",
          marginBottom: 8,
        }}
      >
        <Image
          src="/images/logo/clinikb.png"
          alt="CliniKB"
          width={isMobile ? 80 : collapsed ? 70 : 120}
          height={isMobile ? 80 : collapsed ? 70 : 120}
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          background: "transparent",
          borderRight: 0,
        }}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={240}
          style={{
            background: "#55c5c4",
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <MenuContent />
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          title={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Text strong style={{ color: "#55c5c4" }}>
                Menú
              </Text>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setMobileMenuOpen(false)}
              />
            </div>
          }
          placement="left"
          closable={false}
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
          bodyStyle={{ padding: 0, background: "#55c5c4" }}
        >
          <MenuContent />
        </Drawer>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : collapsed ? 80 : 240 }}>
        {/* Header */}
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuOpen(true)}
                style={{ fontSize: "18px" }}
              />
            )}
            <Text strong style={{ fontSize: isMobile ? "16px" : "18px", color: "#55c5c4" }}>
              Portal de Pacientes
            </Text>
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <Avatar
                style={{
                  backgroundColor: "#367c84",
                  fontSize: "16px",
                }}
                size={isMobile ? "default" : "large"}
              >
                {userInitial}
              </Avatar>
              {!isMobile && <Text>{userName}</Text>}
            </div>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: isMobile ? "16px" : "24px",
            padding: isMobile ? "16px" : "24px",
            minHeight: 280,
            background: "#fff",
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>

        {/* Footer */}
        <Footer style={{ textAlign: "center", background: "#f5f5f5" }}>
          CliniKB © {new Date().getFullYear()} - Portal de Pacientes
        </Footer>
      </Layout>
    </Layout>
  );
}
