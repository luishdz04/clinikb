import { Heading, Hr, Section, Text } from "@react-email/components";
import { CorreoBase } from "./componentes/CorreoBase";

interface VerificationCodeEmailProps {
  /** Código que genera Supabase Auth (largo según Email OTP Length). */
  token: string;
  /** Nombre del paciente, si Auth lo trae en su metadata. */
  fullName?: string;
  /** Minutos de vigencia (Auth > Providers > Email > OTP Expiration). */
  expiresInMinutes?: number;
}

/**
 * Verificación de alta.
 *
 * A propósito no lleva datos clínicos ni personales más allá del nombre: el
 * correo no es un canal confidencial y este mensaje viaja antes de que la
 * cuenta exista siquiera.
 */
export function VerificationCodeEmail({
  token,
  fullName,
  expiresInMinutes = 10,
}: VerificationCodeEmailProps) {
  return (
    <CorreoBase vistaPrevia={`Tu código de verificación es ${token}`}>
      <Heading as="h1" className="m-0 mb-[8px] text-[22px] font-bold text-tinta">
        Confirma tu correo
      </Heading>

      <Text className="m-0 mb-[24px] text-[15px] leading-[24px] text-[#4a5555]">
        {fullName ? `Hola ${fullName}: para` : "Hola: para"} terminar tu registro en CliniKB,
        escribe este código en la página donde te quedaste.
      </Text>

      <Section className="mb-[24px] rounded-[10px] border border-solid border-marca bg-[#eef8f8] px-[24px] py-[24px] text-center">
        <Text className="m-0 mb-[8px] text-[12px] font-semibold uppercase tracking-[1px] text-marca-oscura">
          Código de verificación
        </Text>
        <Text
          className="m-0 text-[38px] font-bold leading-[46px] text-marca-profunda"
          style={{ fontFamily: "'Courier New', Courier, monospace", letterSpacing: "10px" }}
        >
          {token}
        </Text>
        <Text className="m-0 mt-[8px] text-[12px] text-[#6b7676]">
          Vigente por {expiresInMinutes} minutos
        </Text>
      </Section>

      <Text className="m-0 mb-[20px] text-[14px] leading-[22px] text-[#4a5555]">
        En cuanto lo escribas, tu cuenta queda activa y podrás iniciar sesión para agendar
        tus citas. Si se te pasa el tiempo, puedes pedir un código nuevo desde la misma
        página.
      </Text>

      <Hr className="my-[24px] border-0 border-t border-solid border-[#e3e8e8]" />

      {/* Aviso al estilo de la banca: nadie de la clínica pide este código. */}
      <Section className="rounded-[8px] border-0 border-l-[3px] border-solid border-oro bg-[#fdf8ef] px-[16px] py-[14px]">
        <Text className="m-0 text-[13px] leading-[20px] text-[#5b5035]">
          <strong>Nadie de CliniKB te va a pedir este código</strong> por teléfono, WhatsApp
          ni correo. Si tú no solicitaste el registro, ignora este mensaje: sin el código la
          cuenta no se activa.
        </Text>
      </Section>
    </CorreoBase>
  );
}

export default VerificationCodeEmail;

VerificationCodeEmail.PreviewProps = {
  token: "418620",
  fullName: "Luis Diego De Luna",
  expiresInMinutes: 10,
} satisfies VerificationCodeEmailProps;
