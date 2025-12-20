import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PatronesCompletedEmailProps {
  userName: string;
  evaluationDate: string;
}

export default function PatronesCompletedEmail({
  userName,
  evaluationDate,
}: PatronesCompletedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu evaluación de patrones alimentarios ha sido completada exitosamente</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src="https://muscleupgym.fitness/logos/logo.png"
              width="200"
              height="60"
              alt="Muscle Up GYM"
              style={logo}
            />
          </Section>

          {/* Header con emoji */}
          <Heading style={h1}>¡Evaluación Completada! 🎉</Heading>

          {/* Contenido principal */}
          <Text style={text}>Hola <strong>{userName}</strong>,</Text>

          <Text style={text}>
            Tu evaluación de <strong>Patrones Alimentarios MUPAI</strong> ha sido
            completada exitosamente el <strong>{evaluationDate}</strong>.
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightText}>
              📊 Tu perfil alimentario ha sido registrado y está siendo revisado por
              nuestro equipo de nutrición especializado.
            </Text>
          </Section>

          <Text style={text}>
            <strong>¿Qué sigue?</strong>
          </Text>

          <Text style={listItem}>
            ✅ Nuestro equipo está analizando tus respuestas
          </Text>
          <Text style={listItem}>
            ✅ Pronto recibirás tu plan nutricional personalizado
          </Text>
          <Text style={listItem}>
            ✅ El plan estará adaptado a tus preferencias y necesidades específicas
          </Text>

          {/* Botón CTA */}
          <Section style={buttonContainer}>
            <Link style={button} href="https://muscleupgym.fitness/cliente/dashboard">
              Ver Mi Dashboard
            </Link>
          </Section>

          {/* Información adicional */}
          <Section style={infoBox}>
            <Text style={infoText}>
              💡 <strong>Tip:</strong> Mientras esperas, puedes explorar tu dashboard
              y revisar tu plan de entrenamiento actual.
            </Text>
          </Section>

          {/* Contacto */}
          <Text style={text}>
            ¿Tienes preguntas sobre tu evaluación?
          </Text>
          <Text style={text}>
            Contáctanos en{' '}
            <Link
              href="mailto:administracion@muscleupgym.fitness?subject=Consulta sobre evaluación MUPAI"
              style={link}
            >
              administracion@muscleupgym.fitness
            </Link>
          </Text>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2025 <strong>Muscle Up GYM</strong>. Todos los derechos reservados.
            </Text>
            <Text style={footerTextSmall}>
              Sistema MUPAI - Muscle Up Performance Assessment Intelligence
            </Text>
            <Text style={footerTextSmall}>
              San Buenaventura, Coahuila, México
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ============================================================================
// ESTILOS
// ============================================================================

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '0 0 30px',
  lineHeight: '1.3',
};

const text = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const listItem = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '8px 0',
  paddingLeft: '20px',
};

const highlightBox = {
  backgroundColor: '#FFF4E6',
  border: '2px solid #FFB300',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const highlightText = {
  color: '#C77700',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0',
  textAlign: 'center' as const,
};

const infoBox = {
  backgroundColor: '#E3F2FD',
  border: '1px solid #2196F3',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const infoText = {
  color: '#1565C0',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#FFB300',
  borderRadius: '8px',
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  border: '2px solid #FFB300',
  transition: 'all 0.3s ease',
};

const link = {
  color: '#2196F3',
  textDecoration: 'underline',
  fontWeight: '600',
};

const footer = {
  borderTop: '1px solid #e6e6e6',
  marginTop: '40px',
  paddingTop: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
};

const footerTextSmall = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '4px 0',
};
