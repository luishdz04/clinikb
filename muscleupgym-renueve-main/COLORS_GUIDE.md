# Guía de Colores - MuscleUp Gym

## 🎨 Sistema de Colores Actual (Temporal)

El proyecto está configurado con colores base temporales que se actualizarán con tu paleta personalizada.

### Variables CSS Actuales

```css
--color-background: #0a0a0a          /* Fondo principal oscuro */
--color-background-secondary: #1a1a1a /* Fondo secundario */
--color-foreground: #ededed           /* Texto principal */
--color-accent: #ff4d4d               /* Color de acento/botones */
```

## 📝 Cómo Proporcionar Tu Paleta de Colores

Para personalizar los colores, proporciona:

1. **Color de fondo principal** (background)
2. **Color de fondo secundario** (cards, secciones alternadas)
3. **Color de texto principal** (foreground)
4. **Color primario** (botones principales, CTA)
5. **Color secundario** (elementos secundarios)
6. **Color de acento** (highlights, hover states)
7. **Colores adicionales** según necesites:
   - Success (verde para mensajes de éxito)
   - Warning (amarillo/naranja para advertencias)
   - Error (rojo para errores)
   - Info (azul para información)

### Formato Recomendado

Puedes proporcionar los colores en cualquiera de estos formatos:

```
HEX:  #FF4D4D
RGB:  rgb(255, 77, 77)
HSL:  hsl(0, 100%, 65%)
```

### Ejemplo de Paleta

```json
{
  "background": {
    "primary": "#0a0a0a",
    "secondary": "#1a1a1a",
    "tertiary": "#2a2a2a"
  },
  "foreground": {
    "primary": "#ffffff",
    "secondary": "#b3b3b3",
    "muted": "#666666"
  },
  "brand": {
    "primary": "#ff4d4d",
    "secondary": "#ff8c42",
    "accent": "#00d9ff"
  },
  "state": {
    "success": "#22c55e",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "info": "#3b82f6"
  }
}
```

## 🚀 Dónde Se Configuran

Los colores se configuran en:
- **Archivo:** `src/app/globals.css`
- **Sección:** `@theme { ... }`

Una vez que proporciones tu paleta, actualizaré:
1. Las variables CSS en `globals.css`
2. La configuración de Tailwind
3. Los componentes de ejemplo para usar los nuevos colores

## 💡 Tip

Si tienes un diseño o mockup en Figma, Adobe XD, o cualquier otra herramienta, puedo extraer los colores desde ahí también.
