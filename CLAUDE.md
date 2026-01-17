# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **server monitoring application** built as a monorepo using **Turbo** for build orchestration. It consists of a NestJS backend API for uptime monitoring and a Next.js frontend dashboard, with PostgreSQL for data storage and Redis for queues/caching.

## Development Commands

### Root Level Commands (run from repository root)
```bash
npm run dev              # Start both frontend and backend in development
npm run dev:backend      # Start only the backend server
npm run build            # Build all applications
npm run lint             # Lint all applications
npm run docker:backend   # Run backend in Docker with dependencies
```

### Backend-Specific Commands (run from `apps/backend-uptime`)
```bash
npm run start:dev       # Start backend in watch mode (port 4000)
npm run start:debug     # Start with debug mode
npm run build           # Build for production
npm run start:prod      # Run production build
npm run test            # Run unit tests
npm run test:e2e        # Run end-to-end tests
npm run test:cov        # Run tests with coverage
npm run lint            # Run ESLint
npm run format          # Format with Prettier
```

### Frontend-Specific Commands (run from `apps/web`)
```bash
npm run dev             # Start Next.js dev server (port 3000)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

### Infrastructure
```bash
# Start PostgreSQL and Redis only (from repository root)
docker-compose up -d postgres redis

# Start full stack with Docker
docker-compose up --build -d
```

## Architecture

### Monorepo Structure
```
server-check-app/
├── apps/
│   ├── backend-uptime/    # NestJS API (port 4000)
│   └── web/               # Next.js frontend (port 3000)
├── docker-compose.yml     # PostgreSQL + Redis + Backend containers
└── package.json           # Workspace configuration
```

### Backend Architecture (`apps/backend-uptime`)

**Key Modules:**
- `src/uptime/` - Core monitoring functionality
  - `controller.ts` - REST endpoints for monitors
  - `service.ts` - Business logic for monitor CRUD
  - `processor.ts` - BullMQ queue processor for async checks
- `src/user/` - User management and authentication
- `src/auth/` - JWT strategy and guards
- `src/prisma/` - Prisma client singleton
- `src/config/` - Environment configuration with Joi validation

**Data Flow:**
1. User creates a Monitor via REST API (URL, check frequency)
2. Monitor is stored in PostgreSQL via Prisma
3. BullMQ job is queued with next check timestamp
4. Background worker (`processor.ts`) executes HTTP check
5. PingLog is created with results (status, duration, error)
6. Frontend polls or receives updates via WebSocket (planned)

**Database Models (Prisma):**
- `User` - Authentication, one-to-many with Monitor
- `Monitor` - Server check configuration, one-to-many with PingLog
- `PingLog` - Individual check results with indexed queries

### Frontend Architecture (`apps/web`)

Next.js 16 with App Router and React 19. Currently scaffolded with basic landing page. Dashboard implementation is pending.

### Service Ports
- Backend API: `http://localhost:4000` (API prefix: `/api/v1`)
- Frontend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Environment Setup

Backend requires a `.env` file in `apps/backend-uptime/` with:
- Database connection URL (PostgreSQL)
- Redis connection URL
- JWT secrets
- API port configuration

Refer to `.env.example` in the backend directory for required variables.

## Key Technologies

**Backend:** NestJS, Prisma ORM, BullMQ, JWT (Passport), TypeScript
**Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript
**Infrastructure:** PostgreSQL 16, Redis 7, Docker Compose
**Build System:** Turbo (monorepo orchestration)
