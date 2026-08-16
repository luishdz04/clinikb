import { Section, Text } from "@react-email/components";
import { Fragment } from "react";

export interface DatoFicha {
  etiqueta: string;
  valor: string;
}

/**
 * Ficha de datos de la cita: servicio, fecha, hora, doctor, modalidad.
 *
 * Apilada —etiqueta arriba, valor abajo— en vez de dos columnas. En correo
 * las columnas son tablas, y con un valor largo como el nombre completo de
 * una doctora la celda se aprieta y el texto se parte feo, sobre todo en
 * pantallas angostas. Apilado no puede pasar.
 */
export function FichaCita({ datos }: { datos: DatoFicha[] }) {
  return (
    <Section className="mb-[24px] rounded-[10px] border border-solid border-[#dde5e5] bg-[#f7fafa] px-[22px] py-[6px]">
      {datos.map((dato, i) => (
        <Fragment key={dato.etiqueta}>
          {i > 0 && (
            <Section className="h-[1px] bg-[#e6ecec] leading-[1px]">
              <Text className="m-0 h-[1px] leading-[1px]">&nbsp;</Text>
            </Section>
          )}
          <Section className="py-[14px]">
            <Text className="m-0 mb-[4px] text-[11px] font-semibold uppercase tracking-[1px] text-[#5f6b6b]">
              {dato.etiqueta}
            </Text>
            <Text className="m-0 text-[16px] font-semibold leading-[22px] text-tinta">
              {dato.valor}
            </Text>
          </Section>
        </Fragment>
      ))}
    </Section>
  );
}

export default FichaCita;
