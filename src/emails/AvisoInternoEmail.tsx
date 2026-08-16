import { Button, Heading, Section, Text } from "@react-email/components";
import { CorreoBase } from "./componentes/CorreoBase";
import { FichaCita, type DatoFicha } from "./componentes/FichaCita";

interface AvisoInternoEmailProps {
  /** Encabezado: "Nueva solicitud de cita", "Nuevo paciente registrado"… */
  titulo: string;
  /** Frase que resume qué pasó y qué hay que hacer. */
  resumen: string;
  datos: DatoFicha[];
  /** A dónde va el botón del panel. */
  enlace: string;
  textoEnlace: string;
}

/**
 * Avisos que llegan al buzón de la clínica, no al paciente.
 *
 * Se apaga el bloque del equipo en el pie: presentarle los doctores a la
 * propia clínica no tiene sentido, y el correo queda más corto de leer entre
 * pendientes.
 */
export function AvisoInternoEmail({
  titulo,
  resumen,
  datos,
  enlace,
  textoEnlace,
}: AvisoInternoEmailProps) {
  return (
    <CorreoBase vistaPrevia={`${titulo} · ${resumen}`} mostrarEquipo={false}>
      <Section className="mb-[12px] inline-block rounded-[4px] bg-[#eef8f8] px-[10px] py-[4px]">
        <Text className="m-0 text-[10px] font-bold uppercase tracking-[1.5px] text-[#2b6068]">
          Aviso interno
        </Text>
      </Section>

      <Heading as="h1" className="m-0 mb-[8px] text-[22px] font-bold text-tinta">
        {titulo}
      </Heading>

      <Text className="m-0 mb-[24px] text-[15px] leading-[24px] text-[#4a5555]">{resumen}</Text>

      <FichaCita datos={datos} />

      <Section className="text-center">
        <Button
          href={enlace}
          className="box-border inline-block rounded-[8px] bg-marca-profunda px-[28px] py-[14px] text-[15px] font-semibold text-white no-underline"
        >
          {textoEnlace}
        </Button>
      </Section>
    </CorreoBase>
  );
}

export default AvisoInternoEmail;

AvisoInternoEmail.PreviewProps = {
  titulo: "Nueva solicitud de cita",
  resumen: "Luis Diego De Luna pidió una cita y está esperando confirmación.",
  datos: [
    { etiqueta: "Paciente", valor: "Luis Diego De Luna" },
    { etiqueta: "Correo", valor: "ing.luisdeluna@outlook.com" },
    { etiqueta: "Servicio", valor: "Terapia Individual" },
    { etiqueta: "Fecha", valor: "lunes 18 de agosto de 2026" },
    { etiqueta: "Hora", valor: "11:00 - 12:00" },
    { etiqueta: "Modalidad", valor: "En línea" },
  ],
  enlace: "https://clinikb.com.mx/admin/citas",
  textoEnlace: "Ver la solicitud",
} satisfies AvisoInternoEmailProps;
