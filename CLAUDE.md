# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ParkingHub is a SaaS multitenant parking management system targeting the Colombian market. It is a monorepo with an Angular 19+ frontend and Node.js + Express 5 backend, both in TypeScript strict mode.

> Both `frontend/` and `backend/` have `package.json` and scaffolded structure. Refer to `.agent-skills/` for the authoritative implementation standards.

## Node.js Version (nvm-windows)

This project requires **Node 20+** (Angular 19, Express 5). nvm-windows does not update PATH in the same shell when you run `nvm use`, so use the wrapper script:

```cmd
scripts\use-node20.cmd npm install
scripts\use-node20.cmd npm run dev
scripts\use-node20.cmd npx ng new frontend --style=scss
```

**PowerShell:**
```powershell
.\scripts\use-node20.ps1 npm install
```

The script prepends Node 20 to PATH for that command only — your default (Node 12) stays unchanged. The `.nvmrc` file specifies `20` for this project.

Running the PowerShell script with no arguments opens an interactive shell with Node 20 already on PATH.

## Commands

All commands must be run with Node 20 (see nvm-windows section above). From each subdirectory:

**Frontend (`frontend/`)** — Angular CLI + Karma/Jasmine:
```bash
npm start            # ng serve (dev server, http://localhost:4200)
npm run build        # ng build (production)
npm run watch        # ng build --watch (dev mode)
npm test             # ng test (Karma + Jasmine, opens browser)
```

**Backend (`backend/`)** — Express 5 + tsx + Jest:
```bash
npm run dev          # tsx watch src/main.ts (hot reload)
npm run build        # tsc (compile to dist/)
npm start            # node dist/main.js (production)
npm test             # jest
npm test -- --testPathPattern=<file>  # Single test file
```

## Architecture

The project enforces **Clean Architecture** across both frontend and backend with a strict **inward-only dependency rule**:

```
Frameworks → Interface Adapters → Application → Domain
```

### Backend Layer Structure

```
backend/src/
├── domain/           # Layer 1 — Entities, value objects, repository interfaces. ZERO external deps.
├── application/      # Layer 2 — Use cases. Only imports Domain.
├── infrastructure/   # Layer 3+4 — Mongoose repositories, Express controllers, Pino logger, Zod config.
└── main.ts           # Composition root: wires DI only, no logic.
```

**Critical constraints:**
- Use cases have zero knowledge of MongoDB or Express
- Mongoose types must never appear in the domain layer
- `tenantId` is always extracted from JWT, never from request body
- All totals/pricing calculations happen backend-only

### Frontend Layer Structure

```
frontend/src/app/
├── core/
│   ├── domain/         # Layer 1 — Entities, interfaces
│   ├── application/    # Layer 2 — Facades/use-case services
│   └── infrastructure/ # Layer 3 — HTTP adapters, interceptors
├── features/           # Layer 4 — Lazy-loaded standalone components (OnPush)
└── shared/             # Cross-cutting UI components, pipes, directives
```

**Critical constraints:**
- Standalone components only — no NgModule declarations
- All components use `ChangeDetectionStrategy.OnPush`
- Components never call HTTP directly; they go through facades/use-cases
- Use Signals for local/sync state; RxJS for async streams
- Always use `takeUntilDestroyed()` or `async` pipe when subscribing

## Tech Stack

| Concern | Technology |
|---|---|
| Frontend | Angular 19+ (standalone), Signals, RxJS |
| Backend | Node.js 20+ LTS, Express 5 |
| Database | MongoDB 7+, Mongoose 8+ |
| Validation | Zod (request input + env vars) |
| Logging | Pino (structured JSON; pretty-print dev only) |
| Security | Helmet, CORS (no wildcards in prod), rate limiting |
| Testing (frontend) | Karma + Jasmine (`ng test`) |
| Testing (backend) | Jest + Supertest |
| Language | TypeScript strict mode throughout |

## Environment Variables

Validated at startup with Zod — the app exits immediately if any are missing or invalid:

```
NODE_ENV        development | production | test
PORT            number (default 3000)
MONGODB_URI     URL string
JWT_SECRET      string (min 32 chars)
CORS_ORIGINS    comma-separated URLs
LOG_LEVEL       fatal | error | warn | info | debug | trace
```

## Business Domain

**Core entities:** `Tenant`, `Branch`, `User`, `Ticket`, `CashCut`, `AuditLog`, `PricingConfig`

**RBAC roles:** `SUPER_ADMIN`, `PARKING_ADMIN`, `OPERATOR`

**MVP features:**
- **Check-in**: Generates `Ticket` entity + unique QR code on vehicle entry
- **Pricing Engine**: Backend-only; supports minute/fraction/block modes, grace periods, daily caps, COP currency
- **Check-out**: Scan QR → calculate amount → register payment (Efectivo or Datáfono) → mark `PAID`
- **Cash Cut (Arqueo de Caja)**: Per-operator, per-branch financial audit with discrepancy tracking

Every critical action must be written to `AuditLog`.

## Reference Manuals (`.agent-skills/`)

These are the authoritative Single Source of Truth for standards. Consult before implementing:

- `clean-architecture-patterns.md` — Layer rules, dependency inversion, composition root
- `angular-expert.md` — Component patterns, DI, signals, new control flow (`@if`, `@for`)
- `node-best-practices.md` — Express structure, error hierarchy, security middleware
- `mongodb-optimization.md` — Schema design, ESR indexing rule, aggregation pipelines
- `professional-web-design.md` — Design tokens, animations, accessibility (WCAG 2.1 AA)
- `project-context.md` — Business vision and constraints

## Key Conventions

- **No `any` type** — use generics or `unknown`
- **No `console.log`** — use Pino logger
- **File naming:** `kebab-case` for all files
- **Class naming:** `CreateSpotUseCase`, `MongoSpotRepository`, `ParkingSpotComponent`
- **One export per file** for components, services, and use cases
- **Angular new control flow** (`@if`/`@for`/`@switch`) — no `*ngIf`/`*ngFor` directives
- **Functional guards only** in Angular routing (`canActivate: [authGuard]`)
