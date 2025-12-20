import type { ThemeConfig } from "antd";

// Colores extraídos del logo CliniKB
const colors = {
  // Turquesa/Teal - Color principal
  primary: "#55c5c4",
  primaryDark: "#367c84",
  
  // Dorados/Beige - Acentos
  gold: "#dfc79c",
  goldDark: "#845c24",
  brown: "#5b5035",
  
  // Neutros
  dark: "#060807",
  white: "#ffffff",
};

const theme: ThemeConfig = {
  token: {
    // Colores principales basados en el logo
    colorPrimary: colors.primary,
    colorSuccess: "#52c41a",
    colorWarning: colors.goldDark,
    colorError: "#ff4d4f",
    colorInfo: colors.primaryDark,

    // Tipografía
    fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,

    // Bordes
    borderRadius: 8,

    // Colores de enlace
    colorLink: colors.primary,
    colorLinkHover: colors.primaryDark,
  },
  components: {
    Button: {
      // Personalización de botones
      controlHeight: 40,
      borderRadius: 8,
      primaryColor: colors.white,
    },
    Card: {
      // Personalización de cards
      borderRadiusLG: 12,
    },
    Input: {
      // Personalización de inputs
      controlHeight: 40,
      borderRadius: 8,
    },
    Menu: {
      // Menú con colores del tema
      itemSelectedBg: colors.primary + "15",
      itemSelectedColor: colors.primaryDark,
      itemHoverColor: colors.primary,
      itemActiveBg: colors.primary + "20",
    },
  },
};

export default theme;

// Exportar colores para uso en Tailwind u otros componentes
export { colors };
