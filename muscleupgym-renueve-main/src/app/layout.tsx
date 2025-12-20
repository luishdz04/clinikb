import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntdProvider } from '@/components/providers/AntdProvider';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://muscleupgym.fitness'),
  title: 'MuscleUp Gym - Tu gimnasio de confianza',
  description: 'MuscleUp Gym - Transforma tu cuerpo, transforma tu vida. El mejor gimnasio para alcanzar tus metas fitness.',
  keywords: ['gimnasio', 'fitness', 'entrenamiento', 'muscle up', 'gym'],
  icons: {
    icon: [
      { url: '/images/logocircular.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/logocircular.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/images/logocircular.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/images/logocircular.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'MuscleUp Gym - Tu gimnasio de confianza',
    description: 'Transforma tu cuerpo, transforma tu vida. El mejor gimnasio para alcanzar tus metas fitness.',
    type: 'website',
    locale: 'es_MX',
    images: [
      {
        url: '/images/logocircular.png',
        width: 800,
        height: 800,
        alt: 'MuscleUp Gym Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'MuscleUp Gym - Tu gimnasio de confianza',
    description: 'Transforma tu cuerpo, transforma tu vida.',
    images: ['/images/logocircular.png'],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" type="image/png" href="/images/logocircular.png" />
        <link rel="apple-touch-icon" href="/images/logocircular.png" />
      </head>
      <body className="antialiased">
        <AntdRegistry>
          <AntdProvider>
            {children}
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
