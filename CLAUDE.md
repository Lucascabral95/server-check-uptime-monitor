# Project Context

## What This Is

A production-ready **server monitoring application** using a monorepo architecture. The system tracks website uptime, performs health checks, and provides analytics through a modern dashboard.

## Tech Stack

- **Backend**: NestJS + Prisma + BullMQ + PostgreSQL + Redis
- **Frontend**: Next.js 15 (App Router) + React 19 + Tailwind CSS 4
- **Infrastructure**: Docker Compose, Turbo (build orchestration)

## Quick Start

```bash
# Install dependencies
npm install

# Start development environment
npm run dev

# Start only backend
npm run dev:backend

# Run with Docker (includes PostgreSQL + Redis)
docker-compose up -d
```

## Project Structure

```
server-check-app/
├── apps/
│   ├── backend-uptime/     # NestJS API (port 4000)
│   │   ├── src/
│   │   │   ├── uptime/     # Core monitoring logic
│   │   │   ├── auth/       # JWT authentication
│   │   │   ├── user/       # User management
│   │   │   └── prisma/     # Database client
│   │   ├── .claude.md      # Backend-specific context
│   │   └── prisma/schema.prisma
│   └── web/                # Next.js frontend (port 3000)
│       ├── app/            # App Router pages
│       └── .claude.md      # Frontend-specific context
├── .claudescoperules       # Scope restrictions
└── CLAUDE.md              # This file
```

## Key Workflows

### Creating a Monitor
1. User authenticates via `/api/v1/auth/login`
2. POST to `/api/v1/uptime/monitors` with URL and check frequency
3. Monitor saved to PostgreSQL, BullMQ job scheduled
4. Background worker executes checks, stores results in PingLog

### Database Models
- **User**: Authentication, owns monitors
- **Monitor**: URL, frequency, status
- **PingLog**: Check results (timestamp, status, response time)

## Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables/functions, PascalCase for classes/components
- **Imports**: Absolute paths using `@/` alias
- **Error Handling**: Use NestJS exception filters, Next.js error boundaries

### Testing
- Backend: Jest unit tests + E2E tests
- Run tests: `npm run test` (in respective app directories)

### Database Changes
1. Modify `apps/backend-uptime/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <migration-name>`
3. Prisma Client auto-regenerates

### Environment Variables
- Backend: Copy `.env.example` to `.env` in `apps/backend-uptime/`
- Required: DATABASE_URL, REDIS_URL, JWT_SECRET, PORT

## Important Notes

- **Never commit** `.env` files or sensitive credentials
- **API Routes**: Always prefix with `/api/v1/`
- **CORS**: Configured for localhost:3000 in development
- **Queue Jobs**: BullMQ handles async monitoring checks
- **Port Conflicts**: Backend (4000), Frontend (3000), PostgreSQL (5432), Redis (6379)

## When Making Changes

1. **Backend API changes**: Update corresponding Swagger/OpenAPI docs
2. **Database schema changes**: Always create a migration
3. **New dependencies**: Install at workspace root for shared packages
4. **Frontend components**: Use shadcn/ui conventions when applicable

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

# View database
cd apps/backend-uptime && npx prisma studio
```

## Getting Help

- Check app-specific `.claude.md` files for module details
- Review Prisma schema for data model questions
- See `docker-compose.yml` for infrastructure setup