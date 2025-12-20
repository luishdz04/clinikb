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
  Hr,
} from '@react-email/components';
import type { PatronesRespuestas } from '@/types/patrones';

interface PatronesAdminSummaryEmailProps {
  userName: string;
  userEmail: string;
  edad?: number;
  sexo?: string;
  telefono?: string;
  respuestas: PatronesRespuestas;
  evaluationId: string;
  evaluationDate: string;
}

export default function PatronesAdminSummaryEmail({
  userName,
  userEmail,
  edad,
  sexo,
  telefono,
  respuestas,
  evaluationId,
  evaluationDate,
}: PatronesAdminSummaryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nueva evaluación MUPAI completada por {userName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src="https://muscleupgym.fitness/logos/logo.png"
              width="180"
              height="54"
              alt="Muscle Up GYM"
              style={logo}
            />
          </Section>

          {/* Header */}
          <Heading style={h1}>
            Nueva Evaluación de Patrones Alimentarios
          </Heading>

          <Section style={alertBox}>
            <Text style={alertText}>
              📋 Se ha completado una nueva evaluación MUPAI
            </Text>
          </Section>

          {/* Datos del Cliente */}
          <Section style={infoSection}>
            <Heading style={h2}>👤 Datos del Cliente</Heading>
            <Text style={dataRow}>
              <strong>Nombre:</strong> {userName}
            </Text>
            <Text style={dataRow}>
              <strong>Email:</strong> {userEmail}
            </Text>
            {telefono && (
              <Text style={dataRow}>
                <strong>Teléfono:</strong> {telefono}
              </Text>
            )}
            {edad && (
              <Text style={dataRow}>
                <strong>Edad:</strong> {edad} años
              </Text>
            )}
            {sexo && (
              <Text style={dataRow}>
                <strong>Sexo:</strong> {sexo}
              </Text>
            )}
            <Text style={dataRow}>
              <strong>Fecha de evaluación:</strong> {evaluationDate}
            </Text>
          </Section>

          <Hr style={divider} />

          {/* GRUPO 1: Proteínas Grasas */}
          {respuestas.grupo1_proteinas_grasas && (
            <>
              <Section style={groupSection}>
                <Heading style={h2}>🥩 GRUPO 1: Proteínas con más grasa</Heading>
                {renderSubgroup(
                  'Huevos/Embutidos',
                  respuestas.grupo1_proteinas_grasas.huevos_embutidos
                )}
                {renderSubgroup(
                  'Carnes de res grasas',
                  respuestas.grupo1_proteinas_grasas.carnes_res_grasas
                )}
                {renderSubgroup(
                  'Carnes de cerdo grasas',
                  respuestas.grupo1_proteinas_grasas.carnes_cerdo_grasas
                )}
                {renderSubgroup(
                  'Quesos altos en grasa',
                  respuestas.grupo1_proteinas_grasas.quesos_grasos
                )}
                {renderSubgroup(
                  'Pescados grasos',
                  respuestas.grupo1_proteinas_grasas.pescados_grasos
                )}
              </Section>
              <Hr style={divider} />
            </>
          )}

          {/* GRUPO 2: Proteínas Magras */}
          {respuestas.grupo2_proteinas_magras && (
            <>
              <Section style={groupSection}>
                <Heading style={h2}>🍗 GRUPO 2: Proteínas magras</Heading>
                {renderSubgroup(
                  'Carnes de res magras',
                  respuestas.grupo2_proteinas_magras.carnes_res_magras
                )}
                {renderSubgroup(
                  'Pescados magros',
                  respuestas.grupo2_proteinas_magras.pescados_magros
                )}
                {renderSubgroup(
                  'Lácteos light',
                  respuestas.grupo2_proteinas_magras.lacteos_light
                )}
              </Section>
              <Hr style={divider} />
            </>
          )}

          {/* GRUPO 3: Grasas Saludables */}
          {respuestas.grupo3_grasas_saludables && (
            <>
              <Section style={groupSection}>
                <Heading style={h2}>🥑 GRUPO 3: Grasas saludables</Heading>
                {renderSubgroup(
                  'Grasas naturales',
                  respuestas.grupo3_grasas_saludables.grasas_naturales
                )}
                {renderSubgroup(
                  'Frutos secos/semillas',
                  respuestas.grupo3_grasas_saludables.frutos_secos_semillas
                )}
              </Section>
              <Hr style={divider} />
            </>
          )}

          {/* GRUPO 4: Carbohidratos */}
          {respuestas.grupo4_carbohidratos && (
            <>
              <Section style={groupSection}>
                <Heading style={h2}>🍞 GRUPO 4: Carbohidratos</Heading>
                {renderSubgroup(
                  'Cereales integrales',
                  respuestas.grupo4_carbohidratos.cereales_integrales
                )}
                {renderSubgroup(
                  'Tortillas/panes',
                  respuestas.grupo4_carbohidratos.tortillas_panes
                )}
                {renderSubgroup(
                  'Leguminosas',
                  respuestas.grupo4_carbohidratos.leguminosas
                )}
              </Section>
              <Hr style={divider} />
            </>
          )}

          {/* Vegetales y Frutas */}
          {(respuestas.grupo5_vegetales || respuestas.grupo6_frutas) && (
            <>
              <Section style={groupSection}>
                {respuestas.grupo5_vegetales && (
                  <>
                    <Heading style={h2}>🥬 GRUPO 5: Vegetales</Heading>
                    <Text style={listText}>
                      {respuestas.grupo5_vegetales.join(', ')}
                    </Text>
                  </>
                )}
                {respuestas.grupo6_frutas && (
                  <>
                    <Heading style={h2}>🍎 GRUPO 6: Frutas</Heading>
                    <Text style={listText}>{respuestas.grupo6_frutas.join(', ')}</Text>
                  </>
                )}
              </Section>
              <Hr style={divider} />
            </>
          )}

          {/* Alergias e Intolerancias */}
          {respuestas.alergias_intolerancias && (
            <>
              <Section style={warningSection}>
                <Heading style={h2}>⚠️ RESTRICCIONES IMPORTANTES</Heading>
                <Text style={dataRow}>
                  <strong>Alergias:</strong>{' '}
                  {respuestas.alergias_intolerancias.alergias.join(', ')}
                </Text>
                {respuestas.alergias_intolerancias.otra_alergia && (
                  <Text style={dataRow}>
                    <strong>Otra alergia:</strong>{' '}
                    {respuestas.alergias_intolerancias.otra_alergia}
                  </Text>
                )}
                <Text style={dataRow}>
                  <strong>Intolerancias:</strong>{' '}
                  {respuestas.alergias_intolerancias.intolerancias.join(', ')}
                </Text>
              </Section>
              <Hr style={divider} />
            </>
          )}

          {/* Frecuencia de comidas */}
          {respuestas.frecuencia_comidas && (
            <Section style={infoSection}>
              <Heading style={h2}>🍽️ Frecuencia de comidas</Heading>
              <Text style={dataRow}>{respuestas.frecuencia_comidas}</Text>
            </Section>
          )}

          {/* Sugerencias del cliente */}
          {respuestas.sugerencias_menus && (
            <>
              <Hr style={divider} />
              <Section style={infoSection}>
                <Heading style={h2}>📝 Sugerencias del cliente</Heading>
                <Text style={textBlock}>{respuestas.sugerencias_menus}</Text>
              </Section>
            </>
          )}

          {/* Botón para ver evaluación completa */}
          <Section style={buttonContainer}>
            <Link
              style={button}
              href={`https://muscleupgym.fitness/admin/evaluaciones-patrones/${evaluationId}`}
            >
              Ver Evaluación Completa en Admin
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Sistema MUPAI - Muscle Up Performance Assessment Intelligence
            </Text>
            <Text style={footerTextSmall}>
              Este email fue generado automáticamente. Por favor no responder.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ============================================================================
// HELPER FUNCTION
// ============================================================================
function renderSubgroup(title: string, items: string[]) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: '12px' }}>
      <Text style={subgroupTitle}>{title}:</Text>
      <Text style={listText}>{items.join(', ')}</Text>
    </div>
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
  maxWidth: '700px',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '26px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '0 0 24px',
  lineHeight: '1.3',
};

const h2 = {
  color: '#2c3e50',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 12px',
  lineHeight: '1.4',
};

const alertBox = {
  backgroundColor: '#FFF4E6',
  border: '2px solid #FFB300',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const alertText = {
  color: '#C77700',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const infoSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 0 20px',
};

const groupSection = {
  backgroundColor: '#ffffff',
  borderLeft: '4px solid #FFB300',
  padding: '16px',
  margin: '0 0 20px',
};

const warningSection = {
  backgroundColor: '#FFF3E0',
  border: '2px solid #FF9800',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 0 20px',
};

const dataRow = {
  color: '#404040',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
};

const subgroupTitle = {
  color: '#555',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const listText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const textBlock = {
  color: '#404040',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
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
};

const divider = {
  borderColor: '#e6e6e6',
  margin: '24px 0',
};

const footer = {
  borderTop: '1px solid #e6e6e6',
  marginTop: '32px',
  paddingTop: '20px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '8px 0',
  fontWeight: '600',
};

const footerTextSmall = {
  color: '#999999',
  fontSize: '11px',
  lineHeight: '18px',
  margin: '4px 0',
};
