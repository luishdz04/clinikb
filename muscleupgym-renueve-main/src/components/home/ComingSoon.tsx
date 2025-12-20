'use client';
import { useState, useEffect, useRef } from 'react';
import { Typography, Button } from 'antd';
import { RocketOutlined, ThunderboltOutlined, StarOutlined } from '@ant-design/icons';
import { colors } from '@/theme';

const { Title, Paragraph } = Typography;

export default function ComingSoon() {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.background.primary} 0%, ${colors.background.secondary} 50%, ${colors.background.primary} 100%)`,
      }}
    >
      {/* Animated Grid Background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${colors.border.light} 1px, transparent 1px),
                           linear-gradient(90deg, ${colors.border.light} 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
          opacity: 0.1,
          animation: 'gridMove 20s linear infinite',
        }}
      />

      {/* Gradient Orbs */}
      <div
        className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: `radial-gradient(circle, ${colors.brand.primary} 0%, transparent 70%)`,
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: `radial-gradient(circle, ${colors.brand.primary} 0%, transparent 70%)`,
          animation: 'float 8s ease-in-out infinite 4s',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center">
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '50px',
              backgroundColor: `${colors.brand.primary}20`,
              border: `2px solid ${colors.brand.primary}`,
              marginBottom: '32px',
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <ThunderboltOutlined 
              style={{ 
                color: colors.brand.primary, 
                fontSize: '20px',
                animation: 'pulse 2s infinite',
              }} 
            />
            <span
              style={{
                color: colors.brand.primary,
                fontWeight: 'bold',
                fontSize: '16px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Próximamente
            </span>
          </div>

          {/* Main Title */}
          <Title
            level={1}
            style={{
              color: 'white',
              marginBottom: '24px',
              fontSize: 'clamp(36px, 6vw, 72px)',
              fontWeight: 'bold',
              lineHeight: 1.1,
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
            }}
          >
            Segunda Planta
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${colors.brand.primary} 0%, ${colors.brand.light} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Nivel Superior
            </span>
          </Title>

          {/* Description */}
          <Paragraph
            style={{
              color: colors.text.secondary,
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              maxWidth: '700px',
              margin: '0 auto 48px',
              lineHeight: 1.6,
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s',
            }}
          >
            Estamos expandiendo nuestras instalaciones para ofrecerte más espacio,
            más equipamiento y más oportunidades de alcanzar tus metas.
          </Paragraph>

          {/* Features Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s',
            }}
          >
            {[
              {
                icon: <RocketOutlined />,
                title: 'Más Espacio',
                description: 'Áreas ampliadas para tu comodidad',
              },
              {
                icon: <ThunderboltOutlined />,
                title: 'Nuevo Equipo',
                description: 'Tecnología de última generación',
              },
              {
                icon: <StarOutlined />,
                title: 'Mejor Experiencia',
                description: 'Instalaciones renovadas y modernas',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="feature-card"
                style={{
                  padding: '32px',
                  borderRadius: '20px',
                  backgroundColor: `${colors.background.elevated}80`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${colors.border.light}`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.borderColor = colors.brand.primary;
                  e.currentTarget.style.boxShadow = `0 20px 60px ${colors.brand.primary}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = colors.border.light;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Glow effect */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: `radial-gradient(circle, ${colors.brand.primary}20 0%, transparent 70%)`,
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: 'none',
                  }}
                  className="glow-effect"
                />

                <div
                  style={{
                    fontSize: '48px',
                    color: colors.brand.primary,
                    marginBottom: '16px',
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: colors.text.secondary,
                    fontSize: '16px',
                    margin: 0,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.8s',
            }}
          >
            <Button
              size="large"
              style={{
                height: '60px',
                padding: '0 48px',
                fontSize: '18px',
                fontWeight: 'bold',
                borderRadius: '30px',
                backgroundColor: colors.brand.primary,
                borderColor: colors.brand.primary,
                color: colors.background.primary,
                boxShadow: `0 10px 40px ${colors.brand.primary}40`,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 15px 50px ${colors.brand.primary}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 10px 40px ${colors.brand.primary}40`;
              }}
            >
              Mantente Informado
            </Button>
            <p
              style={{
                marginTop: '16px',
                color: colors.text.muted,
                fontSize: '14px',
              }}
            >
              Síguenos en redes sociales para conocer todos los detalles
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.1);
          }
        }

        @keyframes gridMove {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        .feature-card:hover .glow-effect {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  );
}
