<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">Sistema de monitoreo de uptime para servicios web, construido con <a href="http://nodejs.org" target="_blank">Node.js</a> y NestJS.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

## Backend Uptime — Server Monitor

Sistema de monitoreo de uptime para servicios web, parte del monorepo Server Check App. Este servicio gestiona el monitoreo continuo de URLs, procesamiento asíncrono de checks con colas, y almacenamiento de métricas de rendimiento.

## Estado

- Stack: NestJS + TypeScript
- ORM: Prisma
- Queue: BullMQ + Redis
- Database: PostgreSQL
- Entrypoint: [src/main.ts](src/main.ts)
- API Prefix: `/api/v1`

## Objetivo

Proveer un servicio escalable y confiable para el monitoreo de servicios web que soporte:
- Monitoreo continuo de URLs con frecuencias configurables
- Procesamiento asíncrono de checks HTTP mediante colas BullMQ
- Historial completo de logs con métricas de rendimiento
- Autenticación mediante JWT (AWS Cognito)
- API RESTful versionada y documentada

## Características principales

- **Monitoreo continuo**: Verificación HTTP periódica de servicios configurables
- **Sistema de colas**: BullMQ + Redis para procesamiento asíncrono de checks
- **Historial de métricas**: Logs detallados con status code, duración y errores
- **Autenticación JWT**: Validación de tokens de AWS Cognito con JWKS
- **Cache de claves públicas**: Optimización con cache de 5 minutos para JWKS
- **Validación estricta**: DTOs con class-validator y ValidationPipe global
- **API versionada**: Prefijo global `/api/v1` con rutas excluidas configurables
- **CORS configurable**: Múltiples orígenes permitidos para desarrollo

## Estructura del proyecto

```
src/
├── auth/                    # Módulo de autenticación
│   ├── guards/
│   │   └── jwt-auth.guard.ts    # Guard de JWT con Cognito JWKS
│   └── strategies/
│       └── jwt.strategy.ts       # Estrategia Passport JWT
├── config/                  # Configuraciones
│   ├── cors.ts                  # Opciones de CORS
│   ├── envs.schema.ts           # Validación de variables de entorno con Joi
│   └── routes-excludes-prefix.ts # Rutas sin prefijo global
├── errors/                  # Manejo de errores
│   └── handler-prisma-errot.ts  # Manejador de errores de Prisma
├── generated/               # Código generado por Prisma
│   └── prisma/                  # Cliente de Prisma
├── prisma/                  # Módulo de Prisma
│   ├── prisma.module.ts
│   ├── prisma.service.ts
│   └── prisma.service.spec.ts
├── user/                    # Módulo de usuarios
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   ├── payload-user.dto.ts  # DTO para payload de JWT Cognito
│   │   └── index.ts
│   ├── user.controller.ts
│   ├── user.service.ts
│   └── user.module.ts
├── uptime/                  # Módulo de monitoreo
│   ├── dto/
│   │   ├── create-uptime.dto.ts
│   │   └── update-uptime.dto.ts
│   ├── uptime.controller.ts
│   ├── uptime.service.ts
│   ├── uptime.processor.ts     # Procesador de colas BullMQ
│   └── uptime.module.ts
├── app.controller.ts
├── app.module.ts
└── main.ts                  # Punto de entrada
```

## Modelo de datos

```
User (Usuario)
  ├── Monitor (1:N) - Configuración de monitoreo
      ├── PingLog (1:N) - Logs de checks individuales
```

### Estados del Monitor

- `PENDING` - Pendiente de primer check
- `UP` - Servicio disponible
- `DOWN` - Servicio no disponible

## Requisitos previos

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6

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
```

## API Endpoints

Todas las rutas están prefijadas con `/api/v1` excepto las configuradas en [routes-excludes-prefix.ts](src/config/routes-excludes-prefix.ts).

### Usuarios (Requieren autenticación)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/user` | Crear usuario | :white_check_mark: |
| GET | `/api/v1/user` | Listar usuarios | :white_check_mark: |
| GET | `/api/v1/user/:id` | Obtener usuario por ID | :white_check_mark: |
| PATCH | `/api/v1/user/:id` | Actualizar usuario | :white_check_mark: |
| DELETE | `/api/v1/user/:id` | Eliminar usuario | :white_check_mark: |

### Monitores (Uptime)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/uptime` | Crear monitor | :x: |
| GET | `/api/v1/uptime` | Listar monitores | :x: |
| GET | `/api/v1/uptime/:id` | Obtener monitor por ID | :x: |
| PATCH | `/api/v1/uptime/:id` | Actualizar monitor | :x: |
| DELETE | `/api/v1/uptime/:id` | Eliminar monitor | :x: |

## Autenticación

El servicio utiliza **AWS Cognito** para la autenticación. Los endpoints protegidos requieren un token JWT válido en el header `Authorization`:

```bash
Authorization: Bearer <access_token>
```

### Flujo de autenticación

1. El cliente obtiene un token de AWS Cognito
2. El token se envía en el header `Authorization: Bearer <token>`
3. El [JwtAuthGuard](src/auth/guards/jwt-auth.guard.ts) valida el token:
   - Decodifica el header para obtener el `kid` (Key ID)
   - Obtiene las claves públicas desde el endpoint JWKS de Cognito
   - Verifica la firma del token con la clave pública correspondiente
   - Valida el `iss` (issuer), `exp` (expiración) y `token_use` (debe ser 'access')
4. El payload del usuario se adjunta a `request.user`

### Cache de JWKS

Las claves públicas de Cognito se cachean por 5 minutos para optimizar el rendimiento y reducir las llamadas al endpoint JWKS.

## Colas BullMQ

El servicio utiliza BullMQ para el procesamiento asíncrono de checks de monitoreo:

- **Nombre de la cola**: `uptime-monitor`
- **Procesador**: [UptimeProcessor](src/uptime/uptime.processor.ts)
- **Backend**: Redis

Los jobs se encolan con el timestamp del próximo check y son procesados por el worker en segundo plano.

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Framework | NestJS |
| Lenguaje | TypeScript |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Cola de trabajos | BullMQ + Redis |
| Validación | Joi + class-validator |
| Autenticación | JWT (AWS Cognito) |

## Docker

```bash
# Construir imagen
docker build -t backend-uptime .

# Ejecutar contenedor
docker run -p 4000:4000 --env-file .env backend-uptime
```

## Desarrollo y pruebas

1. Configurar `.env` con las variables necesarias
2. Iniciar PostgreSQL y Redis:

```bash
# Usando Docker Compose desde la raíz del monorepo
docker-compose up -d postgres redis
```

3. Ejecutar migraciones de Prisma (si aplica):

```bash
npx prisma migrate dev
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
  -d '{
    "name": "Mi API",
    "url": "https://api.example.com",
    "frequency": 60
  }'
```

### Obtener todos los monitores

```bash
curl http://localhost:4000/api/v1/uptime
```

### Solicitar con autenticación

```bash
curl http://localhost:4000/api/v1/user \
  -H "Authorization: Bearer <your_access_token>"
```

## Seguridad y buenas prácticas implementadas

- :white_check_mark: Validación de JWT con JWKS de AWS Cognito
- :white_check_mark: Cache de claves públicas con TTL de 5 minutos
- :white_check_mark: ValidationPipe global con `whitelist: true`
- :white_check_mark: Manejo centralizado de errores de Prisma
- :white_check_mark: DTOs para validación de entrada
- :white_check_mark: CORS configurado con orígenes permitidos
- :white_check_mark: Variables de entorno validadas con Joi
- :white_check_mark: Índices de base de datos optimizados para consultas frecuentes

## Observabilidad

- Logs estándar via `console.log` y NestJS Logger
- Métricas de cola disponibles a través de BullMQ
- Logs de procesamiento de jobs en `UptimeProcessor`

## Contribuir

- Seguir las convenciones de commits (Conventional Commits)
- Añadir pruebas para nueva lógica de negocio
- Documentar nuevos endpoints en este README
- Ejecutar `npm run lint` antes de commitear

## Contacto

- Autor del repositorio: Lucas Cabral — lucassimple@hotmail.com

---

## Licencia

UNLICENSED
