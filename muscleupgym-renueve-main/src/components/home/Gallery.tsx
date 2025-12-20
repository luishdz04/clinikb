'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Carousel, Typography } from 'antd';
import Image from 'next/image';
import { colors } from '@/theme';
import { EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;

const images = [
  {
    id: 1,
    src: '/images/1.jpg',
    alt: 'Área de entrenamiento principal'
  },
  {
    id: 2,
    src: '/images/2.jpg',
    alt: 'Área cardiovascular moderna'
  },
  {
    id: 3,
    src: '/images/3.jpg',
    alt: 'Espacio de entrenamiento funcional'
  },
  {
    id: 4,
    src: '/images/4.jpg',
    alt: 'Recepción y área de descanso'
  },
  {
    id: 5,
    src: '/images/5.jpg',
    alt: 'Instalaciones del gimnasio'
  },
  {
    id: 6,
    src: '/images/6.jpg',
    alt: 'Zona de entrenamiento'
  },
  {
    id: 7,
    src: '/images/7.jpg',
    alt: 'Equipamiento especializado'
  },
  {
    id: 8,
    src: '/images/8.jpg',
    alt: 'Espacio de gimnasio'
  },
];

export default function Gallery() {
  const [scrollY, setScrollY] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const parallaxOffset = scrollY * 0.3;

  return (
    <section 
      ref={sectionRef}
      className="py-20 relative overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, ${colors.background.primary}, ${colors.background.secondary})`,
      }}
    >
      {/* Animated background pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, ${colors.brand.primary} 1px, transparent 1px),
                           radial-gradient(circle at 80% 80%, ${colors.brand.primary} 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          transform: `translateY(${parallaxOffset}px)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header with stagger animation */}
        <div 
          className="text-center mb-16"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Title 
            level={2} 
            style={{ 
              color: 'white', 
              marginBottom: '1rem',
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 'bold',
            }}
          >
            Nuestras <span style={{ color: colors.brand.primary }}>instalaciones</span>
          </Title>
          <div 
            className="h-1 w-24 mx-auto rounded-full relative"
            style={{ 
              backgroundColor: colors.brand.primary,
              boxShadow: `0 0 20px ${colors.brand.primary}80`,
            }}
          >
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{ backgroundColor: colors.brand.primary }}
            />
          </div>
          <p 
            className="mt-4 text-gray-400 max-w-2xl mx-auto"
            style={{ fontSize: 'clamp(16px, 2vw, 18px)' }}
          >
            Espacios diseñados para maximizar tu rendimiento
          </p>
        </div>

        {/* Enhanced Carousel */}
        <div
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0)' : 'translateY(50px)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
          }}
        >
          <Carousel 
            autoplay 
            effect="scrollx" 
            slidesToShow={1} 
            dots
            dotPlacement="bottom"
            className="gallery-carousel"
          >
            {images.map((image, index) => (
              <div key={image.id} className="px-2">
                <div 
                  className="gallery-item-wrapper"
                  style={{
                    position: 'relative',
                    height: '600px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: `0 20px 60px -10px ${colors.background.primary}`,
                  }}
                >
                  {/* Main Image with Parallax */}
                  <div 
                    className="image-container"
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      transform: `scale(1.1) translateY(${parallaxOffset * 0.05}px)`,
                      transition: 'transform 0.5s ease-out',
                    }}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>

                  {/* Gradient Overlays */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to top, 
                        ${colors.background.primary}E6 0%, 
                        transparent 40%, 
                        ${colors.background.primary}40 100%)`,
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Hover Effects Container */}
                  <div 
                    className="hover-effects"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                    }}
                  >
                    {/* Shimmer effect on hover */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(90deg, 
                          transparent, 
                          ${colors.brand.primary}40, 
                          transparent)`,
                        animation: 'shimmer 2s infinite',
                      }}
                    />

                    {/* Center Icon */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: `${colors.brand.primary}20`,
                        backdropFilter: 'blur(10px)',
                        border: `2px solid ${colors.brand.primary}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 30px ${colors.brand.primary}60`,
                      }}
                    >
                      <EyeOutlined style={{ fontSize: '32px', color: colors.brand.primary }} />
                    </div>
                  </div>

                  {/* Image Counter */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '24px',
                      right: '24px',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      backgroundColor: `${colors.background.primary}CC`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${colors.border.light}`,
                      color: colors.brand.primary,
                      fontSize: '14px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    {index + 1} / {images.length}
                  </div>

                  {/* Bottom Info */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '32px',
                      transform: 'translateY(0)',
                      transition: 'transform 0.4s ease',
                    }}
                  >
                    <h3
                      style={{
                        color: 'white',
                        fontSize: 'clamp(20px, 3vw, 28px)',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                      }}
                    >
                      {image.alt}
                    </h3>
                    <div
                      style={{
                        width: '60px',
                        height: '3px',
                        backgroundColor: colors.brand.primary,
                        borderRadius: '2px',
                        boxShadow: `0 0 10px ${colors.brand.primary}`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }

        .gallery-item-wrapper:hover .hover-effects {
          opacity: 1;
        }

        .gallery-item-wrapper:hover .image-container {
          transform: scale(1.15) translateY(${parallaxOffset * 0.05}px);
        }

        :global(.gallery-carousel .slick-dots li button) {
          background: ${colors.brand.primary}40 !important;
          width: 12px !important;
          height: 12px !important;
          border-radius: 50% !important;
        }

        :global(.gallery-carousel .slick-dots li.slick-active button) {
          background: ${colors.brand.primary} !important;
          width: 32px !important;
          border-radius: 6px !important;
        }

        :global(.gallery-carousel .slick-dots) {
          bottom: -50px !important;
        }
      `}</style>
    </section>
  );
}
