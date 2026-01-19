<p align="center">
  <a href="https://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo_text.svg" alt="NestJS Logo" width="320"/>
  </a>
</p>

# Server Check App

## 📋 Descripción General

**Server Check App** es un sistema de monitoreo de uptime para servicios web con arquitectura de alto rendimiento. Construido con [NestJS](https://nestjs.com/) y TypeScript en una arquitectura de monorepo, este sistema ofrece procesamiento asíncrono con colas, optimizaciones para alto throughput y monitoreo continuo de disponibilidad y rendimiento.

## 🚀 Características Principales

### Backend - High Performance Architecture

- **⚡ HTTP Connection Pooling** - Pool de conexiones HTTP con Undici para optimizar rendimiento
- **📦 Buffer de Escritura** - Sistema de buffering batch para writes masivos a BD
- **🔌 Circuit Breaker** - Protección contra fallos en cascada en endpoints monitoreados
- **🔄 Retry con Exponential Backoff** - Reintentos inteligentes para checks fallidos
- **⚙️ Procesamiento Asíncrono** - Colas BullMQ para checks de monitoreo no bloqueantes
- **💀 Dead Letter Queue** - Manejo de jobs fallidos con reintentos extendidos
- **📈 Auto-escalado de Jobs** - Cada monitor tiene su job recurrente individual
- **🔐 Cache de JWKS** - Claves públicas de Cognito cacheadas por 5 minutos
- **✅ Validación de Entorno** - Variables de entorno validadas con Joi al inicio

### API Versionada

- Prefijo global: `/api/v1`
- DTOs con validación estricta
- Documentación integrada con Swagger

### Base de Datos Optimizada

- Índices compuestos para consultas frecuentes
- Relaciones con cascade delete
- Enum types para type safety

## 🛠️ Tecnologías Utilizadas

| Componente | Tecnología |
|------------|------------|
| **Backend Framework** | [NestJS](https://nestjs.com/) |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) |
| **Base de datos** | [PostgreSQL 16](https://www.postgresql.org/) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Colas** | [BullMQ](https://docs.bullmq.io/) + [Redis 7](https://redis.io/) |
| **HTTP Client** | [Undici](https://github.com/nodejs/undici) |
| **Validación** | [Joi](https://joi.dev/) + [class-validator](https://github.com/typestack/class-validator) |
| **Autenticación** | [JWT](https://jwt.io/) ([AWS Cognito JWKS](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-idp-jwks.html)) |
| **Frontend** | [Next.js 15](https://nextjs.org/) + [React 19](https://react.dev/) |
| **Build System** | [Turbo](https://turbo.build/repo) |

## 📦 Estructura del Proyecto

```text
server-check-app/
├── apps/
│   ├── backend-uptime/     # NestJS API (puerto 4000)
│   │   ├── src/
│   │   │   ├── auth/               # Autenticación y autorización
│   │   │   ├── config/             # Configuraciones
│   │   │   ├── errors/             # Manejo de errores
│   │   │   ├── ping-log/           # Logs de monitoreo
│   │   │   ├── prisma/             # Configuración de Prisma ORM
│   │   │   ├── uptime/             # Módulo de monitoreo
│   │   │   │   ├── services/
│   │   │   │   │   └── http-pool.service.ts   # Pool HTTP
│   │   │   │   ├── uptime.processor.ts        # BullMQ worker
│   │   │   │   └── uptime.service.ts          # Lógica de negocio
│   │   │   ├── user/               # Módulo de usuarios
│   │   │   └── bullmq/             # Configuración BullMQ
│   │   └── prisma/
│   │       └── schema.prisma       # Esquema de la base de datos
│   └── web/                # Next.js frontend (puerto 3000)
├── packages/               # Paquetes compartidos
├── docker-compose.yml      # Infraestructura local
└── turbo.json             # Orquestación de builds
```

## 🗄️ Modelo de Datos

```text
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

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Lucascabral95/server-check-app.git
cd server-check-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

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
```

### 4. Iniciar infraestructura (PostgreSQL + Redis)

```bash
docker-compose up -d postgres redis
```

### 5. Ejecutar migraciones

```bash
cd apps/backend-uptime
npx prisma migrate dev
npx prisma generate
```

### 6. Iniciar el servidor

```bash
# Todo el monorepo
npm run dev

# Solo backend
npm run dev:backend
```

El backend estará disponible en `http://localhost:4000`

## 📚 Documentación de la API

### Rutas Públicas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/uptime` | Listar monitores |

### Autenticación Requerida (JWT)

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| POST | `/api/v1/uptime` | Crear monitor | USER |
| GET | `/api/v1/uptime/:id` | Obtener monitor | ADMIN |
| PATCH | `/api/v1/uptime/:id` | Actualizar monitor | ADMIN |
| DELETE | `/api/v1/uptime/:id` | Eliminar monitor | ADMIN |
| GET | `/api/v1/user` | Listar usuarios | ADMIN |
| GET | `/api/v1/user/:id` | Obtener usuario | ADMIN |
| PATCH | `/api/v1/user/:id` | Actualizar usuario | ADMIN |
| DELETE | `/api/v1/user/:id` | Eliminar usuario | ADMIN |

### Endpoints de Monitoreo (Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/uptime/stats` | Estadísticas del pool HTTP |
| GET | `/api/v1/uptime/flush` | Forzar flush del buffer |

## 🔐 Flujo de Autenticación

El backend utiliza **AWS Cognito** para autenticación JWT:

1. Cliente obtiene token de AWS Cognito
2. Token enviado en header: `Authorization: Bearer <token>`
3. [`JwtAuthGuard`](apps/backend-uptime/src/auth/guards/jwt-auth.guard.ts) valida:
   - Decodifica header para obtener `kid` (Key ID)
   - Obtiene claves públicas desde endpoint JWKS de Cognito
   - Verifica firma con clave pública correspondiente
   - Valida `iss` (issuer), `exp` (expiración), `token_use`
4. Payload del usuario adjuntado a `request.user`
5. Usuario creado/encontrado en base de datos automáticamente

## ⚡ Servicios de Alto Rendimiento

### HttpPoolService

Servicio de pooling de conexiones HTTP con [`undici`](apps/backend-uptime/src/uptime/services/http-pool.service.ts):

- **Pool por dominio**: Máximo 100 conexiones, pipelining de 10
- **Circuit Breaker**: Se abre tras 5 fallos consecutivos
- **Retry exponencial**: Hasta 3 reintentos con backoff
- **Timeout configurables**: 5s connect, 10s total
- **Métricas en tiempo real**: avg, p95, p99 response times

**Configuración:**
```typescript
const CONFIG = {
  POOL_CONNECTIONS: 100,
  POOL_PIPELINING: 10,
  KEEP_ALIVE_TIMEOUT: 60000,
  CONNECT_TIMEOUT: 5000,
  MAX_RETRIES: 3,
  CIRCUIT_BREAKER_THRESHOLD: 5,
}
```

### PingLogBufferService

Buffer de escritura batch para logs de ping ([`ping-log-buffer.service.ts`](apps/backend-uptime/src/ping-log/ping-log-buffer.service.ts)):

- **Buffer size**: 500 logs (máximo 2000)
- **Auto-flush**: Cada 500 logs o 5 segundos
- **Retry buffer**: Logs fallidos reintentados
- **Backpressure**: Rechaza logs cuando está lleno
- **Stats**: Métricas de utilización en tiempo real

**Configuración:**
```typescript
const CONFIG = {
  BUFFER_SIZE: 500,
  MAX_BUFFER_SIZE: 2000,
  FLUSH_INTERVAL_MS: 5000,
  MAX_FLUSH_RETRIES: 3,
}
```

### BullMQ Worker

Procesador de jobs asíncrono ([`uptime.processor.ts`](apps/backend-uptime/src/uptime/uptime.processor.ts)):

- **Job individual por monitor**: Cada monitor tiene su job recurrente
- **Job ID único**: `monitor:{monitorId}` para evitar duplicados
- **Dead Letter Queue**: Jobs fallidos movidos a DLQ tras 3 intentos
- **Health checks**: Verifica isActive antes de procesar

**Arquitectura de Jobs:**
```typescript
await monitorQueue.add(
  'check-monitor',
  { monitorId },
  {
    jobId: `monitor:${monitorId}`,
    repeat: { every: frequency * 1000 },
  },
);
```

## 📝 Scripts Disponibles

```bash
# Desarrollo (todo el monorepo)
npm run dev                    # Inicia backend y frontend

# Solo backend
npm run dev:backend            # Inicia solo backend en modo watch

# Build
npm run build                  # Build de todas las apps

# Docker
npm run docker:backend         # Levanta backend con Docker Compose
```

### Scripts del Backend

```bash
cd apps/backend-uptime

# Desarrollo
npm run start:dev             # Hot-reload
npm run start:debug           # Modo debug

# Producción
npm run build                 # Compilar TypeScript
npm run start:prod            # Ejecutar build

# Tests
npm run test                  # Tests unitarios
npm run test:e2e              # Tests end-to-end
npm run test:cov              # Tests con cobertura
npm run test:watch            # Tests en modo watch

# Prisma
npx prisma generate           # Generar cliente
npx prisma migrate dev        # Crear migración
npx prisma migrate deploy     # Deploy migraciones
npx prisma studio             # UI de base de datos
```

## 🧪 Ejemplos de Uso

### Crear un monitor

```bash
curl -X POST http://localhost:4000/api/v1/uptime \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "name": "Mi API",
    "url": "https://api.example.com",
    "frequency": 60,
    "userId": "user-id"
  }'
```

### Obtener estadísticas del sistema

```bash
curl http://localhost:4000/api/v1/uptime/stats \
  -H "Authorization: Bearer <access_token>"
```

Respuesta:
```json
{
  "httpPool": {
    "activeRequests": 5,
    "totalRequests": 1000,
    "successfulRequests": 950,
    "averageResponseTime": 125.5
  },
  "buffer": {
    "currentSize": 50,
    "totalFlushed": 5000,
    "flushCount": 10
  },
  "bufferUtilization": 2.5
}
```

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

## 🛡️ Seguridad Implementada

- :white_check_mark: Validación JWT con JWKS de AWS Cognito
- :white_check_mark: Cache de claves públicas con TTL de 5 minutos
- :white_check_mark: ValidationPipe global con `whitelist: true`
- :white_check_mark: RBAC con RolesGuard (ADMIN, USER, GUEST)
- :white_check_mark: CORS configurado con orígenes permitidos
- :white_check_mark: Variables de entorno validadas con Joi
- :white_check_mark: Circuit Breaker para protección de endpoints
- :white_check_mark: Índices de BD optimizados
- :white_check_mark: Dead Letter Queue para manejo de errores

## 🧪 Testing

```bash
# Tests Unitarios
cd apps/backend-uptime
npm run test

# Tests E2E
npm run test:e2e

# Tests con Cobertura
npm run test:cov

# Linting
npm run lint
```

## 🐳 Docker

```bash
# Construir y ejecutar los contenedores
docker-compose up --build -d

# Detener los contenedores
docker-compose down
```

## 📚 Recursos Adicionales

- [Documentación de NestJS](https://docs.nestjs.com/)
- [Documentación de Prisma](https://www.prisma.io/docs/)
- [Documentación de BullMQ](https://docs.bullmq.io/)
- [Documentación de AWS Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)

## 🚀 Despliegue

Para desplegar la aplicación en producción, sigue estos pasos:

1. Configura las variables de entorno de producción en `.env`
2. Construye la aplicación:
   ```bash
   npm run build
   ```
3. Ejecuta las migraciones de la base de datos:
   ```bash
   npx prisma migrate deploy
   ```
4. Inicia el servidor en producción:
   ```bash
   npm run start:prod
   ```

### 🐳 Usando Docker

El proyecto incluye configuración para Docker. Para desplegar con Docker:

1. Construye las imágenes:
   ```bash
   docker-compose build
   ```
2. Inicia los contenedores:
   ```bash
   docker-compose up -d
   ```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, sigue estas pautas:

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia [UNLICENSED](LICENSE).

## 📬 Contacto

- **Autor**: [Lucas Cabral](https://github.com/Lucascabral95)
- **Email**: [lucassimple1995@hotmail.com](mailto:lucassimple1995@hotmail.com)
- **LinkedIn**: [Lucas Gastón Cabral](https://www.linkedin.com/in/lucas-gast%C3%B3n-cabral/)
- **GitHub**: [@Lucascabral95](https://github.com/Lucascabral95)
- **Website**: [Lucas Cabral | Portfolio](https://portfolio-web-dev-git-main-lucascabral95s-projects.vercel.app/)

---

<p align="center">
  Construido con ❤️ usando <a href="https://nestjs.com/">NestJS</a>
</p>
