<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="240" alt="NestJS Logo"/>
  </a>
</p>

<p align="center">
  Sistema de monitoreo de uptime de alto rendimiento para servicios web, construido con
  <a href="https://nestjs.com" target="_blank">NestJS</a>,
  <a href="https://www.prisma.io/" target="_blank">Prisma</a> y
  <a href="https://docs.bullmq.io/" target="_blank">BullMQ</a>.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nestjs/core" target="_blank">
    <img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version"/>
  </a>
  <a href="https://github.com/Lucascabral95/server-check-app" target="_blank">
    <img src="https://img.shields.io/badge/license-UNLICENSED-red.svg" alt="License"/>
  </a>
</p>

***

## Backend Uptime — Server Monitor

Sistema de monitoreo de uptime de alto rendimiento para servicios web, parte del monorepo **Server Check App**. Este servicio gestiona el monitoreo continuo de URLs con procesamiento asíncrono, pool de conexiones HTTP optimizado, y almacenamiento de métricas de rendimiento.

## Estado

- **Stack**: NestJS + TypeScript
- **ORM**: Prisma
- **Queue**: BullMQ + Redis 7
- **Database**: PostgreSQL 16
- **HTTP Client**: Undici
- **Email**: AWS SES + Nodemailer (fallback)
- **Entrypoint**: `src/main.ts`
- **API Prefix**: `/api/v1`
- **Default Port**: `4000`

## Objetivo

Proveer un servicio escalable y de alto rendimiento para el monitoreo de servicios web que soporte:

- Monitoreo continuo de URLs con frecuencias configurables
- Procesamiento asíncrono de checks HTTP mediante colas BullMQ
- Pool de conexiones HTTP optimizado con Undici (100 conexiones, pipelining 10)
- Sistema de buffer para escrituras masivas a BD (500 logs, flush cada 5s)
- Circuit Breaker para protección contra fallos en cascada
- Retry con Exponential Backoff para checks fallidos
- Dead Letter Queue para manejo de errores
- Historial completo de logs con métricas de rendimiento
- Autenticación mediante JWT (AWS Cognito JWKS)
- Notificaciones por email con fallback (AWS SES → Gmail SMTP)
- API RESTful versionada y documentada con Swagger

## Características principales de alto rendimiento

### HTTP Connection Pooling (Undici)
- **Pool por dominio**: 100 conexiones máximas
- **Pipelining**: 10 requests por conexión
- **Keep-alive timeout**: 60 segundos
- **Circuit Breaker**: Se abre tras 5 fallos consecutivos
- **Retry exponencial**: Hasta 3 reintentos con backoff
- **Métricas**: avg, p95, p99 response times en tiempo real

### Buffer de Escritura (PingLog)
- **Buffer size**: 500 logs (máximo 2000)
- **Auto-flush**: Cada 500 logs o 5 segundos
- **Retry buffer**: Logs fallidos reintentados
- **Backpressure**: Rechaza logs cuando está lleno
- **Stats**: Métricas de utilización en tiempo real

### BullMQ Processing
- **Job individual por monitor**: Cada monitor tiene su job recurrente
- **Job ID único**: `monitor:{monitorId}` para evitar duplicados
- **Dead Letter Queue**: Jobs fallidos movidos a DLQ tras 3 intentos
- **DLQ retries**: 5 intentos adicionales con backoff exponencial

### Seguridad
- **JWT con JWKS**: Validación con claves públicas de AWS Cognito
- **Cache de JWKS**: TTL de 5 minutos para optimizar rendimiento
- **RolesGuard**: Control de acceso por roles (ADMIN, USER, GUEST)
- **ValidationPipe**: Validación estricta con `whitelist: true`
- **Environment validation**: Variables validadas con Joi al inicio

## Estructura del proyecto

```
src/
├── auth/                          # Módulo de autenticación
│   ├── guards/
│   │   ├── jwt-auth.guard.ts      # Guard JWT con Cognito JWKS
│   │   └── roles.guard.ts         # Guard de roles
│   ├── strategies/
│   │   └── jwt.strategy.ts         # Estrategia Passport JWT
│   └── decorators/
│       └── roles.decorator.ts      # Decorador @Roles
│
├── config/                        # Configuraciones
│   ├── cors.ts                    # Opciones de CORS
│   ├── envs.schema.ts             # Validación de variables de entorno con Joi
│   └── routes-excludes-prefix.ts  # Rutas sin prefijo global
│
├── errors/                        # Manejo de errores
│   ├── handler-prisma-error.ts   # Manejador de errores de Prisma
│   ├── prisma.exception-filter.ts # Exception filter global
│   └── index.ts
│
├── jwt-module/                    # JWT Module
│   └── jwt-module.module.ts
│
├── prisma/                        # Módulo de Prisma
│   ├── prisma.module.ts
│   ├── prisma.service.ts
│   └── prisma.service.spec.ts
│
├── bullmq/                        # Configuración BullMQ
│   └── bullmq.module.ts            # Registra colas y DLQ
│
├── user/                          # Módulo de usuarios
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   ├── payload-user.dto.ts    # DTO para payload de JWT Cognito
│   │   ├── request-user.dto.ts
│   │   ├── response-user-get.dto.ts
│   │   └── index.ts
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── user.service.spec.ts
│   ├── user.controller.spec.ts
│   └── user.module.ts
│
├── uptime/                        # Módulo de monitoreo
│   ├── services/
│   │   └── http-pool.service.ts    # Pool HTTP con Undici
│   ├── dto/
│   │   ├── create-uptime.dto.ts
│   │   ├── update-uptime.dto.ts
│   │   ├── get-uptime.dto.ts
│   │   ├── get-all-uptimes.dto.ts
│   │   ├── get-stats-user.dto.ts
│   │   ├── get-stats-logs-by-uptime-id.dto.ts
│   │   ├── get-incidents.dto.ts
│   │   ├── get-incidents-by-user-id.dto.ts
│   │   ├── pagination-uptime.dto.ts
│   │   ├── pagination-incidents.dto.ts
│   │   └── index.ts
│   ├── uptime.processor.ts        # BullMQ worker
│   ├── uptime.controller.ts
│   ├── uptime.service.ts
│   ├── uptime.service.spec.ts
│   ├── uptime.controller.spec.ts
│   └── uptime.module.ts
│
├── ping-log/                      # Módulo de logs de monitoreo
│   ├── dto/
│   │   ├── create-ping-log.dto.ts
│   │   ├── get-ping-log.dto.ts
│   │   ├── update-ping-log.dto.ts
│   │   ├── pagination-ping-log.dto.ts
│   │   └── index.ts
│   ├── ping-log-buffer.service.ts # Buffer service batch
│   ├── ping-log-buffer.service.spec.ts
│   ├── ping-log.controller.ts
│   ├── ping-log.service.ts
│   ├── ping-log.service.spec.ts
│   ├── ping-log.controller.spec.ts
│   └── ping-log.module.ts
│
├── email/                         # Módulo de notificaciones
│   ├── dto/
│   │   ├── sendEmail.dto.ts
│   │   └── index.ts
│   ├── email.service.ts            # Servicio de email (AWS SES + Gmail fallback)
│   ├── email.service.spec.ts
│   └── email.module.ts
│
├── utils/                         # Utilidades
│   ├── design-email.ts             # Generador de HTML para emails
│   └── index.ts
│
├── dto/                           # DTOs globales
│   └── index.ts
│
├── app.controller.ts
├── app.module.ts
├── main.ts                        # Punto de entrada
└── generated/                     # Código generado por Prisma
    └── prisma/
        ├── client.ts
        ├── models.ts
        └── enums.ts
```

## Modelo de datos

```
User (Usuario)
  ├── Role: ADMIN | USER | GUEST
  ├── cognitoSub: AWS Cognito Subject
  └── Monitor (1:N) - Configuración de monitoreo
        ├── status: PENDING | UP | DOWN
        ├── frequency: Segundos entre checks
        └── PingLog (1:N) - Logs de checks individuales
              ├── statusCode: HTTP status
              ├── durationMs: Duración en ms
              └── success: Booleano
```

### Estados del Monitor

| Estado | Descripción |
|--------|-------------|
| `PENDING` | Pendiente de primer check |
| `UP` | Servicio disponible |
| `DOWN` | Servicio no disponible |

### Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| `ADMIN` | Acceso completo a todos los recursos |
| `USER` | Acceso a sus propios recursos |
| `GUEST` | Solo lectura |

## Requisitos previos

- Node.js >= 18
- PostgreSQL >= 14 (recomendado 16)
- Redis >= 6 (recomendado 7)
- Cuenta de AWS SES (opcional, tiene fallback a Gmail SMTP)

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.template .env
```

## Configuración de entorno

Edita el archivo `.env` con tus credenciales:

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

# AWS SES (Email)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_SES_FROM_EMAIL=your_email@example.com

# Gmail SMTP (Fallback opcional)
GMAIL_APP_USER=your@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Email Strategy (ses/nodemailer)
SEND_EMAIL_NODEMAILER_SES=ses
```

### Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `4000` |
| `NODE_ENV` | Entorno (development/production) | `development` |
| `DATABASE_URL` | URL de conexión a PostgreSQL | *required* |
| `POSTGRES_USER` | Usuario de PostgreSQL | *required* |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | *required* |
| `POSTGRES_DB` | Nombre de la base de datos | *required* |
| `POSTGRES_PORT` | Puerto de PostgreSQL | `5432` |
| `REDIS_HOST` | Host de Redis | *required* |
| `REDIS_PORT` | Puerto de Redis | `6379` |
| `REDIS_PASSWORD` | Contraseña de Redis | *required* |
| `SECRET_JWT` | Secreto para firmar JWT | *required* |
| `JWT_EXPIRES_IN` | Expiración del token | `60d` |
| `MY_URL_FRONTEND` | URL del frontend para CORS | *required* |
| `AWS_REGION` | Región de AWS SES | *required* |
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID | *required* |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key | *required* |
| `AWS_SES_FROM_EMAIL` | Email remitente | *required* |
| `GMAIL_APP_USER` | Usuario Gmail (fallback) | *required* |
| `GMAIL_APP_PASSWORD` | Contraseña Gmail (fallback) | *required* |
| `SEND_EMAIL_NODEMAILER_SES` | Estrategia de email (ses/nodemailer) | *required* |

## Scripts útiles

```bash
# Desarrollo
npm run start:dev       # Modo watch con hot-reload
npm run start:debug     # Modo debug

# Producción
npm run build           # Compilar TypeScript
npm run start:prod      # Ejecutar build de producción

# Tests
npm run test            # Tests unitarios
npm run test:e2e        # Tests end-to-end
npm run test:cov        # Tests con cobertura
npm run test:watch      # Tests en modo watch
npm run test:debug      # Tests con debug

# Calidad de código
npm run lint            # Ejecutar ESLint
npm run format          # Formatear con Prettier

# Prisma
npx prisma generate      # Generar cliente
npx prisma migrate dev   # Crear migración
npx prisma migrate deploy# Deploy migraciones
npx prisma studio        # UI de base de datos
```

## API Endpoints

Todas las rutas están prefijadas con `/api/v1` excepto las configuradas en `routes-excludes-prefix.ts`.

### Documentación Swagger

La API cuenta con documentación interactiva mediante Swagger:

```bash
# Una vez iniciado el servidor, acceder a:
http://localhost:4000/api
```

### Endpoints Públicos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/uptime` | Listar monitores (con filtros) |
| GET | `/api/v1/uptime/stats` | Estadísticas internas del sistema |
| GET | `/api/v1/uptime/flush` | Forzar flush del buffer de logs |

### Endpoints de Monitores (Uptime)

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| POST | `/api/v1/uptime` | Crear monitor | :white_check_mark: | USER |
| GET | `/api/v1/uptime` | Listar monitores | :x: | - |
| GET | `/api/v1/uptime/:id` | Obtener monitor por ID | :white_check_mark: | ADMIN |
| PATCH | `/api/v1/uptime/:id` | Actualizar monitor | :white_check_mark: | ADMIN |
| DELETE | `/api/v1/uptime/:id` | Eliminar monitor | :white_check_mark: | ADMIN |
| GET | `/api/v1/uptime/stats/user` | Estadísticas del usuario | :white_check_mark: | ADMIN |
| GET | `/api/v1/uptime/logs/:uptimeId` | Logs de un monitor | :white_check_mark: | ADMIN |
| GET | `/api/v1/uptime/incidents/:id` | Incidentes de un monitor | :white_check_mark: | ADMIN |
| GET | `/api/v1/uptime/incidents/user` | Todos los incidentes del usuario | :white_check_mark: | ADMIN |

### Endpoints de Usuarios

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| POST | `/api/v1/user` | Crear usuario | :white_check_mark: | - |
| GET | `/api/v1/user` | Listar usuarios | :white_check_mark: | ADMIN |
| GET | `/api/v1/user/:id` | Obtener usuario por ID | :white_check_mark: | ADMIN |
| PATCH | `/api/v1/user/:id` | Actualizar usuario | :white_check_mark: | ADMIN |
| DELETE | `/api/v1/user/:id` | Eliminar usuario | :white_check_mark: | ADMIN |

## Autenticación

El servicio utiliza **AWS Cognito** para la autenticación mediante JWT con JWKS:

### Flujo de autenticación

1. El cliente obtiene un token de AWS Cognito
2. El token se envía en el header `Authorization: Bearer <token>`
3. El `JwtAuthGuard` valida el token:
   - Decodifica el header para obtener el `kid` (Key ID)
   - Obtiene las claves públicas desde el endpoint JWKS de Cognito
   - Verifica la firma del token con la clave pública correspondiente
   - Valida el `iss` (issuer), `exp` (expiración) y `token_use`
4. El payload del usuario se adjunta a `request.user`
5. Usuario creado/encontrado en base de datos automáticamente

### Cache de JWKS

Las claves públicas de Cognito se cachean por 5 minutos para optimizar el rendimiento y reducir las llamadas al endpoint JWKS.

## Servicios de Alto Rendimiento

### HttpPoolService

Servicio de pooling de conexiones HTTP con Undici:

```typescript
// Configuración
const CONFIG = {
  POOL_CONNECTIONS: 100,
  POOL_PIPELINING: 10,
  KEEP_ALIVE_TIMEOUT: 60000,
  CONNECT_TIMEOUT: 5000,
  MAX_RETRIES: 3,
  CIRCUIT_BREAKER_THRESHOLD: 5,
}
```

**Características:**
- Pool por dominio
- Circuit Breaker que se abre tras 5 fallos consecutivos
- Retry con Exponential Backoff
- Métricas en tiempo real (avg, p95, p99 response times)

### PingLogBufferService

Buffer de escritura batch para logs de ping:

```typescript
// Configuración
const CONFIG = {
  BUFFER_SIZE: 500,
  MAX_BUFFER_SIZE: 2000,
  FLUSH_INTERVAL_MS: 5000,
  MAX_FLUSH_RETRIES: 3,
}
```

**Características:**
- Auto-flush cada 500 logs o 5 segundos
- Backpressure (rechaza logs cuando está lleno)
- Retry buffer para logs fallidos
- Stats de utilización en tiempo real

### BullMQ Worker

Procesador de jobs asíncrono:

**Características:**
- Job individual por monitor con ID único: `monitor:{monitorId}`
- Dead Letter Queue con 5 retries adicionales
- Health checks para verificar isActive
- Email de notificación cuando cambia el estado (UP↔DOWN)

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Framework | NestJS |
| Lenguaje | TypeScript |
| Base de datos | PostgreSQL 16 |
| ORM | Prisma |
| Cola de trabajos | BullMQ + Redis 7 |
| HTTP Client | Undici |
| Validación | Joi + class-validator |
| Autenticación | JWT (AWS Cognito JWKS) |
| Email | AWS SES + Nodemailer (fallback) |
| Documentación | Swagger/OpenAPI |

## Docker

```bash
# Construir imagen
docker build -t backend-uptime .

# Ejecutar contenedor
docker run -p 4000:4000 --env-file .env backend-uptime
```

O usando Docker Compose desde la raíz del monorepo:

```bash
docker-compose up -d backend-uptime
```

## Desarrollo y pruebas

1. Configurar `.env` con las variables necesarias
2. Iniciar PostgreSQL y Redis:

```bash
# Usando Docker Compose desde la raíz del monorepo
docker-compose up -d postgres redis
```

3. Ejecutar migraciones de Prisma:

```bash
npx prisma migrate dev
npx prisma generate
```

4. Ejecutar la aplicación en modo desarrollo:

```bash
npm run start:dev
```

El servidor estará disponible en `http://localhost:4000`

## Ejemplos de uso

### Crear un monitor

```bash
curl -X POST http://localhost:4000/api/v1/uptime \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "name": "Mi API",
    "url": "https://api.example.com",
    "frequency": 60
  }'
```

### Obtener todos los monitores (con filtros)

```bash
curl "http://localhost:4000/api/v1/uptime?page=1&limit=10&status=UP&sortBy=recent"
```

### Obtener estadísticas del sistema

```bash
curl http://localhost:4000/api/v1/uptime/stats \
  -H "Authorization: Bearer <access_token>"
```

**Respuesta:**
```json
{
  "httpPool": {
    "activeRequests": 5,
    "totalRequests": 1000,
    "successfulRequests": 950,
    "failedRequests": 45,
    "averageResponseTime": 125.5,
    "p95ResponseTime": 200,
    "p99ResponseTime": 350
  },
  "buffer": {
    "currentSize": 50,
    "totalFlushed": 5000,
    "flushCount": 10,
    "lastFlushTime": "2024-01-15T10:30:00.000Z",
    "lastFlushDuration": 150,
    "isFlushingNow": false,
    "droppedDueToBackpressure": 0
  },
  "pools": [
    { "domain": "https://api.example.com", "active": true }
  ],
  "bufferUtilization": 2.5
}
```

## Seguridad y buenas prácticas implementadas

- :white_check_mark: Validación JWT con JWKS de AWS Cognito
- :white_check_mark: Cache de claves públicas con TTL de 5 minutos
- :white_check_mark: ValidationPipe global con `whitelist: true`
- :white_check_mark: RBAC con RolesGuard (ADMIN, USER, GUEST)
- :white_check_mark: CORS configurado con orígenes permitidos
- :white_check_mark: Variables de entorno validadas con Joi
- :white_check_mark: Circuit Breaker para protección de endpoints
- :white_check_mark: Índices de BD optimizados
- :white_check_mark: Dead Letter Queue para manejo de errores
- :white_check_mark: DTOs con validación estricta
- :white_check_mark: Manejo centralizado de errores de Prisma
- :white_check_mark: Email con fallback (AWS SES → Gmail SMTP)

## Observabilidad

- **NestJS Logger**: Logs estructurados por módulo
- **Métricas HTTP**: Stats en tiempo real del pool (avg, p95, p99)
- **Métricas de Buffer**: Utilización, flush count, dropped logs
- **Métricas de Cola**: Jobs completados, fallidos, en DLQ
- **BullMQ Dashboard**: Opcional para monitoreo visual de colas

## Contribuir

- Seguir las convenciones de commits (Conventional Commits)
- Añadir pruebas para nueva lógica de negocio
- Documentar nuevos endpoints en Swagger
- Ejecutar `npm run lint` antes de commitear
- Mantener la separación de responsabilidades (módulos)

## Contacto

- **Autor**: Lucas Cabral
- **Email**: lucassimple@hotmail.com
- **LinkedIn**: [Lucas Gastón Cabral](https://www.linkedin.com/in/lucas-gast%C3%B3n-cabral/)
- **Website**: [Lucas Cabral | Portfolio](https://portfolio-web-dev-git-main-lucascabral95s-projects.vercel.app/)
- **GitHub**: [@Lucascabral95](https://github.com/Lucascabral95)

---

## Licencia

Este proyecto está bajo la licencia **UNLICENSED**.

---

<p align="center">
  Construido con :heart: usando <a href="https://nestjs.com/">NestJS</a>
</p>
