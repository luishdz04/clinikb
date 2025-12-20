# MuscleUp Gym - Proyecto Renovado 🏋️

## 🎯 Descripción
Proyecto completamente nuevo de MuscleUp Gym, construido desde cero con tecnologías modernas y arquitectura limpia. Sin dependencias innecesarias ni código legacy.

## 🛠️ Stack Tecnológico

### Core
- **Next.js 15** (latest) - Framework React con App Router
- **React 18** - Librería UI
- **TypeScript 5** - Type safety

### Styling
- **Tailwind CSS 3** - Framework CSS utility-first (PRINCIPAL)
- **PostCSS & Autoprefixer** - Procesamiento CSS
- **clsx + tailwind-merge** - Utilidad para combinar clases

### Modo Dark
- ✅ Configurado con clase `dark` en el `<html>`
- ✅ Sistema de colores personalizable en `tailwind.config.ts`

## 📁 Estructura del Proyecto

```
muscleupgym-renueve/
├── public/
│   ├── logos/              # Logos del gym (SVG, PNG)
│   ├── images/
│   │   ├── heroes/         # Imágenes hero/banner
│   │   ├── gallery/        # Galería del gimnasio
│   │   └── icons/          # Iconos personalizados
│   ├── videos/             # Videos promocionales
│   └── fonts/              # Fuentes personalizadas (opcional)
├── src/
│   ├── app/                # App Router (Next.js 13+)
│   │   ├── layout.tsx      # Layout raíz con modo dark
│   │   ├── page.tsx        # Página principal
│   │   └── globals.css     # Estilos globales con Tailwind
│   ├── components/
│   │   ├── ui/             # Componentes UI reutilizables
│   │   └── layout/         # Componentes de layout (Header, Footer, etc.)
│   ├── lib/
│   │   └── utils.ts        # Utilidades (cn para clases)
│   ├── styles/             # Estilos adicionales
│   └── types/              # Tipos TypeScript globales
├── tailwind.config.ts      # Configuración Tailwind
├── postcss.config.js       # Configuración PostCSS
├── tsconfig.json           # Configuración TypeScript
└── next.config.js          # Configuración Next.js
```

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start

# Linting
npm run lint
```

## 🎨 Sistema de Colores

**Pendiente:** Definir paleta de colores personalizada para modo dark.

Ubicación: `tailwind.config.ts` → `theme.extend.colors`

### Variables CSS actuales (temporales):
```css
--bg: #0f0f0f
--fg: #ffffff
--accent: #ff4d4d
```

## 📋 Próximos Pasos

1. ✅ Configurar Tailwind CSS como sistema principal
2. ✅ Crear estructura de carpetas para assets
3. ✅ Habilitar modo dark
4. ⏳ Definir sistema de colores personalizado
5. ⏳ Crear componentes base (Button, Card, etc.)
6. ⏳ Implementar Header y Footer
7. ⏳ Crear páginas principales

## 📝 Decisiones de Arquitectura

### ¿Por qué Tailwind CSS?
- ✅ Mejor integración con Next.js
- ✅ Performance optimizada (purging automático)
- ✅ Utility-first approach (más flexible)
- ✅ Sistema de diseño consistente
- ✅ No requiere librerías de componentes pesadas (MUI, AntD)
- ✅ Fácil customización con modo dark
- ✅ Comunidad activa y documentación excelente

### Sin MUI, AntD u otras librerías pesadas
- Construiremos componentes propios con Tailwind
- Mayor control sobre el diseño
- Menos KB en el bundle final
- Más rápido y performante

## 🎯 Filosofía del Proyecto
- **Clean Code:** Sin código innecesario
- **Type Safety:** TypeScript en todo
- **Performance First:** Optimización desde el inicio
- **Dark Mode Native:** Diseñado para modo oscuro
- **Scalable:** Arquitectura pensada para crecer

---

**Proyecto iniciado:** Noviembre 22, 2025
**Estado:** 🟢 En desarrollo activo
