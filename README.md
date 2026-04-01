# Finance Dashboard Backend

Backend assignment submission for a finance dashboard system with JWT authentication, RBAC, financial record CRUD, dashboard analytics, audit logging, Swagger docs, and Jest/Supertest coverage.

## Why This Architecture

This project uses a clean Express + TypeScript monolith with explicit separation between routes, controllers, services, repositories, middleware, config, and database schema files. It stays close to a strong junior backend engineer stack: easy to explain in interviews, modular enough to scale, and practical without pulling in heavyweight frameworks.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Drizzle ORM + Drizzle Kit
- JWT authentication
- Zod validation
- Swagger UI / OpenAPI
- Jest + Supertest
- Docker Compose for local PostgreSQL

## Project Structure

```text
src/
  config/
  constants/
  db/
    migrations/
    schema/
    seeds/
  docs/
  middlewares/
  modules/
    audit/
    auth/
    dashboard/
    records/
    users/
  types/
  utils/
tests/
```

## Features

- Role-based access control for `viewer`, `analyst`, and `admin`
- Login endpoint with JWT access token
- Admin user management APIs
- Financial record CRUD with filters, sorting, pagination, and soft delete
- Dashboard analytics for totals, category totals, recent activity, and trends
- Audit logging for login, record mutations, and important user changes
- Centralized validation and error handling
- Swagger documentation at `/docs`

## Role Behavior

- `viewer`
  - can access dashboard endpoints
  - cannot read records
  - cannot mutate records or manage users
- `analyst`
  - can read records
  - can access dashboard endpoints
  - cannot manage users or mutate records
- `admin`
  - full user management
  - full financial record CRUD
  - audit log access
  - dashboard access

## API Overview

- `GET /health`
- `POST /api/v1/auth/login`
- `GET /api/v1/users`
- `POST /api/v1/users`
- `GET /api/v1/users/:id`
- `PATCH /api/v1/users/:id`
- `PATCH /api/v1/users/:id/status`
- `GET /api/v1/records`
- `POST /api/v1/records`
- `GET /api/v1/records/:id`
- `PATCH /api/v1/records/:id`
- `DELETE /api/v1/records/:id`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/category-totals`
- `GET /api/v1/dashboard/recent-activity`
- `GET /api/v1/dashboard/trends`
- `GET /api/v1/audit-logs`

## Request / Response Style

Successful responses follow:

```json
{
  "success": true,
  "message": "Users fetched successfully.",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 1
  }
}
```

Errors follow:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": {}
  }
}
```

## Database Design

### `users`

- `id`
- `name`
- `email`
- `password_hash`
- `role`
- `status`
- `created_at`
- `updated_at`

### `financial_records`

- `id`
- `amount`
- `type`
- `category`
- `date`
- `notes`
- `created_by`
- `created_at`
- `updated_at`
- `deleted_at`

### `audit_logs`

- `id`
- `actor_user_id`
- `entity_type`
- `entity_id`
- `action`
- `metadata`
- `created_at`

## Environment Variables

Copy `.env.example` to `.env` and update values if needed.

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_dashboard
JWT_SECRET=change-me
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000
SWAGGER_ENABLED=true
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start PostgreSQL with Docker:

```bash
docker compose up -d postgres
```

You can also point `DATABASE_URL` at an existing local PostgreSQL instance instead of Docker.

3. Generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

4. Seed demo data:

```bash
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

## Run Commands

```bash
npm run dev
npm run build
npm run start
```

## Migration Commands

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

## Test Commands

```bash
npm test
npm run test:watch
```

## Default Seed Users

- `admin@finance.local` / `Admin@123`
- `analyst@finance.local` / `Admin@123`
- `viewer@finance.local` / `Admin@123`

## Assumptions

- JWT access tokens are sufficient for this assignment, so refresh tokens are omitted.
- `viewer` users only see dashboard data, not record lists.
- Financial record deletes are soft deletes.
- Audit logs capture meaningful security and data mutation events.
- API versioning is implemented as `/api/v1`.

## Tradeoffs

- Redis caching is intentionally excluded to keep the project focused and easier to explain.
- Tests use Supertest with mocked repository/service boundaries instead of a live Postgres test container, which keeps CI and local execution simpler.
- This is a modular monolith rather than microservices because the assignment scope does not justify distributed complexity.

## Future Improvements

- Add refresh tokens and logout invalidation
- Add rate limiting and request correlation IDs
- Add stronger OpenAPI component schemas for every endpoint
- Add live Postgres integration tests in CI
- Add role and permission seeding helpers
- Add CSV export or bulk import for financial records
