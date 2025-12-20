import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
  Link,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  firstName: string;
  contractUrl?: string;
}

export const WelcomeEmail = ({
  firstName,
  contractUrl,
}: WelcomeEmailProps) => {
  const previewText = `¡Bienvenido a Muscle Up GYM!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#f4f4f4] my-auto mx-auto font-sans px-2 py-5">
          <Container className="bg-white border border-solid border-[#e0e0e0] rounded-lg mx-auto max-w-[600px] overflow-hidden">
            
            {/* Barra superior amarilla */}
            <Section className="h-[6px] bg-[#ffcc00] w-full"></Section>

            {/* Logo y Título */}
            <Section className="p-[30px] pb-[20px] text-center">
              <Img
                src="https://muscleupgym.fitness/logo.png"
                width="180"
                height="auto"
                alt="Muscle Up GYM Logo"
                className="mx-auto mb-[20px] block max-w-[180px]"
              />
              <Heading className="m-0 text-black text-[24px] font-bold">
                ¡Bienvenido a Muscle Up GYM!
              </Heading>
            </Section>

            {/* Contenido Principal */}
            <Section className="px-[30px] pb-[30px]">
              <Text className="text-[18px] font-bold text-black mb-[15px]">
                Hola {firstName},
              </Text>
              
              <Text className="text-[#333333] text-[16px] leading-[1.6]">
                Estamos emocionados de tenerte como parte de nuestra comunidad fitness. Tu registro en nuestro sitio web ha sido exitoso.
              </Text>
              
              <Text className="text-[#333333] text-[16px] leading-[1.6]">
                Para activar tu membresía y acceder a las instalaciones, por favor contáctanos directamente para revisar nuestros planes disponibles.
              </Text>

              <Text className="text-[#333333] text-[16px] leading-[1.6]">
                Adjunto a este correo encontrarás tu <strong>Contrato de registro</strong>. Por favor, consérvalo para tus registros.
              </Text>
              
              {contractUrl && (
                <Section className="text-center py-[20px]">
                  <Button
                    className="bg-[#ffcc00] text-black px-[24px] py-[12px] rounded-[5px] font-bold text-[16px] no-underline inline-block"
                    href={contractUrl}
                  >
                    Descargar Contrato
                  </Button>
                </Section>
              )}
              
              {/* Caja de Horarios */}
              <Section className="bg-[#f8f8f8] rounded-[5px] my-[20px] p-[20px]">
                <Text className="text-black font-bold mt-0 mb-[10px] text-[16px]">
                  Horario de Atención:
                </Text>
                <ul className="m-0 pl-[20px] text-[#333333] text-[15px] leading-[1.6]">
                  <li>Lunes a Viernes: 6:00 AM - 10:00 PM</li>
                  <li>Sábados: 9:00 AM - 5:00 PM</li>
                </ul>
              </Section>
              
              <Text className="text-[#333333] text-[16px] leading-[1.6]">
                Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos:
              </Text>
              <Text className="text-[#333333] text-[16px] leading-[1.6]">
                📞 Tel: 866-112-7905<br />
                📧 Email: administracion@muscleupgym.fitness
              </Text>
              
              <Text className="mt-[25px] text-[#333333] text-[16px] leading-[1.6]">
                Saludos,<br />
                El equipo de Muscle Up GYM
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-t border-[#e0e0e0] bg-white p-[20px] text-center">
              <Text className="m-0 text-[#777777] text-[12px]">
                © 2025 Muscle Up GYM | Tel: 866-112-7905 | administracion@muscleupgym.fitness
              </Text>
              <Text className="m-[10px] mb-0 text-[#777777] text-[12px] italic">
                "Tu salud y bienestar son nuestra misión"
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
