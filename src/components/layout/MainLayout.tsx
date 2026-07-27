"use client";

import { Layout } from "antd";
import Header from "./Header";
import Footer from "./Footer";

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header />
      <Content style={{ flex: 1 }}>{children}</Content>
      <Footer />
    </Layout>
  );
}
