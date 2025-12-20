'use client';

import { useState, useEffect } from 'react';
import { Card, Typography, Tag, Row, Col, Table, Spin, Empty, App, Collapse, Divider, Timeline } from 'antd';
import {
  ShoppingCartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  CreditCardOutlined,
  WalletOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { colors } from '@/theme';
import { createClient } from '@/utils/supabase/client';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

// Interfaces
interface SaleItem {
  id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount: number;
}

interface PaymentDetail {
  id: string;
  payment_method: string;
  amount: number;
  commission_amount: number;
  payment_reference: string | null;
  payment_date: string;
}

interface Sale {
  id: string;
  sale_number: string;
  sale_type: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: string;
  payment_status: string;
  is_mixed_payment: boolean;
  created_at: string;
  completed_at: string | null;
  sale_items: SaleItem[];
  sale_payment_details: PaymentDetail[];
}

// Función para formatear fecha completa
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

// Función para formatear solo fecha
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} del ${year}`;
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
    'completed': { label: 'Completada', color: 'success' },
    'pending': { label: 'Pendiente', color: 'processing' },
    'cancelled': { label: 'Cancelada', color: 'error' },
    'refunded': { label: 'Reembolsada', color: 'warning' },
    'partial': { label: 'Parcial', color: 'warning' },
  };
  return statuses[status] || { label: status, color: 'default' };
};

// Función para obtener estado de pago
const getPaymentStatusLabel = (status: string): { label: string; color: string } => {
  const statuses: { [key: string]: { label: string; color: string } } = {
    'paid': { label: 'Pagado', color: 'success' },
    'pending': { label: 'Pendiente', color: 'warning' },
    'partial': { label: 'Pago Parcial', color: 'processing' },
    'refunded': { label: 'Reembolsado', color: 'default' },
  };
  return statuses[status] || { label: status, color: 'default' };
};

// Función para obtener tipo de venta en español
const getSaleTypeLabel = (type: string): string => {
  const types: { [key: string]: string } = {
    'sale': 'Venta',
    'layaway': 'Apartado',
    'credit': 'Crédito',
    'preorder': 'Preventa',
  };
  return types[type] || type;
};

export default function MisComprasPage() {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const { message } = App.useApp();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Obtener todas las ventas del usuario con items y pagos
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select(`
            id,
            sale_number,
            sale_type,
            subtotal,
            discount_amount,
            total_amount,
            paid_amount,
            pending_amount,
            status,
            payment_status,
            is_mixed_payment,
            created_at,
            completed_at,
            sale_items (
              id,
              product_name,
              product_sku,
              quantity,
              unit_price,
              total_price,
              discount_amount
            ),
            sale_payment_details (
              id,
              payment_method,
              amount,
              commission_amount,
              payment_reference,
              payment_date
            )
          `)
          .eq('customer_id', user.id)
          .eq('_deleted', false)
          .order('created_at', { ascending: false });

        if (salesError) {
          console.error('Error fetching sales:', salesError);
          message.error('Error al cargar las compras');
          return;
        }

        if (salesData) {
          setSales(salesData as unknown as Sale[]);
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

  // Columnas para la tabla de items
  const itemColumns: ColumnsType<SaleItem> = [
    {
      title: 'Producto',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (name: string, record: SaleItem) => (
        <div>
          <Text strong style={{ color: colors.text.primary }}>{name}</Text>
          <br />
          <Text style={{ color: colors.text.muted, fontSize: 11 }}>{record.product_sku}</Text>
        </div>
      ),
    },
    {
      title: 'Cant.',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 60,
      align: 'center',
    },
    {
      title: 'P. Unit.',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 100,
      align: 'right',
      render: (price: number) => `$${price.toLocaleString()}`,
    },
    {
      title: 'Total',
      dataIndex: 'total_price',
      key: 'total_price',
      width: 100,
      align: 'right',
      render: (price: number) => (
        <Text strong style={{ color: colors.brand.primary }}>
          ${price.toLocaleString()}
        </Text>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: colors.text.primary }}>
          Mis Compras
        </Title>
        <Text style={{ color: colors.text.secondary }}>
          Historial de tus compras en Muscle Up GYM
        </Text>
      </div>

      {/* Lista de compras */}
      {sales.length === 0 ? (
        <Card>
          <Empty
            image={<InboxOutlined style={{ fontSize: 64, color: colors.text.muted }} />}
            description={
              <Text style={{ color: colors.text.muted }}>
                Aún no tienes compras registradas
              </Text>
            }
          />
        </Card>
      ) : (
        <Collapse
          accordion
          style={{ background: 'transparent', border: 'none' }}
          items={sales.map((sale) => {
            const statusInfo = getStatusLabel(sale.status);
            const paymentStatusInfo = getPaymentStatusLabel(sale.payment_status);
            
            return {
              key: sale.id,
              style: {
                marginBottom: 12,
                background: colors.background.secondary,
                borderRadius: 8,
                border: `1px solid ${colors.border.light}`,
              },
              label: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: sale.status === 'completed' ? colors.state.success + '20' : colors.state.warning + '20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {sale.status === 'completed' ? (
                        <CheckCircleOutlined style={{ fontSize: 20, color: colors.state.success }} />
                      ) : sale.status === 'cancelled' ? (
                        <CloseCircleOutlined style={{ fontSize: 20, color: colors.state.error }} />
                      ) : (
                        <ShoppingCartOutlined style={{ fontSize: 20, color: colors.state.warning }} />
                      )}
                    </div>
                    <div>
                      <Text strong style={{ color: colors.text.primary }}>
                        {sale.sale_number}
                      </Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CalendarOutlined style={{ fontSize: 12, color: colors.text.muted }} />
                        <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                          {formatDateTime(sale.created_at)}
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                    <Text strong style={{ color: colors.brand.primary, fontSize: 16 }}>
                      ${sale.total_amount.toLocaleString()} MXN
                    </Text>
                  </div>
                </div>
              ),
              children: (
                <div>
                  {/* Tipo de venta y estado de pago */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    <Tag>{getSaleTypeLabel(sale.sale_type)}</Tag>
                    <Tag color={paymentStatusInfo.color}>{paymentStatusInfo.label}</Tag>
                    {sale.is_mixed_payment && <Tag color="purple">Pago Mixto</Tag>}
                    {sale.sale_items.length > 0 && (
                      <Tag color="blue">{sale.sale_items.length} producto{sale.sale_items.length > 1 ? 's' : ''}</Tag>
                    )}
                  </div>

                  {/* Tabla de productos */}
                  <Title level={5} style={{ color: colors.text.primary, marginBottom: 12 }}>
                    Productos
                  </Title>
                  <Table
                    columns={itemColumns}
                    dataSource={sale.sale_items}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    style={{ marginBottom: 16 }}
                  />

                  <Row gutter={24}>
                    {/* Detalles de pago */}
                    <Col xs={24} md={12}>
                      <Title level={5} style={{ color: colors.text.primary, marginBottom: 12 }}>
                        Métodos de Pago
                      </Title>
                      {sale.sale_payment_details.length > 0 ? (
                        <Timeline
                          items={sale.sale_payment_details.map((payment) => {
                            return {
                              color: 'green',
                              icon: getPaymentMethodIcon(payment.payment_method),
                              content: (
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text strong style={{ color: colors.text.primary }}>
                                      ${payment.amount.toLocaleString()} MXN
                                    </Text>
                                  </div>
                                  <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                                    {payment.payment_method}
                                  </Text>
                                </div>
                              ),
                            };
                          })}
                        />
                      ) : (
                        <Text style={{ color: colors.text.muted }}>Sin detalles de pago</Text>
                      )}
                    </Col>

                    {/* Resumen */}
                    <Col xs={24} md={12}>
                      <Title level={5} style={{ color: colors.text.primary, marginBottom: 12 }}>
                        Resumen
                      </Title>
                      {(() => {
                        // Calcular el total real pagado sumando todos los pagos
                        const totalPagadoReal = sale.sale_payment_details.reduce((sum, p) => sum + p.amount, 0);
                        const totalComisiones = sale.sale_payment_details.reduce((sum, p) => sum + (p.commission_amount || 0), 0);
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text style={{ color: colors.text.muted }}>Subtotal:</Text>
                              <Text style={{ color: colors.text.primary }}>
                                ${sale.subtotal.toLocaleString()} MXN
                              </Text>
                            </div>
                            {sale.discount_amount > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text style={{ color: colors.state.success }}>Descuento:</Text>
                                <Text style={{ color: colors.state.success }}>
                                  -${sale.discount_amount.toLocaleString()} MXN
                                </Text>
                              </div>
                            )}
                            {totalComisiones > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text style={{ color: colors.text.muted }}>Comisión:</Text>
                                <Text style={{ color: colors.text.muted }}>
                                  ${totalComisiones.toFixed(2)} MXN
                                </Text>
                              </div>
                            )}
                            <Divider style={{ margin: '8px 0', borderColor: colors.border.light }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text strong style={{ color: colors.text.primary }}>Total Pagado:</Text>
                              <Text strong style={{ color: colors.brand.primary, fontSize: 16 }}>
                                ${totalPagadoReal.toFixed(2)} MXN
                              </Text>
                            </div>
                            {sale.pending_amount > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text style={{ color: colors.state.error }}>Pendiente:</Text>
                                <Text style={{ color: colors.state.error }}>
                                  ${sale.pending_amount.toLocaleString()} MXN
                                </Text>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </Col>
                  </Row>
                </div>
              ),
            };
          })}
        />
      )}
    </div>
  );
}
