# AGENTS.md

## Purpose

This file provides concrete, copy-pastable instructions for AI coding agents and human contributors working in this repository. It covers setup, development workflows, testing, and validation steps specific to this codebase.

---

## Repo map

```
/
├── apps/
│   ├── frontend/          # Next.js 14 (App Router, TypeScript)
│   └── backend/           # NestJS 10 (TypeScript)
├── packages/
│   └── shared/            # Shared types, DTOs, constants (imported by both apps)
├── docker/
│   └── docker-compose.yml # PostgreSQL + Redis for local dev
├── .github/workflows/     # CI pipelines (lint, test, build)
├── turbo.json             # Turborepo task config
├── npm-workspace.yaml    # Workspace definition
├── .env.example           # Template for local environment variables
```

---

## Quickstart

Prerequisites (from `.nvmrc` and `package.json#engines`):

- Node.js 24 LTS
- npm 9+
- Docker & Docker Compose

```bash
# 1. Install dependencies
npm install

# 2. Start Postgres + Redis
docker compose -f docker/docker-compose.yml up -d

# 3. Copy env template and fill in local values
cp .env.example .env

# 4. Run DB migrations
npm --filter backend db:migrate

# 5. Seed development data (optional)
npm --filter backend db:seed

# 6. Start both apps in dev mode
npm dev
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:3001`.

---

## Common commands

### Install

```bash
npm install                       # all workspaces
```

### Dev

```bash
npm dev                           # both apps via turbo
npm --filter frontend dev         # frontend only
npm --filter backend dev          # backend only
```

### Build

```bash
npm build                         # all workspaces
npm --filter frontend build
npm --filter backend build
```

### Lint / Format

```bash
npm lint                          # ESLint across all workspaces
npm lint:fix                      # auto-fix
npm format                        # Prettier write
npm format:check                  # Prettier check (CI uses this)
```

### Typecheck

```bash
npm typecheck                     # tsc --noEmit across all workspaces
npm --filter frontend typecheck
npm --filter backend typecheck
```

### Test

```bash
# Unit + integration
npm test                          # all workspaces
npm --filter backend test         # backend unit tests (Jest)
npm --filter frontend test        # frontend unit tests (Vitest)

# Single file or pattern
npm --filter backend test -- --testPathPattern=users.service

# Integration tests (backend, requires running Postgres)
npm --filter backend test:integration

# E2E (frontend, requires both apps running)
npm --filter frontend test:e2e    # Playwright
```

### Database

```bash
docker compose -f docker/docker-compose.yml up -d postgres   # start Postgres only
npm --filter backend db:migrate                              # run pending migrations
npm --filter backend db:migrate:create --name=add_invoices   # create new migration
npm --filter backend db:migrate:rollback                     # rollback last migration
npm --filter backend db:seed                                 # seed dev data
npm --filter backend db:studio                               # open Prisma Studio (GUI)
```

---

## Testing & TDD workflow

Follow **Red → Green → Refactor**:

1. **Red** — Write a failing test that describes the expected behavior.
2. **Green** — Write the minimal code to make the test pass.
3. **Refactor** — Clean up while keeping tests green.

### Bug fixes

Always start with a failing test that reproduces the bug before writing the fix.

### Test locations

| Layer | Location | Runner | Command |
|---|---|---|---|
| Backend unit | `apps/backend/src/**/*.spec.ts` | Jest | `npm --filter backend test` |
| Backend integration | `apps/backend/test/**/*.integration.spec.ts` | Jest + Supertest | `npm --filter backend test:integration` |
| Frontend unit | `apps/frontend/src/**/*.test.ts(x)` | Vitest | `npm --filter frontend test` |
| Frontend E2E | `apps/frontend/e2e/**/*.spec.ts` | Playwright | `npm --filter frontend test:e2e` |

### Running a targeted test

```bash
# Backend — single test file
npm --filter backend test -- --testPathPattern=users.service.spec

# Frontend — single test file
npm --filter frontend test -- users-list.test.tsx

# Playwright — single spec
npm --filter frontend test:e2e -- --grep="user login"
```

---

## Code quality rules

- **All PRs must pass**: `lint`, `format:check`, `typecheck`, `test`, `build`.
- **No `any`** — use strict TypeScript; `unknown` with type guards if needed.
- **No `console.log`** in committed code — use the logger service (backend) or remove before PR.
- **Import order** is enforced by ESLint (`eslint-plugin-import`). Do not reorder manually.
- **Shared types** live in `packages/shared/`. Do NOT duplicate DTOs or interfaces between apps.
- **No breaking API changes** without coordinating frontend and backend. If an endpoint response shape changes, update `packages/shared` types first, then both consumers.

### Code style (enforced by Prettier + ESLint)

- Double quotes, semicolons, 2-space indent.
- Arrow functions preferred.
- Functional React components only (no class components).
- Strict equality (`===`).
- Singular naming for DB tables/entities.

---

## Frontend (Next.js) agent guidance

### Structure

```
apps/frontend/src/
├── app/              # App Router pages and layouts
├── components/       # Reusable UI components
│   ├── ui/           # Primitives (Button, Input, Modal)
│   └── features/     # Domain-specific (UserCard, InvoiceTable)
├── hooks/            # Custom React hooks
├── lib/              # Utilities, API client, constants
├── styles/           # Global CSS, Tailwind config
└── types/            # Frontend-only types (prefer shared/ for API types)
```

### Patterns

- **Data fetching**: Use React Server Components for read paths. Client components use `@tanstack/react-query` with the API client from `lib/api.ts`.
- **Routing**: File-based App Router. Dynamic routes use `[param]` directories.
- **Styling**: Tailwind CSS utility classes. No custom CSS unless unavoidable.
- **Forms**: `react-hook-form` + `zod` for validation. Schemas in `packages/shared` when matching backend DTOs.

### Validating UI changes

```bash
npm --filter frontend typecheck
npm --filter frontend lint
npm --filter frontend test
npm --filter frontend build            # catches SSR issues
npm --filter frontend test:e2e         # if touching user flows
```

---

## Backend (NestJS) agent guidance

### Structure

```
apps/backend/src/
├── modules/
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── dto/
│   │   ├── entities/
│   │   └── users.service.spec.ts
│   └── ...
├── common/
│   ├── guards/        # Auth guards, role guards
│   ├── decorators/    # Custom decorators
│   ├── filters/       # Exception filters
│   ├── pipes/         # Validation pipes
│   └── interceptors/
├── config/            # Configuration module, env validation
├── database/          # Prisma client, migrations, seeds
└── main.ts
```

### Adding an endpoint

1. Create/update DTO in `modules/<domain>/dto/` with `class-validator` decorators.
2. Add corresponding shared type in `packages/shared/` if the frontend consumes it.
3. Implement service method with unit test (`.spec.ts` alongside).
4. Add controller route using the DTO. Apply appropriate guards.
5. Write integration test in `test/` that hits the endpoint via Supertest.
6. Run full validation (see checklist below).

### Testing approach

- **Services**: Mock the Prisma client. Test business logic in isolation.
- **Controllers**: Test through integration specs using `@nestjs/testing` + Supertest.
- **Guards/Pipes**: Unit test independently.

```bash
# Run only user module tests
npm --filter backend test -- --testPathPattern=modules/users
```

---

## Database (PostgreSQL) guidance

### Local setup

Postgres runs via Docker Compose:

```bash
docker compose -f docker/docker-compose.yml up -d postgres
```

Connection string (from `.env.example`):

```
DATABASE_URL=postgresql://devuser:devpass@localhost:5432/appdb
```

### ORM & migrations

This repo uses **Prisma**. Schema lives at `apps/backend/prisma/schema.prisma`.

```bash
# After schema changes — generate client + create migration
npm --filter backend db:migrate:create --name=describe_change
npm --filter backend db:migrate

# Reset DB (drops + recreates + seeds)
npm --filter backend db:reset

# Open GUI
npm --filter backend db:studio
```

### Rules

- Never edit a migration file that has been merged to `main`.
- One migration per logical change. Do not batch unrelated changes.
- Seed files go in `apps/backend/prisma/seed.ts`. Keep seeds idempotent.
- Integration tests use a separate test database (`appdb_test`). The test runner handles setup/teardown.

---

## Environment variables & secrets

- Template: `.env.example` at repo root. Copy to `.env` for local dev.
- **Never commit `.env`**. It is in `.gitignore`.
- Both apps read from root `.env` via `dotenv` (loaded in turbo pipeline).

### Adding a new env var

1. Add the variable to `.env.example` with a placeholder value and a comment.
2. Add validation in `apps/backend/src/config/env.validation.ts` (uses `zod` or `class-validator`).
3. For frontend public vars, prefix with `NEXT_PUBLIC_` and add to `apps/frontend/.env.example` if separate.
4. Document the variable's purpose in this file or in `README.md` if user-facing.
5. Update CI secrets in GitHub Actions if required for builds/tests.

### Key variables (from `.env.example`)

| Variable | Used by | Description |
|---|---|---|
| `DATABASE_URL` | backend | Postgres connection string |
| `REDIS_URL` | backend | Redis connection string |
| `JWT_SECRET` | backend | Token signing key |
| `NEXT_PUBLIC_API_URL` | frontend | Backend API base URL |
| `S3_BUCKET` | backend | File upload bucket |

---

## Change validation checklist

Run before every PR. CI runs the same checks.

```bash
npm lint
npm format:check
npm typecheck
npm test
npm --filter backend test:integration
npm build
# If touching user-facing flows:
npm --filter frontend test:e2e
```

All commands must exit 0. Fix any failures before requesting review.

---

## Documentation hygiene

- **`README.md`** — Human-facing: project overview, setup for newcomers, architecture decisions.
- **`AGENTS.md`** (this file) — Agent-facing: precise commands, file paths, do/don't rules.

**Rule**: If you discover a recurring pitfall or non-obvious behavior while working in this repo, add a short note to the **Troubleshooting** section below.

---

## Troubleshooting

### Prisma client out of sync

If you see `PrismaClientKnownRequestError` about missing fields after pulling new migrations:

```bash
npm --filter backend db:migrate
npm --filter backend postinstall   # regenerates Prisma client
```

### Port conflicts

Backend defaults to `3001`, frontend to `3000`. If ports are occupied:

```bash
PORT=3002 npm --filter frontend dev
PORT=3003 npm --filter backend dev
```

### Docker Compose Postgres won't start

Check if another Postgres is using port 5432:

```bash
lsof -i :5432
# Stop the conflicting process or change the port in docker-compose.yml
```

### `npm install` fails on lockfile mismatch

Do not use `npm` or `yarn`. This repo requires npm:

```bash
corepack enable
npm install --frozen-lockfile   # CI mode — fails on mismatch
npm install                     # local — updates lockfile if needed
```
