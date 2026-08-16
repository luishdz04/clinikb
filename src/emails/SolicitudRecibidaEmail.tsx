import { Heading, Section, Text } from "@react-email/components";
import { CorreoBase } from "./componentes/CorreoBase";
import { FichaCita, type DatoFicha } from "./componentes/FichaCita";

interface SolicitudRecibidaEmailProps {
  nombrePaciente: string;
  servicio: string;
  enLinea: boolean;
  /** Sólo si la persona indicó preferencia. */
  fechaPreferida?: string;
  horaPreferida?: string;
  notas?: string;
  /** Cambia el texto: reservar un horario abierto no es lo mismo que pedir uno. */
  horarioReservado?: boolean;
}

/**
 * Acuse de recibo de una solicitud de cita.
 *
 * Su único trabajo es que nadie se quede pensando "¿habrá llegado?". Por eso
 * dice explícitamente qué sigue y en cuánto tiempo, en vez de un "gracias por
 * tu solicitud" que no informa nada.
 */
export function SolicitudRecibidaEmail({
  nombrePaciente,
  servicio,
  enLinea,
  fechaPreferida,
  horaPreferida,
  notas,
  horarioReservado = false,
}: SolicitudRecibidaEmailProps) {
  const datos: DatoFicha[] = [
    { etiqueta: "Servicio", valor: servicio },
    { etiqueta: "Modalidad", valor: enLinea ? "En línea" : "Presencial" },
  ];
  if (fechaPreferida) {
    datos.push({
      etiqueta: horarioReservado ? "Fecha" : "Fecha preferida",
      valor: fechaPreferida,
    });
  }
  if (horaPreferida) {
    datos.push({
      etiqueta: horarioReservado ? "Hora" : "Hora preferida",
      valor: horaPreferida,
    });
  }
  if (notas) datos.push({ etiqueta: "Lo que nos comentaste", valor: notas });

  return (
    <CorreoBase vistaPrevia="Recibimos tu solicitud de cita">
      <Heading as="h1" className="m-0 mb-[8px] text-[22px] font-bold text-tinta">
        Recibimos tu solicitud
      </Heading>

      <Text className="m-0 mb-[24px] text-[15px] leading-[24px] text-[#4a5555]">
        Hola {nombrePaciente}:{" "}
        {horarioReservado
          ? "apartamos el horario que elegiste. Falta que la clínica lo confirme."
          : "ya tenemos tu solicitud. Todavía no es una cita confirmada."}
      </Text>

      <FichaCita datos={datos} />

      <Section className="rounded-[8px] border-0 border-l-[3px] border-solid border-marca bg-[#eef8f8] px-[16px] py-[14px]">
        <Text className="m-0 mb-[6px] text-[11px] font-semibold uppercase tracking-[1px] text-[#2b6068]">
          Qué sigue
        </Text>
        <Text className="m-0 text-[13px] leading-[20px] text-[#2b6068]">
          Revisamos la agenda y te escribimos para confirmarte día y hora. Normalmente el
          mismo día. Si tu cita es en línea, en ese correo te llegará el enlace de la
          videollamada.
        </Text>
      </Section>
    </CorreoBase>
  );
}

export default SolicitudRecibidaEmail;

SolicitudRecibidaEmail.PreviewProps = {
  nombrePaciente: "Luis Diego De Luna",
  servicio: "Terapia Individual",
  enLinea: true,
  fechaPreferida: "lunes 18 de agosto de 2026",
  horaPreferida: "11:00",
  notas: "De preferencia por la mañana.",
  horarioReservado: false,
} satisfies SolicitudRecibidaEmailProps;
