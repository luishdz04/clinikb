'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, Typography, Row, Col, Spin, Empty, Tag, Statistic, Table, Select, App, Timeline } from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TrophyOutlined,
  RiseOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { colors } from '@/theme';
import { createClient } from '@/utils/supabase/client';

const { Title, Text } = Typography;

interface AccessLog {
  id: string;
  user_id: string;
  access_type: string;
  access_method: string;
  success: boolean;
  device_timestamp: string;
  created_at: string;
}

// Función para formatear fecha
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

// Función para formatear hora
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
};

// Función para obtener el día de la semana
const getDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
};

// Función para obtener el día de la semana abreviado
const getDayOfWeekShort = (dateString: string): string => {
  const date = new Date(dateString);
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
};

export default function AsistenciasPage() {
  const [loading, setLoading] = useState(true);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const { message } = App.useApp();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('access_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('_deleted', false)
          .eq('success', true)
          .order('device_timestamp', { ascending: false });

        if (error) {
          console.error('Error fetching access logs:', error);
          message.error('Error al cargar las asistencias');
        }

        if (data) {
          setAccessLogs(data);
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

  // Filtrar por mes
  const filteredLogs = useMemo(() => {
    if (selectedMonth === 'all') return accessLogs;
    return accessLogs.filter(log => {
      const date = new Date(log.device_timestamp);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      return monthKey === selectedMonth;
    });
  }, [accessLogs, selectedMonth]);

  // Estadísticas
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Asistencias este mes
    const thisMonthLogs = accessLogs.filter(log => {
      const date = new Date(log.device_timestamp);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Asistencias por día de la semana con fechas (SOLO del mes actual)
    const byDayOfWeek: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const datesByDayOfWeek: { [key: number]: string[] } = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    
    // Usar solo los logs del mes actual para el gráfico
    thisMonthLogs.forEach(log => {
      const date = new Date(log.device_timestamp);
      byDayOfWeek[date.getDay()]++;
      // Guardar fecha formateada
      const day = date.getDate().toString().padStart(2, '0');
      const monthShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][date.getMonth()];
      datesByDayOfWeek[date.getDay()].push(`${day} ${monthShort}`);
    });

    // Día(s) más frecuente(s) del mes - manejar empates
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const maxValue = Math.max(...Object.values(byDayOfWeek));
    
    let favoriteDayName = 'Sin datos';
    if (maxValue > 0) {
      // Encontrar todos los días con el valor máximo
      const favoriteDays = Object.entries(byDayOfWeek)
        .filter(([_, count]) => count === maxValue)
        .map(([dayIndex]) => days[parseInt(dayIndex)]);
      
      if (favoriteDays.length === 1) {
        favoriteDayName = favoriteDays[0];
      } else if (favoriteDays.length <= 3) {
        // Si son 2 o 3 días empatados, mostrarlos todos
        favoriteDayName = favoriteDays.join(', ');
      } else {
        // Si son más de 3, mostrar "Varios días"
        favoriteDayName = `${favoriteDays.length} días (empate)`;
      }
    }

    // Hora promedio
    let totalMinutes = 0;
    accessLogs.forEach(log => {
      const date = new Date(log.device_timestamp);
      totalMinutes += date.getHours() * 60 + date.getMinutes();
    });
    const avgMinutes = accessLogs.length > 0 ? Math.round(totalMinutes / accessLogs.length) : 0;
    const avgHour = Math.floor(avgMinutes / 60);
    const avgMin = avgMinutes % 60;
    const avgTime = `${avgHour.toString().padStart(2, '0')}:${avgMin.toString().padStart(2, '0')}`;

    // Racha actual (días consecutivos)
    let streak = 0;
    if (accessLogs.length > 0) {
      const sortedLogs = [...accessLogs].sort((a, b) => 
        new Date(b.device_timestamp).getTime() - new Date(a.device_timestamp).getTime()
      );
      
      const uniqueDays = new Set<string>();
      sortedLogs.forEach(log => {
        const date = new Date(log.device_timestamp);
        uniqueDays.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
      });
      
      const daysArray = Array.from(uniqueDays).sort().reverse();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < daysArray.length; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const checkKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
        
        if (daysArray.includes(checkKey)) {
          streak++;
        } else {
          break;
        }
      }
    }

    return {
      total: accessLogs.length,
      thisMonth: thisMonthLogs.length,
      favoriteDay: favoriteDayName,
      avgTime,
      streak,
      byDayOfWeek,
      datesByDayOfWeek,
    };
  }, [accessLogs]);

  // Opciones de meses para el filtro
  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    accessLogs.forEach(log => {
      const date = new Date(log.device_timestamp);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      months.add(monthKey);
    });

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const options = Array.from(months).sort().reverse().map(key => {
      const [year, month] = key.split('-');
      return {
        value: key,
        label: `${monthNames[parseInt(month) - 1]} ${year}`,
      };
    });

    return [{ value: 'all', label: 'Todos los meses' }, ...options];
  }, [accessLogs]);

  // Columnas de la tabla
  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'device_timestamp',
      key: 'date',
      render: (timestamp: string) => (
        <div>
          <Text strong style={{ color: colors.text.primary }}>
            {formatDate(timestamp)}
          </Text>
          <br />
          <Text style={{ color: colors.text.muted, fontSize: 12 }}>
            {getDayOfWeek(timestamp)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Hora',
      dataIndex: 'device_timestamp',
      key: 'time',
      render: (timestamp: string) => (
        <Tag icon={<ClockCircleOutlined />} color="blue">
          {formatTime(timestamp)}
        </Tag>
      ),
    },
    {
      title: 'Método',
      dataIndex: 'access_method',
      key: 'method',
      render: (method: string) => (
        <Tag color="green">
          {method === 'fingerprint' ? '👆 Huella' : method === 'card' ? '💳 Tarjeta' : method}
        </Tag>
      ),
    },
  ];

  // Gráfico de barras simple con CSS
  const maxDayValue = Math.max(...Object.values(stats.byDayOfWeek), 1);
  const daysShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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
          Mis Asistencias
        </Title>
        <Text style={{ color: colors.text.secondary }}>
          Historial y estadísticas de tus visitas al gimnasio
        </Text>
      </div>

      {/* Estadísticas principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total de Visitas"
              value={stats.total}
              prefix={<CalendarOutlined style={{ color: colors.brand.primary }} />}
              styles={{ content: { color: colors.brand.primary } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Este Mes"
              value={stats.thisMonth}
              prefix={<FireOutlined style={{ color: colors.state.warning }} />}
              styles={{ content: { color: colors.state.warning } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Racha Actual"
              value={stats.streak}
              suffix="días"
              prefix={<TrophyOutlined style={{ color: colors.state.success }} />}
              styles={{ content: { color: colors.state.success } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Hora Promedio"
              value={stats.avgTime}
              prefix={<ClockCircleOutlined style={{ color: colors.brand.light }} />}
              styles={{ content: { color: colors.brand.light } }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Gráfico de asistencias por día */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RiseOutlined />
                <span>Asistencias de {new Date().toLocaleString('es-MX', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())}</span>
              </div>
            }
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 220, gap: 4 }}>
              {daysShort.map((day, index) => {
                const value = stats.byDayOfWeek[index];
                const dates = stats.datesByDayOfWeek[index];
                const height = maxDayValue > 0 ? (value / maxDayValue) * 120 : 0;
                const isMaxDay = value === Math.max(...Object.values(stats.byDayOfWeek)) && value > 0;
                
                return (
                  <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <Text style={{ color: colors.text.primary, fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>
                      {value}
                    </Text>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 40,
                        height: Math.max(height, 4),
                        background: isMaxDay 
                          ? `linear-gradient(180deg, ${colors.brand.primary}, ${colors.brand.dark})`
                          : colors.brand.primary + '60',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                    <Text style={{ 
                      color: isMaxDay ? colors.brand.primary : colors.text.muted, 
                      fontSize: 12, 
                      marginTop: 8,
                      fontWeight: isMaxDay ? 'bold' : 'normal'
                    }}>
                      {day}
                    </Text>
                    {/* Fechas de asistencia */}
                    <div style={{ 
                      marginTop: 4, 
                      textAlign: 'center',
                      minHeight: 36,
                    }}>
                      {dates.slice(0, 3).map((date, i) => (
                        <Text 
                          key={i} 
                          style={{ 
                            color: colors.text.muted, 
                            fontSize: 9, 
                            display: 'block',
                            lineHeight: 1.2
                          }}
                        >
                          {date}
                        </Text>
                      ))}
                      {dates.length > 3 && (
                        <Text style={{ color: colors.text.muted, fontSize: 9 }}>
                          +{dates.length - 3}
                        </Text>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Tag color="gold" icon={<TrophyOutlined />}>
                Tu día favorito: {stats.favoriteDay}
              </Tag>
            </div>
          </Card>
        </Col>

        {/* Resumen rápido */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircleOutlined />
                <span>Resumen</span>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ 
                padding: 16, 
                background: colors.background.tertiary, 
                borderRadius: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <Text style={{ color: colors.text.muted, fontSize: 12 }}>Día Favorito</Text>
                  <Title level={4} style={{ margin: 0, color: colors.text.primary }}>
                    {stats.favoriteDay}
                  </Title>
                </div>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: colors.brand.primary + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CalendarOutlined style={{ fontSize: 24, color: colors.brand.primary }} />
                </div>
              </div>

              <div style={{ 
                padding: 16, 
                background: colors.background.tertiary, 
                borderRadius: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <Text style={{ color: colors.text.muted, fontSize: 12 }}>Hora Promedio de Entrada</Text>
                  <Title level={4} style={{ margin: 0, color: colors.text.primary }}>
                    {stats.avgTime}
                  </Title>
                </div>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: colors.brand.light + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ClockCircleOutlined style={{ fontSize: 24, color: colors.brand.light }} />
                </div>
              </div>

              <div style={{ 
                padding: 16, 
                background: stats.streak >= 3 ? colors.state.success + '20' : colors.background.tertiary, 
                borderRadius: 12,
                border: stats.streak >= 3 ? `1px solid ${colors.state.success}` : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <Text style={{ color: colors.text.muted, fontSize: 12 }}>Racha Actual</Text>
                  <Title level={4} style={{ margin: 0, color: stats.streak >= 3 ? colors.state.success : colors.text.primary }}>
                    {stats.streak} días consecutivos
                  </Title>
                  {stats.streak >= 3 && (
                    <Text style={{ color: colors.state.success, fontSize: 12 }}>
                      🔥 ¡Sigue así!
                    </Text>
                  )}
                </div>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: colors.state.success + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FireOutlined style={{ fontSize: 24, color: colors.state.success }} />
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Últimas visitas y Calendario */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Últimas Visitas con Timeline */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HistoryOutlined />
                <span>Últimas Visitas</span>
              </div>
            }
          >
            {accessLogs.length > 0 ? (
              <Timeline
                items={accessLogs.slice(0, 5).map((log) => {
                  const date = new Date(log.device_timestamp);
                  const dayNum = date.getDate().toString().padStart(2, '0');
                  
                  return {
                    color: 'green',
                    icon: <CheckCircleOutlined />,
                    content: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 50,
                          height: 50,
                          borderRadius: 8,
                          background: `linear-gradient(135deg, ${colors.brand.primary}, ${colors.brand.dark})`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Text style={{ color: colors.text.inverse, fontSize: 18, fontWeight: 'bold', lineHeight: 1 }}>
                            {dayNum}
                          </Text>
                          <Text style={{ color: colors.text.inverse, fontSize: 10, textTransform: 'uppercase' }}>
                            {getDayOfWeekShort(log.device_timestamp)}
                          </Text>
                        </div>
                        <div>
                          <Text strong style={{ color: colors.text.primary }}>
                            {formatDate(log.device_timestamp)}
                          </Text>
                          <br />
                          <Tag icon={<ClockCircleOutlined />} color="blue" style={{ marginTop: 4 }}>
                            {formatTime(log.device_timestamp)}
                          </Tag>
                          <Tag color="green" style={{ marginTop: 4 }}>
                            {log.access_method === 'fingerprint' ? '👆 Huella' : '💳 Tarjeta'}
                          </Tag>
                        </div>
                      </div>
                    ),
                  };
                })}
              />
            ) : (
              <Empty description={<Text style={{ color: colors.text.muted }}>Sin visitas registradas</Text>} />
            )}
          </Card>
        </Col>

        {/* Mini Calendario del Mes */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarOutlined />
                <span>Calendario - {new Date().toLocaleString('es-MX', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}</span>
              </div>
            }
          >
            {(() => {
              const now = new Date();
              const year = now.getFullYear();
              const month = now.getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              
              // Días con asistencia este mes
              const attendedDays = new Set<number>();
              accessLogs.forEach(log => {
                const date = new Date(log.device_timestamp);
                if (date.getMonth() === month && date.getFullYear() === year) {
                  attendedDays.add(date.getDate());
                }
              });

              const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
              const cells = [];
              
              // Días de la semana header
              for (let i = 0; i < 7; i++) {
                cells.push(
                  <div key={`header-${i}`} style={{ 
                    textAlign: 'center', 
                    padding: 4, 
                    color: colors.text.muted,
                    fontSize: 11,
                    fontWeight: 'bold'
                  }}>
                    {dayNames[i]}
                  </div>
                );
              }
              
              // Espacios vacíos antes del primer día
              for (let i = 0; i < firstDay; i++) {
                cells.push(<div key={`empty-${i}`} />);
              }
              
              // Días del mes
              for (let day = 1; day <= daysInMonth; day++) {
                const isToday = day === now.getDate();
                const hasAttendance = attendedDays.has(day);
                
                cells.push(
                  <div
                    key={day}
                    style={{
                      textAlign: 'center',
                      padding: 6,
                      borderRadius: 8,
                      background: hasAttendance 
                        ? colors.brand.primary 
                        : isToday 
                          ? colors.background.tertiary 
                          : 'transparent',
                      color: hasAttendance 
                        ? colors.text.inverse 
                        : isToday 
                          ? colors.brand.primary 
                          : colors.text.primary,
                      fontWeight: hasAttendance || isToday ? 'bold' : 'normal',
                      border: isToday && !hasAttendance ? `2px solid ${colors.brand.primary}` : 'none',
                      fontSize: 13,
                    }}
                  >
                    {day}
                  </div>
                );
              }

              return (
                <>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(7, 1fr)', 
                    gap: 4,
                    marginBottom: 16
                  }}>
                    {cells}
                  </div>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, background: colors.brand.primary }} />
                      <Text style={{ color: colors.text.muted, fontSize: 12 }}>Día con asistencia</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${colors.brand.primary}` }} />
                      <Text style={{ color: colors.text.muted, fontSize: 12 }}>Hoy</Text>
                    </div>
                  </div>
                </>
              );
            })()}
          </Card>
        </Col>
      </Row>

      {/* Historial de asistencias */}
      <Card
        style={{ marginTop: 24 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarOutlined />
              <span>Historial de Asistencias</span>
            </div>
            <Select
              value={selectedMonth}
              onChange={setSelectedMonth}
              options={monthOptions}
              style={{ width: 180 }}
              size="small"
            />
          </div>
        }
      >
        {filteredLogs.length > 0 ? (
          <Table
            dataSource={filteredLogs}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: false }}
            size="small"
          />
        ) : (
          <Empty
            description={
              <Text style={{ color: colors.text.muted }}>
                No hay asistencias registradas
              </Text>
            }
          />
        )}
      </Card>
    </div>
  );
}
