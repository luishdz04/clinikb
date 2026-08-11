import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface VerificationCodeEmailProps {
  /** Código de 6 dígitos que genera Supabase Auth. */
  token: string;
  /** Nombre del paciente, si Auth lo trae en su metadata. */
  fullName?: string;
  /** Minutos de vigencia del código (Auth > Providers > Email > OTP Expiration). */
  expiresInMinutes?: number;
}

/**
 * Correo de verificación de alta. Deliberadamente NO incluye datos clínicos ni
 * personales más allá del nombre: el correo no es un canal confidencial.
 */
export function VerificationCodeEmail({
  token,
  fullName,
  expiresInMinutes = 10,
}: VerificationCodeEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Tu código de verificación de CliniKB es {token}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>CliniKB</Heading>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={title}>
              Confirma tu correo
            </Heading>

            <Text style={text}>
              {fullName ? `Hola ${fullName}: ` : "Hola: "}
              para terminar tu registro, escribe este código en la página donde te quedaste.
            </Text>

            <Section style={codeBox}>
              <Text style={code}>{token}</Text>
            </Section>

            <Text style={muted}>
              El código vence en {expiresInMinutes} minutos. Si se te pasa el tiempo, puedes
              pedir uno nuevo desde la misma página.
            </Text>

            <Hr style={hr} />

            <Text style={muted}>
              Si tú no solicitaste este registro, ignora este mensaje: sin el código no se
              crea ninguna cuenta.
            </Text>

            <Text style={notice}>
              Recuerda que tu registro pasa por una revisión antes de quedar activo. Te
              avisaremos por este mismo medio cuando sea aprobado.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              CliniKB · Este correo se envió de forma automática.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default VerificationCodeEmail;

// Colores espejo de src/theme/themeConfig.ts. Van en línea y hardcodeados
// porque los clientes de correo no soportan variables CSS ni hojas externas.
const MARCA = "#55c5c4";
const MARCA_PROFUNDA = "#2b6068";
const TINTA = "#060807";

const body = {
  backgroundColor: "#f5f5f5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "24px 0",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "600px",
  overflow: "hidden" as const,
};

const header = {
  backgroundColor: MARCA_PROFUNDA,
  padding: "32px 24px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  letterSpacing: "1px",
  margin: 0,
};

const content = { padding: "32px 32px 8px" };

const title = { color: TINTA, fontSize: "20px", margin: "0 0 16px" };

const text = { color: "#333333", fontSize: "15px", lineHeight: "24px", margin: "0 0 24px" };

const codeBox = {
  backgroundColor: "#f4fbfb",
  border: `2px solid ${MARCA}`,
  borderRadius: "8px",
  margin: "0 0 24px",
  padding: "20px",
  textAlign: "center" as const,
};

const code = {
  color: MARCA_PROFUNDA,
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "36px",
  fontWeight: "bold",
  letterSpacing: "10px",
  lineHeight: "40px",
  margin: 0,
};

const muted = { color: "#767676", fontSize: "13px", lineHeight: "20px", margin: "0 0 16px" };

const notice = {
  backgroundColor: "#fdf8ef",
  borderLeft: "4px solid #dfc79c",
  color: "#5b5035",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 8px",
  padding: "12px 16px",
};

const hr = { borderColor: "#eaeaea", margin: "24px 0" };

const footer = { padding: "16px 32px 32px" };

const footerText = { color: "#9a9a9a", fontSize: "12px", margin: 0, textAlign: "center" as const };
