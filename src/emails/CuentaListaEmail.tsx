import { Button, Heading, Section, Text } from "@react-email/components";
import { CorreoBase } from "./componentes/CorreoBase";
import { CLINICA } from "./marca";

interface CuentaListaEmailProps {
  nombrePaciente: string;
  urlAcceso: string;
}

/**
 * Bienvenida: la cuenta quedó activa y ya se puede agendar.
 *
 * No habla de revisiones ni de aprobaciones pendientes: desde que se quitó la
 * autorización manual, verificar el código es lo único que hace falta. El
 * texto viejo prometía un trámite que ya no existe.
 */
export function CuentaListaEmail({ nombrePaciente, urlAcceso }: CuentaListaEmailProps) {
  return (
    <CorreoBase vistaPrevia="Tu cuenta de CliniKB ya está lista">
      <Heading as="h1" className="m-0 mb-[8px] text-[22px] font-bold text-tinta">
        Tu cuenta ya está lista
      </Heading>

      <Text className="m-0 mb-[24px] text-[15px] leading-[24px] text-[#4a5555]">
        Hola {nombrePaciente}: tu registro quedó completo. Desde tu panel puedes agendar
        citas, ver las que ya tienes y entrar a tus consultas en línea.
      </Text>

      <Section className="mb-[28px] text-center">
        <Button
          href={urlAcceso}
          className="box-border inline-block rounded-[8px] bg-marca-profunda px-[28px] py-[14px] text-[15px] font-semibold text-white no-underline"
        >
          Entrar a mi panel
        </Button>
      </Section>

      <Section className="mb-[24px] rounded-[10px] border border-solid border-[#dde5e5] bg-[#f7fafa] px-[22px] py-[18px]">
        <Text className="m-0 mb-[10px] text-[11px] font-semibold uppercase tracking-[1px] text-[#5f6b6b]">
          Lo que puedes hacer
        </Text>
        <Text className="m-0 mb-[6px] text-[14px] leading-[22px] text-[#4a5555]">
          Agendar una cita presencial o en línea con la doctora o el doctor que necesites.
        </Text>
        <Text className="m-0 mb-[6px] text-[14px] leading-[22px] text-[#4a5555]">
          Consultar tus citas y recibir el enlace de videollamada cuando sea en línea.
        </Text>
        <Text className="m-0 text-[14px] leading-[22px] text-[#4a5555]">
          Mantener tus datos al día para que la atención sea más rápida.
        </Text>
      </Section>

      <Text className="m-0 text-[14px] leading-[22px] text-[#4a5555]">
        Si tienes dudas, escríbenos a este mismo correo o llámanos al {CLINICA.telefono}.
      </Text>
    </CorreoBase>
  );
}

export default CuentaListaEmail;

CuentaListaEmail.PreviewProps = {
  nombrePaciente: "Luis Diego De Luna",
  urlAcceso: "https://clinikb.com.mx/login",
} satisfies CuentaListaEmailProps;
