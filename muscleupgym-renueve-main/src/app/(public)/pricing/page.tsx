'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Row, Col, Card, Space, Spin, Tag } from 'antd';
import {
  CheckOutlined,
  CrownOutlined,
  UserOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { colors } from '@/theme';

const { Title, Paragraph, Text } = Typography;

interface Plan {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  inscription_price: number;
  visit_price: number;
  weekly_price: number;
  biweekly_price: number;
  monthly_price: number;
  bimonthly_price: number;
  quarterly_price: number;
  semester_price: number;
  annual_price: number;
  features: string[];
  gym_access: boolean;
  classes_included: boolean;
  guest_passes: number;
  has_time_restrictions: boolean;
}

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error('Expected array but got:', typeof data, data);
          setPlans([]);
          return;
        }

        const activePlans = data.filter((plan: Plan) =>
          plan.is_active &&
          !plan.name.toLowerCase().includes('prueba')
        );

        setPlans(activePlans);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getMainPrice = (plan: Plan): { amount: number; label: string; duration: string } | null => {
    if (plan.monthly_price > 0) return { amount: plan.monthly_price, label: '/mes', duration: '30 días' };
    if (plan.weekly_price > 0) return { amount: plan.weekly_price, label: '/semana', duration: '7 días' };
    if (plan.quarterly_price > 0) return { amount: plan.quarterly_price, label: '/trimestre', duration: '90 días' };
    if (plan.semester_price > 0) return { amount: plan.semester_price, label: '/semestre', duration: '180 días' };
    if (plan.annual_price > 0) return { amount: plan.annual_price, label: '/año', duration: '365 días' };
    if (plan.biweekly_price > 0) return { amount: plan.biweekly_price, label: '/quincena', duration: '15 días' };
    if (plan.bimonthly_price > 0) return { amount: plan.bimonthly_price, label: '/bimestre', duration: '60 días' };
    if (plan.visit_price > 0) return { amount: plan.visit_price, label: '/visita', duration: '1 visita' };
    return null;
  };

  const isPopular = (plan: Plan) => {
    return plan.monthly_price > 0 && plan.name.toLowerCase().includes('general');
  };

  const isStudent = (plan: Plan) => {
    return plan.name.toLowerCase().includes('estudiante');
  };

  const getPlanIcon = (plan: Plan) => {
    if (plan.name.toLowerCase().includes('estudiante')) return <UserOutlined />;
    if (plan.monthly_price > 0) return <CalendarOutlined />;
    if (plan.visit_price > 0) return <ThunderboltOutlined />;
    return <CrownOutlined />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.background.primary }}>
        <Spin size="large" />
      </div>
    );
  }

  const handleInscribirse = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen" style={{ background: colors.background.primary, paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="max-w-7xl mx-auto px-4">
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
            <Title level={1} style={{ color: colors.brand.primary, margin: 0, fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: '16px' }}>
              Planes y Precios
            </Title>
            <Paragraph style={{ color: colors.text.secondary, fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
              Elige el plan que mejor se adapte a tus objetivos
            </Paragraph>
          </div>
        </div>

        {/* Plans Grid */}
        {plans.length > 0 ? (
          <Row gutter={[24, 24]} justify="center">
            {plans.map((plan) => {
              const mainPrice = getMainPrice(plan);
              if (!mainPrice) return null;

              const popular = isPopular(plan);
              const student = isStudent(plan);

              return (
                <Col key={plan.id} xs={24} sm={12} md={8} lg={8}>
                  <Card
                    hoverable
                    style={{
                      backgroundColor: colors.background.secondary,
                      border: popular ? `2px solid ${colors.brand.primary}` : `1px solid ${colors.border.light}`,
                      borderRadius: '16px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Popular/Student Badge */}
                    {(popular || student) && (
                      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
                        <Tag
                          icon={popular ? <CrownOutlined /> : <UserOutlined />}
                          style={{
                            background: colors.brand.primary,
                            color: colors.background.primary,
                            border: 'none',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontWeight: 'bold'
                          }}
                        >
                          {popular ? 'POPULAR' : 'ESTUDIANTES'}
                        </Tag>
                      </div>
                    )}

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
                        {getPlanIcon(plan)}
                      </div>
                      <Title level={3} style={{ color: colors.text.primary, marginBottom: '8px', fontSize: '24px' }}>
                        {plan.name}
                      </Title>
                      <Text style={{ color: colors.text.secondary, fontSize: '14px' }}>
                        {plan.description}
                      </Text>
                    </div>

                    {/* Price Section */}
                    <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${colors.border.primary}` }}>
                      {/* Inscription Price */}
                      {plan.inscription_price > 0 && (
                        <Text style={{ color: colors.text.secondary, fontSize: '14px', display: 'block', marginBottom: '12px' }}>
                          Inscripción:{' '}
                          <Text strong style={{ color: colors.text.primary }}>
                            ${plan.inscription_price.toLocaleString()} MXN
                          </Text>
                        </Text>
                      )}

                      {/* Main Price */}
                      <Space orientation="vertical" size={4} style={{ width: '100%', marginBottom: '16px' }}>
                        <Space align="baseline" size={8}>
                          <Text style={{ fontSize: '48px', fontWeight: 700, color: colors.brand.primary, lineHeight: 1 }}>
                            ${mainPrice.amount.toLocaleString()}
                          </Text>
                          <Text style={{ fontSize: '18px', fontWeight: 500, color: colors.text.secondary }}>
                            MXN
                          </Text>
                        </Space>
                        <Text style={{ fontSize: '14px', fontWeight: 500, color: colors.text.secondary }}>
                          {mainPrice.label}
                        </Text>
                      </Space>

                      {/* Duration Badge */}
                      <Tag
                        icon={<CalendarOutlined />}
                        style={{
                          background: `${colors.brand.primary}10`,
                          borderColor: colors.brand.primary,
                          color: colors.text.primary,
                          padding: '6px 16px',
                          borderRadius: '20px',
                        }}
                      >
                        Duración: {mainPrice.duration}
                      </Tag>

                      {/* Additional Prices */}
                      {(plan.visit_price > 0 && plan.visit_price !== mainPrice.amount) ||
                       (plan.weekly_price > 0 && plan.weekly_price !== mainPrice.amount) ? (
                        <div style={{ marginTop: '16px' }}>
                          {plan.visit_price > 0 && plan.visit_price !== mainPrice.amount && (
                            <Text style={{ fontSize: '12px', color: colors.text.secondary, display: 'block' }}>
                              Por visita: ${plan.visit_price.toLocaleString()} MXN
                            </Text>
                          )}
                          {plan.weekly_price > 0 && plan.weekly_price !== mainPrice.amount && (
                            <Text style={{ fontSize: '12px', color: colors.text.secondary, display: 'block' }}>
                              Semanal: ${plan.weekly_price.toLocaleString()} MXN
                            </Text>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {/* Plan Details */}
                    <div style={{ flex: 1, marginBottom: '24px' }}>
                      {/* Features */}
                      {plan.features && plan.features.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                          <Text strong style={{ color: colors.text.primary, fontSize: '14px', display: 'block', marginBottom: '12px' }}>
                            Incluye:
                          </Text>
                          <Space orientation="vertical" size={8} style={{ width: '100%' }}>
                            {plan.features.map((feature, idx) => (
                              <Space key={idx} size={8}>
                                <CheckOutlined style={{ color: colors.brand.primary, fontSize: '14px' }} />
                                <Text style={{ color: colors.text.secondary, fontSize: '14px' }}>
                                  {feature}
                                </Text>
                              </Space>
                            ))}
                          </Space>
                        </div>
                      )}

                      {/* Additional Info */}
                      <Space orientation="vertical" size={8} style={{ width: '100%' }}>
                        {plan.gym_access && (
                          <Space size={8}>
                            <CheckOutlined style={{ color: colors.state.success, fontSize: '12px' }} />
                            <Text style={{ color: colors.text.secondary, fontSize: '12px' }}>
                              Acceso completo al gimnasio
                            </Text>
                          </Space>
                        )}
                        {plan.classes_included && (
                          <Space size={8}>
                            <CheckOutlined style={{ color: colors.state.success, fontSize: '12px' }} />
                            <Text style={{ color: colors.text.secondary, fontSize: '12px' }}>
                              Clases incluidas
                            </Text>
                          </Space>
                        )}
                        {plan.guest_passes > 0 && (
                          <Space size={8}>
                            <CheckOutlined style={{ color: colors.state.success, fontSize: '12px' }} />
                            <Text style={{ color: colors.text.secondary, fontSize: '12px' }}>
                              {plan.guest_passes} pases de invitado
                            </Text>
                          </Space>
                        )}
                        {plan.has_time_restrictions && (
                          <Space size={8}>
                            <Text style={{ color: colors.state.warning }}>⚠️</Text>
                            <Text style={{ color: colors.text.secondary, fontSize: '12px' }}>
                              Con restricciones de horario
                            </Text>
                          </Space>
                        )}
                      </Space>
                    </div>

                    {/* CTA Button */}
                    <Button
                      type="primary"
                      block
                      size="large"
                      onClick={handleInscribirse}
                      style={{
                        background: colors.brand.primary,
                        borderColor: colors.brand.primary,
                        color: colors.background.primary,
                        fontWeight: 700,
                        height: '48px',
                        fontSize: '16px',
                        borderRadius: '8px',
                      }}
                    >
                      Inscribirse ahora
                    </Button>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <Text style={{ fontSize: '20px', color: colors.text.secondary }}>
              No hay planes disponibles en este momento.
            </Text>
          </div>
        )}

        {/* Footer Note */}
        <div style={{ maxWidth: '800px', margin: '64px auto 0', textAlign: 'center' }}>
          <Text style={{ fontSize: '14px', color: colors.text.secondary, lineHeight: 1.6 }}>
            Los precios están expresados en pesos mexicanos (MXN) y pueden estar sujetos a cambios.
            <br />
            Para más información, visítanos o contáctanos directamente.
          </Text>
        </div>
      </div>
    </div>
  );
}
