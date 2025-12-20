import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface WelcomeEmailProps {
  patientName: string;
  patientEmail: string;
}

export const WelcomeEmail = ({
  patientName,
  patientEmail,
}: WelcomeEmailProps) => {
  const previewText = "Bienvenido a CliniKB - Tu registro ha sido exitoso";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#f6f9fc] my-auto mx-auto font-sans px-2 py-5">
          <Container className="bg-white border border-solid border-[#e0e0e0] rounded-lg mx-auto max-w-[600px] overflow-hidden">
            {/* Barra superior turquesa */}
            <Section className="h-[6px] bg-[#55c5c4] w-full"></Section>

            {/* Logo y Título */}
            <Section className="p-[30px] pb-[20px] text-center">
              <Img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/clinikb.png`}
                width="150"
                height="auto"
                alt="CliniKB Logo"
                className="mx-auto mb-[20px] block max-w-[150px]"
              />
              <Heading className="m-0 text-[#060807] text-[24px] font-bold">
                ¡Bienvenido a CliniKB!
              </Heading>
            </Section>

            {/* Contenido Principal */}
            <Section className="px-[30px] pb-[30px]">
              <Text className="text-[18px] font-bold text-[#060807] mb-[15px]">
                Hola {patientName},
              </Text>

              <Text className="text-[#333333] text-[16px] leading-[1.6]">
                Gracias por registrarte en CliniKB. Tu información ha sido
                recibida exitosamente.
              </Text>

              <Section className="bg-[#e6f7f7] border-2 border-solid border-[#55c5c4] rounded-lg p-[20px] my-[20px]">
                <Text className="text-[14px] text-[#367c84] m-0">
                  <strong>Email registrado:</strong> {patientEmail}
                </Text>
              </Section>

              <Text className="text-[#333333] text-[16px] leading-[1.6]">
                Para agendar tu cita, puedes contactarnos por los siguientes
                medios:
              </Text>

              <Section className="my-[20px]">
                <Text className="text-[16px] text-[#484848] my-[8px]">
                  📞 <strong>Teléfono:</strong> 866 159 7283
                </Text>
                <Text className="text-[16px] text-[#484848] my-[8px]">
                  📧 <strong>Email:</strong>{" "}
                  <Link
                    href="mailto:contacto@clinikb.com"
                    className="text-[#55c5c4] underline font-semibold"
                  >
                    contacto@clinikb.com
                  </Link>
                </Text>
                <Text className="text-[16px] text-[#484848] my-[8px]">
                  💬 <strong>WhatsApp:</strong>{" "}
                  <Link
                    href="https://wa.me/5218661597283"
                    className="text-[#55c5c4] underline font-semibold"
                  >
                    Enviar mensaje
                  </Link>
                </Text>
              </Section>

              <Hr className="border border-solid border-[#dfe1e4] my-[26px]" />

              <Text className="text-[#9ca299] text-[14px] leading-[1.6] text-center">
                CliniKB - Centro de Atención Médica y Psicológica
                <br />
                Juárez 145, San Buenaventura, Coahuila, México
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
