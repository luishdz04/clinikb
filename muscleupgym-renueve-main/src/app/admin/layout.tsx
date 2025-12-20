'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Spin, theme, Drawer } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  TeamOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';
import { colors } from '@/theme';
import Image from 'next/image';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

// Items del menú del admin - se actualizarán según las secciones que el usuario indique
const menuItems: MenuProps['items'] = [
  {
    key: '/admin/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/admin/clientes',
    icon: <TeamOutlined />,
    label: 'Clientes',
  },
  {
    key: '/admin/empleados',
    icon: <UserOutlined />,
    label: 'Empleados',
  },
  {
    key: '/admin/ventas',
    icon: <ShoppingOutlined />,
    label: 'Ventas',
  },
  {
    key: '/admin/asistencias',
    icon: <CalendarOutlined />,
    label: 'Asistencias',
  },
  {
    key: '/admin/evaluaciones-patrones',
    icon: <FileTextOutlined />,
    label: 'Evaluaciones Patrones',
  },
  {
    key: '/admin/patrones-autorizaciones',
    icon: <CheckCircleOutlined />,
    label: 'Autorizar Patrones',
  },
  {
    key: '/admin/reportes',
    icon: <BarChartOutlined />,
    label: 'Reportes',
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { token: { borderRadiusLG } } = theme.useToken();

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const getEmployee = () => {
      try {
        // Obtener datos del empleado desde la cookie
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith('employee_session='))
          ?.split('=')[1];

        if (!cookieValue) {
          console.log('No employee session found, redirecting...');
          router.replace('/login/empleados');
          return;
        }

        const employeeData = JSON.parse(decodeURIComponent(cookieValue));
        console.log('Employee data loaded:', employeeData.first_name);
        setEmployee(employeeData);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener datos del empleado:', error);
        router.replace('/login/empleados');
      }
    };
    getEmployee();
  }, [router]);

  const handleMenuClick = (e: { key: string }) => {
    router.push(e.key);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    // Eliminar cookie de sesión
    document.cookie = 'employee_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'admin_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login/empleados');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      danger: true,
      onClick: handleLogout,
    },
  ];

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: colors.background.primary 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  const userName = `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim() || 'Empleado';
  const userInitial = employee?.first_name?.charAt(0).toUpperCase() || 'E';
  const userPhoto = employee?.profile_picture_url;

  // Componente del menú reutilizable
  const MenuContent = () => (
    <>
      {/* Logo */}
      <div
        style={{
          height: isMobile ? 100 : 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '16px' : '20px',
          marginBottom: 8,
        }}
      >
        <Image
          src="/logos/logo.png"
          alt="Muscle Up GYM"
          width={isMobile ? 100 : (collapsed ? 70 : 150)}
          height={isMobile ? 100 : (collapsed ? 70 : 150)}
          style={{ objectFit: 'contain' }}
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
          background: 'transparent',
          borderRight: 0,
        }}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Drawer para móvil */}
      <Drawer
        placement="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        styles={{
          body: { padding: 0, background: colors.background.primary, width: 280 },
          header: { display: 'none' },
        }}
        closable={false}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          padding: '12px 16px',
          borderBottom: `1px solid ${colors.border.light}`,
        }}>
          <Button 
            type="text" 
            icon={<CloseOutlined style={{ color: colors.text.primary }} />}
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
        <MenuContent />
      </Drawer>

      {/* Sidebar para desktop - oculto en móvil */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{
            background: colors.background.primary,
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
          theme="dark"
          trigger={
            <div style={{ 
              background: colors.brand.primary, 
              color: colors.text.inverse,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: 24,
            }}>
              {collapsed ? '›' : '‹'}
            </div>
          }
        >
          <MenuContent />
        </Sider>
      )}

      {/* Main Layout */}
      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 200), transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <Header
          style={{
            padding: '0 16px',
            background: colors.background.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${colors.border.light}`,
            position: 'sticky',
            top: 0,
            zIndex: 99,
            gap: 16,
          }}
        >
          {/* Lado izquierdo - Hamburguesa en móvil o logo pequeño */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: 20, color: colors.text.primary }} />}
                onClick={() => setMobileMenuOpen(true)}
              />
            )}
            {isMobile && (
              <Image
                src="/logos/logo.png"
                alt="Muscle Up GYM"
                width={40}
                height={40}
                style={{ objectFit: 'contain' }}
              />
            )}
          </div>

          {/* Lado derecho */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16 }}>
            {/* Usuario */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 8,
                  transition: 'background 0.2s',
                }}
              >
                {userPhoto ? (
                  <Avatar
                    src={userPhoto}
                    size={36}
                    style={{ border: `2px solid ${colors.brand.primary}` }}
                  />
                ) : (
                  <Avatar
                    style={{
                      backgroundColor: colors.brand.primary,
                      color: colors.text.inverse,
                    }}
                  >
                    {userInitial}
                  </Avatar>
                )}
                {/* Ocultar nombre en móvil */}
                {!isMobile && (
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                    <Text style={{ color: colors.text.primary, fontSize: 14 }}>
                      {userName}
                    </Text>
                    <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                      {employee?.position || 'Empleado'}
                    </Text>
                  </div>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={{ margin: isMobile ? '8px' : '16px' }}>
          <div
            style={{
              padding: isMobile ? 12 : 24,
              minHeight: 'calc(100vh - 64px - 70px - 32px)',
              background: colors.background.secondary,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>

        {/* Footer */}
        <Footer style={{ textAlign: 'center', background: 'transparent', color: colors.text.muted, padding: isMobile ? '12px' : '24px' }}>
          Muscle Up GYM - Panel de Administración ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
}
