'use client';

import { Card, Typography, Row, Col, Progress, Statistic, Tag, Avatar, Button, Empty } from 'antd';
import {
  TrophyOutlined,
  FireOutlined,
  RiseOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { colors } from '@/theme';

const { Title, Text, Paragraph } = Typography;

// Datos de ejemplo
const progressData = {
  streak: 5,
  maxStreak: 12,
  totalVisits: 47,
  thisMonth: 18,
  lastMonth: 22,
  totalClasses: 35,
  caloriesBurned: 15420,
};

const achievements = [
  { id: 1, name: 'Primera Visita', description: 'Completaste tu primera visita', icon: '🎯', unlocked: true, date: '2025-11-23' },
  { id: 2, name: 'Racha de 5 días', description: '5 días consecutivos', icon: '🔥', unlocked: true, date: '2025-12-06' },
  { id: 3, name: 'Madrugador', description: 'Entrena antes de las 7 AM', icon: '🌅', unlocked: true, date: '2025-12-01' },
  { id: 4, name: 'Racha de 10 días', description: '10 días consecutivos', icon: '💪', unlocked: false, progress: 50 },
  { id: 5, name: 'Clase Grupal', description: 'Toma tu primera clase', icon: '👥', unlocked: true, date: '2025-11-25' },
  { id: 6, name: 'Mes Perfecto', description: 'Asiste 20 días en un mes', icon: '🏆', unlocked: false, progress: 90 },
];

const monthlyGoals = [
  { name: 'Visitas al gym', current: 18, target: 20, unit: 'días' },
  { name: 'Clases grupales', current: 8, target: 10, unit: 'clases' },
  { name: 'Calorías quemadas', current: 4500, target: 6000, unit: 'kcal' },
];

export default function MiProgresoPage() {
  const visitChange = ((progressData.thisMonth - progressData.lastMonth) / progressData.lastMonth) * 100;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: colors.text.primary }}>
          Mi Progreso
        </Title>
        <Text style={{ color: colors.text.secondary }}>
          Revisa tus estadísticas y logros
        </Text>
      </div>

      {/* Stats principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Racha Actual"
              value={progressData.streak}
              prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
              suffix="días"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Mejor Racha"
              value={progressData.maxStreak}
              prefix={<TrophyOutlined style={{ color: colors.brand.primary }} />}
              suffix="días"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Visitas Totales"
              value={progressData.totalVisits}
              prefix={<CalendarOutlined style={{ color: colors.state.info }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Calorías Quemadas"
              value={progressData.caloriesBurned}
              prefix={<ThunderboltOutlined style={{ color: colors.state.success }} />}
              suffix="kcal"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Metas del mes */}
        <Col xs={24} lg={12}>
          <Card title="Metas del Mes" extra={<Tag color="blue">Diciembre 2025</Tag>}>
            {monthlyGoals.map((goal, index) => {
              const percent = Math.round((goal.current / goal.target) * 100);
              return (
                <div key={index} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: colors.text.primary }}>{goal.name}</Text>
                    <Text strong style={{ color: percent >= 100 ? colors.state.success : colors.text.secondary }}>
                      {goal.current} / {goal.target} {goal.unit}
                    </Text>
                  </div>
                  <Progress
                    percent={Math.min(percent, 100)}
                    strokeColor={percent >= 100 ? colors.state.success : colors.brand.primary}
                    railColor={colors.border.light}
                    showInfo={false}
                  />
                </div>
              );
            })}
          </Card>
        </Col>

        {/* Comparativa */}
        <Col xs={24} lg={12}>
          <Card title="Este Mes vs Anterior">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: 16, background: colors.background.tertiary, borderRadius: 8 }}>
                  <Text style={{ color: colors.text.muted, display: 'block', marginBottom: 8 }}>Este mes</Text>
                  <Title level={2} style={{ margin: 0, color: colors.brand.primary }}>
                    {progressData.thisMonth}
                  </Title>
                  <Text style={{ color: colors.text.muted }}>visitas</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: 16, background: colors.background.tertiary, borderRadius: 8 }}>
                  <Text style={{ color: colors.text.muted, display: 'block', marginBottom: 8 }}>Mes anterior</Text>
                  <Title level={2} style={{ margin: 0, color: colors.text.secondary }}>
                    {progressData.lastMonth}
                  </Title>
                  <Text style={{ color: colors.text.muted }}>visitas</Text>
                </div>
              </Col>
            </Row>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Tag
                color={visitChange >= 0 ? 'success' : 'error'}
                icon={<RiseOutlined rotate={visitChange < 0 ? 180 : 0} />}
                style={{ fontSize: 14, padding: '4px 12px' }}
              >
                {visitChange >= 0 ? '+' : ''}{visitChange.toFixed(0)}% vs mes anterior
              </Tag>
            </div>
          </Card>
        </Col>

        {/* Logros */}
        <Col xs={24}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrophyOutlined style={{ color: colors.brand.primary }} />
                <span>Logros</span>
              </div>
            }
            extra={
              <Text style={{ color: colors.text.muted }}>
                {achievements.filter(a => a.unlocked).length} / {achievements.length} desbloqueados
              </Text>
            }
          >
            <Row gutter={[16, 16]}>
              {achievements.map((achievement) => (
                <Col xs={12} sm={8} lg={4} key={achievement.id}>
                  <Card
                    size="small"
                    style={{
                      textAlign: 'center',
                      opacity: achievement.unlocked ? 1 : 0.6,
                      background: achievement.unlocked ? colors.background.tertiary : colors.background.secondary,
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>
                      {achievement.unlocked ? achievement.icon : '🔒'}
                    </div>
                    <Text
                      strong
                      style={{
                        color: achievement.unlocked ? colors.text.primary : colors.text.muted,
                        display: 'block',
                        fontSize: 12,
                      }}
                    >
                      {achievement.name}
                    </Text>
                    {achievement.unlocked ? (
                      <Text style={{ color: colors.state.success, fontSize: 10 }}>
                        ✓ {achievement.date}
                      </Text>
                    ) : (
                      <Progress
                        percent={achievement.progress}
                        size="small"
                        showInfo={false}
                        strokeColor={colors.brand.primary}
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
