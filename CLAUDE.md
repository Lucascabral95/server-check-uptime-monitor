# Project Context

## What This Is

A production-ready **server monitoring application** using a monorepo architecture. The system tracks website uptime, performs health checks, and provides analytics through a modern dashboard.

## Tech Stack

- **Backend**: NestJS 11 + Prisma 7 + BullMQ + PostgreSQL + Redis
- **Frontend**: Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- **Auth**: AWS Cognito (JWKS-verified JWTs on the backend, AWS Amplify on the frontend)
- **Infrastructure**: Docker Compose, Turbo (build orchestration — note: no `turbo.json` currently checked in, so `turbo run <task>` falls back to each app's own `package.json` script)

## Quick Start

```bash
# Install dependencies (run at the repo root — installs all workspaces)
npm install

# Start development environment (backend + frontend via Turbo)
npm run dev

# Start only backend / only frontend
npm run dev:backend
npm run dev:frontend

# Run with Docker (includes PostgreSQL + Redis)
docker-compose up -d postgres redis
```

## Project Structure

```
server-check-app/
├── apps/
│   ├── backend-uptime/       # NestJS API (port 4000)
│   │   ├── src/
│   │   │   ├── uptime/       # Core monitoring logic (controller/service/BullMQ processor)
│   │   │   ├── ping-log/     # Check-result storage with a batching write buffer
│   │   │   ├── auth/         # JWT verification against AWS Cognito JWKS
│   │   │   ├── user/         # User management
│   │   │   ├── email/        # Status-change alerts (AWS SES, Nodemailer fallback)
│   │   │   └── prisma/       # Database client
│   │   ├── CLAUDE.md         # Backend-specific context (detailed architecture)
│   │   └── prisma/schema.prisma
│   └── web/                  # Next.js frontend (port 3000)
│       ├── app/               # App Router routes only (auth/, dashboard/)
│       ├── presentation/      # Components, hooks, utils consumed by routes
│       ├── infraestructure/   # API client, constants, interfaces, zod models, services
│       ├── lib/               # axios instance, Cognito/Amplify client, zustand store
│       ├── middleware.ts      # Route protection via `accessToken` cookie
│       └── CLAUDE.md          # Frontend-specific context (detailed architecture)
├── .claudescoperules          # Scope restrictions
└── CLAUDE.md                  # This file
```

Note: the frontend does **not** use a conventional `components/`, `hooks/`, `types/` top-level layout — it's split into `presentation/` (UI-facing code) and `infraestructure/` (API/data-layer code). Check `apps/web/CLAUDE.md` before assuming file locations.

## Key Workflows

### Creating a Monitor
1. User authenticates through AWS Cognito (frontend uses AWS Amplify; backend validates the resulting JWT against Cognito's JWKS)
2. POST to `/api/v1/uptime` with URL and check frequency
3. Monitor saved to PostgreSQL, an individual recurring BullMQ job is scheduled for it
4. `UptimeProcessor` executes checks via the HTTP connection pool, buffers results, and batch-writes to `PingLog`
5. On a status change (UP ↔ DOWN), an email alert is sent

### Database Models
- **User**: `cognitoSub`, email, role (ADMIN/USER/GUEST) — owns monitors
- **Monitor**: URL, frequency, isActive, status (PENDING/UP/DOWN), nextCheck/lastCheck
- **PingLog**: Check results (timestamp, statusCode, durationMs, success)

## Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables/functions, PascalCase for classes/components
- **Error Handling**: Use NestJS exception filters (`handlePrismaError()` for Prisma errors), Next.js error boundaries

### Testing
- **Backend**: Jest, run from `apps/backend-uptime`
  - All tests: `npm run test`
  - Single file: `npx jest src/uptime/uptime.service.spec.ts` (or `npm run test -- uptime.service.spec.ts`)
  - E2E: `npm run test:e2e`
  - Coverage: `npm run test:cov`
- **Frontend**: Vitest, run from `apps/web`
  - All tests: `npm run test`
  - Single file: `npx vitest run presentation/hooks/useUptime.hook.test.tsx`
  - Coverage: `npm run test:coverage`

### Database Changes
1. Modify `apps/backend-uptime/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <migration-name>` (from `apps/backend-uptime`)
3. Prisma Client auto-regenerates

### Environment Variables
- Backend: Copy `.env.template` to `.env` in `apps/backend-uptime/`
- Required (see `apps/backend-uptime/CLAUDE.md` for the full list): `DATABASE_URL`, `REDIS_HOST`/`REDIS_PORT`, `SECRET_JWT`, `JWT_EXPIRES_IN`, `AWS_REGION`, `AWS_COGNITO_USER_POOL_ID`, `AWS_COGNITO_CLIENT_ID`, `MY_URL_FRONTEND`, SMTP/SES vars, `PORT`

## Important Notes

- **Never commit** `.env` files or sensitive credentials
- **API Routes**: Always prefix with `/api/v1/`
- **CORS**: Configured for localhost:3000 in development
- **Queue Jobs**: BullMQ handles async monitoring checks; each monitor gets its own recurring job
- **Port Conflicts**: Backend (4000), Frontend (3000), PostgreSQL (5432), Redis (6379)
- **CI**: `.github/workflows/backend-ci.yml` runs on PRs touching `apps/backend-uptime/**` (spins up Postgres/Redis, migrates, tests, builds)

## When Making Changes

1. **Backend API changes**: Update corresponding Swagger/OpenAPI docs
2. **Database schema changes**: Always create a migration
3. **New dependencies**: Install at workspace root for shared packages, otherwise in the specific app

## Common Tasks

```bash
# Add new dependency to backend
cd apps/backend-uptime && npm install <package>

# Add new dependency to frontend
cd apps/web && npm install <package>

# Reset database (development)
cd apps/backend-uptime && npx prisma migrate reset

# Generate Prisma Client
cd apps/backend-uptime && npx prisma generate

# Seed the database with test data (users, monitors, ping logs)
cd apps/backend-uptime && npm run db:seed

# View database
cd apps/backend-uptime && npx prisma studio
```

## Getting Help

- Check app-specific `CLAUDE.md` files (`apps/backend-uptime/CLAUDE.md`, `apps/web/CLAUDE.md`) for module details
- Review Prisma schema for data model questions
- See `docker-compose.yml` for infrastructure setup
- See root `README.md` for the full architecture diagram and seed-data walkthrough