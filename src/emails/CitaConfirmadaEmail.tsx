import { Button, Heading, Section, Text } from "@react-email/components";
import { CorreoBase } from "./componentes/CorreoBase";
import { FichaCita } from "./componentes/FichaCita";

interface CitaConfirmadaEmailProps {
  nombrePaciente: string;
  servicio: string;
  /** Ya formateada para leer, p. ej. "sábado 16 de agosto de 2026". */
  fecha: string;
  /** HH:MM */
  hora: string;
  doctor: string;
  enLinea: boolean;
  /** Sólo en citas en línea, si Google ya generó la sala. */
  enlaceMeet?: string | null;
  /** Cambia el encabezado cuando la cita se movió de día u hora. */
  reprogramada?: boolean;
}

/**
 * Cita confirmada. Sirve también para las reprogramadas, que son el mismo
 * mensaje con otro encabezado.
 *
 * El enlace de Meet va en el cuerpo aunque Google mande su propia invitación
 * de Calendar: mucha gente no usa Calendar, y quedarse sin el enlace el día
 * de la consulta es el peor momento para descubrirlo.
 */
export function CitaConfirmadaEmail({
  nombrePaciente,
  servicio,
  fecha,
  hora,
  doctor,
  enLinea,
  enlaceMeet,
  reprogramada = false,
}: CitaConfirmadaEmailProps) {
  const titulo = reprogramada ? "Tu cita cambió de horario" : "Tu cita está confirmada";

  return (
    <CorreoBase vistaPrevia={`${titulo} · ${fecha} a las ${hora}`}>
      <Heading as="h1" className="m-0 mb-[8px] text-[22px] font-bold text-tinta">
        {titulo}
      </Heading>

      <Text className="m-0 mb-[24px] text-[15px] leading-[24px] text-[#4a5555]">
        Hola {nombrePaciente}
        {reprogramada
          ? ": tuvimos que mover tu cita. Estos son los datos nuevos, ya confirmados."
          : ": tu cita quedó agendada. Estos son los datos."}
      </Text>

      <FichaCita
        datos={[
          { etiqueta: "Servicio", valor: servicio },
          { etiqueta: "Fecha", valor: fecha },
          { etiqueta: "Hora", valor: `${hora} h` },
          { etiqueta: "Te atiende", valor: doctor },
          { etiqueta: "Modalidad", valor: enLinea ? "En línea" : "Presencial" },
        ]}
      />

      {enLinea && enlaceMeet && (
        <Section className="mb-[24px] text-center">
          <Button
            href={enlaceMeet}
            className="box-border inline-block rounded-[8px] bg-marca-profunda px-[28px] py-[14px] text-[15px] font-semibold text-white no-underline"
          >
            Entrar a la consulta
          </Button>
          {/* El enlace también en texto: hay clientes que bloquean o rompen
              los botones, y sin la URL visible el paciente se queda fuera. */}
          <Text className="m-0 mt-[12px] text-[11px] leading-[16px] text-[#677272]">
            {enlaceMeet}
          </Text>
        </Section>
      )}

      {enLinea && !enlaceMeet && (
        <Section className="mb-[24px] rounded-[8px] border-0 border-l-[3px] border-solid border-oro bg-[#fdf8ef] px-[16px] py-[14px]">
          <Text className="m-0 text-[13px] leading-[20px] text-[#5b5035]">
            Estamos preparando tu sala de videollamada. El enlace aparecerá en tu panel de
            paciente, en la sección Mis Citas, y te llegará por correo.
          </Text>
        </Section>
      )}

      <Section className="rounded-[8px] border-0 border-l-[3px] border-solid border-marca bg-[#eef8f8] px-[16px] py-[14px]">
        <Text className="m-0 text-[13px] leading-[20px] text-[#2b6068]">
          {enLinea
            ? "Conéctate unos minutos antes y busca un lugar tranquilo. Si no puedes asistir, avísanos con anticipación."
            : "Llega de 5 a 10 minutos antes para el registro. Si no puedes asistir, avísanos con anticipación."}
        </Text>
      </Section>
    </CorreoBase>
  );
}

export default CitaConfirmadaEmail;

CitaConfirmadaEmail.PreviewProps = {
  nombrePaciente: "Luis Diego De Luna",
  servicio: "Terapia Individual",
  fecha: "sábado 16 de agosto de 2026",
  hora: "15:00",
  doctor: "Dra. Cynthia Kristell de Luna Hernández",
  enLinea: true,
  enlaceMeet: "https://meet.google.com/gcf-qceu-dqs",
  reprogramada: false,
} satisfies CitaConfirmadaEmailProps;
