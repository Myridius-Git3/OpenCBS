# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenCBS-Cloud is an open-source Core Banking System for microfinance institutions, cooperatives, and digital lenders. It covers client/loan management (front-office) and accounting/reports (back-office).

## Commands

### Full-Stack (Docker)

**Development**
```bash
docker compose up --build        # Start all services (db, rabbitmq, api, web)
docker compose up -d             # Start in background
docker compose down              # Stop all services
```

**Production (Ubuntu EC2)**
```bash
cp .env.example .env             # Fill in all CHANGE_ME_* values before continuing
docker compose -f docker-compose-production.yml up -d --build
docker compose -f docker-compose-production.yml ps       # Check health
docker compose -f docker-compose-production.yml logs -f api

# Redeploy after a code change
docker compose -f docker-compose-production.yml up -d --build

# Full teardown (WARNING: destroys all volumes / data)
docker compose -f docker-compose-production.yml down -v
```

### Backend (server/)

Maven modules must be built in dependency order. Run from each module directory or from `server/`:

```bash
# Build all modules (skip tests)
cd server && mvn clean install -DskipTests

# Build a specific module
cd server/opencbs-core && mvn clean install -DskipTests

# Package the runnable JAR
cd server/opencbs-server && mvn clean package -DskipTests

# Run a specific test class
cd server/opencbs-core && mvn test -Dtest=ClassName

# Run the application locally (after building)
cd server/opencbs-server && mvn spring-boot:run
```

Module build order: `opencbs-spring-boot-starter` → `opencbs-core` → `opencbs-loans` → `opencbs-borrowings` → `opencbs-savings` → `opencbs-term-deposits` → `opencbs-bonds` → `opencbs-server`

### Frontend (client/)

```bash
cd client
npm install --legacy-peer-deps   # Install dependencies
npm start                         # Dev server (ng serve)
npm run build                     # Production build
npm test                          # Run Jasmine/Karma unit tests
npm run lint                      # Run tslint
npm run e2e                       # Run Protractor e2e tests
```

### Playwright E2E Tests (tests/ui/)

```bash
cd tests/ui
npm install
npm test                          # Run all tests (headless)
npm run test:headed               # Run with browser visible
npm run test:ui                   # Playwright UI mode (debugging)
npm run test:transfers            # Run only transfer module tests
npm run report                    # View HTML test report
npm run codegen                   # Record new tests via Playwright codegen
```

The Playwright base URL defaults to `http://localhost` and can be overridden with `OPENCBS_BASE_URL`.

## Architecture

### Backend: Multi-Module Spring Boot Monolith

**Stack:** Java 8, Spring Boot 1.5.4, Maven, PostgreSQL 14, RabbitMQ, Flyway, Hibernate/JPA

The backend is organized as a modular monolith under `server/`. Each domain module is an independent Maven artifact that the main `opencbs-server` application assembles at runtime.

**Domain modules:**
- `opencbs-core` — shared base classes, security, accounting, user management, custom fields
- `opencbs-loans` — loan products, loan applications, installments, penalties, credit committees
- `opencbs-savings` — savings accounts and transactions
- `opencbs-borrowings` — borrowing management
- `opencbs-term-deposits` — term deposit products
- `opencbs-bonds` — bond issuance and management
- `opencbs-server` — Spring Boot entry point (`ServerApplication`), assembles all modules

**Layer pattern** (consistent across all modules):

```
controllers/   REST endpoints extending BaseController → ApiResponse<T> wrapper
services/      Business logic (@Transactional); base interface CrudService<T>
repositories/  Spring Data JPA extending JpaRepository; QueryDSL for complex queries
domain/        JPA entities extending BaseEntity (Long id); Lombok @Data
dto/           API request/response objects
mappers/       MapStruct + ModelMapper entity↔DTO conversions
validators/    Input validation rules
```

**Key cross-cutting concerns:**
- **Auth:** Stateless JWT (HS512) via `AuthenticationTokenFilter`; login at `POST /api/login`; public endpoints: `/api/login`, `/api/info`, `/api/system-settings`
- **Audit:** Hibernate Envers tracks entity history; `UserAuditorAwareImpl` records who made changes
- **Async:** RabbitMQ exchanges (`frontDirectExchange`, `frontFanoutExchange`, `systemTopicExchange`) for account balance calculations and notifications
- **DB migrations:** Flyway versioned SQL in `opencbs-core/src/main/resources/db/migration/core/` (V1__, V2__, ...)
- **Logging/perf:** `@TimeLog` AOP annotation via `TimeLogAspect`
- **Reporting:** JasperReports for PDF/Excel output

### Frontend: Angular 8 SPA

**Stack:** Angular 8, TypeScript, NgRx, Angular Material, PrimeNG, RxJS 6, ngx-translate

```
client/src/app/
  containers/     Feature modules (20+): loan, loan-application, profile, savings,
                  accounting, transfers, bonds, borrowings, term-deposit, etc.
  core/           Core module: NgRx store slices (50+), services, guards, models
  shared/         Reusable components (31), pipes, validators, directives
```

**State management:** NgRx with feature stores per domain; effects handle API side-effects; router store integration. Store defined in `core/store/`.

**Routing:** Hash-based (`useHash: true`) with `PreloadAllModules`; feature modules define their own routing modules; default route → `dashboard`.

**Component prefix:** `cbs`

### E2E Tests: Playwright Page Object Model

Tests live in `tests/ui/` (separate from the Angular client). Structure:

```
tests/ui/
  pages/          Page Object classes (BasePage, LoginPage, TransfersHubPage, ...)
  tests/          Test suites organized by feature (transfers/, ...)
  fixtures/       auth.fixture.ts — authedPage fixture with pre-authenticated session
  playwright.config.ts
```

Config: single Chromium worker, 60s test timeout, traces/screenshots/video on failure, viewport 1440×900.

### Docker Compose Services

**Development** (`docker-compose.yml`)

| Service  | Image / Build         | Port  | Notes                              |
|----------|-----------------------|-------|------------------------------------|
| db       | postgres:14-alpine    | 5432  | Volume: postgres_data              |
| rabbitmq | rabbitmq:3-management | 15672 | Management UI (guest/guest)        |
| api      | server/opencbs-server | 8080  | Credentials via env vars           |
| web      | client/               | 80    | Nginx; depends on api              |

**Production** (`docker-compose-production.yml`)

| Service  | Image / Build         | Port | Notes                                           |
|----------|-----------------------|------|-------------------------------------------------|
| db       | postgres:14-alpine    | —    | Not exposed to host; internal network only      |
| rabbitmq | rabbitmq:3-alpine     | —    | No management UI; internal network only         |
| api      | server/opencbs-server | —    | Credentials from `.env`; healthcheck on :8080   |
| web      | client/               | 80   | Nginx + `client/default-prod.conf`              |

All secrets (DB password, RabbitMQ password, JWT secret) are injected exclusively
via environment variables sourced from `.env`. See `.env.example` for the full list.
`POSTGRES_USER` **must** remain `postgres` — Flyway migrations hardcode
`OWNER TO postgres` across many SQL scripts.

### Spring Boot Configuration

The API container uses Spring profile `docker` (activated via `-Dspring.profiles.active=docker`
in the Dockerfile `ENTRYPOINT`). Config resolution order (highest → lowest priority):

1. Environment variables (secrets, injected by Compose at runtime)
2. `application-docker.properties` (bundled in JAR — docker hostnames: `db`, `rabbitmq`)
3. `application.properties` (bundled in JAR — local-dev defaults)
