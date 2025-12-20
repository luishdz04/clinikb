'use client';
import React from 'react';
import { Carousel, Card, Typography, Space, Avatar } from 'antd';
import { StarFilled, UserOutlined } from '@ant-design/icons';
import { colors } from '@/theme';

const { Title, Paragraph, Text } = Typography;

const testimonials = [
  {
    id: 1,
    quote:
      'Haberme integrado a Muscle Up GYM ha sido una de las mejores experiencias que he disfrutado, cambió considerablemente mi vida, el bajar de peso y talla de una manera ordenada y progresiva, me ha permitido ahora gozar de una buena salud y mi estado de ánimo está excelente. Lo recomiendo ampliamente.',
    author: 'Juanita Guadalupe Lara',
    role: 'Usuario MUP',
    avatar: '/images/logocircular.png',
    stars: 5,
  },
  {
    id: 2,
    quote:
      'Ha sido una de mis mejores experiencias el haberme integrado a Muscle Up GYM en San Buenaventura.',
    author: 'Marco Villarreal',
    role: 'Usuario MUP',
    avatar: '/images/logocircular.png',
    stars: 5,
  },
  {
    id: 3,
    quote:
      'Cuando inicié mi proyecto de entrenamiento y salud, se me hacía imposible, algo de temor e incertidumbre; todo esto desapareció.',
    author: 'Oromi Arce',
    role: 'Usuario MUP',
    avatar: '/images/logocircular.png',
    stars: 5,
  },
];

const Stars = ({ count }: { count: number }) => {
  return (
    <Space size="small">
      {Array.from({ length: count }).map((_, i) => (
        <StarFilled 
          key={i} 
          style={{ 
            color: colors.brand.primary,
            fontSize: '20px'
          }} 
        />
      ))}
    </Space>
  );
};

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => {
  return (
    <div className="px-4 py-8">
      <Card
        style={{
          backgroundColor: colors.background.secondary,
          border: `1px solid ${colors.border.primary}`,
          borderRadius: '24px',
          maxWidth: '800px',
          margin: '0 auto',
        }}
        styles={{ body: { padding: '40px' } }}
      >
        <div className="flex flex-col items-center text-center gap-6">
          <Stars count={testimonial.stars} />
          
          <Paragraph
            style={{
              color: colors.text.primary,
              fontSize: '1.125rem',
              fontStyle: 'italic',
              marginBottom: 0
            }}
          >
            "{testimonial.quote}"
          </Paragraph>

          <Space size="middle" align="center">
            <Avatar 
                size={64} 
                src={testimonial.avatar} 
                icon={<UserOutlined />}
                style={{ backgroundColor: colors.background.elevated }}
            />
            <div className="text-left">
              <Text strong style={{ color: colors.brand.primary, display: 'block', fontSize: '1.1rem' }}>
                {testimonial.author}
              </Text>
              <Text style={{ color: colors.text.muted }}>
                {testimonial.role}
              </Text>
            </div>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default function Testimonials() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Title level={2} style={{ color: 'white', marginBottom: '1rem' }}>
            Testimonios <span style={{ color: colors.brand.primary }}>MUP</span>
          </Title>
          <div className="h-1 w-24 bg-primary mx-auto rounded-full" style={{ backgroundColor: colors.brand.primary }} />
        </div>

        <Carousel autoplay effect="fade" dots={{ className: 'custom-dots' }}>
          {testimonials.map((testimonial) => (
            <div key={testimonial.id}>
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
