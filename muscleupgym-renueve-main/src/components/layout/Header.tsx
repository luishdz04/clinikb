'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Drawer, Button } from 'antd';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { colors } from '@/theme';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Sobre nosotros', href: '/about' },
    { label: 'Planes', href: '/pricing' },
    { label: 'Planes Nutrición', href: '/planes-nutricion' },
    { label: 'Suplementos', href: '/suplementos' },
  ];

  const actionItems = [
    { href: '/login', label: 'Acceso' },
    { href: '/register', label: 'Registro' },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  if (!mounted) {
    return <div className="h-20" />;
  }

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/80 backdrop-blur-xl border-b border-primary/20 shadow-lg shadow-primary/5' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group relative">
              <div className="absolute -inset-2 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />
              <Image
                src={pathname === '/planes-nutricion' ? '/logos/logo-mupai.jpg' : '/logos/logo.png'}
                alt={pathname === '/planes-nutricion' ? 'MUPAI' : 'MuscleUp Gym'}
                width={240}
                height={60}
                className="h-14 w-auto object-contain transition-all duration-500 group-hover:scale-110 group-hover:brightness-110 relative z-10"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative px-4 py-2 group"
                  >
                    <span className={`relative z-10 font-medium transition-colors duration-300 ${
                      isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'
                    }`}>
                      {item.label}
                    </span>
                    <span className="absolute inset-0 bg-primary/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300" />
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <button className="relative px-6 py-2 font-medium text-foreground overflow-hidden group rounded-lg border border-border-light hover:border-primary/50 transition-all duration-300">
                  <span className="relative z-10 group-hover:text-primary transition-colors duration-300">Acceso</span>
                  <span className="absolute inset-0 bg-primary/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </button>
              </Link>
              <Link href="/register">
                <button className="relative px-6 py-2 font-bold text-black bg-primary rounded-lg overflow-hidden group shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                  <span className="relative z-10">Registro</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-400 to-primary bg-[length:200%_100%] animate-shimmer" />
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: colors.brand.primary, fontSize: '20px' }} />}
              onClick={() => setIsOpen(true)}
              className="md:hidden"
              style={{
                background: 'rgba(255, 204, 0, 0.1)',
                border: `1px solid rgba(255, 204, 0, 0.2)`,
                height: '40px',
                width: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      <Drawer
        title={null}
        placement="right"
        onClose={() => setIsOpen(false)}
        open={isOpen}
        closeIcon={null}
        className="mobile-menu-drawer"
        styles={{
          body: {
            background: colors.background.primary,
            padding: 0,
          },
          wrapper: {
            width: '85%',
            maxWidth: '400px',
          },
        }}
      >
        {/* Close Button */}
        <Button
          type="text"
          icon={<CloseOutlined style={{ color: colors.text.primary, fontSize: '20px' }} />}
          onClick={() => setIsOpen(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '24px',
            zIndex: 10,
            color: colors.text.primary,
          }}
        />

        {/* Logo and Slogan */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '32px 24px 40px 24px',
          borderBottom: `1px solid ${colors.border.light}`,
        }}>
          <Image
            src="/logos/logo.png"
            alt="Muscle Up GYM"
            width={200}
            height={50}
            className="mb-4"
            style={{ height: '56px', width: 'auto' }}
          />
          <div style={{ 
            color: colors.text.secondary, 
            fontSize: '14px',
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
            "Tu salud y bienestar son nuestra misión"
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{ padding: '24px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '20px' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  style={{
                    padding: '16px 24px',
                    color: isActive ? colors.brand.primary : colors.text.primary,
                    background: isActive ? 'rgba(255, 204, 0, 0.1)' : 'transparent',
                    borderLeft: isActive ? `4px solid ${colors.brand.primary}` : '4px solid transparent',
                    textDecoration: 'none',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 204, 0, 0.05)';
                      e.currentTarget.style.paddingLeft = '28px';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.paddingLeft = '24px';
                    }
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Separator */}
          <div
            style={{
              margin: '20px auto',
              width: 'calc(100% - 48px)',
              maxWidth: '280px',
              height: '1px',
              background: `linear-gradient(to right, transparent, ${colors.border.light}, transparent)`,
            }}
          />

          {/* Action Buttons */}
          <div style={{ 
            padding: '0 24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            alignItems: 'center',
          }}>
            {actionItems.map(({ href, label }) => (
              <Link key={href} href={href} onClick={handleLinkClick} style={{ width: '100%', maxWidth: '280px' }}>
                <Button
                  type="primary"
                  size="large"
                  style={{
                    width: '100%',
                    background: colors.brand.primary,
                    borderColor: colors.brand.primary,
                    color: colors.background.primary,
                    fontWeight: 600,
                    height: '48px',
                    fontSize: '16px',
                  }}
                >
                  {label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </Drawer>

      {/* Spacer */}
      <div className="h-20" />

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
        .mobile-menu-drawer .ant-drawer-content {
          background: ${colors.background.primary};
        }
        .mobile-menu-drawer .ant-drawer-body {
          padding: 0;
        }
      `}</style>
    </>
  );
}
