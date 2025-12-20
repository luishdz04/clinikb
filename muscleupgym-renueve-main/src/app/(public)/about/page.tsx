'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Typography, Button, Row, Col, Card, Space, Divider, Statistic } from 'antd';
import { motion } from 'framer-motion';
import {
  ArrowLeftOutlined,
  AimOutlined,
  EyeOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  TeamOutlined,
  TrophyOutlined,
  BulbOutlined,
  FireOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { colorTokens } from '@/styles/antd-theme-tokens';

const { Title, Paragraph, Text } = Typography;

interface Valor {
  nombre: string;
  icono: React.ReactNode;
}

const valores: Valor[] = [
  { nombre: 'Sacrificio', icono: <FireOutlined /> },
  { nombre: 'Esfuerzo', icono: <ThunderboltOutlined /> },
  { nombre: 'Superación', icono: <TrophyOutlined /> },
  { nombre: 'Voluntad', icono: <BulbOutlined /> },
  { nombre: 'Paciencia', icono: <HeartOutlined /> },
  { nombre: 'Honestidad', icono: <SafetyOutlined /> },
  { nombre: 'Responsabilidad', icono: <TeamOutlined /> },
  { nombre: 'Perseverancia', icono: <FireOutlined /> },
  { nombre: 'Humildad', icono: <TeamOutlined /> },
  { nombre: 'Trabajo en equipo', icono: <TeamOutlined /> },
  { nombre: 'Convivencia', icono: <TeamOutlined /> },
  { nombre: 'Respeto', icono: <HeartOutlined /> },
];

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-black text-white pt-20 pb-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Header con efecto */}
        <motion.div variants={itemVariants} className="text-center mb-20 relative">
          {/* Glow effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
          
          <Title 
            level={1} 
            style={{ 
              color: colorTokens.primary, 
              fontSize: 'clamp(2.5rem, 6vw, 5rem)', 
              marginBottom: '1rem',
              fontWeight: 800,
              letterSpacing: '-0.02em'
            }}
          >
            Sobre Nosotros
          </Title>
          <Paragraph style={{ 
            color: colorTokens.textSecondary, 
            fontSize: '1.3rem', 
            maxWidth: '900px', 
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Más que un gimnasio, somos una comunidad dedicada a transformar vidas a través del fitness y el bienestar integral en <span style={{ color: colorTokens.primary, fontWeight: 600 }}>San Buenaventura, Coahuila</span>.
          </Paragraph>
        </motion.div>

        {/* Estadísticas destacadas */}
        <motion.div variants={itemVariants} className="mb-24">
          <Row gutter={[32, 32]} justify="center">
            {[
              { value: '200+', label: 'Usuarios Satisfechos', icon: <UserOutlined /> },
              { value: '5+', label: 'Años de Experiencia', icon: <TrophyOutlined /> },
              { value: '100%', label: 'Compromiso', icon: <HeartOutlined /> }
            ].map((stat, idx) => (
              <Col xs={12} md={8} key={idx}>
                <Card
                  className="bg-zinc-900/50 border-zinc-800 hover:border-primary transition-all duration-300 text-center"
                  styles={{ body: { padding: '2rem 1rem' } }}
                >
                  <div className="text-4xl text-primary mb-3">{stat.icon}</div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-zinc-400">{stat.label}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </motion.div>

        {/* Misión y Visión */}
        <motion.div variants={itemVariants}>
          <Row gutter={[48, 48]} className="mb-24">
            <Col xs={24} md={12}>
              <motion.div whileHover={{ scale: 1.02, y: -5 }} transition={{ duration: 0.3 }}>
                <Card 
                  className="h-full bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-primary transition-all duration-300 overflow-hidden relative"
                  styles={{ body: { padding: '3rem 2rem' } }}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                  <div className="flex flex-col items-center text-center relative z-10">
                    <motion.div
                      className="bg-primary/10 p-5 rounded-2xl mb-6 border border-primary/20"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AimOutlined style={{ fontSize: '3.5rem', color: colorTokens.primary }} />
                    </motion.div>
                    <Title level={2} style={{ color: 'white', marginBottom: '1.5rem', fontSize: '2rem' }}>
                      Nuestra Misión
                    </Title>
                    <Paragraph style={{ color: colorTokens.textSecondary, fontSize: '1.15rem', lineHeight: 1.8 }}>
                      Transformar vidas a través del fitness, brindando un espacio motivador donde cada persona pueda alcanzar su mejor versión física y mental con equipamiento de calidad y asesoría profesional.
                    </Paragraph>
                  </div>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={12}>
              <motion.div whileHover={{ scale: 1.02, y: -5 }} transition={{ duration: 0.3 }}>
                <Card 
                  className="h-full bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-primary transition-all duration-300 overflow-hidden relative"
                  styles={{ body: { padding: '3rem 2rem' } }}
                >
                  <div className="absolute top-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                  <div className="flex flex-col items-center text-center relative z-10">
                    <motion.div
                      className="bg-primary/10 p-5 rounded-2xl mb-6 border border-primary/20"
                      whileHover={{ rotate: -5, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EyeOutlined style={{ fontSize: '3.5rem', color: colorTokens.primary }} />
                    </motion.div>
                    <Title level={2} style={{ color: 'white', marginBottom: '1.5rem', fontSize: '2rem' }}>
                      Nuestra Visión
                    </Title>
                    <Paragraph style={{ color: colorTokens.textSecondary, fontSize: '1.15rem', lineHeight: 1.8 }}>
                      Ser reconocidos como el gimnasio líder en transformación integral en Coahuila, creando una comunidad vibrante de personas saludables, fuertes y felices.
                    </Paragraph>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* Valores */}
        <motion.div variants={itemVariants} className="mb-24">
          <div className="text-center mb-12">
            <Title level={2} style={{ 
              color: 'white', 
              marginBottom: '1rem',
              fontSize: '2.5rem',
              fontWeight: 700
            }}>
              Nuestros <span style={{ color: colorTokens.primary }}>Valores</span>
            </Title>
            <Paragraph style={{ color: colorTokens.textSecondary, fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto 3rem' }}>
              Los principios que nos guían cada día para ofrecerte la mejor experiencia
            </Paragraph>
            
            <Row gutter={[24, 24]}>
              {valores.map((valor, index) => (
                <Col xs={12} sm={8} md={6} lg={4} key={index}>
                  <motion.div
                    whileHover={{ 
                      scale: 1.05,
                      y: -8,
                      boxShadow: `0 20px 40px ${colorTokens.primary}40`
                    }}
                    transition={{ duration: 0.3 }}
                    className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:border-primary transition-all duration-300 h-full flex flex-col items-center justify-center gap-4 group cursor-pointer"
                  >
                    <div className="text-4xl text-primary group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                      {valor.icono}
                    </div>
                    <Text strong style={{ color: 'white', fontSize: '1rem', textAlign: 'center' }}>
                      {valor.nombre}
                    </Text>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        </motion.div>

        {/* Historia */}
        <motion.div variants={itemVariants} className="mb-24">
          <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black rounded-3xl border-2 border-zinc-800 overflow-hidden">
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} md={12}>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-12 bg-primary rounded-full" />
                    <Title level={2} style={{ color: colorTokens.primary, margin: 0, fontSize: '2.2rem' }}>
                      Nuestra Historia
                    </Title>
                  </div>
                  <Paragraph style={{ color: colorTokens.textSecondary, fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                    Muscle Up GYM nació con el sueño de crear un espacio diferente en <strong style={{ color: 'white' }}>San Buenaventura, Coahuila</strong>. Un lugar donde el entrenamiento de calidad se combina con un ambiente familiar y de apoyo mutuo.
                  </Paragraph>
                  <Paragraph style={{ color: colorTokens.textSecondary, fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                    Desde nuestros inicios, nos hemos enfocado en ofrecer el mejor equipamiento y la asesoría más profesional, porque creemos que tu salud merece lo mejor.
                  </Paragraph>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2 rounded-lg">
                      <CheckCircleOutlined style={{ color: colorTokens.primary, fontSize: '1.5rem' }} />
                      <span style={{ color: 'white', fontSize: '1rem' }}>Equipamiento moderno</span>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2 rounded-lg">
                      <CheckCircleOutlined style={{ color: colorTokens.primary, fontSize: '1.5rem' }} />
                      <span style={{ color: 'white', fontSize: '1rem' }}>Ambiente familiar</span>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2 rounded-lg">
                      <CheckCircleOutlined style={{ color: colorTokens.primary, fontSize: '1.5rem' }} />
                      <span style={{ color: 'white', fontSize: '1rem' }}>Asesoría profesional</span>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="relative h-[400px] w-full rounded-2xl overflow-hidden border-2 border-zinc-700">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/videos/hero.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
              </Col>
            </Row>
          </Card>
        </motion.div>

        {/* Equipo - Liderazgo */}
        <motion.div variants={itemVariants} className="mb-24">
          <div className="text-center mb-12">
            <Title level={2} style={{ 
              color: 'white', 
              marginBottom: '1rem',
              fontSize: '2.5rem',
              fontWeight: 700
            }}>
              Nuestro <span style={{ color: colorTokens.primary }}>Liderazgo</span>
            </Title>
            <Paragraph style={{ color: colorTokens.textSecondary, fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto 3rem' }}>
              Profesionales comprometidos con tu éxito
            </Paragraph>
          </div>

          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={12} md={8}>
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="bg-zinc-900 border-2 border-zinc-800 hover:border-primary transition-all duration-300 overflow-hidden"
                  styles={{ body: { padding: 0 } }}
                >
                  <div className="relative h-80 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-end justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                    <Image
                      src="/images/profesional/erick-no-bg.png"
                      alt="Erick Francisco De Luna Hernández"
                      width={280}
                      height={320}
                      className="relative z-0 object-contain"
                      style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))', width: 'auto', height: 'auto' }}
                    />
                  </div>
                  <div className="p-6 text-center">
                    <Title level={4} style={{ color: 'white', marginBottom: '0.5rem' }}>
                      Erick Francisco De Luna Hernández
                    </Title>
                    <Text style={{ color: colorTokens.primary, fontSize: '1rem', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>
                      Cofundador
                    </Text>
                    <div className="mb-3">
                      <Text style={{ color: colorTokens.textSecondary, fontSize: '0.9rem', display: 'block' }}>
                        Lic. Ciencias del Ejercicio
                      </Text>
                      <Text style={{ color: colorTokens.textSecondary, fontSize: '0.9rem', display: 'block' }}>
                        MSc. Fuerza y Acondicionamiento
                      </Text>
                    </div>
                    <div className="flex gap-2 justify-center flex-wrap">
                      <div className="bg-zinc-800 px-3 py-1 rounded-full">
                        <Text style={{ color: colorTokens.primary, fontSize: '0.85rem' }}>
                          7+ años experiencia
                        </Text>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* Call to Action Final */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-primary to-yellow-500 border-0 text-center rounded-3xl overflow-hidden">
            <div className="py-12 px-6">
              <StarOutlined style={{ fontSize: '4rem', color: 'white', marginBottom: '1.5rem' }} />
              <Title level={2} style={{ color: 'white', marginBottom: '1rem', fontSize: '2.5rem' }}>
                ¡Únete a Nuestra Comunidad!
              </Title>
              <Paragraph style={{ color: 'white', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem', opacity: 0.95 }}>
                Comienza tu transformación hoy y forma parte de algo más grande
              </Paragraph>
              <Space size="large" wrap>
                <Link href="/registro">
                  <Button 
                    type="primary" 
                    size="large"
                    style={{ 
                      background: 'white', 
                      color: colorTokens.primary, 
                      borderColor: 'white',
                      height: '50px',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      padding: '0 2.5rem'
                    }}
                    icon={<RocketOutlined />}
                  >
                    Registrarse Ahora
                  </Button>
                </Link>
                <Link href="/">
                  <Button 
                    size="large"
                    style={{ 
                      background: 'transparent', 
                      color: 'white', 
                      borderColor: 'white',
                      height: '50px',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      padding: '0 2.5rem'
                    }}
                  >
                    Conocer Más
                  </Button>
                </Link>
              </Space>
            </div>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}
