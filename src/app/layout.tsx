import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, App } from "antd";
import { Geist, Geist_Mono } from "next/font/google";
import theme, { rootCssVariables } from "@/theme/themeConfig";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CliniKB",
  description: "Sistema de gestión clínica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Variables CSS de marca, derivadas de src/theme/themeConfig.ts */}
        <style dangerouslySetInnerHTML={{ __html: rootCssVariables }} />

        {/*
          Material Symbols. No está en el índice de next/font/google, así que no
          puede auto-hospedarse con next/font y se carga desde Google.
          `icon_names` pide solo los glifos usados: al añadir un icono nuevo hay
          que agregarlo a esa lista o no se renderizará.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=self_improvement&display=block"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            <App>
              {children}
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
