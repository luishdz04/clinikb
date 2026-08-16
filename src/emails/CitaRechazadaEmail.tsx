import { Button, Heading, Section, Text } from "@react-email/components";
import { CorreoBase } from "./componentes/CorreoBase";
import { FichaCita } from "./componentes/FichaCita";
import { CLINICA } from "./marca";

interface CitaRechazadaEmailProps {
  nombrePaciente: string;
  servicio: string;
  fecha: string;
  hora: string;
  motivo: string;
}

/**
 * La cita solicitada no se pudo agendar.
 *
 * Es el correo más delicado de todos: alguien pidió atención y le estamos
 * diciendo que no. El tono evita el "rechazada" del código y ofrece una
 * salida concreta —volver a agendar o llamar— en vez de dejar a la persona
 * sin siguiente paso.
 */
export function CitaRechazadaEmail({
  nombrePaciente,
  servicio,
  fecha,
  hora,
  motivo,
}: CitaRechazadaEmailProps) {
  return (
    <CorreoBase vistaPrevia="No pudimos agendar la cita que pediste">
      <Heading as="h1" className="m-0 mb-[8px] text-[22px] font-bold text-tinta">
        No pudimos agendar esta cita
      </Heading>

      <Text className="m-0 mb-[24px] text-[15px] leading-[24px] text-[#4a5555]">
        Hola {nombrePaciente}: lamentamos avisarte que no fue posible confirmar la cita que
        solicitaste.
      </Text>

      <FichaCita
        datos={[
          { etiqueta: "Servicio", valor: servicio },
          { etiqueta: "Fecha solicitada", valor: fecha },
          { etiqueta: "Hora solicitada", valor: `${hora} h` },
        ]}
      />

      <Section className="mb-[24px] rounded-[8px] border-0 border-l-[3px] border-solid border-oro bg-[#fdf8ef] px-[16px] py-[14px]">
        <Text className="m-0 mb-[4px] text-[11px] font-semibold uppercase tracking-[1px] text-[#845c24]">
          Motivo
        </Text>
        <Text className="m-0 text-[14px] leading-[21px] text-[#5b5035]">{motivo}</Text>
      </Section>

      <Text className="m-0 mb-[24px] text-[15px] leading-[24px] text-[#4a5555]">
        Puedes elegir otro horario desde tu panel de paciente. Si prefieres que te ayudemos a
        buscar un espacio, llámanos al {CLINICA.telefono} y lo vemos contigo.
      </Text>

      <Section className="text-center">
        <Button
          href={`${CLINICA.sitio}/cliente/citas`}
          className="box-border inline-block rounded-[8px] bg-marca-profunda px-[28px] py-[14px] text-[15px] font-semibold text-white no-underline"
        >
          Elegir otro horario
        </Button>
      </Section>
    </CorreoBase>
  );
}

export default CitaRechazadaEmail;

CitaRechazadaEmail.PreviewProps = {
  nombrePaciente: "Luis Diego De Luna",
  servicio: "Terapia Individual",
  fecha: "sábado 16 de agosto de 2026",
  hora: "15:00",
  motivo: "Ese horario ya está ocupado. Tenemos disponibilidad el lunes por la mañana.",
} satisfies CitaRechazadaEmailProps;
