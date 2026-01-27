<p align="center">
  <a href="https://nextjs.org/" target="_blank">
    <img src="https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js" alt="Next.js"/>
  </a>
  <a href="https://react.dev/" target="_blank">
    <img src="https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react" alt="React"/>
  </a>
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript" alt="TypeScript"/>
  </a>
</p>

<p align="center">
  Dashboard web moderno para visualizar y monitorear el estado de servidores en tiempo real, construido con
  <a href="https://nextjs.org" target="_blank">Next.js 16</a> y
  <a href="https://react.dev" target="_blank">React 19</a>.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/next" target="_blank">
    <img src="https://img.shields.io/npm/v/next.svg" alt="NPM Version" />
  </a>
  <a href="https://github.com/Lucascabral95/server-check-app" target="_blank">
    <img src="https://img.shields.io/badge/license-UNLICENSED-red.svg" alt="Package License" />
  </a>
</p>

***

## Web — Server Check App Dashboard

Dashboard web moderno para el monitoreo de uptime de servicios web, parte del monorepo **Server Check App**. Este servicio provee una interfaz intuitiva para visualizar, gestionar y analizar el estado de monitores en tiempo real.

## Estado

- **Stack**: Next.js 16 + React 19 + TypeScript
- **State Management**: Zustand + React Query
- **Authentication**: AWS Cognito (Amplify)
- **Styling**: SCSS Modules + CSS Variables
- **Testing**: Vitest + Happy DOM
- **Entrypoint**: `app/layout.tsx`
- **Default Port**: `3000`

## Objetivo

Proveer una experiencia de usuario moderna y responsiva para el monitoreo de servicios web que soporte:

- Autenticación y autorización mediante AWS Cognito
- Visualización en tiempo real del estado de monitores
- Gestión completa de monitores (CRUD)
- Filtrado y ordenamiento de monitores
- Visualización de estadísticas y logs históricos
- Interfaz responsiva para dispositivos móviles y desktop

## Características principales

- **App Router de Next.js 16**: Renderizado híbrido con Server y Client Components
- **Autenticación AWS Cognito**: Flujo completo de registro, login y verificación de email
- **Gestión de estado**: Zustand para estado global, React Query para estado del servidor
- **API optimizada**: Axios con interceptores para inyección automática de tokens
- **Testing completo**: Vitest con Happy DOM para componentes y hooks
- **Arquitectura limpia**: Separación en capas (`presentation/`, `infraestructure/`, `lib/`)
- **TypeScript estricto**: Type safety en todo el código
- **Rutas protegidas**: Route groups para auth y dashboard

## Estructura del proyecto

```
apps/web/
├── app/                                    # Next.js App Router
│   ├── layout.tsx                          # Layout raíz (providers, fuentes)
│   ├── page.tsx                            # Homepage (landing)
│   ├── globals.css                         # Estilos globales (CSS variables)
│   ├── robots.ts                           # SEO robots.txt
│   ├── sitemap.ts                          # SEO sitemap
│   │
│   ├── (auth)/                             # Route group: Auth pages
│   │   ├── login/
│   │   │   ├── page.tsx                    # Server component
│   │   │   └── LoginView.tsx               # Client component
│   │   ├── register/
│   │   │   ├── page.tsx
│   │   │   └── RegisterView.tsx
│   │   └── validate-email/
│   │       ├── page.tsx
│   │       └── ValidateEmailView.tsx
│   │
│   └── (dashboard)/                        # Route group: Protected routes
│       ├── layout.tsx                      # Dashboard shell
│       ├── home/
│       │   ├── page.tsx                    # Lista de monitores
│       │   └── DashboardHomeView.tsx
│       ├── monitors/
│       │   ├── new/http/
│       │   │   ├── page.tsx
│       │   │   └── MonitorsNewHttpView.tsx
│       │   └── [id]/
│       │       ├── edit/
│       │       │   ├── page.tsx
│       │       │   └── EditMonitorView.tsx
│       │       └── details/
│       │           ├── page.tsx
│       │           └── MonitorsDetailsByIdView.tsx
│       ├── incidents/
│       │   ├── page.tsx
│       │   └── IncidentsDashboardView.tsx
│       ├── servers/
│       │   ├── page.tsx
│       │   └── ServerStatusDashboardView.tsx
│       └── settings/
│           ├── page.tsx
│           └── SettingsDashboardView.tsx
│
├── presentation/                           # Capa de presentación (frontend)
│   ├── components/                         # Componentes React
│   │   ├── auth/                           # Componentes de autenticación
│   │   │   ├── AuthCard.tsx                # Card contenedor de auth
│   │   │   ├── AuthLogo.tsx                # Logo de la app
│   │   │   ├── LoginForm.tsx               # Formulario de login
│   │   │   ├── RegisterForm.tsx            # Formulario de registro
│   │   │   ├── ValidateEmailForm.tsx       # Formulario de validación
│   │   │   ├── AuthErrorAlert.tsx          # Alertas de error
│   │   │   ├── PasswordRequirementsIndicator.tsx
│   │   │   ├── *.scss                      # Estilos
│   │   │   └── *.test.tsx                  # Tests
│   │   │
│   │   ├── Dashboard/                      # Componentes del dashboard
│   │   │   ├── Categories.tsx              # Categorías de navegación
│   │   │   ├── LogoutProfile.tsx           # Botón de logout
│   │   │   ├── DashboardComponents.scss    # Estilos compartidos
│   │   │   └── Home/                       # Componentes de Home
│   │   │       ├── CardUptime.tsx          # Card de monitor
│   │   │       ├── StatusUptimes.tsx       # Lista de estados
│   │   │       ├── ChartStatsLastDay.tsx   # Gráfico último día
│   │   │       ├── MenuDropdownCardUptime.tsx
│   │   │       └── DetailsUptime/          # Componentes de detalles
│   │   │           ├── MonitorStatsOverview.tsx
│   │   │           ├── LatestIncidents.tsx
│   │   │           └── MonitorDetailsHeader.tsx
│   │   │
│   │   ├── Filters/                        # Componentes de filtrado
│   │   │   └── FiltersMonitor/
│   │   │       ├── FiltersMonitor.tsx      # Filtros principales
│   │   │       ├── FilterMonitorInside.tsx # Filtros internos
│   │   │       ├── SortMonitorInside.tsx   # Ordenamiento
│   │   │       ├── FiltersIncidents.tsx    # Filtros de incidentes
│   │   │       ├── FiltersMonitor.scss
│   │   │       └── *.test.tsx              # Tests
│   │   │
│   │   ├── Structures/                     # Componentes estructurales
│   │   │   ├── Dashboard/
│   │   │   │   ├── StructureDashboard.tsx  # Layout del dashboard
│   │   │   │   └── StructureDashboard.scss
│   │   │   ├── LoginRegisterValidate/
│   │   │   │   ├── StructureLoginRegisterValidate.tsx
│   │   │   │   └── StructureLoginRegisterValidate.scss
│   │   │   └── Dashboard/Home/
│   │   │       ├── StructureChartStats.tsx
│   │   │       └── StructureChartStats.scss
│   │   │
│   │   ├── Landing/                        # Landing page components
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── FooterSection.tsx
│   │   │   ├── LogosSection.tsx
│   │   │   └── *.test.tsx
│   │   │
│   │   └── shared/                         # Componentes compartidos
│   │       ├── states/
│   │       │   ├── LoadingState.tsx        # Estado de carga
│   │       │   ├── ErrorState.tsx          # Estado de error
│   │       │   └── *.scss, *.test.tsx
│   │       └── Toasts/
│   │           ├── Toast.tsx               # Componente de toast
│   │           └── *.scss, *.test.tsx
│   │
│   ├── hooks/                              # Custom hooks
│   │   ├── useUptime.hook.ts               # Hook de monitores
│   │   ├── useNewMonitor.hook.ts           # Hook para crear monitor
│   │   ├── useUpdateMonitor.hook.ts        # Hook para actualizar
│   │   ├── usePingLogs.hook.ts             # Hook de logs
│   │   ├── useUptimeCheck.hook.ts          # Hook de verificación
│   │   ├── useMonitorById.hook.ts          # Hook por ID
│   │   ├── useMonitorByIdWithStatsLogs.ts  # Hook con estadísticas
│   │   ├── useAllMonitorsWithIncidentsByUser.hook.ts
│   │   ├── useFilteredIncidents.hook.ts    # Hook de incidentes filtrados
│   │   ├── useFilterIncidents.hook.ts      # Hook de filtros
│   │   ├── useFilterUptimeHome.hook.ts     # Hook de filtros home
│   │   ├── useUsers.hook.ts                # Hook de usuarios
│   │   └── *.test.tsx                      # Tests de hooks
│   │
│   └── utils/                              # Utilidades
│       ├── formatDate.utils.ts             # Formato de fecha
│       ├── formatInterval.utils.ts         # Formato de intervalo
│       ├── formatLastCheck.utils.ts        # Último check
│       ├── formatTimeRemaining.utils.ts    # Tiempo restante
│       ├── getStatusColor.utils.ts         # Color por estado
│       ├── jwt.utils.ts                    # Utilidades JWT
│       ├── decodeTokenJwt.utils.ts         # Decodificar JWT
│       ├── porcentHealthy.utils.ts         # Porcentaje salud
│       ├── colorByPercentage.utils.ts      # Color por porcentaje
│       └── index.ts
│
├── infraestructure/                        # Capa de infraestructura
│   ├── Api/
│   │   └── Axios-config.ts                 # Configuración de Axios
│   ├── Tans-Tack-Query/
│   │   └── TansTackQuery.global.tsx        # Provider de React Query
│   │
│   ├── constants/                          # Constantes de la app
│   │   ├── dashboardCategories.constants.ts
│   │   ├── protectedRoutes.constants.ts    # Rutas protegidas
│   │   ├── publicRoutes.constants.ts       # Rutas públicas
│   │   ├── interval-optinons.constants.ts  # Opciones de intervalo
│   │   ├── icons-svg.constants.tsx         # Iconos SVG
│   │   ├── settingsSections.constants.ts
│   │   ├── timeoutToast.constants.ts
│   │   ├── socialNetworks.constants.ts
│   │   ├── landing/                        # Constantes landing
│   │   │   ├── companies.constants.tsx
│   │   │   ├── features.constants.ts
│   │   │   ├── metrics.constants.ts
│   │   │   ├── nav.constants.ts
│   │   │   ├── testimonials.constants.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── interfaces/                         # Interfaces TypeScript
│   │   ├── uptime.interface.ts             # Interfaces de monitores
│   │   ├── user.interface.ts               # Interfaces de usuarios
│   │   ├── login.interface.ts              # Interfaces de login
│   │   ├── register.interface.ts           # Interfaces de registro
│   │   ├── validate-email.interface.ts     # Interfaces de validación
│   │   ├── enums.ts                        # Enumerados (Status, Role)
│   │   ├── get-stats-user.interface.ts
│   │   ├── get-stats-logs-by-uptime-id.interface.ts
│   │   ├── get-incidents.interface.ts
│   │   ├── get-incidents-by-user-id.interface.ts
│   │   ├── notify-state.interface.ts
│   │   ├── toast.interface.ts
│   │   ├── toastProps.inteface.ts
│   │   ├── pagination/                     # Interfaces de paginación
│   │   │   ├── uptime-pagination.interface.ts
│   │   │   ├── ping-logs-pagination.interface.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── models/                             # Schemas de Zod
│   │   ├── createUptimeSchema.ts           # Schema para crear monitor
│   │   ├── login.schema.ts                 # Schema de login
│   │   ├── register.schema.ts              # Schema de registro
│   │   ├── validate-email.schema.ts        # Schema de validación
│   │   └── index.ts
│   │
│   └── services/                           # Servicios de lógica de negocio
│       ├── auth.service.ts                 # Servicio de autenticación
│       ├── auth.service.test.ts            # Tests del servicio
│       └── index.ts
│
├── lib/                                    # Capa de librerías
│   ├── axios/
│   │   └── axios.ts                        # Configuración base de Axios
│   ├── cognito/
│   │   ├── amplify-cognito.client.ts       # Cliente de Amplify
│   │   └── cognito.ts                      # Configuración de Cognito
│   ├── Resources/Api/                      # Recursos de API
│   │   ├── UptimeApi.ts                    # API de monitores
│   │   ├── UsersApi.ts                     # API de usuarios
│   │   ├── PingLogsApi.ts                  # API de logs
│   │   └── index.ts
│   ├── hooks/                              # Hooks de librería
│   │   ├── useAuth.ts                      # Hook de autenticación
│   │   ├── useAuth.test.ts                 # Tests
│   │   └── index.ts
│   ├── store/
│   │   ├── authStore.ts                    # Store de autenticación
│   │   └── store.ts                        # Store principal (Zustand)
│   └── utils/
│       └── seo.ts                          # Utilidades SEO
│
├── presentation/components/SEO/            # Componentes SEO
├── public/                                 # Archivos estáticos
├── next.config.ts                          # Configuración de Next.js
├── postcss.config.mjs                      # Configuración de PostCSS
├── vitest.config.ts                        # Configuración de Vitest
├── eslint.config.mjs                       # Configuración de ESLint
├── tsconfig.json                           # Configuración de TypeScript
├── CLAUDE.md                               # Contexto del frontend
└── package.json                            # Dependencias y scripts
```

## Modelo de datos

### Interfaces TypeScript

**GetUptimeDto** (Monitor individual):
```typescript
interface GetUptimeDto {
  id: string;
  userId: string;
  name: string;
  url: string;
  frequency: number;          // Intervalo en segundos
  isActive: boolean;
  nextCheck: Date;
  lastCheck: Date;
  status: Status;             // UP | DOWN | PENDING
  createdAt: string;
  updatedAt: string;
}
```

**GetAllUptimesDto** (Lista con paginación):
```typescript
interface GetAllUptimesDto {
  data: GetUptimeDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    nextPage: boolean;
    prevPage: boolean;
    totalItems: number;
    itemsPerPage: number;
  };
}
```

**DataUserGetDto** (Usuario):
```typescript
interface DataUserGetDto {
  id: string;
  email: string;
  role: Role;                 // ADMIN | USER | GUEST
  createdAt: string;
  updatedAt: string;
}
```

### Estados del Monitor

```typescript
enum Status {
  UP = 'UP',           // Servicio disponible
  DOWN = 'DOWN',       // Servicio no disponible
  PENDING = 'PENDING'  // Pendiente de primer check
}
```

### Roles de Usuario

```typescript
enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}
```

## Requisitos previos

- Node.js >= 18
- Backend de NestJS corriendo en `http://localhost:4000`
- AWS Cognito configurado (o usar entorno de desarrollo)

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar template de variables de entorno (si existe)
cp .env.example .env.local
```

## Configuración de entorno

Edita el archivo `.env.local` con tus credenciales:

```env
# API Backend
NEXT_PUBLIC_API_URL_BACKEND=http://localhost:4000

# AWS Cognito (opcional para desarrollo)
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_USER_POOLS_ID=your_user_pool_id
NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID=your_client_id
```

### Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL_BACKEND` | URL del backend NestJS | `http://localhost:4000` |
| `NEXT_PUBLIC_AWS_REGION` | Región de AWS Cognito | `us-east-1` |
| `NEXT_PUBLIC_AWS_USER_POOLS_ID` | ID del User Pool de Cognito | *required* |
| `NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID` | ID del Client App de Cognito | *required* |

## Scripts útiles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo (port 3000)

# Producción
npm run build            # Compila para producción
npm run start            # Inicia servidor de producción

# Tests
npm run test             # Tests unitarios con Vitest
npm run test:ui          # UI de Vitest
npm run test:run         # Ejecuta tests una vez
npm run test:coverage    # Tests con cobertura

# Calidad de código
npm run lint             # Ejecutar ESLint
```

## Rutas de la aplicación

### Rutas Públicas (Auth)

| Ruta | Descripción |
|------|-------------|
| `/` | Homepage (landing) |
| `/auth/login` | Página de inicio de sesión |
| `/auth/register` | Página de registro |
| `/auth/validate-email` | Validación de email con código |

### Rutas Protegidas (Dashboard)

| Ruta | Descripción | Auth |
|------|-------------|------|
| `/dashboard/home` | Lista de monitores | :white_check_mark: |
| `/dashboard/home/monitors/new/http` | Crear monitor HTTP | :white_check_mark: |
| `/dashboard/home/monitors/[id]/edit` | Editar monitor | :white_check_mark: |
| `/dashboard/home/monitors/[id]/details` | Detalles del monitor | :white_check_mark: |
| `/dashboard/incidents` | Incidentes | :white_check_mark: |
| `/dashboard/servers` | Estado de servidores | :white_check_mark: |
| `/dashboard/settings` | Configuración | :white_check_mark: |

## Autenticación

La aplicación utiliza **AWS Cognito** mediante AWS Amplify para la autenticación:

### Flujo de autenticación

1. **Registro**: Usuario se registra con email y contraseña
2. **Verificación**: Se envía código de verificación al email
3. **Confirmación**: Usuario ingresa código para confirmar email
4. **Login**: Usuario ingresa credenciales y recibe tokens JWT
5. **Sesión**: Tokens se almacenan en Zustand con persistencia

### AuthService

Servicio centralizado para operaciones de autenticación:

```typescript
// Registro
await authService.register({ email, password });

// Confirmar email
await authService.confirmEmail({ email, code });

// Reenviar código
await authService.resendConfirmationCode(email);

// Login
await authService.login({ email, password });

// Logout
await authService.logout();

// Obtener usuario actual
const user = await authService.getCurrentUser();
```

### Estado de Autenticación (Zustand)

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: LoginResponseUser | null;
  tokens: AuthTokens | null;
  error: LoginException | null;
  isLoading: boolean;
}
```

El estado se persiste en `localStorage` con la clave `auth-storage`.

## Gestión de Estado

### Zustand (Estado Global)

Para estado del cliente (autenticación, UI):

```typescript
import { useAppStore } from '@/lib/store';

const { /* state */ } = useAppStore();
```

### React Query (Estado del Servidor)

Para datos del servidor (monitores, estadísticas):

```typescript
import useUptime from '@/presentation/hooks/useUptime.hook';

const { uptimes, createUptime, deleteUptime } = useUptime();
```

**Queries disponibles:**
- `uptimes` - Lista de monitores con paginación
- `uptimeById` - Monitor por ID
- `stats` - Estadísticas generales
- `myStats` - Estadísticas del usuario
- `statsLogsByUptimeId` - Estadísticas y logs de un monitor

**Mutations disponibles:**
- `createUptime` - Crear nuevo monitor
- `updateUptime` - Actualizar monitor existente
- `deleteUptime` - Eliminar monitor
- `flushUptime` - Forzar flush de buffer de logs

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Framework | Next.js 16.1 (App Router) |
| UI Library | React 19.2 |
| Lenguaje | TypeScript 5.x |
| State Management | Zustand + React Query |
| Forms | - |
| Validation | Zod |
| Authentication | AWS Amplify (Cognito) |
| HTTP Client | Axios |
| Styling | SCSS Modules + CSS Variables |
| Testing | Vitest + Happy DOM |
| Icons | React Icons |

## Desarrollo y pruebas

1. Configurar `.env.local` con las variables necesarias
2. Iniciar el backend (debe estar corriendo en puerto 4000):

```bash
# Desde la raíz del monorepo
npm run dev:backend
```

3. Ejecutar la aplicación en modo desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Tests

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar con UI
npm run test:ui

# Ejecutar con cobertura
npm run test:coverage
```

**Configuración de Vitest:**
- Environment: `happy-dom`
- Coverage provider: `v8`
- Aliases: `@` → root, `@workspace/types` → backend DTOs

## Ejemplos de uso

### Usar el hook de monitores

```typescript
'use client';
import useUptime from '@/presentation/hooks/useUptime.hook';

function MonitorsList() {
  const { uptimes, createUptime, deleteUptime } = useUptime();

  if (uptimes.isLoading) return <LoadingState />;
  if (uptimes.isError) return <ErrorState />;

  return (
    <div>
      {uptimes.data?.data.map(uptime => (
        <CardUptime key={uptime.id} uptimes={uptime} />
      ))}
    </div>
  );
}
```

### Usar el servicio de autenticación

```typescript
'use client';
import { authService } from '@/infraestructure/services';
import { useAuthStore } from '@/lib/store/authStore';

function LoginForm() {
  const { setUser } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    await authService.login({ email, password });
    const user = await authService.getCurrentUser();
    setUser(user, { /* tokens */ });
  };

  return <form onSubmit={/* ... */}>...</form>;
}
```

### Crear un monitor

```typescript
'use client';
import { useState } from 'react';
import { createUptime } from '@/lib/Resources/api';

function CreateMonitorForm() {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: CreateUptimeDto) => {
    setLoading(true);
    try {
      await createUptime(data);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={onSubmit}>...</form>;
}
```

## Seguridad y buenas prácticas implementadas

- Autenticación con AWS Cognito mediante JWT
- Tokens almacenados en Zustand con persistencia
- Axios interceptor para inyección automática de tokens
- Validación de formularios con Zod schemas
- TypeScript estricto para type safety
- Componentes testeables con Vitest + Happy DOM
- Separación de capas (presentation/infraestructure/lib)
- Custom hooks para lógica reutilizable
- Manejo de errores centralizado
- Rutas protegidas con layout de dashboard
- Environment variables para configuración sensible

## Testing

### Estructura de tests

```
├── *.test.tsx              # Tests de componentes
├── *.test.ts               # Tests de hooks y servicios
└── vitest.config.ts        # Configuración de tests
```

**Componentes:** Tests con `@testing-library/react`
**Hooks:** Tests con `@testing-library/react` y `@testing-library/user-event`
**Servicios:** Tests unitarios directos

**Coverage:**
- Provider: v8
- Reporters: text, json, html
- Excludes: types, interfaces, models, configs

## Observabilidad

- **Console logs**: Para desarrollo en componentes y servicios
- **React DevTools**: Para inspeccionar componentes y hooks
- **Network tab**: Para monitorear llamadas a la API

## Contribuir

- Seguir las convenciones de commits (Conventional Commits)
- Añadir pruebas para nueva lógica de negocio
- Ejecutar `npm run lint` antes de commitear
- Mantener la separación de capas (presentation/infraestructure/lib)
- Documentar nuevos componentes en este README

## Contacto

- **Autor**: Lucas Cabral
- **Email**: lucassimple@hotmail.com
- **LinkedIn**: [Lucas Gastón Cabral](https://www.linkedin.com/in/lucas-gast%C3%B3n-cabral/)
- **Website**: [Lucas Cabral | Portfolio](https://portfolio-web-dev-git-main-lucascabral95s-projects.vercel.app/)

---

## Licencia

Este proyecto está bajo la licencia **UNLICENSED**.

---

<p align="center">
  Construido con :heart: usando <a href="https://nextjs.org/">Next.js</a> y <a href="https://react.dev/">React</a>
</p>
