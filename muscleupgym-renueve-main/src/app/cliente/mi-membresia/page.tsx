'use client';

import { useState, useEffect } from 'react';
import { Card, Typography, Tag, Progress, Row, Col, Divider, Timeline, Statistic, Spin, Empty, App } from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  StarOutlined,
  DollarOutlined,
  CreditCardOutlined,
  WalletOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { colors } from '@/theme';
import { createClient } from '@/utils/supabase/client';

const { Title, Text } = Typography;

// Interfaces
interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  gym_access: boolean;
  classes_included: boolean;
  monthly_price: number;
  inscription_price: number;
}

interface UserMembership {
  id: string;
  user_id: string;
  plan_id: string;
  payment_type: string;
  total_amount: number;
  inscription_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  freeze_start_date: string | null;
  freeze_end_date: string | null;
  freeze_reason: string | null;
  total_visits: number;
  remaining_visits: number;
  paid_amount: number;
  pending_amount: number;
  is_renewal: boolean;
  created_at: string;
  membership_plans: MembershipPlan;
}

interface PaymentDetail {
  id: string;
  membership_id: string;
  payment_method: string;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  payment_reference: string | null;
  sequence_order: number;
  created_at: string;
}

interface MembershipHistory {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  paid_amount: number;
  payment_type: string;
  membership_plans: {
    name: string;
  } | null;
}

// Función para formatear fecha
const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  const day = date.getDate().toString().padStart(2, '0');
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} del ${year}`;
};

// Función para calcular días restantes
const calculateDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Función para obtener color de días restantes
const getDaysColor = (days: number): string => {
  if (days > 10) return colors.state.success;
  if (days > 3) return colors.state.warning;
  return colors.state.error;
};

// Función para obtener el tipo de pago en español
const getPaymentTypeLabel = (type: string): string => {
  const types: { [key: string]: string } = {
    'monthly': 'Mensual',
    'bimonthly': 'Bimestral',
    'quarterly': 'Trimestral',
    'semester': 'Semestral',
    'annual': 'Anual',
    'weekly': 'Semanal',
    'biweekly': 'Quincenal',
    'visit': 'Por Visita',
  };
  return types[type] || type;
};

// Función para obtener el icono del método de pago
const getPaymentMethodIcon = (method: string) => {
  if (method.toLowerCase().includes('tarjeta')) return <CreditCardOutlined />;
  if (method.toLowerCase().includes('monedero') || method.toLowerCase().includes('mup')) return <WalletOutlined />;
  return <DollarOutlined />;
};

// Función para obtener el estado en español
const getStatusLabel = (status: string): { label: string; color: string } => {
  const statuses: { [key: string]: { label: string; color: string } } = {
    'active': { label: 'Activa', color: 'success' },
    'expired': { label: 'Vencida', color: 'error' },
    'frozen': { label: 'Congelada', color: 'warning' },
    'cancelled': { label: 'Cancelada', color: 'default' },
    'pending': { label: 'Pendiente', color: 'processing' },
  };
  return statuses[status] || { label: status, color: 'default' };
};

export default function MiMembresiaPage() {
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([]);
  const [membershipHistory, setMembershipHistory] = useState<MembershipHistory[]>([]);
  const { message } = App.useApp();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Obtener membresía activa del usuario con el plan
        const { data: membershipData, error: membershipError } = await supabase
          .from('user_memberships')
          .select(`
            *,
            membership_plans (
              id,
              name,
              description,
              features,
              gym_access,
              classes_included,
              monthly_price,
              inscription_price
            )
          `)
          .eq('user_id', user.id)
          .eq('_deleted', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (membershipError && membershipError.code !== 'PGRST116') {
          console.error('Error fetching membership:', membershipError);
        }

        if (membershipData) {
          setMembership(membershipData);

          // Obtener detalles de pago de esta membresía
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('membership_payment_details')
            .select('*')
            .eq('membership_id', membershipData.id)
            .eq('_deleted', false)
            .order('sequence_order', { ascending: true });

          if (paymentsError) {
            console.error('Error fetching payment details:', paymentsError);
          }

          if (paymentsData) {
            setPaymentDetails(paymentsData);
          }
        }

        // Obtener historial de membresías anteriores
        const { data: historyData } = await supabase
          .from('user_memberships')
          .select(`
            id,
            start_date,
            end_date,
            status,
            total_amount,
            paid_amount,
            payment_type,
            membership_plans (
              name
            )
          `)
          .eq('user_id', user.id)
          .eq('_deleted', false)
          .order('created_at', { ascending: false });

        if (historyData && historyData.length > 1) {
          // Excluir la membresía actual (primera en la lista)
          setMembershipHistory(historyData.slice(1) as unknown as MembershipHistory[]);
        }
      } catch (error) {
        console.error('Error:', error);
        message.error('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!membership) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, color: colors.text.primary }}>
            Mi Membresía
          </Title>
          <Text style={{ color: colors.text.secondary }}>
            Información de tu plan actual
          </Text>
        </div>
        <Card>
          <Empty
            description={
              <Text style={{ color: colors.text.muted }}>
                No tienes una membresía activa
              </Text>
            }
          />
        </Card>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining(membership.end_date);
  const totalDays = Math.ceil(
    (new Date(membership.end_date + 'T00:00:00').getTime() - new Date(membership.start_date + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24)
  );
  const usedDays = totalDays - daysRemaining;
  const progressPercent = Math.min(100, Math.max(0, (usedDays / totalDays) * 100));
  const statusInfo = getStatusLabel(membership.status);
  const plan = membership.membership_plans;

  // Generar beneficios basados en el plan
  const benefits: string[] = [];
  if (plan.gym_access) benefits.push('Acceso al gimnasio');
  if (plan.classes_included) benefits.push('Clases grupales incluidas');
  if (plan.features && plan.features.length > 0) {
    benefits.push(...plan.features);
  }
  // Beneficios por defecto si no hay
  if (benefits.length === 0) {
    benefits.push('Acceso al área de pesas', 'Acceso al área de cardio', 'Vestidores y regaderas');
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: colors.text.primary }}>
          Mi Membresía
        </Title>
        <Text style={{ color: colors.text.secondary }}>
          Información de tu plan actual
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Card principal de membresía */}
        <Col xs={24} lg={16}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${colors.brand.primary}, ${colors.brand.dark})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <StarOutlined style={{ fontSize: 24, color: colors.text.inverse }} />
                  </div>
                  <div>
                    <Title level={3} style={{ margin: 0, color: colors.text.primary }}>
                      {plan.name}
                    </Title>
                    <Text style={{ color: colors.text.muted }}>
                      Membresía {getPaymentTypeLabel(membership.payment_type)}
                      {membership.is_renewal && ' (Renovación)'}
                    </Text>
                  </div>
                </div>
              </div>
              <Tag
                color={statusInfo.color}
                icon={membership.status === 'active' ? <CheckCircleOutlined /> : 
                      membership.status === 'frozen' ? <PauseCircleOutlined /> : 
                      <ClockCircleOutlined />}
                style={{ fontSize: 14, padding: '4px 12px' }}
              >
                {statusInfo.label}
              </Tag>
            </div>

            <Row gutter={[24, 16]} style={{ marginBottom: 24 }}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Total Pagado"
                  value={membership.paid_amount}
                  prefix="$"
                  suffix="MXN"
                  styles={{ content: { color: colors.brand.primary } }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Días restantes"
                  value={daysRemaining > 0 ? daysRemaining : 0}
                  suffix="días"
                  styles={{ content: { color: getDaysColor(daysRemaining) } }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <div>
                  <Text style={{ color: colors.text.muted, fontSize: 12 }}>Inicio</Text>
                  <div style={{ color: colors.text.primary, fontSize: 14, fontWeight: 500 }}>
                    {formatDate(membership.start_date)}
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div>
                  <Text style={{ color: colors.text.muted, fontSize: 12 }}>Vencimiento</Text>
                  <div style={{ color: colors.text.primary, fontSize: 14, fontWeight: 500 }}>
                    {formatDate(membership.end_date)}
                  </div>
                </div>
              </Col>
            </Row>

            {/* Mostrar información de congelamiento si aplica */}
            {membership.status === 'frozen' && membership.freeze_start_date && (
              <Card 
                size="small" 
                style={{ 
                  marginBottom: 24, 
                  background: colors.state.warning + '20',
                  border: `1px solid ${colors.state.warning}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PauseCircleOutlined style={{ color: colors.state.warning, fontSize: 20 }} />
                  <div>
                    <Text strong style={{ color: colors.text.primary }}>Membresía Congelada</Text>
                    <br />
                    <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                      Desde: {formatDate(membership.freeze_start_date)}
                      {membership.freeze_end_date && ` - Hasta: ${formatDate(membership.freeze_end_date)}`}
                    </Text>
                    {membership.freeze_reason && (
                      <Text style={{ color: colors.text.muted, fontSize: 12, display: 'block' }}>
                        Razón: {membership.freeze_reason}
                      </Text>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Monto pendiente si existe */}
            {membership.pending_amount > 0 && (
              <Card 
                size="small" 
                style={{ 
                  marginBottom: 24, 
                  background: colors.state.error + '20',
                  border: `1px solid ${colors.state.error}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong style={{ color: colors.state.error }}>Saldo Pendiente</Text>
                    <br />
                    <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                      Acude a recepción para liquidar tu saldo
                    </Text>
                  </div>
                  <Text strong style={{ color: colors.state.error, fontSize: 20 }}>
                    ${membership.pending_amount} MXN
                  </Text>
                </div>
              </Card>
            )}

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: colors.text.secondary }}>Progreso del plan</Text>
                <Text style={{ color: colors.text.muted }}>
                  {usedDays > 0 ? usedDays : 0} de {totalDays} días
                </Text>
              </div>
              <Progress
                percent={progressPercent}
                showInfo={false}
                strokeColor={getDaysColor(daysRemaining)}
                railColor={colors.border.light}
                size="small"
              />
            </div>

            <Divider style={{ borderColor: colors.border.light }} />

            <Title level={5} style={{ color: colors.text.primary, marginBottom: 16 }}>
              Beneficios incluidos
            </Title>
            <Row gutter={[16, 8]}>
              {benefits.map((benefit, index) => (
                <Col xs={24} sm={12} key={index}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircleOutlined style={{ color: colors.state.success }} />
                    <Text style={{ color: colors.text.secondary }}>{benefit}</Text>
                  </div>
                </Col>
              ))}
            </Row>

            {plan.description && (
              <>
                <Divider style={{ borderColor: colors.border.light }} />
                <Text style={{ color: colors.text.muted }}>{plan.description}</Text>
              </>
            )}
          </Card>
        </Col>

        {/* Detalles de pago */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HistoryOutlined />
                <span>Detalles de Pago</span>
              </div>
            }
          >
            {paymentDetails.length > 0 ? (
              <Timeline
                items={paymentDetails.map((payment) => ({
                  color: 'green',
                  icon: getPaymentMethodIcon(payment.payment_method),
                  content: (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong style={{ color: colors.text.primary }}>
                          ${payment.amount.toLocaleString()} MXN
                        </Text>
                        <Tag color="success" style={{ marginLeft: 8 }}>Pagado</Tag>
                      </div>
                      <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                        {payment.payment_method}
                      </Text>
                      {payment.payment_reference && (
                        <Text style={{ color: colors.text.muted, fontSize: 11, display: 'block' }}>
                          Ref: {payment.payment_reference}
                        </Text>
                      )}
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text style={{ color: colors.text.muted }}>
                    Sin detalles de pago
                  </Text>
                }
              />
            )}

            {/* Resumen de montos */}
            <Divider style={{ borderColor: colors.border.light }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text.muted }}>Membresía:</Text>
                <Text style={{ color: colors.text.primary }}>
                  ${(membership.total_amount - membership.inscription_amount).toLocaleString()} MXN
                </Text>
              </div>
              {membership.inscription_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text.muted }}>Inscripción:</Text>
                  <Text style={{ color: colors.text.primary }}>
                    ${membership.inscription_amount.toLocaleString()} MXN
                  </Text>
                </div>
              )}
              <Divider style={{ margin: '8px 0', borderColor: colors.border.light }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ color: colors.text.primary }}>Total:</Text>
                <Text strong style={{ color: colors.brand.primary }}>
                  ${membership.total_amount.toLocaleString()} MXN
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text.muted }}>Pagado:</Text>
                <Text style={{ color: colors.state.success }}>
                  ${membership.paid_amount.toLocaleString()} MXN
                </Text>
              </div>
              {membership.pending_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text.muted }}>Pendiente:</Text>
                  <Text style={{ color: colors.state.error }}>
                    ${membership.pending_amount.toLocaleString()} MXN
                  </Text>
                </div>
              )}
            </div>
          </Card>

          {/* Card de vencimiento */}
          <Card style={{ marginTop: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: colors.background.tertiary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CalendarOutlined style={{ fontSize: 28, color: getDaysColor(daysRemaining) }} />
              </div>
              <Text style={{ color: colors.text.muted, fontSize: 12 }}>Tu membresía vence el</Text>
              <Title level={4} style={{ margin: '8px 0', color: colors.text.primary }}>
                {formatDate(membership.end_date)}
              </Title>
              <Tag 
                color={daysRemaining > 10 ? 'success' : daysRemaining > 3 ? 'warning' : 'error'}
                style={{ fontSize: 14, padding: '4px 12px' }}
              >
                {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Membresía vencida'}
              </Tag>
            </div>
          </Card>

          {/* Información de visitas si aplica */}
          {(membership.total_visits > 0 || membership.remaining_visits > 0) && (
            <Card style={{ marginTop: 16 }} title="Visitas">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Totales"
                    value={membership.total_visits}
                    styles={{ content: { color: colors.text.primary } }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Restantes"
                    value={membership.remaining_visits}
                    styles={{ content: { color: colors.brand.primary } }}
                  />
                </Col>
              </Row>
            </Card>
          )}
        </Col>
      </Row>

      {/* Historial de Membresías Anteriores */}
      {membershipHistory.length > 0 && (
        <Card 
          style={{ marginTop: 24 }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <HistoryOutlined />
              <span>Historial de Membresías</span>
            </div>
          }
        >
          <Timeline
            items={membershipHistory.map((hist) => {
              const histStatus = getStatusLabel(hist.status);
              return {
                color: hist.status === 'active' ? 'green' : hist.status === 'expired' ? 'gray' : 'red',
                content: (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <Text strong style={{ color: colors.text.primary }}>
                          {hist.membership_plans?.name || 'Plan'}
                        </Text>
                        <Text style={{ color: colors.text.muted, fontSize: 12, marginLeft: 8 }}>
                          ({getPaymentTypeLabel(hist.payment_type)})
                        </Text>
                      </div>
                      <Tag color={histStatus.color}>{histStatus.label}</Tag>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                        {formatDate(hist.start_date)} - {formatDate(hist.end_date)}
                      </Text>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                        Total: ${hist.total_amount.toLocaleString()} MXN • Pagado: ${hist.paid_amount.toLocaleString()} MXN
                      </Text>
                    </div>
                  </div>
                ),
              };
            })}
          />
        </Card>
      )}
    </div>
  );
}
