# Repository Guidelines

## Project Structure & Module Organization

This npm-workspace monorepo contains two applications under `apps/`. `apps/backend-uptime/` is a NestJS API: feature modules live in `src/` (for example, `uptime/`, `auth/`, and `ping-log/`), Prisma schema and migrations live in `prisma/`, and end-to-end tests live in `test/`. `apps/web/` is a Next.js App Router frontend: routes belong in `app/`, UI code in `presentation/`, and API/data-layer code in `infraestructure/`. Shared client and state utilities are in `lib/`.

## Build, Test, and Development Commands

Run commands from the repository root unless noted otherwise.

- `npm run dev` starts both applications through Turbo.
- `npm run dev:backend` and `npm run dev:frontend` start one application with hot reload.
- `npm run build` and `npm run lint` build or lint all workspaces.
- `npm run build-test:full-project` builds and tests both applications.
- `docker-compose up -d postgres redis` starts local PostgreSQL and Redis.

Within `apps/backend-uptime`, use `npm run test`, `npm run test:e2e`, and `npm run test:cov`. Within `apps/web`, use `npm run test:run` or `npm run test:coverage`. Apply backend formatting with `npm run format`.

## Coding Style & Naming Conventions

Write strict TypeScript with two-space indentation. Backend formatting is enforced by Prettier: single quotes, semicolons, trailing commas, and a 100-character print width. Use `camelCase` for variables and functions; use `PascalCase` for Nest classes and React components. Name backend unit tests `*.spec.ts`; name frontend tests `*.test.ts(x)` or `*.spec.ts(x)`. Keep Next.js routes thin and place reusable UI and data concerns in their established layers.

## Testing Guidelines

Add or update focused tests with every behavior change. Backend unit tests use Jest beside source files; E2E tests use the backend `test/` directory. Frontend tests use Vitest and Testing Library. Run the relevant application test suite before opening a pull request, then run lint and the applicable build.

## Commit & Pull Request Guidelines

Use concise, imperative conventional commits, such as `feat: add monitor alerts` or `fix: handle timeout errors`; optional scopes such as `feat(frontend):` are established. Keep commits cohesive. Pull requests should state the user-visible change, testing performed, linked issue when applicable, and screenshots for visual frontend changes. Document schema migrations, required environment variables, and API contract changes explicitly.

## Security & Configuration

Never commit `.env` files or credentials. Copy each app's `.env.template` for local setup. Backend API routes use the `/api/v1/` prefix; schema changes require a Prisma migration.
