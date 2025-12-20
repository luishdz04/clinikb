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
  Button,
  Tailwind,
} from "@react-email/components";

interface ApprovalEmailProps {
  patientName: string;
  patientEmail: string;
  loginUrl: string;
}

export const ApprovalEmail = ({
  patientName,
  patientEmail,
  loginUrl,
}: ApprovalEmailProps) => {
  const previewText = "Tu cuenta en CliniKB ha sido aprobada";

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
                ¡Cuenta Aprobada! 🎉
              </Heading>
            </Section>

            {/* Contenido Principal */}
            <Section className="px-[30px] pb-[30px]">
              <Text className="text-[18px] font-bold text-[#060807] mb-[15px]">
                Hola {patientName},
              </Text>

              <Text className="text-[#333333] text-[16px] leading-[1.6]">
                ¡Excelentes noticias! Tu solicitud de registro en CliniKB ha sido
                aprobada exitosamente.
              </Text>

              <Section className="bg-[#e6f7f7] border-2 border-solid border-[#55c5c4] rounded-lg p-[20px] my-[20px]">
                <Text className="text-[14px] text-[#367c84] m-0 mb-2">
                  <strong>📧 Email registrado:</strong> {patientEmail}
                </Text>
                <Text className="text-[14px] text-[#367c84] m-0">
                  Ya puedes iniciar sesión en tu portal de paciente para agendar
                  citas y acceder a tus servicios médicos.
                </Text>
              </Section>

              <Section className="text-center my-[30px]">
                <Button
                  href={loginUrl}
                  className="bg-[#55c5c4] text-white font-semibold py-[12px] px-[24px] rounded-lg no-underline inline-block"
                >
                  Iniciar Sesión Ahora
                </Button>
              </Section>

              <Hr className="border border-solid border-[#e0e0e0] my-[20px]" />

              <Text className="text-[#333333] text-[16px] leading-[1.6]">
                Si tienes alguna pregunta o necesitas ayuda, contáctanos:
              </Text>

              <Section className="my-[20px]">
                <Text className="text-[16px] text-[#484848] my-[8px]">
                  📞 <strong>Teléfono:</strong> 866 159 7283
                </Text>
                <Text className="text-[16px] text-[#484848] my-[8px]">
                  📧 <strong>Email:</strong>{" "}
                  <Link
                    href="mailto:contacto@clinikb.com"
                    className="text-[#55c5c4] no-underline"
                  >
                    contacto@clinikb.com
                  </Link>
                </Text>
                <Text className="text-[16px] text-[#484848] my-[8px]">
                  💬 <strong>WhatsApp:</strong>{" "}
                  <Link
                    href="https://wa.me/528661597283"
                    className="text-[#55c5c4] no-underline"
                  >
                    Enviar mensaje
                  </Link>
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="bg-[#f6f9fc] px-[30px] py-[20px] text-center">
              <Text className="text-[#888888] text-[12px] leading-[1.5]">
                © {new Date().getFullYear()} CliniKB - Todos los derechos reservados
                <br />
                Este correo fue enviado porque tu cuenta fue aprobada en CliniKB.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ApprovalEmail;
