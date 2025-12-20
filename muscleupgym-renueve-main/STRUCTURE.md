# 📁 Estructura del Proyecto MuscleUp Gym

## 🌐 Páginas Públicas `(public)`
Accesibles para todos los visitantes sin autenticación.

```
src/app/(public)/
├── about/          # Sobre nosotros, historia, misión
├── services/       # Servicios y clases del gimnasio
├── pricing/        # Planes y precios de membresías
├── gallery/        # Galería de fotos del gimnasio
└── contact/        # Formulario de contacto e información
```

## 🔐 Autenticación `(auth)`
Páginas relacionadas con login y registro.

```
src/app/(auth)/
├── login/          # Página de inicio de sesión
└── register/       # Página de registro de nuevos usuarios
```

## 🔒 Páginas Privadas `(private)`
Protegidas por el proxy, requieren autenticación.

### Admin - Panel de Administración
```
src/app/(private)/admin/
└── (las rutas se crearán paso a paso)
```

**Rutas planeadas:**
- `/admin/dashboard` - Vista general y estadísticas
- `/admin/members` - Gestión de miembros/clientes
- `/admin/trainers` - Gestión de entrenadores
- `/admin/memberships` - Gestión de planes de membresía
- `/admin/payments` - Control de pagos y facturación
- `/admin/reports` - Reportes y análisis
- `/admin/settings` - Configuración del sistema

### Client - Panel de Cliente
```
src/app/(private)/client/
└── (las rutas se crearán paso a paso)
```

**Rutas planeadas:**
- `/client/dashboard` - Panel principal del cliente
- `/client/profile` - Perfil y datos personales
- `/client/schedule` - Horario de clases y reservas
- `/client/membership` - Información de membresía activa
- `/client/payments` - Historial de pagos

## 🛡️ Sistema de Protección

### `proxy.ts`
Archivo en la raíz de `src/` que maneja:
- ✅ Autenticación basada en cookies/tokens
- ✅ Autorización por roles (admin/client)
- ✅ Redirección automática según permisos
- ✅ Protección de rutas privadas

**Flujo:**
1. Usuario intenta acceder a ruta privada
2. Proxy verifica token y rol
3. Permite acceso o redirige a `/login`
4. Después del login, redirige al dashboard correspondiente

## 📂 Otras Carpetas

```
src/
├── components/
│   ├── ui/              # Componentes base (Button, Card, etc.)
│   └── layout/          # Header, Footer, Sidebar, etc.
├── context/             # React Context para estado global
├── hooks/               # Custom hooks reutilizables
├── lib/                 # Utilidades (utils.ts, etc.)
├── services/            # Servicios de API y lógica de negocio
├── types/               # Tipos TypeScript
└── utils/               # Funciones helper adicionales
```

## 🚀 Próximos Pasos

1. ✅ Estructura de carpetas creada
2. ✅ Proxy configurado
3. ⏳ Crear páginas públicas (Home, About, etc.)
4. ⏳ Implementar sistema de autenticación
5. ⏳ Crear dashboards (Admin/Client) paso a paso
6. ⏳ Integrar con base de datos/API

---

**Nota:** Las rutas dentro de `admin/` y `client/` se irán creando incrementalmente según las necesidades del proyecto.
