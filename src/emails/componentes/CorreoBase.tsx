import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "@react-email/components";
import type { ReactNode } from "react";
import { CLINICA, CSS_ESQUEMA, EQUIPO, LOGO_URL, configTailwind } from "../marca";

interface CorreoBaseProps {
  /** Texto que se ve en la lista de la bandeja, antes de abrir. */
  vistaPrevia: string;
  /**
   * `<title>` del documento. Los lectores de pantalla lo anuncian al abrir el
   * correo, así que debe decir de qué se trata ESTE mensaje, no la marca.
   * Si se omite se usa la vista previa, que ya cumple.
   */
  titulo?: string;
  children: ReactNode;
  /** Nombre del equipo en el pie. Se apaga en los avisos internos. */
  mostrarEquipo?: boolean;
}

/**
 * Cascarón compartido por todos los correos: encabezado con logo, tarjeta
 * blanca y pie con los datos de la clínica.
 *
 * Existe para que el color, el logo y la dirección se cambien en un solo
 * lugar. Antes cada plantilla traía su propio HTML y ninguna se parecía a
 * las demás.
 */
export function CorreoBase({
  vistaPrevia,
  titulo,
  children,
  mostrarEquipo = true,
}: CorreoBaseProps) {
  return (
    <Html lang="es" dir="ltr">
      <Tailwind config={{ presets: [pixelBasedPreset], ...configTailwind }}>
        <Head>
          <title>{titulo ?? vistaPrevia}</title>
          {/* Sólo esquema claro: ver la nota en marca.ts. */}
          <meta name="color-scheme" content="light" />
          <meta name="supported-color-schemes" content="light" />
          <style>{CSS_ESQUEMA}</style>
        </Head>
        <Body
          className="bg-[#eef1f1] m-0 py-[32px]"
          style={{
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          <Preview>{vistaPrevia}</Preview>

          <Container className="mx-auto w-full max-w-[600px] p-0">
            {/* El logo es un PNG con transparencia y disco casi negro: sobre
                este fondo se funde y deja ver el aro dorado, que es lo que le
                da el aire de sello. */}
            <Section className="rounded-t-[12px] bg-tinta px-[32px] py-[28px] text-center">
              <Img
                src={LOGO_URL}
                alt="CliniKB"
                width="88"
                height="88"
                className="mx-auto block"
              />
            </Section>

            {/* Filo de marca entre el encabezado y el contenido. */}
            <Section className="h-[4px] bg-marca leading-[4px]">
              <Text className="m-0 h-[4px] leading-[4px]">&nbsp;</Text>
            </Section>

            <Section className="bg-white px-[32px] py-[32px]">{children}</Section>

            <Section className="rounded-b-[12px] border-0 border-t border-solid border-[#e3e8e8] bg-[#f7f9f9] px-[32px] py-[24px]">
              {mostrarEquipo && (
                <>
                  {EQUIPO.map((persona) => (
                    <Text
                      key={persona.nombre}
                      className="m-0 mb-[6px] text-[12px] leading-[18px] text-[#5f6b6b]"
                    >
                      <span className="font-semibold text-marca-profunda">{persona.area}</span>
                      {" · "}
                      {persona.nombre}
                      {" — "}
                      {persona.detalle}
                    </Text>
                  ))}
                  <Section className="my-[14px] h-[1px] bg-[#e3e8e8] leading-[1px]">
                    <Text className="m-0 h-[1px] leading-[1px]">&nbsp;</Text>
                  </Section>
                </>
              )}

              <Text className="m-0 text-[12px] leading-[18px] text-[#5f6b6b]">
                {CLINICA.direccion}
              </Text>
              <Text className="m-0 text-[12px] leading-[18px] text-[#5f6b6b]">
                Tel. {CLINICA.telefono} ·{" "}
                <Link
                  href={`mailto:${CLINICA.correo}`}
                  className="text-marca-oscura underline"
                >
                  {CLINICA.correo}
                </Link>
              </Text>
              <Text className="m-0 mt-[12px] text-[11px] leading-[16px] text-[#677272]">
                Este correo se envió de forma automática desde{" "}
                <Link href={CLINICA.sitio} className="text-marca-oscura underline">
                  clinikb.com.mx
                </Link>
                . Por favor no compartas su contenido con terceros.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default CorreoBase;
