'use client';
import { useState } from 'react';
import { Typography, Button, Card, Space, Collapse } from 'antd';
import type { CollapseProps } from 'antd';
import {
  ArrowLeftOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  DollarOutlined,
  SafetyOutlined,
  HomeOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { colors } from '@/theme';

const { Title, Paragraph, Text } = Typography;

export default function PreguntasFrecuentes() {
  const faqSections = [
    {
      id: 'inscripcion',
      title: '🧾 Inscripción y Membresías',
      icon: <DollarOutlined />,
      items: [
        {
          question: '¿Cómo me inscribo a Muscle Up GYM?',
          answer: 'Puedes inscribirte directamente en recepción o desde nuestro sitio web. Solo necesitas llenar el formulario y aceptar el reglamento.'
        },
        {
          question: '¿Cuál es la edad mínima para inscribirme?',
          answer: 'La edad mínima es de 12 años. Si eres menor de edad, es obligatorio el consentimiento y firma de padre, madre o tutor.'
        },
        {
          question: '¿Cuáles son las tarifas actuales?',
          answer: (
            <div className="space-y-3">
              <div className="p-4 rounded-lg" style={{ background: colors.background.tertiary, border: `1px solid ${colors.border.primary}` }}>
                <Text strong style={{ color: colors.brand.primary }}>Inscripción:</Text>
                <div className="text-2xl font-bold" style={{ color: colors.text.primary }}>$150 MXN</div>
              </div>
              <div className="p-4 rounded-lg" style={{ background: colors.background.tertiary, border: `1px solid ${colors.border.primary}` }}>
                <Text strong style={{ color: colors.brand.primary }}>Mensualidad general:</Text>
                <div className="text-2xl font-bold" style={{ color: colors.text.primary }}>$530 MXN</div>
              </div>
              <div className="p-4 rounded-lg" style={{ background: colors.background.tertiary, border: `1px solid ${colors.border.primary}` }}>
                <Text strong style={{ color: colors.brand.primary }}>Mensualidad estudiantil:</Text>
                <div className="text-2xl font-bold" style={{ color: colors.text.primary }}>$450 MXN</div>
              </div>
              <div className="p-4 rounded-lg" style={{ background: colors.background.tertiary, border: `1px solid ${colors.border.primary}` }}>
                <Text strong style={{ color: colors.brand.primary }}>Visita individual:</Text>
                <div className="text-2xl font-bold" style={{ color: colors.text.primary }}>$150 MXN</div>
              </div>
            </div>
          )
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer: 'Efectivo, transferencia bancaria y tarjeta (débito o crédito, mediante terminal).'
        },
        {
          question: '¿Puedo congelar mi membresía?',
          answer: 'No. Las membresías no pueden ser congeladas ni transferidas. Puedes indicar una fecha futura de inicio al realizar el pago por anticipado.'
        }
      ]
    },
    {
      id: 'horarios',
      title: '⏰ Horarios y Acceso',
      icon: <ClockCircleOutlined />,
      items: [
        {
          question: '¿Cuáles son los horarios del gimnasio?',
          answer: (
            <div className="p-4 rounded-lg space-y-3" style={{ background: colors.background.tertiary, border: `1px solid ${colors.border.primary}` }}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: colors.brand.primary }}></div>
                <Text style={{ color: colors.text.primary }}>
                  <strong style={{ color: colors.brand.primary }}>Lunes a viernes:</strong> 6:00 a.m. – 10:00 p.m.
                </Text>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: colors.brand.primary }}></div>
                <Text style={{ color: colors.text.primary }}>
                  <strong style={{ color: colors.brand.primary }}>Sábados:</strong> 9:00 a.m. – 5:00 p.m.
                </Text>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <Text style={{ color: colors.text.primary }}>
                  <strong className="text-red-400">Domingos:</strong> cerrado
                </Text>
              </div>
            </div>
          )
        },
        {
          question: '¿Cómo ingreso al gimnasio?',
          answer: 'Mediante tu huella digital, válida únicamente si tu membresía está vigente. El acceso máximo es de 2 veces por día.'
        }
      ]
    },
    {
      id: 'entrenamiento',
      title: '🏋️‍♂️ Entrenamiento y Rutinas',
      icon: <TeamOutlined />,
      items: [
        {
          question: '¿Qué tipo de rutinas ofrecen?',
          answer: (
            <Space orientation="vertical" size="middle" className="w-full">
              <div className="p-4 rounded-lg" style={{ background: colors.background.tertiary, border: `1px solid ${colors.border.primary}` }}>
                <Title level={5} style={{ color: colors.brand.primary, marginBottom: '12px' }}>🎯 Rutinas Estructuradas Gratuitas:</Title>
                <Text style={{ color: colors.text.secondary }}>
                  Con seguimiento semanal y progresivo (niveles 1 al 5), enfocadas en recomposición corporal, 
                  ganancia de masa muscular y pérdida de grasa.
                </Text>
              </div>
              <div className="p-4 rounded-lg" style={{ background: colors.background.tertiary, border: `1px solid ${colors.border.primary}` }}>
                <Title level={5} style={{ color: colors.brand.primary, marginBottom: '12px' }}>💪 Diseño Personalizado:</Title>
                <Text style={{ color: colors.text.secondary }}>
                  Costo adicional. Incluye consulta individual y plan adaptado a tus objetivos específicos.
                </Text>
              </div>
            </Space>
          )
        },
        {
          question: '¿Ofrecen asesoría personalizada?',
          answer: 'Sí, contamos con entrenadores certificados que pueden diseñar rutinas personalizadas y brindarte seguimiento. Consulta costos en recepción.'
        }
      ]
    },
    {
      id: 'reglamento',
      title: '📋 Reglamento y Normas',
      icon: <SafetyOutlined />,
      items: [
        {
          question: '¿Cuáles son las normas principales del gimnasio?',
          answer: (
            <ul style={{ color: colors.text.secondary, lineHeight: 2 }}>
              <li>Respetar el reglamento interno y las indicaciones del personal</li>
              <li>Mantener limpio y ordenado el espacio de entrenamiento</li>
              <li>Usar ropa y calzado deportivo adecuado</li>
              <li>No está permitido el uso de celular en áreas de entrenamiento</li>
              <li>Prohibido el consumo de alimentos y bebidas (excepto agua)</li>
            </ul>
          )
        },
        {
          question: '¿Puedo traer invitados?',
          answer: 'Los invitados deben pagar la tarifa de visita individual ($150 MXN) y cumplir con el reglamento.'
        }
      ]
    },
    {
      id: 'instalaciones',
      title: '🏢 Instalaciones y Servicios',
      icon: <HomeOutlined />,
      items: [
        {
          question: '¿Qué servicios e instalaciones tienen?',
          answer: (
            <ul style={{ color: colors.text.secondary, lineHeight: 2 }}>
              <li><CheckCircleOutlined style={{ color: colors.brand.primary }} /> Área de pesas libre</li>
              <li><CheckCircleOutlined style={{ color: colors.brand.primary }} /> Máquinas de cardio</li>
              <li><CheckCircleOutlined style={{ color: colors.brand.primary }} /> Área funcional</li>
              <li><CheckCircleOutlined style={{ color: colors.brand.primary }} /> Vestidores y regaderas</li>
              <li><CheckCircleOutlined style={{ color: colors.brand.primary }} /> Casilleros (candado propio)</li>
              <li><CheckCircleOutlined style={{ color: colors.brand.primary }} /> WiFi gratuito</li>
            </ul>
          )
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: colors.background.primary, color: colors.text.primary, paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link href="/">
            <Button
              icon={<ArrowLeftOutlined />}
              style={{
                background: 'transparent',
                borderColor: colors.border.primary,
                color: colors.text.primary,
                marginBottom: '32px'
              }}
            >
              Volver al inicio
            </Button>
          </Link>

          <div className="text-center">
            <Space align="center" size="middle" style={{ marginBottom: '16px', justifyContent: 'center' }}>
              <QuestionCircleOutlined style={{ fontSize: '48px', color: colors.brand.primary }} />
              <Title level={1} style={{ color: colors.text.primary, margin: 0, fontSize: 'clamp(32px, 5vw, 48px)' }}>
                Preguntas Frecuentes
              </Title>
            </Space>

            <Paragraph style={{ color: colors.text.secondary, fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
              Encuentra respuestas rápidas a las preguntas más comunes sobre membresías, horarios y servicios.
            </Paragraph>
          </div>
        </div>

        {/* FAQ Sections */}
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          {faqSections.map((section) => (
            <Card
              key={section.id}
              style={{
                background: colors.background.secondary,
                border: `1px solid ${colors.border.light}`,
              }}
            >
              <Title level={3} style={{ color: colors.brand.primary, marginBottom: '24px' }}>
                {section.title}
              </Title>
              
              <Collapse
                bordered={false}
                style={{ background: 'transparent' }}
                expandIconPlacement="end"
                items={section.items.map((item, index) => ({
                  key: index,
                  label: (
                    <Text strong style={{ color: colors.text.primary, fontSize: '16px' }}>
                      {item.question}
                    </Text>
                  ),
                  children: (
                    <div style={{ color: colors.text.secondary }}>
                      {typeof item.answer === 'string' ? (
                        <Paragraph style={{ color: colors.text.secondary, marginBottom: 0 }}>
                          {item.answer}
                        </Paragraph>
                      ) : (
                        item.answer
                      )}
                    </div>
                  ),
                  style: {
                    background: colors.background.tertiary,
                    marginBottom: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border.light}`,
                  }
                }))}
              />
            </Card>
          ))}
        </Space>

        {/* CTA */}
        <Card
          style={{
            background: `linear-gradient(135deg, ${colors.background.secondary}, ${colors.background.tertiary})`,
            border: `1px solid ${colors.brand.primary}`,
            marginTop: '48px',
            textAlign: 'center'
          }}
        >
          <Title level={4} style={{ color: colors.brand.primary }}>
            ¿No encontraste lo que buscabas?
          </Title>
          <Paragraph style={{ color: colors.text.secondary, marginBottom: '24px' }}>
            Contáctanos directamente y con gusto te atenderemos
          </Paragraph>
          <Link href="/register">
            <Button
              type="primary"
              size="large"
              style={{
                background: colors.brand.primary,
                borderColor: colors.brand.primary,
                color: colors.background.primary,
                fontWeight: 600
              }}
            >
              Contáctanos
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
