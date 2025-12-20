# Componentes UI - MuscleUp Gym

Componentes base construidos con Tailwind CSS y la paleta de colores personalizada.

## 🎨 Paleta de Colores

| Color | Código | Uso |
|-------|--------|-----|
| Negro Puro | `#000000` | Fondo Principal |
| Blanco Puro | `#FFFFFF` | Texto Principal |
| Amarillo Dorado | `#FFCC00` | Acento y CTA |
| Gris Oscuro | `#1A1A1A` | Superficies y Tarjetas |
| Gris Medio | `#808080` | Bordes y Divisores |
| Gris Claro | `#E0E0E0` | Texto Secundario |

## 📦 Componentes Disponibles

### Button

Botón con múltiples variantes y tamaños.

**Variantes:** `primary` | `secondary` | `outline` | `ghost`  
**Tamaños:** `sm` | `md` | `lg`

```tsx
import { Button } from '@/components/ui';

// Botón primario (amarillo dorado)
<Button variant="primary" size="lg">
  Comenzar Ahora
</Button>

// Botón secundario
<Button variant="secondary">
  Más Información
</Button>

// Botón outline
<Button variant="outline">
  Contáctanos
</Button>

// Botón ghost
<Button variant="ghost" size="sm">
  Cancelar
</Button>
```

### Card

Tarjetas con variantes para diferentes contextos.

**Variantes:** `default` | `bordered` | `elevated`

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

<Card variant="bordered">
  <CardHeader>
    <CardTitle>Membresía Premium</CardTitle>
    <CardDescription>Acceso ilimitado a todas las instalaciones</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-[--color-foreground]">
      Incluye clases grupales, entrenador personal y más...
    </p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Suscribirse</Button>
  </CardFooter>
</Card>
```

### Badge

Etiquetas pequeñas para estados o categorías.

**Variantes:** `default` | `success` | `warning` | `error` | `info`

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Activo</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="error">Vencido</Badge>
<Badge variant="info">Nuevo</Badge>
<Badge variant="default">Premium</Badge>
```

## 🎯 Uso de Variables CSS

Todos los componentes utilizan variables CSS personalizadas:

```css
/* Fondos */
--color-background: #000000
--color-surface: #1A1A1A

/* Textos */
--color-foreground: #FFFFFF
--color-muted: #E0E0E0

/* Marca */
--color-primary: #FFCC00
--color-primary-dark: #E6B800
--color-primary-light: #FFD633

/* Bordes */
--color-border: #808080
--color-border-light: #4D4D4D

/* Estados */
--color-success: #4ADE80
--color-warning: #FFCC00
--color-error: #EF4444
--color-info: #3B82F6
```

### Uso en componentes personalizados:

```tsx
// Usando variables CSS directamente
<div className="bg-[--color-surface] text-[--color-foreground] border border-[--color-border]">
  Contenido
</div>

// Hover states
<div className="hover:bg-[--color-primary] hover:text-[--color-background] transition-colors">
  Elemento con hover
</div>
```

## 🚀 Próximos Componentes

- [ ] Input / TextField
- [ ] Select / Dropdown
- [ ] Modal / Dialog
- [ ] Navigation / Navbar
- [ ] Footer
- [ ] Hero Section
- [ ] Testimonial Card
- [ ] Pricing Card
- [ ] Gallery Grid
- [ ] Contact Form

## 💡 Tips

1. **Consistencia:** Todos los componentes usan la misma paleta de colores
2. **Accesibilidad:** Alto contraste entre texto y fondo (#FFFFFF sobre #000000)
3. **Hover States:** Transiciones suaves con `transition-all duration-300`
4. **Responsive:** Diseñado mobile-first con breakpoints de Tailwind
5. **Type Safety:** Todos los componentes tienen tipos TypeScript completos
