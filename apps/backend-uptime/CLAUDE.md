# Backend Uptime - Architecture & Context

## 📋 Project Overview

**Server Check Backend** - A production-grade uptime monitoring API that continuously checks website/server availability and stores historical data.

**Tech Stack:**
- **Framework**: NestJS 10.x
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Job Queue**: BullMQ + Redis
- **Email**: Nodemailer + AWS SES fallback
- **Auth**: JWT with AWS Cognito integration

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Next.js)                       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ HTTP + JWT
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        NestJS Backend                         │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    API Layer (Controllers)           │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │              Service Layer (Business Logic)         │  │
│  │  ┌─────────────┬─────────────┬─────────────┐ │  │
│  │  │ UptimeService│ UserService  │EmailService│ │  │
│  │  └─────────────┼─────────────┼─────────────┘ │  │
│  │                 │             │             │    │
│  │  ┌─────────────▼─────────────▼─────────────┐ │  │
│  │  │    PrismaService (Data Access)     │ │  │
│  │  └───────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
│                                               │
│  ┌───────────────────────────────────────────────┐  │
│  │         BullMQ Processors (Workers)        │  │
│  │  ┌─────────────────────────────────────┐     │  │
│  │  │   UptimeProcessor               │     │  │
│  │  │   - Checks URLs                  │     │  │
│  │  │   - Updates status               │     │  │
│  │  │   - Sends emails               │     │  │
│  │  └─────────────────────────────────────┘     │  │
│  └───────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
          │                │
          ▼                ▼
    ┌─────────┐    ┌─────────┐
    │PostgreSQL│    │  Redis  │
    │(Data)   │    │ (Queue) │
    └─────────┘    └─────────┘
```

---

## 📁 Directory Structure

```
apps/backend-uptime/src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root NestJS module
│
├── auth/                     # Authentication module
│   ├── decorators/            # @Roles, @Public decorators
│   ├── guards/               # JwtAuthGuard, RolesGuard, MonitorOwnerGuard
│   ├── strategies/            # JWT strategy
│   └── dto/                 # Auth DTOs
│
├── user/                     # User management
│   ├── user.controller.ts    # CRUD endpoints
│   ├── user.service.ts      # Business logic
│   └── dto/                # User DTOs
│
├── uptime/                   # Core monitoring module ⭐
│   ├── uptime.controller.ts  # API endpoints (/api/v1/uptime)
│   ├── uptime.service.ts     # Main business logic (1050 lines)
│   ├── uptime.processor.ts  # BullMQ worker for background checks
│   ├── dto/                # Request/response DTOs
│   └── services/
│       ├── http-pool.service.ts    # HTTP connection pooling ⭐
│       └── (other utility services)
│
├── ping-log/                 # Ping logs storage
│   ├── ping-log.controller.ts
│   ├── ping-log.service.ts
│   ├── ping-log-buffer.service.ts  # Batch writes for performance
│   └── dto/
│
├── email/                    # Email notifications
│   ├── email.service.ts
│   └── dto/
│
├── prisma/                   # Database client
│   └── prisma.service.ts
│
├── bullmq/                   # Queue configuration
│   └── bullmq.module.ts
│
├── jwt-module/               # JWT configuration
├── config/                   # Environment config
├── errors/                   # Custom exceptions
└── utils/                    # Utility functions
```

---

## 🎯 Core Modules Explained

### 1. **Uptime Module** (Heart of the app)

**Purpose**: Manages server monitors, executes health checks, tracks incidents.

**Key Files:**
- `uptime.controller.ts` - REST API endpoints
- `uptime.service.ts` - Business logic for CRUD + stats
- `uptime.processor.ts` - Background worker (BullMQ)
- `services/http-pool.service.ts` - Enterprise-grade HTTP client

**What it does:**
1. Create/Read/Update/Delete monitors
2. Calculate statistics (24h, 7d, 30d, 365d uptime)
3. Detect and group incidents (periods of consecutive failures)
4. Queue background checks via BullMQ
5. Sync queue jobs with database state

---

### 2. **Auth Module**

**Purpose**: JWT authentication with AWS Cognito integration.

**Flow:**
```
1. Frontend sends Cognito JWT → API
2. JwtAuthGuard extracts token from header
3. Validates against Cognito JWKS (public keys)
4. Creates/updates user in local DB
5. Attaches user to request object
```

**Key Guards:**
- `JwtAuthGuard` - Validates JWT signature + structure
- `RolesGuard` - Checks user roles (ADMIN/USER/GUEST)
- `MonitorOwnerGuard` - Ensures user owns the monitor

---

### 3. **PingLog Module**

**Purpose**: Stores individual check results efficiently.

**Optimization**: Uses `PingLogBufferService` to batch inserts into PostgreSQL (instead of writing each check immediately).

**Buffer Flow:**
```
Individual checks → Buffer (in-memory) → Batch write every X seconds → PostgreSQL
```

This reduces database load from hundreds of writes per minute to periodic bulk inserts.

---

### 4. **Email Module**

**Purpose**: Sends alerts when monitor status changes (UP ↔ DOWN).

**Providers:**
1. AWS SES (primary)
2. Nodemailer with fallback (if SES fails)

**Trigger**: Status change OR first check after PENDING

---

## 🔑 Key Services Explained

### **HttpPoolService** ⭐ (Most Enterprise-Grade)

**Location**: `src/uptime/services/http-pool.service.ts`

**What it does:**
- Manages connection pools per domain using `undici`
- Implements **Circuit Breaker** pattern
- Exponential backoff retries
- Tracks p95, p99 response times
- Stats logging every 60s

**Why it's pro:**
- Prevents thundering herd on failing servers
- Connection pooling = better performance
- Circuit breaker stops cascading failures

**Configuration:**
```typescript
POOL_CONNECTIONS: 100        // Max connections per pool
POOL_PIPELINING: 10         // HTTP/2 pipelining
CIRCUIT_BREAKER_THRESHOLD: 5  // Opens after 5 failures
MAX_RETRIES: 3               // Max 3 retries with exponential backoff
```

---

### **UptimeProcessor** (BullMQ Worker)

**Location**: `src/uptime/uptime.processor.ts`

**What it does:**
1. Pulls job from Redis queue
2. Fetches monitor from PostgreSQL
3. Executes HTTP check via HttpPoolService
4. Writes result to PingLog buffer
5. Updates monitor status in DB
6. Sends email if status changed
7. Moves failed jobs to DLQ (Dead Letter Queue)

**Job Flow:**
```
BullMQ Queue → [UptimeProcessor.process()] → Check URL → Update DB
                                                    ↓
                                            [DLQ if failed repeatedly]
```

---

### **JwtAuthGuard** (Security)

**Location**: `src/auth/guards/jwt-auth.guard.ts`

**What it does:**
1. Extracts Bearer token from request header
2. Decodes JWT header + payload (base64)
3. Fetches public key from Cognito JWKS
4. Verifies JWT signature using RSA public key
5. Validates audience, issuer, token_use
6. Creates/updates user in local DB
7. Attaches user to `request.user`

**Features:**
- JWKS caching (5 min TTL, LRU eviction)
- Request deduplication (prevents duplicate JWKS fetches)
- Support for both ID tokens and Access tokens

---

## 🗄️ Database Model

**Location**: `prisma/schema.prisma`

**Entities:**

```prisma
enum Status {
  PENDING   // Initial state
  UP        // Server is responding
  DOWN      // Server is not responding
}

model User {
  id         String   @id @default(uuid())
  cognitoSub String?  @unique  // AWS Cognito sub
  email      String   @unique
  role       Role     @default(USER)
  monitors   Monitor[]
}

model Monitor {
  id        String    @id @default(uuid())
  userId    String
  name      String
  url       String
  frequency Int       @default(60)  // Check frequency in seconds
  isActive  Boolean   @default(true)
  nextCheck DateTime
  lastCheck DateTime?
  status    Status    @default(PENDING)
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now())

  user      User      @relation(fields: [userId], references: [id])
  logs      PingLog[]

  @@index([isActive, nextCheck])  // For queue queries
}

model PingLog {
  id         String   @id @default(uuid())
  monitorId  String
  statusCode Int
  durationMs Int
  error      String?
  success    Boolean   @default(false)
  timestamp  DateTime @default(now())

  monitor    Monitor  @relation(fields: [monitorId], references: [id])

  @@index([monitorId, timestamp(sort: Desc)])
  @@index([monitorId, success])
}
```

---

## 🔌 API Endpoints

**Base URL**: `/api/v1`

### Auth (`/api/v1/auth`)
- `POST /register` - Register new user (Cognito)
- `POST /login` - Login with email/password
- `POST /validate-email` - Validate email code

### Users (`/api/v1/users`)
- `GET /users` - List users (admin)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user (admin)

### Uptime (`/api/v1/uptime`)
- `POST /` - Create new monitor
- `GET /` - List monitors (pagination, filters, sorting)
- `GET /:id` - Get monitor by ID
- `PATCH /:id` - Update monitor
- `DELETE /:id` - Delete monitor
- `GET /logs/:uptimeId` - Get monitor logs with stats
- `GET /stats/user` - Get current user's dashboard stats
- `GET /incidents/:id` - Get incidents for a monitor
- `GET /incidents/user` - Get all incidents across monitors
- `POST /queue/clear` - Clear all queue jobs
- `POST /queue/sync` - Sync queue with DB
- `GET /flush` - Force flush PingLog buffer
- `GET /stats` - Internal system stats

**Rate Limiting:**
- `@Throttle({ short: {} })` - Strict limits
- `@Throttle({ medium: {} })` - Medium limits
- `@SkipThrottle()` - No limits (admin endpoints)

---

## 🔄 Background Job Flow

**Location**: `src/uptime/uptime.processor.ts`

```
┌─────────────────────────────────────────────────────────────────┐
│                     Redis (BullMQ)                      │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Queue: "uptime-monitor"                      │     │
│  │                                                  │
│  │  Job: { monitorId: "uuid" }                  │     │
│  └───────────────────────┬─────────────────────────┘     │
│                        │                            │
└────────────────────────────┼────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              UptimeProcessor (Worker)                     │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  1. Fetch monitor from DB                    │     │
│  │  2. Check URL via HttpPoolService              │     │
│  │  3. Add result to PingLogBuffer               │     │
│  │  4. Update monitor.status in DB                │     │
│  │  5. If status changed → Send email            │     │
│  │  6. If failed 3x → Move to DLQ             │     │
│  └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

**Dead Letter Queue (DLQ):**
- Queue name: `uptime-monitor-dlq`
- Purpose: Stores jobs that failed after max retries
- Config: 5 retry attempts with exponential backoff

---

## 🔐 Security

### Authentication Flow

```
┌──────────────┐
│  Frontend   │
│  (Next.js)  │
└──────┬───────┘
       │
       │ 1. Login with Cognito
       │
       ▼
┌──────────────────────┐
│  AWS Cognito       │
│  - User Pools      │
│  - JWT Tokens      │
└──────┬───────────────┘
       │
       │ 2. Returns JWT
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  Backend API                                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │  JwtAuthGuard                           │     │
│  │  - Extract Bearer token                   │     │
│  │  - Fetch JWKS from Cognito               │     │
│  │  - Verify signature                       │     │
│  │  - Validate audience/issuer/token_use      │     │
│  │  - Find/create user in local DB           │     │
│  └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Protected Routes

All `/api/v1/uptime` endpoints require:
- Valid JWT token
- Token must be from expected Cognito issuer
- Token must have correct audience
- User must own the monitor (for UPDATE/DELETE)

---

## 🧪 Testing

**Framework**: Jest

**Test Files:**
- `*.spec.ts` - Unit tests for services/controllers
- `*.e2e-spec.ts` - End-to-end tests

**Current Coverage** (from `/coverage`):
- Statements: ~7-8% (needs improvement)
- Branches: ~3%
- Functions: ~3%
- Lines: ~48%

**Key Areas Tested:**
- Guards (JwtAuthGuard, RolesGuard)
- Controllers (UptimeController, UserController)
- Services (partial)

---

## 📊 Important Concepts

### Incident Detection

The app groups consecutive failed checks into "incidents":

```
Logs: [UP, UP, UP, DOWN, DOWN, DOWN, UP, UP]
                           └─────┘
                              Incident detected
```

**Incident =**
- `startTime`: First DOWN log
- `endTime`: First UP log after
- `durationMs`: Time difference
- `affectedChecks`: Number of failed checks
- `status`: ONGOING if still DOWN, RESOLVED if back UP

### Statistics Calculation

For any time period (24h, 7d, 30d, 365d):

```typescript
healthPercentage = (successCount / totalCount) × 100

downtimeMs = Sum of all DOWN periods
uptimeMs = (periodEnd - periodStart) - downtimeMs
```

---

## ⚙️ Environment Variables Required

**Create `.env` from `.env.example`:**

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/servercheck"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# JWT
SECRET_JWT="your-secret-key"
JWT_EXPIRES_IN="1h"

# AWS Cognito
AWS_REGION="us-east-1"
AWS_COGNITO_USER_POOL_ID="us-east-1_XXXXX"
AWS_COGNITO_CLIENT_ID="XXXXXXXXXXXXX"

# Email (SES or Nodemailer)
AWS_SES_FROM_EMAIL="noreply@yourdomain.com"
GMAIL_APP_USER="your@gmail.com"
GMAIL_APP_PASSWORD="app-specific-password"

# Server
PORT="4000"
NODE_ENV="development"
```

---

## 🚀 Running the Application

**Development:**
```bash
cd apps/backend-uptime
npm run start:dev    # Hot reload
```

**Production:**
```bash
cd apps/backend-uptime
npm run build
npm run start:prod
```

**With Docker:**
```bash
docker-compose up -d
```

---

## 🔧 Common Tasks

### Create a new monitor
```bash
POST /api/v1/uptime
{
  "name": "My Website",
  "url": "https://example.com",
  "frequency": 60
}
```
→ Creates monitor + queues BullMQ job

### Manually trigger queue sync
```bash
POST /api/v1/uptime/queue/sync
```
→ Removes orphaned jobs + creates missing jobs

### View internal stats
```bash
GET /api/v1/uptime/stats
```
→ Returns HTTP pool stats, buffer utilization

---

## ⚠️ Known Issues & Solutions

| Issue | Solution |
|--------|----------|
| Queue jobs out of sync after DB reset | Run `POST /queue/sync` |
| Old jobs failing repeatedly | Run `POST /queue/clear` |
| Tests failing with DB errors | Ensure PostgreSQL + Redis running |
| JWT validation failing | Check Cognito config in `.env` |

---

## 📝 Notes for Claude

### This is a production monitoring app
- Reliability is critical
- Background jobs must not be interrupted
- Database performance matters (lots of writes)
- Email notifications must be reliable

### Backend uses BullMQ
- Jobs are queued in Redis
- Multiple workers can run in parallel
- DLQ handles permanently failing jobs

### Database uses Prisma
- Always create migrations for schema changes
- Use `npx prisma migrate dev --name <name>`
- Never edit migration files manually

### Authentication uses JWT
- Tokens issued by AWS Cognito
- Protected routes require JwtAuthGuard
- User data synced to local DB

### Code patterns to follow
- Use `handlePrismaError()` for Prisma errors
- Log with `Logger` class
- Return NestJS exceptions (BadRequest, NotFound, etc.)
- Use Guards for route protection

### When adding new features
- Follow existing module structure
- Create DTOs with validation decorators
- Add tests in `.spec.ts` files
- Update this CLAUDE.md if architecture changes
