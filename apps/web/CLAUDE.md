# Frontend Context

## Purpose

Next.js 16 dashboard for real-time server/uptime monitoring, backed by the NestJS API in `apps/backend-uptime`.

## Tech Stack

- **Framework**: Next.js 16.1, App Router
- **React**: 19.2
- **Styling**: Tailwind CSS 4 (native CSS engine) + SCSS modules for some components
- **Auth**: AWS Amplify (`aws-amplify/auth`) against AWS Cognito
- **Server state**: TanStack Query 5
- **Client state**: Zustand (persisted to storage)
- **Forms**: react-hook-form + Zod resolvers
- **HTTP**: axios
- **Testing**: Vitest + Testing Library + happy-dom

## Project Structure

This app is **not** organized as a conventional flat `components/`, `hooks/`, `types/` tree. It follows a layered split:

```
apps/web/
├── app/                          # App Router routes ONLY — pages, layouts, route-level views
│   ├── layout.tsx                # Root layout: fonts, metadata, ConfigureAmplify, TanStack Query provider
│   ├── page.tsx                  # Landing page
│   ├── robots.ts / sitemap.ts    # SEO
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── validate-email/
│   └── dashboard/
│       ├── layout.tsx
│       ├── home/                 # Monitor list + monitor details
│       ├── incidents/
│       ├── servers/
│       └── settings/
│
├── presentation/                 # UI layer consumed by app/ routes
│   ├── components/
│   │   ├── auth/                 # LoginForm, RegisterForm, ValidateEmailForm, AuthCard
│   │   ├── Dashboard/            # Home/ (CardUptime, StatusUptimes, ChartStatsLastDay,
│   │   │                         #   DetailsUptime/, Incidents/), Categories, LogoutProfile
│   │   ├── Landing/               # Hero/Features/CTA/Footer/Logos sections
│   │   ├── Filters/               # FiltersMonitor, SortMonitorInside, FiltersIncidents
│   │   ├── shared/                # LoadingState, ErrorState, Toast
│   │   ├── Structures/            # Page shells (StructureDashboard, StructureLoginRegisterValidate)
│   │   └── SEO/
│   ├── hooks/                    # React Query hooks per domain (useUptime, usePingLogs,
│   │                              #   useMonitorById, useFilteredIncidents, useNewMonitor, ...)
│   └── utils/                    # Formatting/display helpers (formatDate, getStatusColor,
│                                  #   porcentHealthy, decodeTokenJwt, ...)
│
├── infraestructure/               # Data/integration layer (note the spelling — matches the repo)
│   ├── Api/Axios-config.ts        # the only axios instance — baseURL `/api/backend` (same-origin proxy)
│   ├── services/                  # e.g. auth.service.ts — wraps aws-amplify/auth calls
│   ├── interfaces/                # Response/DTO TypeScript interfaces
│   ├── models/                    # Zod schemas (createUptimeSchema, login.schema, register.schema, ...)
│   ├── constants/                 # protectedRoutes/publicRoutes, dashboard categories, intervals, icons
│   └── Tans-Tack-Query/           # QueryClient instance + provider component
│
├── app/api/
│   ├── auth/session/route.ts      # POST sets httpOnly accessToken/idToken cookies; DELETE clears them
│   └── backend/[...path]/route.ts # Same-origin proxy: reads the idToken cookie, forwards to the
│                                  #   NestJS backend as Authorization: Bearer (backend is unchanged)
│
├── lib/
│   ├── Resources/Api/             # Raw API call functions (UptimeApi, PingLogsApi, UsersApi) —
│   │                              #   consumed by presentation/hooks via TanStack Query, via Axios-config.ts
│   ├── cognito/                   # amplify-cognito.client.ts, cognito.ts (Amplify.configure + ConfigureAmplify)
│   ├── store/authStore.ts         # Zustand store: user, isAuthenticated (identity only — no tokens)
│   └── utils/seo.ts
│
├── middleware.ts                  # Route protection — reads the `accessToken` cookie and checks its
│                                  #   `exp` claim (presence + expiry, not signature — the backend is
│                                  #   the real validator), redirects unauthenticated users away from
│                                  #   protectedRoutes and authenticated users away from publicRoutes
└── public/
```

There is a **single axios instance** (`infraestructure/Api/Axios-config.ts`), used by everything in `lib/Resources/Api/*`. `infraestructure/services/auth.service.ts` doesn't use axios at all — it talks to Cognito directly via `aws-amplify/auth`, then calls `app/api/auth/session/route.ts` (plain `fetch`) to persist the resulting tokens as httpOnly cookies. (A previously-empty, unused `lib/axios/axios.ts` file was removed — it had no importers.)

### Path aliases (`tsconfig.json`)
- `@/*` → repo-relative from `apps/web/`
- `@workspace/types` → `apps/backend-uptime/src/dto` (the frontend imports backend DTO types directly across the workspace boundary — keep this in mind when backend DTOs change shape)

## Authentication Flow

1. Login/register/confirm-email go through **AWS Amplify** (`infraestructure/services/auth.service.ts`), which calls Cognito directly from the browser — there is no backend `/auth/login` endpoint that owns credentials.
2. On successful sign-in, `authService` reads `accessToken`/`idToken` from the Amplify session and POSTs them to `app/api/auth/session/route.ts`, which sets them as **httpOnly** cookies (`Secure` in production, `SameSite=Lax`, `maxAge` aligned to the token's real `exp` claim — not a fixed 30 days). Browser JS never has read access to the JWTs; `lib/store/authStore.ts` (Zustand, persisted) only holds `user`/`isAuthenticated` — identity, not credentials.
3. `middleware.ts` gates routes by the presence **and expiry** of the `accessToken` cookie (decodes the payload to check `exp`, no signature verification — the backend is the real validator): protects `/dashboard/**`, and redirects authenticated users away from public/auth routes.
4. The axios instance (`infraestructure/Api/Axios-config.ts`) points at the same-origin proxy `app/api/backend/[...path]/route.ts`, which reads the httpOnly `idToken` cookie server-side and forwards each request to the NestJS backend as `Authorization: Bearer <idToken>` — the backend's JWKS verification (see `apps/backend-uptime/CLAUDE.md`) is unchanged. Logout calls Amplify `signOut()` then `DELETE app/api/auth/session/route.ts` to clear both cookies.

## Data Fetching Pattern

All server data goes through **TanStack Query** hooks in `presentation/hooks/`, which call functions in `lib/Resources/Api/`. Example (`presentation/hooks/useUptime.hook.ts`): one hook exposes several `useQuery`s (list, by id, stats, incidents) and several `useMutation`s (create/update/delete/flush), each mutation invalidating the relevant query keys on success. Follow this pattern for new domains rather than introducing SWR, raw `fetch` in components, or a new data-fetching library.

## Validation

Forms use **Zod schemas** from `infraestructure/models/` paired with `react-hook-form` + `@hookform/resolvers/zod` (e.g. `createUptimeSchema`, `login.schema.ts`, `register.schema.ts`). Add new schemas there rather than inlining validation in components.

## Development Commands

```bash
npm run dev            # Start dev server (http://localhost:3000)
npm run build           # Production build
npm run start           # Start production server
npm run lint            # ESLint

npm run test            # Vitest
npm run test:ui         # Vitest with UI
npm run test:run        # Vitest run (CI mode)
npm run test:coverage   # Vitest with coverage
```

Tests are colocated with the code they cover (e.g. `useNewMonitor.hook.test.tsx` next to `useNewMonitor.hook.ts`, `auth.service.test.ts` next to `auth.service.ts`), not in a separate `__tests__` tree.

## Conventions

- Default to Server Components; add `'use client'` only where hooks/interactivity are needed.
- Public env vars need the `NEXT_PUBLIC_` prefix (e.g. `NEXT_PUBLIC_API_URL_BACKEND`, `NEXT_PUBLIC_COGNITO_USER_POOL_ID`, `NEXT_PUBLIC_COGNITO_CLIENT_ID`).
- New API-facing code goes in `infraestructure/` or `lib/Resources/Api/`, matching the existing layer for that domain — new UI-facing code goes in `presentation/`.
- SEO metadata is set per-route via the exported `metadata` object (see `app/layout.tsx` for the site-wide defaults, including OpenGraph/keywords already configured).
