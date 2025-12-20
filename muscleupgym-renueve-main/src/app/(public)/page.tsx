'use client';

import Link from 'next/link';
import { Button } from 'antd';
import { ArrowRightOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { colors } from '@/theme';
import Intro from '@/components/home/Intro';
import Testimonials from '@/components/home/Testimonials';
import Gallery from '@/components/home/Gallery';
import InfoTabsV2 from '@/components/sections/InfoTabsV2';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section con Video */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Video de fondo */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.5)' }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        {/* Overlay gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"
          style={{ zIndex: 1 }}
        />

        {/* Contenido del Hero */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-5xl space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/50 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium" style={{ color: colors.brand.primary }}>
                Tu gimnasio de confianza
              </span>
            </div>

            {/* Título Principal */}
            <h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight"
              style={{ color: colors.text.primary }}
            >
              Transforma tu cuerpo,{' '}
              <span style={{ color: colors.brand.primary }}>
                transforma tu vida
              </span>
            </h1>

            {/* Subtítulo */}
            <p 
              className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
              style={{ color: colors.text.secondary }}
            >
              Alcanza tus metas fitness con el mejor equipo, entrenadores certificados 
              y una comunidad que te impulsa a dar lo mejor de ti cada día.
            </p>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/register">
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                  style={{
                    height: 56,
                    fontSize: 18,
                    paddingLeft: 32,
                    paddingRight: 32,
                    fontWeight: 600,
                  }}
                >
                  Comienza Ahora
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="large"
                  icon={<PlayCircleOutlined />}
                  style={{
                    height: 56,
                    fontSize: 18,
                    paddingLeft: 32,
                    paddingRight: 32,
                    fontWeight: 600,
                    background: 'transparent',
                    borderColor: colors.border.primary,
                    color: colors.text.primary,
                  }}
                >
                  Ver Planes
                </Button>
              </Link>
            </div>

            {/* Stats rápidas */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
              <div className="space-y-2">
                <div 
                  className="text-4xl md:text-5xl font-bold"
                  style={{ color: colors.brand.primary }}
                >
                  5+
                </div>
                <div 
                  className="text-sm md:text-base"
                  style={{ color: colors.text.muted }}
                >
                  Años de experiencia
                </div>
              </div>
              <div className="space-y-2">
                <div 
                  className="text-4xl md:text-5xl font-bold"
                  style={{ color: colors.brand.primary }}
                >
                  1000+
                </div>
                <div 
                  className="text-sm md:text-base"
                  style={{ color: colors.text.muted }}
                >
                  Miembros activos
                </div>
              </div>
              <div className="space-y-2">
                <div 
                  className="text-4xl md:text-5xl font-bold"
                  style={{ color: colors.brand.primary }}
                >
                  24/7
                </div>
                <div 
                  className="text-sm md:text-base"
                  style={{ color: colors.text.muted }}
                >
                  Acceso al gym
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <div 
              className="text-sm"
              style={{ color: colors.text.muted }}
            >
              Descubre más
            </div>
            <div 
              className="w-6 h-10 rounded-full border-2 flex items-start justify-center p-2"
              style={{ borderColor: colors.border.primary }}
            >
              <div 
                className="w-1 h-2 rounded-full"
                style={{ backgroundColor: colors.brand.primary }}
              />
            </div>
          </div>
        </div>
      </section>

      <Intro />
      <Testimonials />
      <Gallery />
      <InfoTabsV2 />
    </main>
  );
}
