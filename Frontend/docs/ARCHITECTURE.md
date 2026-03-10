# Arquitectura y sistema de diseño – Frontend HealthLearn

## 1. Análisis del estado actual

### 1.1 Problemas detectados

#### Layouts
- **Dashboard (`app/(dashboard)/layout.tsx`)**: Declara `<html>` y `<body>` de nuevo. En Next.js App Router solo el **root layout** debe incluir `html`/`body`; los layouts anidados solo reciben `children` y los envuelven.
- **Auth y Public**: No tienen layout compartido; cada página aplica su propio contenedor (`min-h-screen`, `bg-gray-50`, etc.).
- **Create-course**: Tiene layout propio con header dedicado, sin reutilizar el shell del dashboard.

#### Duplicados e inconsistencias visuales

| Elemento | Ubicaciones | Inconsistencia |
|----------|-------------|----------------|
| **Logo / marca** | CreatorSidebar (teal "Ú" + "HealthLearn"), create-course layout (teal "Ú" + "HealthLearn - Médicos Creadores"), auth-signup Header (purple "LOGO"), home (purple "HUB CENTRAL") | Colores distintos (teal vs purple), textos distintos. |
| **Sidebar** | CreatorSidebar (w-64, navegación por secciones con `#id`), MainLayout (w-20 icon-only, Perfil/Cursos/Ajustes), SettingsLayout (sidebar local para tabs) | Tres patrones distintos; ninguno usa `components/ui/sidebar.tsx` (shadcn). |
| **Header** | `shared/Header.tsx` (dashboard), header en create-course layout, Header interno en auth-signup | Usuario hardcodeado "Dr. Juan Pérez" en shared Header; estilos no unificados. |
| **MainLayout** | `components/profile/MainLayout.tsx` | **No está usado en ninguna ruta** (componente huérfano). |

#### Colores y tokens
- `globals.css` define variables CSS (`--primary`, `--sidebar-*`, etc.).
- Los componentes usan clases Tailwind directas: `gray-50`, `teal-500`, `purple-600`, sin referenciar las variables.
- Resultado: marca inconsistente (teal en dashboard/creator, purple en home/auth).

#### Rutas y grupos
- `(auth)`: login, reset-password, signup — sin layout común.
- `(dashboard)`: una sola página con scroll por secciones; sidebar con enlaces `#courses`, `#communication`, etc.
- `(create-course)`: create — layout con header propio.
- `(public)`: course/[id] — sin layout; CourseDetailPage puede tener su propio shell.
- Páginas sueltas: test-course, verify-account, verify-email.

---

## 2. Propuesta de estructura uniforme

### 2.1 Jerarquía de layouts

```
app/
  layout.tsx                    → Root: <html>, <body>, AuthProvider, Toaster
  (marketing)/                  → Landing, explorar (opcional)
    layout.tsx                  → Sin sidebar; contenedor centrado o full-width
  (auth)/
    layout.tsx                  → Centered card, logo unificado, sin sidebar
  (dashboard)/                  → Área creadores (cursos, comunicación, analytics, etc.)
    layout.tsx                  → Shell con AppSidebar + AppHeader + main
  (create-course)/
    layout.tsx                  → Mismo Shell que dashboard (sidebar + header) o header reducido
  (public)/
    layout.tsx                  → Sin sidebar; header público opcional
```

- Un solo **Shell** (sidebar + header + main) para todas las zonas de app autenticada (dashboard y create-course).
- Auth y public con layouts mínimos y reutilizando **AppLogo** y contenedores base.

### 2.2 Componentes base a crear/unificar

| Componente | Ubicación | Responsabilidad |
|------------|-----------|------------------|
| **AppLogo** | `components/shared/AppLogo.tsx` | Logo + nombre de la app; variantes: default, withSuffix ("Médicos Creadores"). Un solo color de marca (ej. teal). |
| **AppShell** | `components/layouts/AppShell.tsx` | Envuelve sidebar + área principal (header + main). Props: `sidebarContent`, `headerContent` o `children` para slot del main. |
| **AppSidebar** | `components/shared/AppSidebar.tsx` | Sidebar fijo (o basado en `ui/sidebar`). Items configurables por ruta (dashboard vs create-course). Ancho fijo (ej. 16rem). |
| **AppHeader** | `components/shared/AppHeader.tsx` | Barra superior: espacio opcional a la izquierda, notificaciones, menú usuario. Datos de usuario desde AuthContext, sin hardcodear. |
| **AuthLayout** | `components/layouts/AuthLayout.tsx` | Contenedor centrado para login/signup/reset; usa AppLogo y estilos de `globals.css`. |
| **PageContainer** | `components/ui/PageContainer.tsx` | Opcional: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` para contenido de página. |

### 2.3 Design tokens de marca

- En `globals.css`, añadir (o reutilizar) variables para la marca:
  - `--brand-primary`: color principal (ej. teal-600).
  - `--brand-primary-foreground`: texto sobre brand.
- Usar estas variables en AppLogo y en estados activos de sidebar/buttons (o clases que las referencien).
- Decisión: **una sola identidad** (p. ej. teal) en toda la app; eliminar purple de home/auth o reservarlo para “marketing” si se decide más adelante.

### 2.4 Uso del sidebar de shadcn (`ui/sidebar`)

- Opción A: **Migrar** CreatorSidebar a estar construido con `SidebarProvider` + `Sidebar` + `SidebarContent` de `ui/sidebar.tsx`, para colapsar en móvil y mantener consistencia.
- Opción B: Mantener un sidebar custom pero con **mismos anchos y estilos** que los definidos en `globals.css` (`--sidebar-*`) y un único componente `AppSidebar` que reciba items por props.

Se recomienda Opción B a corto plazo (menos cambios) y Opción A cuando se unifiquen todas las vistas.

### 2.5 MainLayout (perfil) y SettingsLayout

- **MainLayout** está huérfano. Opciones:
  1. Crear ruta `app/(dashboard)/perfil/page.tsx` que renderice `<MainLayout />` (perfil + Mi aprendizaje + Ajustes).
  2. O integrar “Perfil” y “Ajustes” como secciones o rutas dentro del dashboard actual (sidebar con links a `/perfil`, `/perfil/ajustes`), y entonces MainLayout pasa a ser una vista más dentro del Shell.
- **SettingsLayout**: Mantenerlo como layout **local** (tabs Cuenta / Privacidad / Seguridad) dentro de la vista de Ajustes; no duplicar con el sidebar global.

---

## 3. Resumen de acciones

1. **Corregir** `(dashboard)/layout.tsx`: quitar `<html>` y `<body>`; usar solo el Shell (sidebar + header + main).
2. **Añadir** `Toaster` en el root layout si no está, para no duplicarlo.
3. **Crear** `AppLogo`, `AppShell`, `AppSidebar`, `AppHeader` y, si aplica, `AuthLayout` y `PageContainer`.
4. **Unificar** marca en `globals.css` (--brand-*) y usar en AppLogo y navegación activa.
5. **Refactorizar** CreatorSidebar para que sea configuración de AppSidebar (items con href o scroll).
6. **Refactorizar** create-course layout para usar el mismo AppShell (o un Shell reducido que comparta header/sidebar).
7. **Conectar** Header con AuthContext (nombre, email, avatar) en lugar de datos fijos.
8. **Decidir** ruta para MainLayout (ej. `/perfil`) e integrarlo en la navegación del sidebar.

Con esta base, las vistas faltantes se pueden completar usando siempre el mismo Shell, AppLogo y tokens, reduciendo duplicados y manteniendo una experiencia visual coherente.

---

## 4. Cambios realizados (resumen)

- **Root layout**: `Toaster` movido aquí; `body` con `min-h-screen bg-background text-foreground`.
- **Dashboard layout**: Eliminados `<html>` y `<body>` duplicados; uso de `AppShell` con `CreatorSidebar` y `Header`; sin redefinir documento.
- **Create-course layout**: Uso de `AppLogo` con sufijo "Médicos Creadores"; clases `bg-background`, `bg-card`, `border-border`.
- **Componentes nuevos**:
  - `components/shared/AppLogo.tsx`: logo + nombre; variantes de tamaño y sufijo.
  - `components/layouts/AppShell.tsx`: shell reutilizable (sidebar + área principal con header y main).
  - `components/layouts/AuthLayout.tsx`: contenedor centrado para auth (opcional; signup ya usa AppLogo internamente).
- **Design tokens** en `globals.css`: `--brand-primary`, `--brand-primary-foreground`, `--brand-muted`; expuestos en `@theme inline` como `--color-brand-*`.
- **CreatorSidebar**: Usa `AppLogo`; estilos con tokens (`bg-card`, `border-border`, `bg-brand-muted`, `text-brand-primary`).
- **Header**: Conectado a `AuthContext` (nombre, email, avatar); enlaces a `/perfil` y cierre de sesión; estilos con tokens.
- **Auth signup**: Logo reemplazado por `AppLogo`; botón y enlaces con `brand-primary`; fondos `bg-background`, `text-muted-foreground`.
- **Home**: Usa `AppLogo`; CTA con `bg-brand-primary`; enlace "Explorar cursos" apuntando a ruta existente.
- **Corrección adicional**: `CourseDetailPage` importa `ProfessionalVerificationForm` en lugar de `ProfessionalProfileForm` (nombre correcto del export).
