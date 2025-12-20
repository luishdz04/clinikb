'use client';
import { Layout, Row, Col, Typography, Space, Divider, Button } from 'antd';
import {
  EnvironmentOutlined,
  PhoneOutlined,
  FacebookOutlined,
  InstagramOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useGymSettings } from '@/hooks/useGymSettings';
import { colors } from '@/theme';
import Link from 'next/link';

const { Footer: AntFooter } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function Footer() {
  const { settings } = useGymSettings();

  const handleMapsClick = () => {
    window.open(settings.gym_maps_url || 'https://maps.google.com', '_blank', 'noopener,noreferrer');
  };

  const handleFacebookClick = () => {
    if (settings.gym_facebook_url) {
      window.open(settings.gym_facebook_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <AntFooter
      style={{
        background: `linear-gradient(to bottom, ${colors.background.primary}, ${colors.background.secondary})`,
        color: colors.text.primary,
        padding: '64px 24px 24px',
        borderTop: `1px solid ${colors.border.light}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <Row gutter={[48, 48]} style={{ marginBottom: '48px' }}>
          {/* Columna 1: Logo y Redes */}
          <Col xs={24} md={8}>
            <div className="flex flex-col items-center text-center gap-6">
              <img
                src="/images/logocircular.png"
                alt="Muscle Up GYM"
                style={{
                  height: 'auto',
                  width: '150px',
                  maxWidth: '100%',
                }}
              />
              <Paragraph style={{ 
                color: colors.text.secondary, 
                fontSize: '18px',
                marginBottom: '24px'
              }}>
                Tu salud y bienestar es nuestra misión.
              </Paragraph>
              <Button
                type="primary"
                icon={<FacebookOutlined />}
                size="large"
                onClick={handleFacebookClick}
                style={{
                  background: '#1877F2',
                  borderColor: '#1877F2',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                Síguenos en Facebook
              </Button>
            </div>
          </Col>

          {/* Columna 2: Ubicación */}
          <Col xs={24} md={8}>
            <div className="flex flex-col items-center text-center gap-4">
              <Title
                level={4}
                style={{
                  color: colors.brand.primary,
                  marginBottom: '24px',
                  fontSize: '20px',
                  fontWeight: 700,
                }}
              >
                📍 Nuestra Ubicación
              </Title>
              
              <div 
                onClick={handleMapsClick}
                style={{ cursor: 'pointer' }}
                className="hover:opacity-80 transition-opacity"
              >
                <EnvironmentOutlined
                  style={{
                    fontSize: '32px',
                    color: colors.brand.primary,
                    marginBottom: '16px',
                  }}
                />
                <Paragraph
                  style={{
                    color: colors.text.primary,
                    fontSize: '16px',
                    lineHeight: 1.8,
                    marginBottom: '16px',
                  }}
                >
                  Francisco I. Madero 708<br />
                  Colonia Lindavista<br />
                  San Buenaventura<br />
                  Coahuila
                </Paragraph>
                <Text
                  style={{
                    color: colors.brand.primary,
                    fontSize: '14px',
                    textDecoration: 'underline',
                  }}
                >
                  📱 Toca para abrir en Maps
                </Text>
              </div>
            </div>
          </Col>

          {/* Columna 3: Enlaces Útiles */}
          <Col xs={24} md={8}>
            <div className="flex flex-col items-center text-center gap-4">
              <Title
                level={4}
                style={{
                  color: colors.brand.primary,
                  marginBottom: '24px',
                  fontSize: '20px',
                  fontWeight: 700,
                }}
              >
                🔗 Enlaces Útiles
              </Title>
              
              <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                <Link href="/aviso-privacidad" className="text-gray-300 hover:text-primary transition-colors text-base">
                  🔒 Aviso de Privacidad
                </Link>
                
                <a 
                  href={`tel:${settings.gym_phone}`}
                  className="text-gray-300 hover:text-primary transition-colors text-base"
                >
                  📞 866 1127905
                </a>
                
                <Link href="/preguntas-frecuentes" className="text-gray-300 hover:text-primary transition-colors text-base">
                  ❓ Preguntas Frecuentes
                </Link>
              </Space>
            </div>
          </Col>
        </Row>

        <Divider style={{ borderColor: colors.border.light, margin: '48px 0 24px' }} />

        <div className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Muscle Up GYM. Todos los derechos reservados.
        </div>
      </div>
    </AntFooter>
  );
}
