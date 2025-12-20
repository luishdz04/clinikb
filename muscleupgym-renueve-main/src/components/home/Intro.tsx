'use client';
import React, { useState, useEffect } from 'react';
import { Card, Typography, Space } from 'antd';
import { introCards } from '@/data/introCards';
import { colors } from '@/theme';

const { Title, Paragraph } = Typography;

// Componente para el contador animado simple
const Counter = ({ 
  value, 
  prefix = '', 
  suffix = '', 
  title 
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  title?: string;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000; // Duración de la animación
    const stepTime = Math.abs(Math.floor(duration / end));
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) {
        clearInterval(timer);
        // Pausa de 3 segundos en el valor final antes de reiniciar
        setTimeout(() => {
          setCount(0);
        }, 3000);
      }
    }, stepTime > 0 ? stepTime : 10);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div style={{ marginTop: '32px', textAlign: 'center' }}>
      <div
        style={{
          color: colors.brand.primary,
          fontSize: 'clamp(32px, 4vw, 48px)',
          fontWeight: 'bold',
          lineHeight: 1
        }}
      >
        {prefix}{count}{suffix}
      </div>
      {title && (
        <Paragraph
          style={{
            color: colors.text.secondary,
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            marginTop: '8px',
            marginBottom: 0
          }}
        >
          {title}
        </Paragraph>
      )}
    </div>
  );
};

const IntroCard = ({ card }: { card: typeof introCards[0] }) => {
  const getAlignment = () => {
    if (card.align === 'right') return 'flex-end';
    if (card.align === 'center') return 'center';
    return 'flex-start';
  };

  const getTextAlign = () => {
    if (card.align === 'right') return 'right';
    if (card.align === 'center') return 'center';
    return 'left';
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: 'clamp(500px, 70vh, 700px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: getAlignment(),
        padding: 'clamp(40px, 6vw, 80px) 24px',
        backgroundImage: `url(${card.img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        overflow: 'hidden'
      }}
    >
      {/* Overlay con gradiente */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)`,
          zIndex: 0
        }}
      />

      {/* Contenido */}
      <Card
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 'clamp(280px, 60vw, 450px)',
          width: '100%',
          backgroundColor: `${colors.background.secondary}CC`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.border.primary}`,
          borderRadius: '16px',
          padding: 'clamp(24px, 4vw, 40px)',
          textAlign: getTextAlign() as any
        }}
      >
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <Title
            level={2}
            style={{
              color: colors.text.primary,
              marginBottom: '16px',
              fontSize: 'clamp(24px, 3vw, 36px)',
              fontWeight: 'bold'
            }}
          >
            {card.title}
          </Title>

          <div
            style={{
              width: card.align === 'center' ? '80px' : '60px',
              height: '3px',
              backgroundColor: colors.brand.primary,
              margin: card.align === 'center' ? '0 auto 24px auto' : 
                      card.align === 'right' ? '0 0 24px auto' : '0 0 24px 0',
              borderRadius: '2px'
            }}
          />

          <Paragraph
            style={{
              color: colors.text.primary,
              fontSize: 'clamp(16px, 2vw, 18px)',
              lineHeight: 1.6,
              marginBottom: 0
            }}
          >
            {card.text}
          </Paragraph>

          {card.counter && (
            <Counter
              value={card.counter.value}
              prefix={card.counter.prefix}
              suffix={card.counter.suffix}
              title={card.counter.title}
            />
          )}
        </Space>
      </Card>
    </div>
  );
};

export default function Intro() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      {introCards.map((card) => (
        <IntroCard key={card.id} card={card} />
      ))}
    </section>
  );
}
