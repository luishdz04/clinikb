'use client';
import { Typography, Button, Space, Card, Row, Col, Divider } from 'antd';
import { 
  ThunderboltOutlined, 
  FireOutlined, 
  ExperimentOutlined,
  CheckOutlined,
  MailOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { colors } from '@/theme';

const { Title, Paragraph, Text } = Typography;

export default function SuplementosPage() {
  const logos = [
    'muscletech-logo-3DBC4BBC88-seeklogo.com_.png',
    'descarga.jpg',
    'descarga-1.png',
    'bpinew.webp'
  ];

  const suplementosInfo = [
    {
      title: "Proteína",
      icon: <ThunderboltOutlined style={{ fontSize: '32px', color: colors.brand.primary }} />,
      description: "Esencial para la síntesis de proteína muscular",
      benefits: [
        "Acelera la recuperación muscular post-entrenamiento",
        "Estimula la síntesis de proteína muscular (MPS)",
        "Ayuda a mantener la masa muscular en déficit calórico",
        "Mejora la saciedad y control del apetito"
      ],
      science: "Estudios demuestran que consumir 20-40g de proteína post-ejercicio optimiza la síntesis proteica muscular durante las siguientes 3-4 horas."
    },
    {
      title: "Creatina",
      icon: <FireOutlined style={{ fontSize: '32px', color: colors.brand.primary }} />,
      description: "El suplemento más estudiado para rendimiento deportivo",
      benefits: [
        "Aumenta la fuerza y potencia muscular hasta un 15%",
        "Mejora el rendimiento en ejercicios de alta intensidad",
        "Acelera la regeneración de ATP",
        "Puede incrementar la masa muscular magra"
      ],
      science: "Más de 1000 estudios respaldan la eficacia de 3-5g diarios de monohidrato de creatina para mejorar el rendimiento deportivo."
    },
    {
      title: "Quemadores de Grasa",
      icon: <FireOutlined style={{ fontSize: '32px', color: colors.brand.primary }} />,
      description: "Potenciadores del metabolismo y la termogénesis",
      benefits: [
        "Incrementan la termogénesis hasta un 5-10%",
        "Mejoran la oxidación de grasas durante el ejercicio",
        "Pueden suprimir el apetito naturalmente",
        "Aumentan los niveles de energía y concentración"
      ],
      science: "Ingredientes como la cafeína, té verde y L-carnitina han demostrado científicamente incrementar el gasto energético y la movilización de grasas."
    },
    {
      title: "BCAA / EAA",
      icon: <ExperimentOutlined style={{ fontSize: '32px', color: colors.brand.primary }} />,
      description: "Aminoácidos esenciales para la construcción muscular",
      benefits: [
        "Previenen el catabolismo muscular durante el entrenamiento",
        "Reducen la fatiga y mejoran la resistencia",
        "Aceleran la síntesis de proteína muscular",
        "Disminuyen el dolor muscular post-ejercicio"
      ],
      science: "Los aminoácidos de cadena ramificada, especialmente la leucina, activan la vía mTOR, clave para la síntesis proteica."
    }
  ];

  const handleSolicitarCotizacion = () => {
    const subject = encodeURIComponent("Consulta sobre Suplementos - Muscle Up GYM");
    const body = encodeURIComponent(`Hola,

Me interesa recibir más información sobre los suplementos que manejan en Muscle Up GYM.

Específicamente me gustaría conocer:
- Marcas disponibles
- Precios y promociones
- Asesoría personalizada sobre suplementación

¡Espero su respuesta!

Saludos.`);

    window.location.href = `mailto:administracion@muscleupgym.fitness?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen" style={{ background: colors.background.primary, color: colors.text.primary, paddingTop: '80px', paddingBottom: '80px' }}>
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
              Suplementos
            </Title>
            <Paragraph style={{ color: colors.text.secondary, fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
              Las mejores marcas y productos para optimizar tus resultados
            </Paragraph>
          </div>
        </div>

        {/* Logos de marcas */}
        <div className="mb-20">
          <Title level={2} style={{ color: colors.brand.primary, textAlign: 'center', marginBottom: '32px', fontSize: 'clamp(24px, 3vw, 32px)' }}>
            Marcas de Confianza
          </Title>
          
          <Row gutter={[24, 24]} justify="center">
            {logos.map((logo, index) => (
              <Col key={index} xs={12} sm={8} md={6} lg={6}>
                <Card
                  hoverable
                  style={{
                    backgroundColor: colors.background.secondary,
                    border: `2px solid ${colors.border.light}`,
                    borderRadius: '16px',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '160px',
                    padding: '24px'
                  }}
                  styles={{
                    body: {
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      width: '100%'
                    }
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '100px' }}>
                    <Image
                      src={`/marcas/${logo}`}
                      alt={`Marca ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Sección educativa */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <Title level={2} style={{ color: colors.brand.primary, marginBottom: '16px', fontSize: 'clamp(28px, 4vw, 40px)' }}>
              Ciencia y Beneficios
            </Title>
            <Paragraph style={{ color: colors.text.secondary, fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
              Información respaldada por estudios científicos sobre los suplementos más efectivos
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {suplementosInfo.map((suplemento, index) => (
              <Col key={index} xs={24} sm={24} md={12} lg={12}>
                <Card
                  hoverable
                  style={{
                    backgroundColor: colors.background.secondary,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: '16px',
                    height: '100%'
                  }}
                >
                  <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                    <Space size="middle" align="start">
                      {suplemento.icon}
                      <Space orientation="vertical" size="small" style={{ flex: 1 }}>
                        <Title level={3} style={{ color: colors.brand.primary, marginBottom: '8px', fontSize: 'clamp(20px, 2.5vw, 24px)' }}>
                          {suplemento.title}
                        </Title>
                        <Text style={{ color: colors.text.secondary, fontWeight: 500, fontSize: '16px' }}>
                          {suplemento.description}
                        </Text>
                      </Space>
                    </Space>

                    <Divider style={{ borderColor: colors.border.primary, margin: '16px 0' }} />

                    <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                      <Title level={4} style={{ color: colors.brand.primary, marginBottom: '12px', fontSize: '18px' }}>
                        Beneficios Principales:
                      </Title>
                      <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                        {suplemento.benefits.map((benefit, benefitIndex) => (
                          <Space key={benefitIndex} size="small" align="start">
                            <CheckOutlined style={{ color: colors.brand.primary, fontSize: '16px', marginTop: '4px' }} />
                            <Text style={{ color: colors.text.secondary, fontSize: '16px' }}>
                              {benefit}
                            </Text>
                          </Space>
                        ))}
                      </Space>
                    </Space>

                    <Card
                      style={{
                        backgroundColor: colors.background.tertiary,
                        border: `1px solid ${colors.border.light}`,
                        borderRadius: '8px',
                        marginTop: '16px'
                      }}
                    >
                      <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                        <Space size="small">
                          <ExperimentOutlined style={{ color: colors.brand.primary, fontSize: '16px' }} />
                          <Text strong style={{ color: colors.brand.primary, fontSize: '16px' }}>
                            Respaldo Científico
                          </Text>
                        </Space>
                        <Text style={{ color: colors.text.secondary, fontSize: '14px', lineHeight: 1.6 }}>
                          {suplemento.science}
                        </Text>
                      </Space>
                    </Card>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Call to action */}
        <Card
          style={{
            backgroundColor: colors.background.secondary,
            border: `1px solid ${colors.brand.primary}`,
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center'
          }}
        >
          <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <Title level={2} style={{ color: colors.brand.primary, marginBottom: '16px', fontSize: 'clamp(24px, 3vw, 32px)' }}>
              ¿Listo para optimizar tus resultados?
            </Title>
            <Paragraph style={{ color: colors.text.secondary, fontSize: '18px', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px auto' }}>
              Contáctanos para una asesoría personalizada sobre suplementación
            </Paragraph>
            <Button
              type="primary"
              size="large"
              icon={<MailOutlined />}
              onClick={handleSolicitarCotizacion}
              style={{
                backgroundColor: colors.brand.primary,
                borderColor: colors.brand.primary,
                color: colors.background.primary,
                fontWeight: 'bold',
                height: '48px',
                fontSize: '18px',
                paddingLeft: '48px',
                paddingRight: '48px'
              }}
            >
              Solicitar Cotización
            </Button>
            <Text style={{ color: colors.text.muted, fontSize: '14px', opacity: 0.7, display: 'block', marginTop: '16px' }}>
              Te redirigiremos a tu cliente de correo para contactar directamente
            </Text>
          </Space>
        </Card>
      </div>
    </div>
  );
}
