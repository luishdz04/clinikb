"use client";

import { Layout, Menu, Button, Space, Dropdown } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

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
    key: "about",
    icon: <UserOutlined />,
    label: <Link href="/nosotros">Nosotros</Link>,
  },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const pathToKey: Record<string, string> = useMemo(
    () => ({ "/": "home", "/servicios": "services", "/nosotros": "about" }),
    []
  );
  const keyToPath: Record<string, string> = useMemo(
    () => ({ home: "/", services: "/servicios", about: "/nosotros" }),
    []
  );

  const [current, setCurrent] = useState(pathToKey[pathname] ?? "home");

  useEffect(() => {
    setCurrent(pathToKey[pathname] ?? "home");
  }, [pathname, pathToKey]);

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
        onClick={(e) => {
          setCurrent(e.key);
          const path = keyToPath[e.key as keyof typeof keyToPath];
          if (path) router.push(path);
        }}
        items={menuItems}
        className="hidden flex-1 justify-center border-none bg-transparent lg:flex"
        style={{ minWidth: 0, flex: "auto", justifyContent: "center" }}
      />

      {/* Actions */}
      <Space className="hidden lg:flex">
        <Link href="/registro">
          <Button type="primary" size="large">
            Agendar Cita
          </Button>
        </Link>
      </Space>

      {/* Mobile Menu */}
      <Dropdown
        menu={{
          items: menuItems,
          onClick: (e) => {
            setCurrent(e.key);
            const path = keyToPath[e.key as keyof typeof keyToPath];
            if (path) router.push(path);
          },
        }}
        trigger={["click"]}
        className="lg:hidden"
      >
        <Button type="text" icon={<MenuOutlined className="text-xl" />} />
      </Dropdown>
    </header>
  );
}
