'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, Row, Col, Typography, Divider, Button, Space, Tag } from 'antd';
import {
  DollarOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  FireOutlined,
  WhatsAppOutlined,
  MailOutlined,
  FacebookOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  UserOutlined,
  CrownOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import Image from 'next/image';
import { colors } from '@/theme';

const { Title, Paragraph, Text } = Typography;
const PRIMARY_COLOR = colors.brand.primary;

// Estilos base para cards oscuros
const darkCardStyle = {
  background: colors.background.secondary,
  border: `1px solid ${colors.border.secondary}`,
  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
};

export default function PlanesNutricionPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        minHeight: '100vh',
        paddingTop: '7rem',
        paddingBottom: '2rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        background: colors.background.primary
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Banner de navegación */}
        <motion.div variants={itemVariants}>
          <Card
            style={{
              background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #FFD700 50%, #FFA500 100%)`,
              marginBottom: '2rem',
              border: 'none',
              textAlign: 'center'
            }}
          >
            <Title level={3} style={{ color: colors.text.inverse, margin: 0 }}>
              💪 Planes Profesionales de Nutrición y Entrenamiento
            </Title>
            <Paragraph style={{ color: colors.text.inverse, margin: '0.5rem 0 0 0', fontSize: '1rem' }}>
              Servicios personalizados basados en ciencia y resultados comprobados
            </Paragraph>
          </Card>
        </motion.div>

        {/* Sección Sobre el Profesional */}
        <motion.div variants={itemVariants}>
          {/* Header Section con diseño premium */}
          <div style={{
            position: 'relative',
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              height: '100px',
              background: `radial-gradient(ellipse, ${colors.brand.primary}30 0%, transparent 70%)`,
              filter: 'blur(40px)',
              zIndex: 0
            }}/>
            <Title level={1} style={{ 
              position: 'relative',
              color: colors.brand.primary, 
              marginBottom: '0.5rem',
              fontSize: '3rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              zIndex: 1
            }}>
              Sobre el Profesional
            </Title>
            <Paragraph style={{ 
              position: 'relative',
              color: colors.text.secondary, 
              fontSize: '1.1rem',
              maxWidth: '600px',
              margin: '0 auto',
              zIndex: 1
            }}>
              Líder en ciencias del ejercicio y metodología del entrenamiento
            </Paragraph>
          </div>

          <Card
            style={{
              marginBottom: '3rem',
              background: colors.background.secondary,
              border: `1px solid ${colors.border.secondary}`,
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
          >
            <Row gutter={[48, 48]} align="middle">
              {/* Foto de Erick con diseño premium */}
              <Col xs={24} lg={10}>
                <div style={{ 
                  position: 'relative',
                  textAlign: 'center',
                  padding: '3rem 2rem'
                }}>
                  {/* Círculo decorativo de fondo */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '380px',
                    height: '380px',
                    background: `conic-gradient(from 180deg at 50% 50%, ${colors.brand.primary}00 0deg, ${colors.brand.primary}40 180deg, ${colors.brand.primary}00 360deg)`,
                    borderRadius: '50%',
                    filter: 'blur(30px)',
                    animation: 'rotate 20s linear infinite'
                  }}/>
                  
                  {/* Imagen del profesional */}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <Image
                      src="/images/profesional/erick-no-bg.png"
                      alt="Erick Francisco De Luna Hernández"
                      width={400}
                      height={500}
                      style={{
                        width: '100%',
                        maxWidth: '380px',
                        height: 'auto',
                        filter: `drop-shadow(0 20px 40px ${colors.brand.primary}60)`,
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  </div>

                  {/* Info del profesional */}
                  <div style={{ 
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: `linear-gradient(135deg, ${colors.brand.primary}15 0%, ${colors.brand.primary}05 100%)`,
                    borderRadius: '16px',
                    border: `1px solid ${colors.brand.primary}30`
                  }}>
                    <Title level={2} style={{ 
                      color: colors.brand.primary, 
                      marginBottom: '0.5rem',
                      fontSize: '1.8rem',
                      fontWeight: 700
                    }}>
                      Erick Francisco<br/>De Luna Hernández
                    </Title>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '8px',
                      alignItems: 'center',
                      marginTop: '1rem'
                    }}>
                      <Tag style={{
                        background: colors.brand.primary,
                        color: colors.background.primary,
                        border: 'none',
                        padding: '6px 20px',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        borderRadius: '20px'
                      }}>
                        Lic. Ciencias del Ejercicio
                      </Tag>
                      <Tag style={{
                        background: colors.background.tertiary,
                        color: colors.brand.primary,
                        border: `1px solid ${colors.brand.primary}`,
                        padding: '6px 20px',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        borderRadius: '20px'
                      }}>
                        MSc. Fuerza y Acondicionamiento
                      </Tag>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Credenciales y Experiencia */}
              <Col xs={24} lg={14}>
                <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                  {/* Formación Académica */}
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      marginBottom: '1.5rem',
                      paddingBottom: '1rem',
                      borderBottom: `2px solid ${colors.brand.primary}30`
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: `${colors.brand.primary}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        🎓
                      </div>
                      <Title level={3} style={{ 
                        color: colors.text.primary, 
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: 700
                      }}>
                        Formación Académica
                      </Title>
                    </div>
                    
                    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                      {[
                        { title: 'Licenciado en Ciencias del Ejercicio', inst: 'UANL, México' },
                        { title: 'Máster en Fuerza y Acondicionamiento', inst: 'FSI, España' },
                        { title: '1er Lugar de Generación', inst: 'Ciencias del Ejercicio, UANL' },
                        { title: 'Reconocimiento al Mérito Académico', inst: 'Mejor promedio, UANL' },
                        { title: 'Programa de Desarrollo de Talento Universitario', inst: 'UANL' },
                        { title: 'Beca de movilidad internacional', inst: 'Universidad de Sevilla, España' }
                      ].map((item, idx) => (
                        <div key={idx} style={{
                          padding: '1rem',
                          background: `${colors.background.tertiary}80`,
                          borderRadius: '12px',
                          borderLeft: `4px solid ${colors.brand.primary}`,
                          transition: 'all 0.3s ease'
                        }}>
                          <Text style={{ 
                            color: colors.text.primary, 
                            fontSize: '1.05rem',
                            fontWeight: 600,
                            display: 'block',
                            marginBottom: '4px'
                          }}>
                            {item.title}
                          </Text>
                          <Text style={{ 
                            color: colors.text.secondary, 
                            fontSize: '0.9rem'
                          }}>
                            {item.inst}
                          </Text>
                        </div>
                      ))}
                    </Space>
                  </div>

                  {/* Experiencia Profesional */}
                  <div style={{ marginTop: '2rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      marginBottom: '1.5rem',
                      paddingBottom: '1rem',
                      borderBottom: `2px solid ${colors.brand.primary}30`
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: `${colors.brand.primary}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        💼
                      </div>
                      <Title level={3} style={{ 
                        color: colors.text.primary, 
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: 700
                      }}>
                        Experiencia Profesional
                      </Title>
                    </div>
                    
                    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                      {[
                        { title: 'Cofundador y Encargado del Área de Ciencias del Ejercicio y Metodología del Entrenamiento', inst: 'Muscle Up GYM' },
                        { title: 'Instructor del Laboratorio de Rendimiento Humano', inst: 'UANL' }
                      ].map((item, idx) => (
                        <div key={idx} style={{
                          padding: '1rem',
                          background: `${colors.background.tertiary}80`,
                          borderRadius: '12px',
                          borderLeft: `4px solid ${colors.brand.primary}`,
                          transition: 'all 0.3s ease'
                        }}>
                          <Text style={{ 
                            color: colors.text.primary, 
                            fontSize: '1.05rem',
                            fontWeight: 600,
                            display: 'block',
                            marginBottom: '4px'
                          }}>
                            {item.title}
                          </Text>
                          <Text style={{ 
                            color: colors.text.secondary, 
                            fontSize: '0.9rem'
                          }}>
                            {item.inst}
                          </Text>
                        </div>
                      ))}
                    </Space>
                  </div>
                </Space>
              </Col>
            </Row>

            <Divider style={{ borderColor: colors.border.primary, margin: '3rem 0' }} />

            {/* Sección de Credenciales Visuales */}
            <div style={{ marginBottom: '3rem' }}>
              {/* Certificados Profesionales */}
              <div style={{ marginBottom: '3rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '2rem',
                  paddingBottom: '1rem',
                  borderBottom: `2px solid ${colors.brand.primary}30`
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${colors.brand.primary}30 0%, ${colors.brand.primary}10 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    boxShadow: `0 4px 12px ${colors.brand.primary}20`
                  }}>
                    📜
                  </div>
                  <Title level={3} style={{ 
                    color: colors.brand.primary, 
                    margin: 0,
                    fontSize: '1.8rem',
                    fontWeight: 700
                  }}>
                    Certificados Profesionales
                  </Title>
                </div>
                
                <Row gutter={[24, 24]} justify="center">
                  {[
                    { src: '/images/certificados/certificado1.jpg', title: 'Certificación Internacional' },
                    { src: '/images/certificados/certificado2.jpg', title: 'Especialización Avanzada' },
                    { src: '/images/certificados/certificado3.jpg', title: 'Acreditación Profesional' },
                    { src: '/images/certificados/certificado4.jpg', title: 'Formación Continua' }
                  ].map((cert, idx) => (
                    <Col xs={24} sm={12} lg={6} key={idx}>
                      <motion.div
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: `0 20px 40px ${colors.brand.primary}40`
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          hoverable
                          style={{
                            background: `linear-gradient(145deg, ${colors.background.tertiary} 0%, ${colors.background.secondary} 100%)`,
                            border: `2px solid ${colors.brand.primary}30`,
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: `0 8px 24px ${colors.brand.primary}20`,
                            height: '100%'
                          }}
                          styles={{ body: { padding: '12px' } }}
                          cover={
                            <div style={{ 
                              position: 'relative',
                              overflow: 'hidden',
                              borderRadius: '12px 12px 0 0',
                              background: colors.background.primary
                            }}>
                              <Image
                                src={cert.src}
                                alt={cert.title}
                                width={300}
                                height={400}
                                style={{
                                  width: '100%',
                                  height: '280px',
                                  objectFit: 'cover',
                                  transition: 'transform 0.3s ease'
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `linear-gradient(180deg, transparent 60%, ${colors.background.primary}90 100%)`,
                                pointerEvents: 'none'
                              }} />
                            </div>
                          }
                        >
                          <Text style={{ 
                            color: colors.text.primary, 
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            display: 'block'
                          }}>
                            {cert.title}
                          </Text>
                        </Card>
                      </motion.div>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* Mérito Académico */}
              <div style={{ marginBottom: '3rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '2rem',
                  paddingBottom: '1rem',
                  borderBottom: `2px solid ${colors.brand.primary}30`
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, #FFD700 0%, #FFA500 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                  }}>
                    🏆
                  </div>
                  <Title level={3} style={{ 
                    color: '#FFD700', 
                    margin: 0,
                    fontSize: '1.8rem',
                    fontWeight: 700
                  }}>
                    Mérito Académico
                  </Title>
                </div>
                
                <Row gutter={[24, 24]} justify="center">
                  <Col xs={24} md={12}>
                    <motion.div
                      whileHover={{ 
                        scale: 1.03,
                        boxShadow: '0 20px 40px rgba(255, 215, 0, 0.3)'
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        hoverable
                        style={{
                          background: `linear-gradient(145deg, ${colors.background.tertiary} 0%, ${colors.background.secondary} 100%)`,
                          border: '2px solid #FFD70050',
                          borderRadius: '20px',
                          overflow: 'hidden',
                          boxShadow: '0 12px 32px rgba(255, 215, 0, 0.2)',
                          height: '100%'
                        }}
                        styles={{ body: { padding: '20px' } }}
                        cover={
                          <div style={{ 
                            position: 'relative',
                            overflow: 'hidden',
                            background: colors.background.primary
                          }}>
                            <Image
                              src="/images/meritoacademico/shared image.jpg"
                              alt="Reconocimiento al Mérito Académico"
                              width={600}
                              height={800}
                              style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'contain',
                                maxHeight: '500px'
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              top: '20px',
                              right: '20px',
                              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                            }}>
                              <Text style={{ 
                                color: colors.background.primary, 
                                fontSize: '0.9rem',
                                fontWeight: 700
                              }}>
                                1er Lugar
                              </Text>
                            </div>
                          </div>
                        }
                      >
                        <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                          <Text style={{ 
                            color: '#FFD700', 
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            textAlign: 'center',
                            display: 'block'
                          }}>
                            Mejor Promedio de Generación
                          </Text>
                          <Text style={{ 
                            color: colors.text.secondary, 
                            fontSize: '1rem',
                            textAlign: 'center',
                            display: 'block'
                          }}>
                            Licenciatura en Ciencias del Ejercicio - UANL
                          </Text>
                        </Space>
                      </Card>
                    </motion.div>
                  </Col>
                </Row>
              </div>

              {/* Reconocimientos Destacados */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '2rem',
                  paddingBottom: '1rem',
                  borderBottom: `2px solid ${colors.brand.primary}30`
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${colors.brand.primary}30 0%, ${colors.brand.primary}10 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    boxShadow: `0 4px 12px ${colors.brand.primary}20`
                  }}>
                    ⭐
                  </div>
                  <Title level={3} style={{ 
                    color: colors.brand.primary, 
                    margin: 0,
                    fontSize: '1.8rem',
                    fontWeight: 700
                  }}>
                    Reconocimientos Destacados
                  </Title>
                </div>
                
                <Row gutter={[24, 24]} justify="center">
                  {[
                    { src: '/reconocimientos/reconocimiento1.jpg', title: 'Excelencia Académica' },
                    { src: '/reconocimientos/reconocimiento2.jpg', title: 'Contribución Científica' },
                    { src: '/reconocimientos/reconocimiento3.jpg', title: 'Liderazgo Profesional' }
                  ].map((rec, idx) => (
                    <Col xs={24} sm={12} md={8} key={idx}>
                      <motion.div
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: `0 20px 40px ${colors.brand.primary}40`
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          hoverable
                          style={{
                            background: `linear-gradient(145deg, ${colors.background.tertiary} 0%, ${colors.background.secondary} 100%)`,
                            border: `2px solid ${colors.brand.primary}30`,
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: `0 8px 24px ${colors.brand.primary}20`,
                            height: '100%'
                          }}
                          styles={{ body: { padding: '12px' } }}
                          cover={
                            <div style={{ 
                              position: 'relative',
                              overflow: 'hidden',
                              borderRadius: '12px 12px 0 0',
                              background: colors.background.primary
                            }}>
                              <Image
                                src={rec.src}
                                alt={rec.title}
                                width={300}
                                height={400}
                                style={{
                                  width: '100%',
                                  height: '280px',
                                  objectFit: 'cover',
                                  transition: 'transform 0.3s ease'
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `linear-gradient(180deg, transparent 60%, ${colors.background.primary}90 100%)`,
                                pointerEvents: 'none'
                              }} />
                            </div>
                          }
                        >
                          <Text style={{ 
                            color: colors.text.primary, 
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            display: 'block'
                          }}>
                            {rec.title}
                          </Text>
                        </Card>
                      </motion.div>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Header Planes */}
        <motion.div variants={itemVariants}>
          <Card
            style={{
              background: `linear-gradient(135deg, ${colors.brand.primary} 0%, #FFD700 50%, #FFA500 100%)`,
              marginBottom: '2rem',
              border: 'none',
              textAlign: 'center'
            }}
          >
            <Title level={1} style={{ color: colors.text.inverse, margin: 0 }}>
              ⚡ PLANES Y TARIFAS
            </Title>
            <Paragraph style={{ color: colors.text.inverse, fontSize: '1.1rem', margin: '0.5rem 0 0 0' }}>
              Servicios Profesionales de Nutrición y Entrenamiento Personalizado
            </Paragraph>
          </Card>
        </motion.div>

        {/* Plan de Nutrición */}
        <motion.div variants={itemVariants}>
          <Card
            hoverable
            style={{
              backgroundColor: colors.background.secondary,
              border: `2px solid ${colors.brand.primary}`,
              borderRadius: '16px',
              marginBottom: '2rem',
              overflow: 'hidden'
            }}
          >
            {/* Plan Icon & Name */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  background: `${colors.brand.primary}20`,
                  color: colors.brand.primary,
                }}
              >
                <HeartOutlined />
              </div>
              <Title level={3} style={{ color: colors.text.primary, marginBottom: '8px', fontSize: '24px' }}>
                Plan de Nutrición Personalizada
              </Title>
              <Text style={{ color: colors.text.secondary, fontSize: '14px' }}>
                Programa completo de alimentación
              </Text>
            </div>

            {/* Price Section */}
            <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${colors.border.primary}` }}>
              <Space orientation="vertical" size={4} style={{ width: '100%', marginBottom: '16px' }}>
                <Space align="baseline" size={8}>
                  <Text style={{ fontSize: '48px', fontWeight: 700, color: colors.brand.primary, lineHeight: 1 }}>
                    $750
                  </Text>
                  <Text style={{ fontSize: '18px', fontWeight: 500, color: colors.text.secondary }}>
                    MXN
                  </Text>
                </Space>
                <Text style={{ fontSize: '14px', fontWeight: 500, color: colors.text.secondary }}>
                  pago único
                </Text>
              </Space>

              <Tag
                icon={<CalendarOutlined />}
                style={{
                  background: `${colors.brand.primary}10`,
                  borderColor: colors.brand.primary,
                  color: colors.text.primary,
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: `1px solid ${colors.brand.primary}40`
                }}
              >
                6 semanas
              </Tag>
            </div>

            {/* Features */}
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              <Text style={{ color: colors.text.primary, fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckOutlined style={{ color: colors.state.success, fontSize: '16px', marginTop: '4px', flexShrink: 0 }} />
                <span>Evaluación inicial (bioimpedancia + cuestionarios)</span>
              </Text>
              <Text style={{ color: colors.text.primary, fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckOutlined style={{ color: colors.state.success, fontSize: '16px', marginTop: '4px', flexShrink: 0 }} />
                <span>6 menús adaptados (calorías, macros, micronutrientes, preferencias)</span>
              </Text>
              <Text style={{ color: colors.text.primary, fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckOutlined style={{ color: colors.state.success, fontSize: '16px', marginTop: '4px', flexShrink: 0 }} />
                <span>Evaluación final con medición corporal</span>
              </Text>
              <Text style={{ color: colors.text.primary, fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckOutlined style={{ color: colors.state.success, fontSize: '16px', marginTop: '4px', flexShrink: 0 }} />
                <span>Ajustes desde $150 MXN | Menús extra desde $100 MXN</span>
              </Text>
            </Space>
          </Card>
        </motion.div>

        {/* Plan de Entrenamiento */}
        <motion.div variants={itemVariants}>
          <Card
            hoverable
            style={{
              backgroundColor: colors.background.secondary,
              border: `2px solid #74b9ff`,
              borderRadius: '16px',
              marginBottom: '2rem',
              overflow: 'hidden'
            }}
          >
            {/* Plan Icon & Name */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  background: 'rgba(116, 185, 255, 0.2)',
                  color: '#74b9ff',
                }}
              >
                <ThunderboltOutlined />
              </div>
              <Title level={3} style={{ color: colors.text.primary, marginBottom: '8px', fontSize: '24px' }}>
                Plan de Entrenamiento Personalizado
              </Title>
              <Text style={{ color: colors.text.secondary, fontSize: '14px' }}>
                Programa completo de entrenamiento
              </Text>
            </div>

            {/* Price Section */}
            <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${colors.border.primary}` }}>
              <Space orientation="vertical" size={4} style={{ width: '100%', marginBottom: '16px' }}>
                <Space align="baseline" size={8}>
                  <Text style={{ fontSize: '48px', fontWeight: 700, color: '#74b9ff', lineHeight: 1 }}>
                    $850
                  </Text>
                  <Text style={{ fontSize: '18px', fontWeight: 500, color: colors.text.secondary }}>
                    MXN
                  </Text>
                </Space>
                <Text style={{ fontSize: '14px', fontWeight: 500, color: colors.text.secondary }}>
                  pago único
                </Text>
              </Space>

              <Tag
                icon={<CalendarOutlined />}
                style={{
                  background: 'rgba(116, 185, 255, 0.1)',
                  borderColor: '#74b9ff',
                  color: colors.text.primary,
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(116, 185, 255, 0.4)'
                }}
              >
                8 semanas
              </Tag>
            </div>

            {/* Features */}
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              <Text style={{ color: colors.text.primary, fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckOutlined style={{ color: colors.state.success, fontSize: '16px', marginTop: '4px', flexShrink: 0 }} />
                <span>Evaluación inicial con Designing Your Training</span>
              </Text>
              <Text style={{ color: colors.text.primary, fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckOutlined style={{ color: colors.state.success, fontSize: '16px', marginTop: '4px', flexShrink: 0 }} />
                <span>Plan personalizado en volumen, frecuencia, intensidad</span>
              </Text>
              <Text style={{ color: colors.text.primary, fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckOutlined style={{ color: colors.state.success, fontSize: '16px', marginTop: '4px', flexShrink: 0 }} />
                <span>Entrega profesional en PDF</span>
              </Text>
              <Text style={{ color: colors.text.primary, fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckOutlined style={{ color: colors.state.success, fontSize: '16px', marginTop: '4px', flexShrink: 0 }} />
                <span>Evaluación final de progresos</span>
              </Text>
            </Space>
          </Card>
        </motion.div>

        {/* Plan Combinado */}
        <motion.div variants={itemVariants}>
          <Card
            hoverable
            style={{
              backgroundColor: colors.background.secondary,
              border: `2px solid #ff7675`,
              borderRadius: '16px',
              marginBottom: '2rem',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Popular Badge */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
              <Tag
                icon={<CrownOutlined />}
                style={{
                  background: colors.state.success,
                  color: colors.background.primary,
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontWeight: 'bold'
                }}
              >
                ¡AHORRO!
              </Tag>
            </div>

            {/* Plan Icon & Name */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  background: 'rgba(255, 118, 117, 0.2)',
                  color: '#ff7675',
                }}
              >
                <FireOutlined />
              </div>
              <Title level={3} style={{ color: colors.text.primary, marginBottom: '8px', fontSize: '24px' }}>
                Plan Combinado
              </Title>
              <Text style={{ color: colors.text.secondary, fontSize: '14px' }}>
                Entrenamiento + Nutrición
              </Text>
            </div>

            {/* Price Section */}
            <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${colors.border.primary}` }}>
              <Space orientation="vertical" size={4} style={{ width: '100%', marginBottom: '8px' }}>
                <Space align="baseline" size={8}>
                  <Text style={{ fontSize: '48px', fontWeight: 700, color: '#ff7675', lineHeight: 1 }}>
                    $1,500
                  </Text>
                  <Text style={{ fontSize: '18px', fontWeight: 500, color: colors.text.secondary }}>
                    MXN
                  </Text>
                </Space>
                <Text style={{ fontSize: '14px', fontWeight: 500, color: colors.text.secondary }}>
                  pago único
                </Text>
              </Space>

              {/* Ahorro Badge */}
              <Tag
                style={{
                  background: `${colors.state.success}20`,
                  borderColor: colors.state.success,
                  color: colors.state.successLight,
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: `1px solid ${colors.state.success}`,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginTop: '8px'
                }}
              >
                🎁 Ahorro: $100 MXN
              </Tag>
            </div>

            {/* Features */}
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              <Text style={{ color: colors.text.primary, fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckOutlined style={{ color: colors.state.success, fontSize: '16px', marginTop: '4px', flexShrink: 0 }} />
                <span>Incluye ambos planes completos</span>
              </Text>
              <Text style={{ color: colors.text.primary, fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckOutlined style={{ color: colors.state.success, fontSize: '16px', marginTop: '4px', flexShrink: 0 }} />
                <span>Evaluación inicial y final con bioimpedancia</span>
              </Text>
              <Text style={{ color: colors.text.primary, fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckOutlined style={{ color: colors.state.success, fontSize: '16px', marginTop: '4px', flexShrink: 0 }} />
                <span>Integración total entre dieta y entrenamiento</span>
              </Text>
            </Space>
          </Card>
        </motion.div>

        {/* Mecánica de Adquisición */}
        <motion.div variants={itemVariants}>
          <Card
            style={{
              background: colors.background.secondary,
              marginBottom: '2rem',
              borderTop: `1px solid ${colors.border.secondary}`,
              borderRight: `1px solid ${colors.border.secondary}`,
              borderBottom: `1px solid ${colors.border.secondary}`,
              borderLeft: `5px solid ${colors.brand.primary}`,
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}
          >
            <Title level={2} style={{ color: colors.text.primary }}>
              📝 Mecánica de Adquisición:
            </Title>
            
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              <Text style={{ fontSize: '1.1rem', color: colors.text.secondary }}>
                <Tag color="gold" style={{ marginRight: '8px', background: colors.brand.primary, color: colors.text.inverse, borderColor: colors.brand.primary }}>1</Tag>
                Selecciona el plan que mejor se adapte a ti
              </Text>
              <Text style={{ fontSize: '1.1rem', color: colors.text.secondary }}>
                <Tag color="gold" style={{ marginRight: '8px', background: colors.brand.primary, color: colors.text.inverse, borderColor: colors.brand.primary }}>2</Tag>
                Realiza la transferencia a la tarjeta bancaria
              </Text>
              <Text style={{ fontSize: '1.1rem', color: colors.text.secondary }}>
                <Tag color="gold" style={{ marginRight: '8px', background: colors.brand.primary, color: colors.text.inverse, borderColor: colors.brand.primary }}>3</Tag>
                Programa tu medición corporal (en Muscle Up GYM o por tu cuenta si eres foráneo)
              </Text>
              <Text style={{ fontSize: '1.1rem', color: colors.text.secondary }}>
                <Tag color="gold" style={{ marginRight: '8px', background: colors.brand.primary, color: colors.text.inverse, borderColor: colors.brand.primary }}>4</Tag>
                Se autoriza el acceso a los cuestionarios para personalizar tu plan
              </Text>
              <Text style={{ fontSize: '1.1rem', color: colors.text.secondary }}>
                <Tag color="gold" style={{ marginRight: '8px', background: colors.brand.primary, color: colors.text.inverse, borderColor: colors.brand.primary }}>5</Tag>
                Tras contestar los cuestionarios, el plan se entrega en 3 a 5 días hábiles
              </Text>
            </Space>
          </Card>
        </motion.div>

        {/* Información de Transferencia */}
        <motion.div variants={itemVariants}>
          <Card
            title={
              <Title level={3} style={{ margin: 0, color: colors.text.primary }}>
                💳 Información de Transferencia
              </Title>
            }
            style={{ 
              marginBottom: '2rem',
              background: colors.background.secondary,
              border: `1px solid ${colors.border.secondary}`
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <Image
                src="/images/tarjetas/tarjeta-bancaria.png"
                alt="Tarjeta Bancaria para Transferencias"
                width={600}
                height={400}
                style={{
                  borderRadius: '10px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  width: '100%',
                  maxWidth: '600px',
                  height: 'auto'
                }}
              />
            </div>
          </Card>
        </motion.div>

        {/* Footer con contacto */}
        <motion.div variants={itemVariants}>
          <Card
            style={{
              background: `linear-gradient(135deg, ${colors.background.tertiary} 0%, ${colors.background.primary} 100%)`,
              border: `1px solid ${colors.border.primary}`,
              textAlign: 'center'
            }}
          >
            <Title level={4} style={{ color: colors.text.primary }}>
              ¿Listo para comenzar tu transformación?
            </Title>
            <Space size="large" orientation="vertical" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
              <Button
                type="primary"
                size="large"
                icon={<WhatsAppOutlined />}
                href="https://wa.me/message/YOUR_WHATSAPP_NUMBER"
                target="_blank"
                block
                style={{ background: '#25D366', borderColor: '#25D366' }}
              >
                Contáctanos por WhatsApp
              </Button>
              <Button
                size="large"
                icon={<MailOutlined />}
                href="mailto:administracion@muscleupgym.fitness?subject=Información de planes personalizados"
                block
                style={{ background: colors.brand.primary, color: colors.text.inverse, borderColor: colors.brand.primary }}
              >
                Envíanos un Email
              </Button>
            </Space>
          </Card>
        </motion.div>
      </div>

      {/* Animación CSS */}
      <style jsx global>{`
        @keyframes rotate {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </motion.div>
  );
}
