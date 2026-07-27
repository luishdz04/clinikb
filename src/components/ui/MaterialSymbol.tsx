import type { CSSProperties } from "react";

interface MaterialSymbolProps {
  /**
   * Nombre del símbolo, tal cual aparece en fonts.google.com/icons
   * (por ejemplo `self_improvement`).
   *
   * Ojo: la hoja de estilos de `app/layout.tsx` pide solo los glifos listados
   * en su parámetro `icon_names`. Un nombre que no esté ahí se renderiza como
   * texto plano.
   */
  name: string;
  /** Relleno del glifo (eje FILL). */
  filled?: boolean;
  /** Tamaño en px. Por defecto hereda el del texto contenedor. */
  size?: number | string;
  style?: CSSProperties;
  className?: string;
}

/**
 * Icono de Material Symbols.
 *
 * La fuente usa ligaduras: el nombre del icono va como contenido de texto y se
 * sustituye por el glifo. `aria-hidden` evita que un lector de pantalla lea ese
 * nombre en bruto.
 */
export default function MaterialSymbol({
  name,
  filled = false,
  size,
  style,
  className,
}: MaterialSymbolProps) {
  return (
    <span
      aria-hidden
      translate="no"
      className={["material-symbols-outlined", className].filter(Boolean).join(" ")}
      style={{
        fontSize: size ?? "1em",
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        lineHeight: 1,
        verticalAlign: "-0.15em",
        ...style,
      }}
    >
      {name}
    </span>
  );
}
