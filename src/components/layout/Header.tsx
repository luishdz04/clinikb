"use client";

import { Layout, Menu, Button, Space, Dropdown } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  MenuOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const menuItems = [
  {
    key: "home",
    icon: <HomeOutlined />,
    label: <Link href="/">Inicio</Link>,
  },
  {
    key: "services",
    icon: <MedicineBoxOutlined />,
    label: <Link href="/servicios">Servicios</Link>,
  },
  {
    key: "appointments",
    icon: <CalendarOutlined />,
    label: <Link href="/citas">Citas</Link>,
  },
  {
    key: "about",
    icon: <UserOutlined />,
    label: <Link href="/nosotros">Nosotros</Link>,
  },
];

export default function Header() {
  const [current, setCurrent] = useState("home");

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-4 py-2 shadow-sm lg:px-8">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Image
          src="/images/logo/clinikb.png"
          alt="CliniKB Logo"
          width={50}
          height={50}
          priority
          className="rounded-full"
        />
      </Link>

      {/* Menu Desktop */}
      <Menu
        mode="horizontal"
        selectedKeys={[current]}
        onClick={(e) => setCurrent(e.key)}
        items={menuItems}
        className="hidden flex-1 justify-center border-none bg-transparent lg:flex"
        style={{ minWidth: 0, flex: "auto", justifyContent: "center" }}
      />

      {/* Actions */}
      <Space className="hidden lg:flex">
        <Button type="default" icon={<LoginOutlined />}>
          Iniciar Sesión
        </Button>
        <Button type="primary">
          Agendar Cita
        </Button>
      </Space>

      {/* Mobile Menu */}
      <Dropdown
        menu={{ items: menuItems, onClick: (e) => setCurrent(e.key) }}
        trigger={["click"]}
        className="lg:hidden"
      >
        <Button type="text" icon={<MenuOutlined className="text-xl" />} />
      </Dropdown>
    </header>
  );
}
