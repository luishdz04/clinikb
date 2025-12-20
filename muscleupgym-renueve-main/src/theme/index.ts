/**
 * 🎨 Tema Centralizado de MuscleUp Gym
 * 
 * Este archivo contiene todos los tokens de diseño para usar en:
 * - Ant Design (antd)
 * - Tailwind CSS
 * - Componentes personalizados
 * 
 * IMPORTANTE: Mantener sincronizado con globals.css
 */

// ============================================
// 🎨 TOKENS DE COLORES
// ============================================

export const colors = {
  // Fondos
  background: {
    primary: '#000000',      // Fondo principal (negro)
    secondary: '#1A1A1A',    // Superficies, cards
    tertiary: '#2A2A2A',     // Elementos elevados
    elevated: '#333333',     // Modals, dropdowns
    white: '#FFFFFF',        // Fondo blanco (para triggers, etc)
  },
  
  // Textos
  text: {
    primary: '#FFFFFF',      // Texto principal
    secondary: '#E0E0E0',    // Texto secundario
    muted: '#A0A0A0',        // Texto deshabilitado/placeholder
    inverse: '#000000',      // Texto sobre fondos claros
  },
  
  // Marca Principal (Amarillo/Dorado)
  brand: {
    primary: '#FFCC00',      // Color principal del gym
    dark: '#E6B800',         // Hover/pressed states
    light: '#FFD633',        // Accents
    lighter: '#FFE066',      // Backgrounds sutiles
  },
  
  // Bordes
  border: {
    primary: '#808080',      // Borde principal
    secondary: '#4D4D4D',    // Borde sutil
    light: '#333333',        // Borde muy sutil
    dark: '#000000',         // Borde negro
  },
  
  // Estados
  state: {
    success: '#4ADE80',      // Verde éxito
    successBg: '#166534',    // Fondo éxito
    successLight: '#22C55E', // Verde más brillante
    warning: '#FFCC00',      // Amarillo advertencia (mismo que brand)
    warningBg: '#854D0E',    // Fondo advertencia
    warningLight: '#FCD34D', // Amarillo claro
    error: '#EF4444',        // Rojo error
    errorBg: '#991B1B',      // Fondo error
    info: '#3B82F6',         // Azul información
    infoBg: '#1E40AF',       // Fondo información
    infoLight: '#60A5FA',    // Azul claro
  },
} as const;

// ============================================
// 📐 TOKENS DE ESPACIADO Y DIMENSIONES
// ============================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ============================================
// 🔤 TOKENS DE TIPOGRAFÍA
// ============================================

export const typography = {
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'JetBrains Mono, Menlo, Monaco, monospace',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
} as const;

// ============================================
// 🐜 TEMA DE ANT DESIGN
// ============================================

import { theme as antTheme, type ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    // Colores principales
    colorPrimary: colors.brand.primary,
    colorSuccess: colors.state.success,
    colorWarning: colors.brand.primary, // Usamos el dorado para warning también
    colorError: colors.state.error,
    colorInfo: colors.state.info,
    colorLink: colors.brand.primary,
    
    // Colores de fondo
    colorBgBase: colors.background.primary,
    colorBgContainer: colors.background.secondary,
    colorBgElevated: colors.background.tertiary,
    colorBgLayout: colors.background.primary,
    colorBgSpotlight: colors.background.elevated,
    colorBgMask: 'rgba(0, 0, 0, 0.75)',
    
    // Colores de texto
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorTextTertiary: colors.text.muted,
    colorTextQuaternary: '#666666',
    colorTextDescription: colors.text.secondary,
    colorTextDisabled: colors.text.muted,
    colorTextPlaceholder: colors.text.muted,
    
    // Bordes
    colorBorder: colors.border.secondary,
    colorBorderSecondary: colors.border.light,
    
    // Border radius
    borderRadius: borderRadius.md,
    borderRadiusLG: borderRadius.lg,
    borderRadiusSM: borderRadius.sm,
    borderRadiusXS: 4,
    
    // Fuentes
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    
    // Sombras (sutiles para tema oscuro)
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    boxShadowSecondary: '0 2px 8px rgba(0, 0, 0, 0.4)',
    
    // Otros
    wireframe: false,
    motion: true,
  },
  
  components: {
    // Layout
    Layout: {
      headerBg: colors.background.secondary,
      bodyBg: colors.background.primary,
      siderBg: colors.background.secondary,
      footerBg: colors.background.secondary,
    },
    
    // Menu
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: colors.background.primary,
      darkItemSelectedBg: colors.brand.primary + '20', // 20% opacity
      darkItemSelectedColor: colors.brand.primary,
      darkItemHoverBg: colors.background.tertiary,
    },
    
    // Card
    Card: {
      colorBgContainer: colors.background.secondary,
      colorBorderSecondary: colors.border.light,
    },
    
    // Table
    Table: {
      colorBgContainer: colors.background.secondary,
      headerBg: colors.background.tertiary,
      headerColor: colors.text.primary,
      rowHoverBg: colors.background.tertiary,
      borderColor: colors.border.light,
    },
    
    // Button
    Button: {
      primaryColor: colors.text.inverse, // Texto negro en botón amarillo
      colorPrimaryHover: colors.brand.light,
      colorPrimaryActive: colors.brand.dark,
      defaultBg: colors.background.secondary,
      defaultBorderColor: colors.border.secondary,
      defaultColor: colors.text.primary,
    },
    
    // Input
    Input: {
      colorBgContainer: colors.background.secondary,
      colorBorder: colors.border.secondary,
      activeBorderColor: colors.brand.primary,
      hoverBorderColor: colors.brand.light,
    },
    
    // Select
    Select: {
      colorBgContainer: colors.background.secondary,
      colorBgElevated: colors.background.tertiary,
      optionSelectedBg: colors.brand.primary + '20',
    },
    
    // Modal
    Modal: {
      contentBg: colors.background.secondary,
      headerBg: colors.background.secondary,
      footerBg: colors.background.secondary,
    },
    
    // Dropdown
    Dropdown: {
      colorBgElevated: colors.background.tertiary,
    },
    
    // Tag
    Tag: {
      defaultBg: colors.background.tertiary,
      defaultColor: colors.text.primary,
    },
    
    // Badge
    Badge: {
      colorError: colors.state.error,
    },
    
    // Progress
    Progress: {
      defaultColor: colors.brand.primary,
    },
    
    // Statistic
    Statistic: {
      colorTextDescription: colors.text.secondary,
    },
    
    // Tabs
    Tabs: {
      inkBarColor: colors.brand.primary,
      itemActiveColor: colors.brand.primary,
      itemSelectedColor: colors.brand.primary,
      itemHoverColor: colors.brand.light,
    },
    
    // Form
    Form: {
      labelColor: colors.text.primary,
    },
    
    // Switch
    Switch: {
      colorPrimary: colors.brand.primary,
      colorPrimaryHover: colors.brand.light,
    },
    
    // Checkbox
    Checkbox: {
      colorPrimary: colors.brand.primary,
      colorPrimaryHover: colors.brand.light,
    },
    
    // Radio
    Radio: {
      colorPrimary: colors.brand.primary,
      colorPrimaryHover: colors.brand.light,
    },
    
    // DatePicker
    DatePicker: {
      colorBgContainer: colors.background.secondary,
      colorBgElevated: colors.background.tertiary,
    },
    
    // Tooltip
    Tooltip: {
      colorBgSpotlight: colors.background.elevated,
      colorTextLightSolid: colors.text.primary,
    },
    
    // Message
    Message: {
      contentBg: colors.background.tertiary,
    },
    
    // Notification
    Notification: {
      colorBgElevated: colors.background.tertiary,
    },
  },
  
  algorithm: antTheme.darkAlgorithm,
};

// ============================================
// 🛠️ UTILIDADES
// ============================================

/**
 * Obtiene un color con transparencia
 * @param hex Color en formato hex
 * @param alpha Transparencia (0-1)
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Colores CSS Variables para usar en estilos inline
 */
export const cssVars = {
  '--color-background': colors.background.primary,
  '--color-surface': colors.background.secondary,
  '--color-foreground': colors.text.primary,
  '--color-muted': colors.text.secondary,
  '--color-primary': colors.brand.primary,
  '--color-primary-dark': colors.brand.dark,
  '--color-primary-light': colors.brand.light,
  '--color-border': colors.border.primary,
  '--color-border-light': colors.border.secondary,
  '--color-success': colors.state.success,
  '--color-warning': colors.state.warning,
  '--color-error': colors.state.error,
  '--color-info': colors.state.info,
} as const;

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  antdTheme,
  hexToRgba,
  cssVars,
};
