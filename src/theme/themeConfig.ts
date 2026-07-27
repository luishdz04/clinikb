import type { ThemeConfig } from "antd";

/**
 * FUENTE ÚNICA DE VERDAD del tema CliniKB.
 *
 * Estos colores alimentan tres consumidores:
 *  1. Los tokens de Ant Design (abajo, vía ConfigProvider).
 *  2. Las variables CSS `--brand-*` que inyecta `app/layout.tsx`.
 *  3. Las utilidades de Tailwind (`text-brand`, `bg-brand-dark`, ...) que
 *     se mapean desde esas variables en `app/globals.css`.
 *
 * No hardcodees estos hex en componentes: usa las utilidades de Tailwind
 * o los tokens de antd.
 */
const colors = {
  // Turquesa/Teal - Color principal
  primary: "#55c5c4",
  primaryDark: "#367c84",
  /**
   * Turquesa profundo. Solo para superficies con texto blanco encima:
   * sobre `primary` el blanco da 2.06:1 (falla WCAG AA), sobre este 7.06:1.
   */
  primaryDeep: "#2b6068",

  // Dorados/Beige - Acentos
  gold: "#dfc79c",
  goldDark: "#845c24",
  brown: "#5b5035",

  // Neutros
  dark: "#060807",
  white: "#ffffff",
} as const;

/** Variables CSS que se inyectan en `:root` desde el layout raíz. */
const cssVariables: Record<string, string> = {
  "--brand": colors.primary,
  "--brand-dark": colors.primaryDark,
  "--brand-deep": colors.primaryDeep,
  "--brand-gold": colors.gold,
  "--brand-gold-dark": colors.goldDark,
  "--brand-brown": colors.brown,
  "--brand-ink": colors.dark,
};

/** Serializa `cssVariables` a un bloque `:root { ... }` para un <style> inline. */
export const rootCssVariables = `:root{${Object.entries(cssVariables)
  .map(([key, value]) => `${key}:${value};`)
  .join("")}}`;

const theme: ThemeConfig = {
  token: {
    // Colores principales basados en el logo
    colorPrimary: colors.primary,
    colorSuccess: "#52c41a",
    colorWarning: colors.goldDark,
    colorError: "#ff4d4f",
    colorInfo: colors.primaryDark,

    // Tipografía
    fontFamily:
      "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,

    // Bordes
    borderRadius: 8,

    // Colores de enlace
    colorLink: colors.primary,
    colorLinkHover: colors.primaryDark,
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 8,
      primaryColor: colors.white,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Input: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Menu: {
      itemSelectedBg: colors.primary + "15",
      itemSelectedColor: colors.primaryDark,
      itemHoverColor: colors.primary,
      itemActiveBg: colors.primary + "20",

      // Menú horizontal del Header. Antes esto vivía en globals.css como
      // overrides `!important` sobre `.ant-menu-horizontal`; ahora son tokens.
      itemBg: "transparent",
      horizontalItemSelectedColor: colors.primaryDark,
      horizontalItemHoverColor: colors.primary,

      // El item activo se marca con una píldora, no con la barra inferior
      // por defecto: `activeBarHeight: 0` la elimina.
      activeBarHeight: 0,
      activeBarBorderWidth: 0,
      horizontalItemSelectedBg: colors.primary + "1f",
      horizontalItemHoverBg: colors.primary + "12",
      horizontalItemBorderRadius: 999,
      itemPaddingInline: 16,
    },
  },
};

export default theme;

// Exportar colores para uso en Tailwind u otros componentes
export { colors };
