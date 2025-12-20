'use client';
import { useState, useMemo } from 'react';
import { Tabs, Card, Typography, Space, Row, Col, Tag, Alert, Button, Divider } from 'antd';
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  FacebookOutlined,
  InstagramOutlined,
  RightOutlined
} from '@ant-design/icons';
import Image from 'next/image';
import { useHydrated } from '@/hooks/useHydrated';
import { useGymSettings } from '@/hooks/useGymSettings';
import { colors } from '@/theme';
import './InfoTabs.css';

const { Title, Paragraph, Text } = Typography;

// Mapeo de colores del theme a los nombres usados en el componente original
const colorTokens = {
  primary: colors.brand.primary,
  blackPure: colors.background.primary,
  gray900: colors.background.secondary,
  textPrimary: colors.text.primary,
  textSecondary: colors.text.secondary,
  textTertiary: colors.text.muted,
  primaryBorder: colors.border.secondary,
  borderDefault: colors.border.light,
  warning: colors.state.warning,
  warningBorder: colors.state.warningBg,
  primaryShadow: colors.brand.primary + '33',
};

type TabKey = 'horarios' | 'ubicacion' | 'entrenadores' | 'contacto';

const trainers = [
  {
    id: 1,
    name: 'Erick De Luna Hernández',
    role: 'Jefe',
    avatar: '/img/trainers/erick.jpg',
    bio: 'Especialista en entrenamiento HIIT y pérdida de peso. 7 años de experiencia transformando vidas.',
    tags: ['HIIT', 'Cardio', 'Pérdida de peso'],
    experience: '7 años',
    certifications: ['NASM-CPT', 'HIIT Specialist']
  },
  {
    id: 2,
    name: 'Carlos Rodríguez',
    role: 'Entrenador de Fuerza',
    avatar: '/img/trainers/carlos.jpg',
    bio: 'Campeón nacional de powerlifting. Especialista en fuerza y ganancia muscular.',
    tags: ['Powerlifting', 'Hipertrofia', 'Nutrición'],
    experience: '5 años',
    certifications: ['CSCS', 'Powerlifting Coach']
  },
];

const staticLocationInfo = {
  mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3553.017366937368!2d-101.56074932591812!3d27.061199753696098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x868bc7097088ba89%3A0xb8df300649d83db7!2sMUSCLE%20UP%20GYM!5e0!3m2!1ses!2smx!4v1748582869049!5m2!1ses!2smx',
  landmarks: [
    'A 2-3 minutos de la plaza principal',
    'Zona céntrica de fácil acceso',
    'Transporte público disponible'
  ]
};

const staticContactInfo = {
  socialMedia: {
    instagram: 'https://instagram.com/muscle_up_gym_sbv',
  }
};

const getCurrentDayIndex = (): number => {
  const today = new Date();
  return today.getDay();
};

// Función para calcular horario de atención (primer y último día hábil)
const getAttentionSchedule = (gymHours: Record<string, { open: string | null; close: string | null; closed?: boolean }>) => {
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNamesES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const openDays = dayOrder
    .map((day, idx) => ({ day, ...gymHours[day], dayIndex: (idx + 1) % 7 }))
    .filter(d => !d.closed && d.open && d.close)
    .sort((a, b) => a.dayIndex - b.dayIndex);

  if (openDays.length === 0) return 'Horarios no disponibles';

  const firstDay = dayNamesES[openDays[0].dayIndex];
  const lastDay = dayNamesES[openDays[openDays.length - 1].dayIndex];
  const firstHours = `${openDays[0].open} – ${openDays[0].close}`;

  return `${firstDay} a ${lastDay} ${firstHours}`;
};

// Componente para cada tarjeta de horario
const ScheduleCard = ({ day, hours, isToday }: {
  day: string;
  hours: string;
  isToday: boolean;
}) => {
  return (
    <Card
      hoverable
      style={{
        backgroundColor: isToday ? colorTokens.primary : colorTokens.gray900,
        border: `1px solid ${isToday ? colorTokens.primary : colorTokens.primaryBorder}`,
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        height: '100%',
        position: 'relative'
      }}
      className={isToday ? 'schedule-card-today' : 'schedule-card'}
    >
      {isToday && (
        <Tag
          color={colorTokens.blackPure}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          HOY
        </Tag>
      )}
      <Space orientation="vertical" size="small" style={{ width: '100%' }}>
        <Title
          level={4}
          style={{
            color: isToday ? colorTokens.blackPure : colorTokens.textPrimary,
            marginBottom: '8px',
            fontSize: 'clamp(18px, 2vw, 20px)',
            fontWeight: 'bold'
          }}
        >
          {day}
        </Title>
        <Text
          style={{
            color: isToday ? colorTokens.blackPure : colorTokens.textSecondary,
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            fontWeight: 500
          }}
        >
          {hours}
        </Text>
      </Space>
    </Card>
  );
};

// Componente para cada tarjeta de entrenador
const TrainerCard = ({ trainer }: { trainer: typeof trainers[0] }) => {
  return (
    <Card
      hoverable
      style={{
        backgroundColor: colorTokens.gray900,
        border: `1px solid ${colorTokens.primaryBorder}`,
        borderRadius: '16px',
        padding: '32px',
        height: '100%'
      }}
      className="trainer-card"
    >
      <Space orientation="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
        {/* Avatar */}
        <div
          style={{
            position: 'relative',
            width: 'clamp(96px, 12vw, 128px)',
            height: 'clamp(96px, 12vw, 128px)',
            margin: '0 auto',
            borderRadius: '50%',
            overflow: 'hidden',
            border: `4px solid ${colorTokens.primary}`,
            boxShadow: `0 0 20px ${colorTokens.primary}33`
          }}
          className="trainer-avatar"
        >
          <Image
            src={trainer.avatar}
            alt={trainer.name}
            fill
            style={{
              objectFit: 'cover'
            }}
            sizes="(max-width: 640px) 96px, 128px"
          />
        </div>

        {/* Información */}
        <Space orientation="vertical" size="small" style={{ width: '100%' }}>
          <Title
            level={3}
            style={{
              color: colorTokens.textPrimary,
              marginBottom: '4px',
              fontSize: 'clamp(20px, 2.5vw, 24px)',
              fontWeight: 'bold'
            }}
          >
            {trainer.name}
          </Title>

          <Text
            style={{
              color: colorTokens.primary,
              fontSize: 'clamp(16px, 2vw, 18px)',
              fontWeight: 600
            }}
          >
            {trainer.role}
          </Text>

          <Text
            style={{
              color: colorTokens.textSecondary,
              fontSize: 'clamp(14px, 1.8vw, 16px)'
            }}
          >
            📅 {trainer.experience}
          </Text>

          <Paragraph
            style={{
              color: colorTokens.textSecondary,
              fontSize: 'clamp(14px, 1.8vw, 16px)',
              lineHeight: 1.6,
              marginTop: '16px',
              marginBottom: '16px'
            }}
          >
            {trainer.bio}
          </Paragraph>

          {/* Tags */}
          <Space wrap size="small" style={{ justifyContent: 'center', marginTop: '16px' }}>
            {trainer.tags.map((tag) => (
              <Tag
                key={tag}
                color={colorTokens.primary}
                style={{
                  color: colorTokens.blackPure,
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontWeight: 500
                }}
              >
                {tag}
              </Tag>
            ))}
          </Space>

          {/* Certificaciones */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: `1px solid ${colorTokens.borderDefault}`
            }}
          >
            <Text
              style={{
                color: colorTokens.textTertiary,
                fontSize: 'clamp(12px, 1.5vw, 14px)'
              }}
            >
              🏆 {trainer.certifications.join(' • ')}
            </Text>
          </div>
        </Space>
      </Space>
    </Card>
  );
};

export default function InfoTabs() {
  const [active, setActive] = useState<TabKey>('horarios');
  const hydrated = useHydrated();
  const { settings } = useGymSettings();

  const locationInfo = {
    address: settings.gym_address,
    ...staticLocationInfo
  };

  const contactInfo = {
    phone: settings.gym_phone.replace(/\s/g, ''),
    email: settings.gym_email || 'administracion@muscleupgym.fitness',
    schedule: getAttentionSchedule(settings.gym_hours),
    socialMedia: {
      facebook: settings.gym_facebook_url,
      ...staticContactInfo.socialMedia
    }
  };

  const schedule = useMemo(() => {
    if (!hydrated) {
      return [];
    }

    const currentDayIndex = getCurrentDayIndex();

    const dayMapping: Record<string, { day: string; dayIndex: number }> = {
      monday: { day: 'Lunes', dayIndex: 1 },
      tuesday: { day: 'Martes', dayIndex: 2 },
      wednesday: { day: 'Miércoles', dayIndex: 3 },
      thursday: { day: 'Jueves', dayIndex: 4 },
      friday: { day: 'Viernes', dayIndex: 5 },
      saturday: { day: 'Sábado', dayIndex: 6 },
      sunday: { day: 'Domingo', dayIndex: 0 }
    };

    if (settings.gym_hours && typeof settings.gym_hours === 'object') {
      const dynamicSchedule = Object.entries(settings.gym_hours)
        .filter(([_, schedule]: [string, any]) => !schedule.closed && schedule.open && schedule.close)
        .map(([dayKey, schedule]: [string, any]) => {
          const dayInfo = dayMapping[dayKey];
          return {
            day: dayInfo.day,
            hours: `${schedule.open} - ${schedule.close}`,
            dayIndex: dayInfo.dayIndex,
            isToday: dayInfo.dayIndex === currentDayIndex
          };
        })
        .sort((a, b) => a.dayIndex - b.dayIndex);

      return dynamicSchedule;
    }

    return [];
  }, [hydrated, settings.gym_hours]);

  const tabItems = [
    {
      key: 'horarios',
      label: (
        <Space>
          <ClockCircleOutlined />
          <span>Horarios</span>
        </Space>
      ),
      children: (
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <Space orientation="vertical" size="small" style={{ width: '100%' }}>
            <Title
              level={2}
              style={{
                color: colorTokens.textPrimary,
                marginBottom: '8px',
                fontSize: 'clamp(24px, 3vw, 32px)',
                fontWeight: 'bold'
              }}
            >
              Nuestros Horarios
            </Title>
            <Paragraph
              style={{
                color: colorTokens.textSecondary,
                fontSize: 'clamp(16px, 2vw, 18px)',
                lineHeight: 1.6,
                marginBottom: '24px'
              }}
            >
              Abrimos todos los días para que no haya excusas. ¡Ven cuando mejor te convenga y entrena con nosotros!
            </Paragraph>
          </Space>

          <Row gutter={[16, 16]}>
            {schedule.map((item) => (
              <Col key={item.day} xs={12} sm={8} md={8} lg={4}>
                <ScheduleCard
                  day={item.day}
                  hours={item.hours}
                  isToday={item.isToday}
                />
              </Col>
            ))}
          </Row>

          <Alert
            message="⚠️ Entrada hasta 1 hora antes del cierre"
            type="warning"
            showIcon
            style={{
              marginTop: '32px',
              backgroundColor: `${colorTokens.warning}20`,
              border: `1px solid ${colorTokens.warningBorder}`,
              borderRadius: '12px'
            }}
          />
        </Space>
      ),
    },
    {
      key: 'ubicacion',
      label: (
        <Space>
          <EnvironmentOutlined />
          <span>Ubicación</span>
        </Space>
      ),
      children: (
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <Space orientation="vertical" size="small" style={{ width: '100%' }}>
            <Title
              level={2}
              style={{
                color: colorTokens.textPrimary,
                marginBottom: '8px',
                fontSize: 'clamp(24px, 3vw, 32px)',
                fontWeight: 'bold'
              }}
            >
              ¿Dónde Estamos?
            </Title>
          </Space>

          <Card
            style={{
              backgroundColor: colorTokens.blackPure,
              border: `1px solid ${colorTokens.primaryBorder}`,
              borderRadius: '16px',
              padding: 0,
              overflow: 'hidden'
            }}
            styles={{
              body: { padding: 0 }
            }}
          >
            <div
              style={{
                width: '100%',
                height: 'clamp(300px, 50vh, 500px)',
                position: 'relative'
              }}
            >
              <iframe
                src={locationInfo.mapUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Card>

          <Card
            style={{
              backgroundColor: colorTokens.gray900,
              border: `1px solid ${colorTokens.primaryBorder}`,
              borderRadius: '16px',
              padding: '32px'
            }}
          >
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              <Space size="middle" align="start">
                <EnvironmentOutlined style={{ color: colorTokens.primary, fontSize: '24px', marginTop: '4px' }} />
                <Text style={{ color: colorTokens.textPrimary, fontSize: 'clamp(16px, 2vw, 18px)' }}>
                  {locationInfo.address}
                </Text>
              </Space>

              <Text
                style={{
                  color: colorTokens.primary,
                  fontSize: 'clamp(14px, 1.8vw, 16px)',
                  fontWeight: 500,
                  display: 'block',
                  marginTop: '16px'
                }}
              >
                📍 Zona céntrica de fácil acceso. ¡Te esperamos!
              </Text>

              <Divider style={{ borderColor: colorTokens.borderDefault, margin: '16px 0' }} />

              <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                {locationInfo.landmarks.map((landmark) => (
                  <Space key={landmark} size="small">
                    <RightOutlined style={{ color: colorTokens.primary, fontSize: '16px' }} />
                    <Text style={{ color: colorTokens.textSecondary, fontSize: 'clamp(14px, 1.8vw, 16px)' }}>
                      {landmark}
                    </Text>
                  </Space>
                ))}
              </Space>
            </Space>
          </Card>
        </Space>
      ),
    },
    {
      key: 'entrenadores',
      label: (
        <Space>
          <TeamOutlined />
          <span>Nuestros Entrenadores</span>
        </Space>
      ),
      children: (
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <Space orientation="vertical" size="small" style={{ width: '100%' }}>
            <Title
              level={2}
              style={{
                color: colorTokens.textPrimary,
                marginBottom: '8px',
                fontSize: 'clamp(24px, 3vw, 32px)',
                fontWeight: 'bold'
              }}
            >
              Conoce al Equipo
            </Title>
            <Paragraph
              style={{
                color: colorTokens.textSecondary,
                fontSize: 'clamp(16px, 2vw, 18px)',
                lineHeight: 1.6,
                marginBottom: '24px'
              }}
            >
              Profesionales certificados y apasionados por ayudarte a lograr tus objetivos de fitness.
            </Paragraph>
          </Space>

          <Row gutter={[24, 24]}>
            {trainers.map((trainer) => (
              <Col key={trainer.id} xs={24} lg={12}>
                <TrainerCard trainer={trainer} />
              </Col>
            ))}
          </Row>
        </Space>
      ),
    },
    {
      key: 'contacto',
      label: (
        <Space>
          <MailOutlined />
          <span>Contáctanos</span>
        </Space>
      ),
      children: (
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <Space orientation="vertical" size="small" style={{ width: '100%' }}>
            <Title
              level={2}
              style={{
                color: colorTokens.textPrimary,
                marginBottom: '8px',
                fontSize: 'clamp(24px, 3vw, 32px)',
                fontWeight: 'bold'
              }}
            >
              Hablemos
            </Title>
            <Paragraph
              style={{
                color: colorTokens.textSecondary,
                fontSize: 'clamp(16px, 2vw, 18px)',
                lineHeight: 1.6,
                marginBottom: '24px'
              }}
            >
              ¿Dudas? ¿Preguntas? ¿Listo para empezar? Contáctanos por cualquier medio y te atenderemos de inmediato.
            </Paragraph>
          </Space>

          <Card
            style={{
              backgroundColor: colorTokens.gray900,
              border: `1px solid ${colorTokens.primaryBorder}`,
              borderRadius: '16px',
              padding: '32px'
            }}
          >
            <Space orientation="vertical" size="large" style={{ width: '100%' }}>
              <Card
                hoverable
                style={{
                  backgroundColor: colorTokens.blackPure,
                  border: `1px solid ${colorTokens.borderDefault}`,
                  borderRadius: '12px',
                  padding: '24px'
                }}
              >
                <Space size="middle" align="start">
                  <PhoneOutlined style={{ color: colorTokens.primary, fontSize: '24px', marginTop: '4px' }} />
                  <Space orientation="vertical" size="small">
                    <Text strong style={{ color: colorTokens.textPrimary, fontSize: 'clamp(16px, 2vw, 18px)' }}>
                      Teléfono
                    </Text>
                    <a
                      href={`tel:${contactInfo.phone}`}
                      style={{
                        color: colorTokens.primary,
                        fontSize: 'clamp(16px, 2vw, 18px)',
                        textDecoration: 'none'
                      }}
                      className="contact-link"
                    >
                      {settings.gym_phone}
                    </a>
                  </Space>
                </Space>
              </Card>

              <Card
                hoverable
                style={{
                  backgroundColor: colorTokens.blackPure,
                  border: `1px solid ${colorTokens.borderDefault}`,
                  borderRadius: '12px',
                  padding: '24px'
                }}
              >
                <Space size="middle" align="start">
                  <MailOutlined style={{ color: colorTokens.primary, fontSize: '24px', marginTop: '4px' }} />
                  <Space orientation="vertical" size="small">
                    <Text strong style={{ color: colorTokens.textPrimary, fontSize: 'clamp(16px, 2vw, 18px)' }}>
                      Email
                    </Text>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      style={{
                        color: colorTokens.primary,
                        fontSize: 'clamp(16px, 2vw, 18px)',
                        textDecoration: 'none'
                      }}
                      className="contact-link"
                    >
                      {contactInfo.email}
                    </a>
                  </Space>
                </Space>
              </Card>

              <Card
                style={{
                  backgroundColor: colorTokens.blackPure,
                  border: `1px solid ${colorTokens.borderDefault}`,
                  borderRadius: '12px',
                  padding: '24px'
                }}
              >
                <Space size="middle" align="start">
                  <ClockCircleOutlined style={{ color: colorTokens.primary, fontSize: '24px', marginTop: '4px' }} />
                  <Space orientation="vertical" size="small">
                    <Text strong style={{ color: colorTokens.textPrimary, fontSize: 'clamp(16px, 2vw, 18px)' }}>
                      Horario de atención
                    </Text>
                    <Text style={{ color: colorTokens.textSecondary, fontSize: 'clamp(14px, 1.8vw, 16px)' }}>
                      {contactInfo.schedule}
                    </Text>
                  </Space>
                </Space>
              </Card>
            </Space>
          </Card>

          <Space size="middle" wrap style={{ marginTop: '24px' }}>
            {contactInfo.socialMedia.facebook && (
              <Button
                type="primary"
                icon={<FacebookOutlined />}
                href={contactInfo.socialMedia.facebook}
                target="_blank"
                rel="noreferrer"
                size="large"
                style={{
                  backgroundColor: '#1877F2',
                  borderColor: '#1877F2',
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px',
                  fontWeight: 500
                }}
                className="social-button"
              >
                Facebook
              </Button>
            )}
            <Button
              type="primary"
              icon={<InstagramOutlined />}
              href={contactInfo.socialMedia.instagram}
              target="_blank"
              rel="noreferrer"
              size="large"
              style={{
                background: 'linear-gradient(45deg, #833AB4, #E1306C, #FCAF45)',
                borderColor: 'transparent',
                height: '48px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 500
              }}
              className="social-button"
            >
              Instagram
            </Button>
          </Space>
        </Space>
      ),
    },
  ];

  return (
    <section
      id="info"
      style={{
        position: 'relative',
        padding: 'clamp(64px, 8vw, 128px) 24px',
        backgroundColor: colorTokens.blackPure,
        overflow: 'hidden'
      }}
    >
      {/* Fondo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to bottom right, ${colorTokens.gray900}33, ${colorTokens.blackPure})`,
          zIndex: 0
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
        {/* Encabezado */}
        <Space
          orientation="vertical"
          size="large"
          style={{ width: '100%', marginBottom: '64px', textAlign: 'center' }}
        >
          <Title
            level={1}
            style={{
              color: colorTokens.textPrimary,
              marginBottom: '16px',
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 'bold'
            }}
          >
            Todo lo que necesitas saber
          </Title>

          <div
            style={{
              width: 'clamp(64px, 8vw, 96px)',
              height: '3px',
              backgroundColor: colorTokens.primary,
              margin: '0 auto 24px auto',
              borderRadius: '2px'
            }}
          />

          <Paragraph
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: colorTokens.textSecondary,
              fontWeight: 500,
              marginBottom: 0
            }}
          >
            Horarios, ubicación, equipo profesional y formas de contacto. ¡Estamos listos para ayudarte!
          </Paragraph>
        </Space>

        {/* Tabs */}
        <Tabs
          activeKey={active}
          onChange={(key) => setActive(key as TabKey)}
          items={tabItems}
          size="large"
          className="info-tabs"
          style={{
            color: colorTokens.textPrimary
          }}
        />
      </div>
    </section>
  );
}
