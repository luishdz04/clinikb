"use client";

import { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Spin, theme, Drawer } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  ScheduleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import type { MenuProps } from "antd";
import Image from "next/image";

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

// Función para generar items del menú según el rol
const getMenuItems = (isAdmin: boolean): MenuProps["items"] => {
  const baseItems: MenuProps["items"] = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/pacientes",
      icon: <TeamOutlined />,
      label: "Pacientes",
    },
  ];

  // Item de Servicios solo para admin
  if (isAdmin) {
    baseItems.push({
      key: "/admin/servicios",
      icon: <SettingOutlined />,
      label: "Servicios",
    });
  }

  // Items comunes para todos
  baseItems.push(
    {
      key: "/admin/mis-servicios",
      icon: <MedicineBoxOutlined />,
      label: "Mis Servicios",
    },
    {
      key: "/admin/horarios",
      icon: <ClockCircleOutlined />,
      label: "Horarios",
    },
    {
      key: "/admin/citas",
      icon: <ScheduleOutlined />,
      label: "Citas",
    },
    {
      key: "/admin/historial",
      icon: <FileTextOutlined />,
      label: "Historial Clínico",
    }
  );

  return baseItems;
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
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
    const getDoctor = () => {
      try {
        const doctorData = localStorage.getItem("doctor");
        if (!doctorData) {
          console.log("No doctor session found, redirecting...");
          router.replace("/login/doctor");
          return;
        }

        const parsedDoctor = JSON.parse(doctorData);
        console.log("Doctor data loaded:", parsedDoctor.full_name);
        setDoctor(parsedDoctor);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener datos del doctor:", error);
        router.replace("/login/doctor");
      }
    };
    getDoctor();
  }, [router]);

  const handleMenuClick = (e: { key: string }) => {
    router.push(e.key);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("doctor");
    router.push("/login/doctor");
  };

  const userMenuItems: MenuProps["items"] = [
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

  const userName = doctor?.full_name || "Doctor";
  const userInitial = doctor?.full_name?.charAt(0).toUpperCase() || "D";
  const isAdmin = doctor?.role === "admin";
  const menuItems = getMenuItems(isAdmin);

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
            background: "#367c84",
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
              <Text strong style={{ color: "#367c84" }}>
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
          bodyStyle={{ padding: 0, background: "#367c84" }}
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
            justifyContent: "flex-end",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 1,
            height: "80px",
          }}
        >
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              style={{ fontSize: "18px", position: "absolute", left: 24 }}
            />
          )}

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
              }}
            >
              <Avatar
                style={{
                  backgroundColor: "#55c5c4",
                  fontSize: "20px",
                  width: 48,
                  height: 48,
                }}
              >
                {userInitial}
              </Avatar>
              {!isMobile && <Text style={{ fontSize: "15px" }}>{userName}</Text>}
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
          CliniKB © {new Date().getFullYear()} - Panel de Administración
        </Footer>
      </Layout>
    </Layout>
  );
}
