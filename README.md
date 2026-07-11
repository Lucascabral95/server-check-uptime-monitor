<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo_text.svg" alt="NestJS Logo" width="320"/>
  </a>
</p>

<h1 align="center">Server Check App</h1>

<p align="center">
  Plataforma de monitoreo de uptime de alto rendimiento con arquitectura de monorepo, procesamiento asíncrono y monitoreo continuo de servicios web.
</p>

***

## Despliegue AWS en una EC2

La producción se despliega con Terraform en una única EC2. Docker Compose ejecuta PostgreSQL, Redis, API, web, Caddy y la observabilidad; CloudFront entrega HTTPS. No hay SSH público: la actualización remota usa AWS Systems Manager. El agente secundario queda fuera de este despliegue inicial.

Antes de ejecutar, instalá AWS CLI v2 y Terraform 1.11+, autenticá tu cuenta con `aws configure`, confirmá que el remitente de SES sea una dirección real que puedas verificar y completá `deploy/phase5/secrets/bootstrap.env` desde su ejemplo. Ese archivo no se versiona.

```powershell
# Desde la raíz, con todos los cambios ya confirmados en Git
npm run deploy:aws
```

El comando crea el bucket de estado, red, EC2, IAM, S3 de artefactos y backups, Cognito, identidad SES, CloudFront y un presupuesto opcional. Luego empaqueta el commit actual, lo sube a S3, escribe los secretos en Parameter Store, instala el stack, realiza las migraciones y verifica `/health/readiness`. Al terminar imprime la URL HTTPS de CloudFront.

Para una cuenta Free Tier nueva, el valor por defecto usa `m7i-flex.large`, porque el stack completo no cabe de forma fiable en 1 GiB. AWS puede aplicar créditos y elegibilidad según la fecha de creación de la cuenta y región; configurá una alerta de presupuesto para evitar sorpresas:

```powershell
npm run deploy:aws
```

SES empieza en sandbox: verificá el email que envía AWS y solicitá salida de sandbox si necesitás notificar a destinatarios no verificados. Para eliminar todos los recursos al finalizar las pruebas ejecutá `terraform -chdir=deploy/aws/main destroy` (con la misma configuración de backend) y luego `terraform -chdir=deploy/aws/bootstrap destroy`.

***

## Table of contents

- [Descripción general](#descripción-general)
- [⚙️ Características principales](#️-características-principales)
- [🏛️ Arquitectura del sistema](#️-arquitectura-del-sistema)
  - [Flujo de datos](#flujo-de-datos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [🛠️ Catálogo de servicios](#️-catálogo-de-servicios)
  - [🔐 Auth Module](#-auth-module)
  - [📊 Uptime Module](#-uptime-module)
  - [📝 Ping Log Module](#-ping-log-module)
  - [📧 Email Module](#-email-module)
  - [🌐 Frontend (Next.js)](#-frontend-nextjs)
- [🚀 Guía de instalación y ejecución](#-guía-de-instalación-y-ejecución)
- [🛠️ Scripts disponibles](#️-scripts-disponibles)
- [🧪 Testing](#-testing)
- [🐳 Docker](#-docker)
- [🔄 CI/CD](#-cicd)
- [🛡️ Seguridad implementada](#️-seguridad-implementada)
- [📚 Documentación de la API](#-documentación-de-la-api)
- [🤝 Contribuciones](#-contribuciones)
- [📄 Licencia](#-licencia)
- [📬 Contacto](#-contacto)

## Descripción general

**Server Check App** es un sistema de monitoreo de uptime para servicios web con arquitectura de alto rendimiento. Construido con [NestJS](https://nestjs.com/) y [Next.js](https://nextjs.org/) en una arquitectura de monorepo con [Turbo](https://turbo.build/repo), este sistema ofrece procesamiento asíncrono con colas, optimizaciones para alto throughput y monitoreo continuo de disponibilidad y rendimiento.

El backend está optimizado para manejar miles de checks por minuto grâce a un pool de conexiones HTTP, un sistema de buffering para escrituras masivas a la base de datos, y un procesador de colas que escala automáticamente según la cantidad de monitores activos.

***

<a id="️-características-principales"></a>
## ⚙️ Características principales

### Backend - High Performance Architecture

- **⚡ HTTP Connection Pooling** - Pool de conexiones HTTP con Undici para optimizar rendimiento (100 conexiones, pipelining 10)
- **📦 Buffer de Escritura** - Sistema de buffering batch para writes masivos a BD (500 logs, flush cada 5s)
- **🔌 Circuit Breaker** - Protección contra fallos en cascada en endpoints monitoreados (se abre tras 5 fallos)
- **🔄 Retry con Exponential Backoff** - Reintentos inteligentes para checks fallidos (hasta 3 reintentos)
- **⚙️ Procesamiento Asíncrono** - Colas BullMQ para checks de monitoreo no bloqueantes
- **💀 Dead Letter Queue** - Manejo de jobs fallidos con reintentos extendidos (5 retries con backoff exponencial)
- **📈 Auto-escalado de Jobs** - Cada monitor tiene su job recurrente individual (job ID único)
- **🔐 Cache de JWKS** - Claves públicas de Cognito cacheadas por 5 minutos
- **✅ Validación de Entorno** - Variables de entorno validadas con Joi al inicio
- **📊 Métricas en Tiempo Real** - Stats HTTP pool (avg, p95, p99 response times)

### Frontend - Modern Dashboard

- **🎨 Next.js 16 + React 19** - Última versión con App Router y Server Components
- **💅 Tailwind CSS 4** - Estilizado moderno con motor CSS nativo
- **🔐 Autenticación con AWS Amplify** - Integración completa con AWS Cognito
- **📱 Diseño Responsive** - Optimizado para todos los dispositivos
- **⚡ Optimizaciones** - Code splitting, lazy loading, image optimization

<a id="️-arquitectura-del-sistema"></a>
## 🏛️ Arquitectura del sistema

El siguiente diagrama ilustra el flujo de datos y la interacción entre los componentes de la plataforma:

```mermaid
graph TB
    subgraph "Frontend - Next.js 16"
        U[Usuario]
        L[Landing Page]
        A[Auth Pages]
        D[Dashboard]
    end

    subgraph "Backend - NestJS"
        API[API Gateway /api/v1]
        AUTH[Auth Module]
        UPTIME[Uptime Module]
        PING[Ping Log Module]
        EMAIL[Email Module]
    end

    subgraph "Background Processing"
        QUEUE[BullMQ Queue]
        PROC[Uptime Processor]
        DLQ[Dead Letter Queue]
    end

    subgraph "Infrastructure"
        PG[(PostgreSQL 16)]
        REDIS[(Redis 7)]
        POOL[HTTP Pool Service]
        BUFFER[Ping Log Buffer]
    end

    subgraph "External Services"
        COGNITO[AWS Cognito]
        SES[AWS SES]
    end

    U --> L
    U --> A
    U --> D

    L --> API
    A --> API
    D --> API

    API --> AUTH
    API --> UPTIME

    AUTH --> COGNITO
    AUTH --> PG

    UPTIME --> QUEUE
    UPTIME --> PG

    QUEUE --> PROC
    PROC --> POOL
    PROC --> BUFFER
    PROC --> EMAIL

    POOL -->|HTTP Check| Internet[Internet Services]
    BUFFER --> PG
    EMAIL --> SES
    EMAIL --> PG

    PROC -->|On Failure| DLQ
    DLQ --> PROC

    QUEUE --> REDIS
```

<a id="flujo-de-datos"></a>
## Flujo de datos

1. **Autenticación**: El usuario se registra/login a través de AWS Cognito
2. **Creación de Monitor**: El usuario crea un monitor vía API
3. **Job Scheduling**: BullMQ crea un job recurrente individual para el monitor
4. **Health Check**: El processor ejecuta el check HTTP usando el pool de conexiones
5. **Buffering**: El resultado se almacena en el buffer de PingLogs
6. **Batch Write**: Cada 5 segundos o 500 logs, se escriben a PostgreSQL
7. **Status Update**: El estado del monitor se actualiza (UP/DOWN)
8. **Notificación**: Si el estado cambió, se envía email de alerta
9. **Error Handling**: Si falla, el job va a la Dead Letter Queue para retries extendidos

<a id="estructura-del-proyecto"></a>
## Estructura del proyecto

```text
server-check-app/
├── apps/
│   ├── backend-uptime/              # NestJS API (puerto 4000)
│   │   ├── src/
│   │   │   ├── auth/                # Autenticación JWT + JWKS
│   │   │   │   ├── guards/          # JwtAuthGuard, RolesGuard
│   │   │   │   ├── strategies/      # JWT Strategy
│   │   │   │   └── decorators/      # @Roles decorator
│   │   │   ├── uptime/              # Módulo de monitoreo
│   │   │   │   ├── services/
│   │   │   │   │   └── http-pool.service.ts   # Pool HTTP Undici
│   │   │   │   ├── uptime.processor.ts        # BullMQ worker
│   │   │   │   ├── uptime.service.ts          # Lógica de negocio
│   │   │   │   └── dto/                       # Data Transfer Objects
│   │   │   ├── ping-log/            # Logs de monitoreo
│   │   │   │   ├── ping-log-buffer.service.ts # Buffer batch
│   │   │   │   ├── ping-log.service.ts
│   │   │   │   └── dto/
│   │   │   ├── email/               # Notificaciones por email
│   │   │   │   ├── email.service.ts
│   │   │   │   └── dto/
│   │   │   ├── user/                # Gestión de usuarios
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── user.controller.ts
│   │   │   │   └── dto/
│   │   │   ├── prisma/              # Configuración Prisma ORM
│   │   │   │   ├── prisma.module.ts
│   │   │   │   └── prisma.service.ts
│   │   │   ├── bullmq/              # Configuración BullMQ
│   │   │   │   └── bullmq.module.ts
│   │   │   ├── config/              # Configuraciones
│   │   │   │   ├── cors.ts
│   │   │   │   ├── envs.schema.ts   # Validación Joi
│   │   │   │   └── routes-excludes-prefix.ts
│   │   │   ├── errors/              # Manejo de errores
│   │   │   │   ├── handler-prisma-error.ts
│   │   │   │   └── prisma.exception-filter.ts
│   │   │   ├── jwt-module/          # JWT Module
│   │   │   ├── utils/               # Utilidades (email design, etc)
│   │   │   ├── dto/                 # DTOs globales
│   │   │   ├── app.module.ts        # Root module
│   │   │   └── main.ts              # Entry point
│   │   ├── prisma/
│   │   │   └── schema.prisma        # Esquema de base de datos
│   │   ├── .env.template            # Template de variables de entorno
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                         # Next.js 16 frontend (puerto 3000)
│       ├── app/                     # App Router
│       │   ├── (auth)/              # Route group: Auth pages
│       │   │   ├── login/
│       │   │   │   ├── page.tsx
│       │   │   │   └── LoginView.tsx
│       │   │   ├── register/
│       │   │   │   ├── page.tsx
│       │   │   │   └── RegisterView.tsx
│       │   │   └── validate-email/
│       │   │       ├── page.tsx
│       │   │       └── ValidateEmailView.tsx
│       │   ├── (dashboard)/         # Route group: Protected routes
│       │   │   ├── layout.tsx       # Dashboard shell
│       │   │   ├── home/
│       │   │   │   ├── page.tsx     # Lista de monitores
│       │   │   │   └── DashboardHomeView.tsx
│       │   │   ├── monitors/
│       │   │   │   ├── new/http/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── MonitorsNewHttpView.tsx
│       │   │   │   └── [id]/
│       │   │   │       ├── details/
│       │   │   │       │   ├── page.tsx
│       │   │   │       │   └── MonitorsDetailsByIdView.tsx
│       │   │   │       └── edit/
│       │   │   │           ├── page.tsx
│       │   │   │           └── EditMonitorView.tsx
│       │   │   ├── incidents/
│       │   │   │   ├── page.tsx
│       │   │   │   └── IncidentsDashboardView.tsx
│       │   │   ├── servers/
│       │   │   │   ├── page.tsx
│       │   │   │   └── ServerStatusDashboardView.tsx
│       │   │   └── settings/
│       │   │       ├── page.tsx
│       │   │       └── SettingsDashboardView.tsx
│       │   ├── layout.tsx           # Root layout
│       │   ├── page.tsx             # Landing page
│       │   ├── globals.css          # Tailwind CSS
│       │   ├── robots.ts            # SEO
│       │   └── sitemap.ts           # SEO
│       │
│       ├── presentation/
│       │   ├── components/
│       │   │   ├── auth/            # Auth components
│       │   │   │   ├── LoginForm.tsx
│       │   │   │   ├── RegisterForm.tsx
│       │   │   │   ├── ValidateEmailForm.tsx
│       │   │   │   ├── AuthCard.tsx
│       │   │   │   ├── PasswordRequirementsIndicator.tsx
│       │   │   │   └── auth.scss
│       │   │   ├── Dashboard/       # Dashboard components
│       │   │   │   ├── Home/
│       │   │   │   │   ├── CardUptime.tsx
│       │   │   │   │   ├── StatusUptimes.tsx
│       │   │   │   │   ├── ChartStatsLastDay.tsx
│       │   │   │   │   ├── DetailsUptime/
│       │   │   │   │   │   ├── MonitorStatsOverview.tsx
│       │   │   │   │   │   ├── LatestIncidents.tsx
│       │   │   │   │   │   └── MonitorDetailsHeader.tsx
│       │   │   │   │   └── Incidents/
│       │   │   │   │       └── TableIncidents.tsx
│       │   │   │   ├── LogoutProfile.tsx
│       │   │   │   └── Categories.tsx
│       │   │   ├── Landing/         # Landing page components
│       │   │   │   ├── HeroSection.tsx
│       │   │   │   ├── FeaturesSection.tsx
│       │   │   │   ├── CTASection.tsx
│       │   │   │   ├── FooterSection.tsx
│       │   │   │   └── LogosSection.tsx
│       │   │   ├── Filters/         # Filter components
│       │   │   │   └── FiltersMonitor/
│       │   │   │       ├── FiltersMonitor.tsx
│       │   │   │       ├── FilterMonitorInside.tsx
│       │   │   │       ├── SortMonitorInside.tsx
│       │   │   │       └── FiltersIncidents.tsx
│       │   │   ├── shared/          # Shared components
│       │   │   │   ├── states/
│       │   │   │   │   ├── LoadingState.tsx
│       │   │   │   │   └── ErrorState.tsx
│       │   │   │   └── Toasts/
│       │   │   │       └── Toast.tsx
│       │   │   └── Structures/      # Layout structures
│       │   │       ├── LoginRegisterValidate/
│       │   │       │   └── StructureLoginRegisterValidate.tsx
│       │   │       └── Dashboard/
│       │   │           └── StructureDashboard.tsx
│       │   ├── hooks/                # Custom React hooks
│       │   │   ├── useUptime.hook.ts
│       │   │   ├── useUptimeCheck.hook.ts
│       │   │   ├── usePingLogs.hook.ts
│       │   │   ├── useMonitorById.hook.ts
│       │   │   ├── useMonitorByIdWithStatsLogs.ts
│       │   │   ├── useAllMonitorsWithIncidentsByUser.hook.ts
│       │   │   ├── useFilteredIncidents.hook.ts
│       │   │   ├── useNewMonitor.hook.ts
│       │   │   └── useUsers.hook.ts
│       │   ├── utils/                # Utility functions
│       │   │   ├── jwt.utils.ts
│       │   │   ├── decodeTokenJwt.utils.ts
│       │   │   ├── formatDate.utils.ts
│       │   │   ├── formatInterval.utils.ts
│       │   │   ├── formatLastCheck.utils.ts
│       │   │   ├── formatTimeRemaining.utils.ts
│       │   │   ├── getStatusColor.utils.ts
│       │   │   └── porcentHealthy.utils.ts
│       │   └── components/SEO/       # SEO components
│       ├── lib/                      # Utility libraries
│       │   └── utils/
│       │       └── index.ts
│       ├── public/                   # Static assets
│       ├── next.config.ts            # Next.js config
│       ├── postcss.config.mjs        # PostCSS config
│       ├── CLAUDE.md                 # Frontend context
│       └── package.json
│
├── packages/                         # Paquetes compartidos
├── docker-compose.yml                # Infraestructura local
├── turbo.json                        # Orquestación de builds
├── package.json                      # Root package.json
├── CLAUDE.md                         # Project context
└── README.md                         # Este archivo
```

<a id="️-catálogo-de-servicios"></a>
## 🛠️ Catálogo de servicios

<a id="-auth-module"></a>
### 🔐 Auth Module

- **Ruta**: `apps/backend-uptime/src/auth/`
- **Stack**: NestJS, JWT, AWS Cognito JWKS
- **Función**: Gestión de autenticación y autorización
- **Características**:
  - Validación JWT con JWKS de AWS Cognito
  - Cache de claves públicas (5 minutos TTL)
  - RolesGuard para control de acceso (ADMIN, USER, GUEST)
  - Decorador @Roles para protección de rutas

<a id="-uptime-module"></a>
### 📊 Uptime Module

- **Ruta**: `apps/backend-uptime/src/uptime/`
- **Stack**: NestJS, BullMQ, Undici, Prisma
- **Función**: Módulo principal de monitoreo
- **Características**:
  - HTTP Pool Service con Undici (100 conexiones, pipelining 10)
  - Circuit Breaker (se abre tras 5 fallos)
  - Retry con Exponential Backoff (hasta 3 reintentos)
  - Uptime Processor (BullMQ worker)
  - Job individual por monitor con ID único
  - Dead Letter Queue para jobs fallidos
  - Métricas en tiempo real (avg, p95, p99 response times)

<a id="-ping-log-module"></a>
### 📝 Ping Log Module

- **Ruta**: `apps/backend-uptime/src/ping-log/`
- **Stack**: NestJS, Prisma
- **Función**: Gestión de logs de monitoreo con buffer
- **Características**:
  - Buffer de escritura batch (500 logs, flush cada 5s)
  - Auto-flush al alcanzar tamaño óptimo
  - Backpressure (rechaza logs cuando está lleno)
  - Retry buffer para logs fallidos
  - Health checks y métricas de utilización

<a id="-email-module"></a>
### 📧 Email Module

- **Ruta**: `apps/backend-uptime/src/email/`
- **Stack**: NestJS, AWS SES, Nodemailer
- **Función**: Envío de notificaciones por email
- **Características**:
  - Envío de alertas cuando cambia el estado (UP↔DOWN)
  - Diseño de email HTML responsive
  - Integración con AWS SES para producción

<a id="-frontend-nextjs"></a>
### 🌐 Frontend (Next.js)

- **Ruta**: `apps/web/`
- **Stack**: Next.js 16, React 19, Tailwind CSS 4, AWS Amplify
- **Puerto**: 3000
- **Características**:
  - App Router con Server Components
  - Autenticación con AWS Amplify
  - Dashboard responsive con monitoreo en tiempo real
  - Componentes reutilizables con Testing
  - Hooks personalizados para gestión de estado

<a id="-guía-de-instalación-y-ejecución"></a>
## 🚀 Guía de instalación y ejecución

### Prerrequisitos

- Node.js 20+
- Docker y Docker Compose
- npm, yarn o pnpm

### 1) Clonar el repositorio

```bash
git clone https://github.com/Lucascabral95/server-check-app.git
cd server-check-app
```

### 2) Instalar dependencias

```bash
npm install
```

### 3) Configurar variables de entorno

```bash
cp apps/backend-uptime/.env.template apps/backend-uptime/.env
```

Edita `apps/backend-uptime/.env` con tus credenciales:

```env
# Servidor
PORT=4000
NODE_ENV=development

# Base de datos (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/uptime_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=uptime_db
POSTGRES_PORT=5432

# Redis (BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT (AWS Cognito)
SECRET_JWT=your_secret_key_here
JWT_EXPIRES_IN=60d

# Frontend (CORS)
MY_URL_FRONTEND=http://localhost:3000

# Email (AWS SES)
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=your_email
```

### 4) Iniciar infraestructura (PostgreSQL + Redis)

```bash
docker-compose up -d postgres redis
```

### 5) Ejecutar migraciones

```bash
cd apps/backend-uptime
npx prisma migrate dev
npx prisma generate
```

### 6) (Opcional) Poblar la base de datos con datos de prueba

El proyecto incluye un sistema de semilla (seed) que genera datos de desarrollo para probar la aplicación.

> **⚠️ Importante**: El seed crea usuarios con datos específicos (email, cognitoSub). Para usar el frontend con estos usuarios de prueba, necesitarás configurar AWS Cognito con los mismos valores, o modificar el archivo `prisma/seed/data/user.data.ts` con tus propios datos.

#### ¿Qué genera el seed?

El sistema de seed utiliza **@faker-js/faker** para generar datos realistas:

**Usuarios (2):**
- 1 usuario con rol `ADMIN`
- 1 usuario con rol `USER`
- Cada usuario tiene un `email` y `cognitoSub` específicos definidos en `prisma/seed/data/user.data.ts`

**Monitores (8):**
- 5 monitores para el usuario Admin (2 activos UP, 1 DOWN, 1 inactivo, 1 PENDING)
- 3 monitores para el usuario Regular (2 activos UP, 1 con estado variado)
- URLs, nombres y frecuencias generadas con Faker

**Ping Logs (~1,344):**
- Logs históricos de los últimos **7 días**
- **24 logs por día** por monitor (1 log por hora)
- **85% tasa de éxito**
- Códigos de estado realistas:
  - Éxitos: 200, 201, 204
  - Errores: 400, 404, 500, 502, 503, 504
- Tiempos de respuesta entre 50ms y 5000ms
- Mensajes de error realistas: "Connection timeout", "DNS resolution failed", "SSL certificate error", etc.

#### Personalizar el seed

Para usar tus propios usuarios de prueba, edita `apps/backend-uptime/prisma/seed/data/user.data.ts`:

```typescript
export const SEED_USERS = [
  {
    id: 'your-uuid-here',
    cognitoSub: 'your-cognito-sub-here', // Desde AWS Cognito
    email: 'your-email@example.com',
    role: Role.ADMIN,
  },
  // ...
];
```

#### Ejecutar el seed

```bash
cd apps/backend-uptime

# Opción 1: Reset completo + seed (recomendado para desarrollo)
npm run db:seed

# Opción 2: Solo seed (sin reset)
npm run prisma:seed

# Opción 3: Setup completo (generate + migrate + seed)
npm run db:setup
```

> **Nota**: El comando `db:seed` ejecuta automáticamente `db:reset` (borra todos los datos y reaplica migraciones) antes de ejecutar el seed.

### 7) Iniciar el servidor

```bash
# Todo el monorepo
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend
npm run dev:frontend
```

- **Backend**: `http://localhost:4000`
- **Frontend**: `http://localhost:3000`

<a id="️-scripts-disponibles"></a>
## 🛠️ Scripts disponibles

### Root (Monorepo)

```bash
npm run dev              # Inicia backend y frontend
npm run dev:backend      # Inicia solo backend
npm run dev:frontend     # Inicia solo frontend
npm run build            # Build de todas las apps
npm run lint             # Lint de todas las apps
npm run docker:backend   # Levanta backend con Docker Compose
```

### Backend (apps/backend-uptime)

```bash
# Desarrollo
npm run start:dev        # Hot-reload
npm run start:debug      # Modo debug

# Producción
npm run build            # Compilar TypeScript
npm run start:prod       # Ejecutar build

# Tests
npm run test             # Tests unitarios
npm run test:e2e         # Tests end-to-end
npm run test:cov         # Tests con cobertura
npm run test:watch       # Tests en modo watch

# Prisma
npx prisma generate      # Generar cliente
npx prisma migrate dev   # Crear migración
npx prisma migrate deploy# Deploy migraciones
npx prisma studio        # UI de base de datos

# Base de datos - Seed
npm run prisma:seed      # Ejecutar seed (datos de prueba)
npm run db:reset         # Resetear base de datos (borra datos)
npm run db:seed          # Reset + seed (recomendado para dev)
npm run db:setup         # Setup completo: generate + migrate + seed
```

### Frontend (apps/web)

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run start            # Servidor de producción

# Construccion + testeo 
npm run build-test:frontend  # Construcción y testeo del frontend
npm run build-test:backend   # Construcción y testeo del backend

# Tests
npm run test             # Tests con Vitest
npm run test:ui          # Tests con UI
npm run test:run         # Ejecutar tests
npm run test:coverage    # Tests con cobertura

# Linting
npm run lint             # ESLint
```

<a id="-testing"></a>
## 🧪 Testing

### Backend Tests

```bash
cd apps/backend-uptime

# Tests Unitarios
npm run test

# Tests E2E
npm run test:e2e

# Tests con Cobertura
npm run test:cov

# Tests en modo watch
npm run test:watch
```

### Frontend Tests

```bash
cd apps/web

# Tests con Vitest
npm run test

# Tests con UI
npm run test:ui

# Tests con cobertura
npm run test:coverage
```

<a id="-docker"></a>
## 🐳 Docker

### Infraestructura local

```bash
# Construir y ejecutar los contenedores
docker-compose up --build -d

# Detener los contenedores
docker-compose down

# Ver logs
docker-compose logs -f

# Escalar servicios
docker-compose up -d --scale backend-uptime=3
```

<a id="-cicd"></a>
## 🔄 CI/CD

El proyecto tiene configurado GitHub Actions para el backend:

- **Trigger**: Pull requests a `main` con cambios en `apps/backend-uptime/**`
- **Servicios**: PostgreSQL 16 + Redis 7 en contenedores
- **Pasos**:
  1. Setup Node.js 20 con cache npm
  2. Instalar dependencias
  3. Crear `.env` desde secrets
  4. Generar Prisma Client
  5. Esperar servicios
  6. Ejecutar migraciones
  7. Run tests
  8. Build aplicación

Ver [`.github/workflows/backend-ci.yml`](.github/workflows/backend-ci.yml)

<a id="️-seguridad-implementada"></a>
## 🛡️ Seguridad implementada

- Validación JWT con JWKS de AWS Cognito
- Cache de claves públicas con TTL de 5 minutos
- ValidationPipe global con `whitelist: true`
- RBAC con RolesGuard (ADMIN, USER, GUEST)
- CORS configurado con orígenes permitidos
- Variables de entorno validadas con Joi
- Circuit Breaker para protección de endpoints
- Índices de BD optimizados
- Dead Letter Queue para manejo de errores

<a id="-documentación-de-la-api"></a>
## 📚 Documentación de la API

### Rutas Públicas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/uptime` | Listar monitores |

### Autenticación Requerida (JWT)

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| POST | `/api/v1/uptime` | Crear monitor | USER - ADMIN |
| GET | `/api/v1/uptime/:id` | Obtener monitor | USER OWNER - ADMIN |
| PATCH | `/api/v1/uptime/:id` | Actualizar monitor | USER OWNER - ADMIN |
| DELETE | `/api/v1/uptime/:id` | Eliminar monitor | USER OWNER - ADMIN |
| GET | `/api/v1/user` | Listar usuarios | ADMIN |
| GET | `/api/v1/user/:id` | Obtener usuario | USER OWNER - ADMIN |
| PATCH | `/api/v1/user/:id` | Actualizar usuario | ADMIN |
| DELETE | `/api/v1/user/:id` | Eliminar usuario | ADMIN |

### Endpoints de Monitoreo (Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/uptime/stats` | Estadísticas del pool HTTP |
| GET | `/api/v1/uptime/flush` | Forzar flush del buffer |

<a id="🤝-contribuciones"></a>
## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue estas pautas:

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Commits

Este proyecto sigue [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan la lógica)
- `refactor:` Refactorización de código
- `test:` Añadir o modificar tests
- `chore:` Tareas de mantenimiento

<a id="-licencia"></a>
## 📄 Licencia

Este proyecto está bajo la licencia [UNLICENSED](LICENSE).

<a id="-contacto"></a>
## 📬 Contacto

- **Autor**: [Lucas Cabral](https://github.com/Lucascabral95)
- **Email**: [lucassimple1995@hotmail.com](mailto:lucassimple1995@hotmail.com)
- **LinkedIn**: [Lucas Gastón Cabral](https://www.linkedin.com/in/lucas-gast%C3%B3n-cabral/)
- **Website**: [Lucas Cabral | Portfolio](https://portfolio-web-dev-git-main-lucascabral95s-projects.vercel.app/)

---

<p align="center">
  Construido con ❤️ usando <a href="https://nestjs.com/">NestJS</a> y <a href="https://nextjs.org/">Next.js</a>
</p>
