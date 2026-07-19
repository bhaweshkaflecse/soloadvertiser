# Solo Advertiser

<!-- Logo placeholder -->
<p align="center">
  <img src="docs/assets/logo-placeholder.png" alt="Solo Advertiser" width="200" />
</p>

<p align="center">
  <strong>Transform delivery riders into mobile advertising assets.</strong>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="#development">Development</a> &bull;
  <a href="#deployment">Deployment</a> &bull;
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/NestJS-10.x-red?logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/Next.js-14.x-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Flutter-3.x-blue?logo=flutter" alt="Flutter" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7.x-red?logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/Prisma-5.x-teal?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Docker-Compose-blue?logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/Turborepo-latest-purple?logo=turborepo" alt="Turborepo" />
</p>

---

## Overview

Solo Advertiser is an advertising inventory marketplace that connects businesses with delivery riders for mobile advertising campaigns. Businesses create campaigns, riders apply branding to their vehicles, and the platform handles verification, tracking, and payouts --- creating a new revenue stream for the gig economy.

## Architecture

```
+-------------------------------------------------------------------+
|                         CLIENTS                                     |
+-------------------------------------------------------------------+
|  Admin Panel    |  Business Portal  |  Rider App    |  Partner API |
|  (Next.js)      |  (Next.js)        |  (Flutter)    |  (REST)      |
+-------------------------------------------------------------------+
          |                  |                |               |
          +------------------+----------------+---------------+
                             |
                    +-----------------+
                    |   API Gateway   |
                    |   (NestJS)      |
                    +-----------------+
                    |  Auth | RBAC    |
                    |  Rate Limiting  |
                    |  Request Valid. |
                    +-----------------+
                             |
          +------------------+------------------+
          |                  |                  |
  +-------+------+  +-------+------+  +--------+-----+
  | Domain Layer |  | Domain Layer |  | Domain Layer  |
  | Campaigns    |  | Riders       |  | Finance       |
  | Assignments  |  | Businesses   |  | Marketplace   |
  +--------------+  +--------------+  +---------------+
          |                  |                  |
          +------------------+------------------+
                             |
              +--------------+--------------+
              |              |              |
        +-----------+  +---------+  +------------+
        | PostgreSQL |  |  Redis  |  |   Object   |
        |   (Data)   |  | (Cache) |  |  Storage   |
        +-----------+  +---------+  +------------+
```

## Features

- **Campaign Management** --- Create, manage, and track mobile advertising campaigns
- **Rider Marketplace** --- Onboard and manage delivery riders as advertising inventory
- **Real-time Tracking** --- GPS verification and impression counting
- **Financial System** --- Escrow, wallets, commission, and automated payouts
- **Multi-tenant Auth** --- Role-based access for admins, businesses, riders, and partners
- **Marketplace** --- Channel-based inventory system with pre-orders and enrollments
- **Media Management** --- Upload, store, and moderate campaign creative assets
- **Notifications** --- Push, email, SMS, and in-app notifications
- **Admin Dashboard** --- Full platform oversight with moderation tools
- **Analytics** --- Campaign performance, rider metrics, and financial reporting

## Quick Start

### Prerequisites

- **Node.js** >= 20.0.0 (see `.nvmrc`)
- **pnpm** >= 9.0.0
- **Docker** & Docker Compose
- **Flutter** >= 3.x (for rider app only)

### 5-Step Setup

```bash
# 1. Clone
git clone https://github.com/bhaweshkaflecse/soloadvertiser.git
cd soloadvertiser

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env

# 4. Start infrastructure (Postgres, Redis)
docker compose -f docker-compose.dev.yml up -d

# 5. Run all apps in dev mode
pnpm dev
```

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Lint all packages |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm test` | Run test suite |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm format` | Format code with Prettier |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed development data |
| `pnpm clean` | Remove all build artifacts |

### Project Structure

```
soloadvertiser/
+-- apps/
|   +-- api/               # NestJS backend (REST + WebSocket)
|   +-- admin-web/         # Next.js admin dashboard
|   +-- business-web/      # Next.js business portal
|   +-- rider-app/         # Flutter mobile app
+-- packages/
|   +-- config/            # Environment config & validation
|   +-- contracts/         # Error codes, API contracts
|   +-- database/          # Prisma client & schema
|   +-- eslint-config/     # Shared ESLint configurations
|   +-- events/            # Domain event catalog & bus
|   +-- logger/            # Structured logging (Pino)
|   +-- sdk/               # Typed API client SDK
|   +-- shared/            # Common utilities
|   +-- tsconfig/          # TypeScript base configs
|   +-- types/             # Shared type definitions
|   +-- ui/                # React component library
|   +-- validation/        # Zod schemas for validation
+-- infrastructure/
|   +-- docker/            # Multi-stage Dockerfiles
|   +-- nginx/             # Reverse proxy config
|   +-- postgres/          # Database initialization
|   +-- redis/             # Cache configuration
+-- docs/                  # Product & architecture docs
+-- scripts/               # Dev & deployment scripts
```

### Package Management

```bash
# Add dependency to a specific package
pnpm --filter @soloadvertiser/api add express

# Add dev dependency to workspace root
pnpm add -D -w some-tool

# Run script in a specific package
pnpm --filter @soloadvertiser/api dev

# Build only SDK package
pnpm --filter @soloadvertiser/sdk build
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_REFRESH_SECRET` | Refresh token secret | (required) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | (optional) |
| `AWS_S3_BUCKET` | S3 bucket for media | (required) |
| `AWS_REGION` | AWS region | `us-east-1` |
| `MPESA_CONSUMER_KEY` | M-Pesa API key | (optional) |
| `MPESA_CONSUMER_SECRET` | M-Pesa API secret | (optional) |
| `SMTP_HOST` | Email SMTP host | (optional) |
| `SMTP_PORT` | Email SMTP port | `587` |
| `FCM_SERVER_KEY` | Firebase push notification key | (optional) |
| `SENTRY_DSN` | Sentry error tracking | (optional) |

### Docker Commands

```bash
# Development stack
docker compose -f docker-compose.dev.yml up -d

# Production build
docker compose -f docker-compose.production.yml up --build

# Stop all services
docker compose down

# View logs
docker compose logs -f api

# Reset database
docker compose exec postgres psql -U postgres -c "DROP DATABASE soloadvertiser;"
docker compose exec postgres psql -U postgres -c "CREATE DATABASE soloadvertiser;"
```

## API Documentation

The API follows RESTful conventions with JSON:API-inspired response envelopes.

**Base URL:** `http://localhost:3000/v1`

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

### Authentication

All authenticated endpoints require a Bearer token:

```
Authorization: Bearer <access_token>
```

Tokens expire after 15 minutes. Use the refresh endpoint to obtain new tokens.

Full API documentation is available at `/api/docs` (Swagger) when running in development mode.

## Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific package tests
pnpm --filter @soloadvertiser/api test

# Run e2e tests (requires running services)
pnpm test:e2e

# Watch mode
pnpm --filter @soloadvertiser/api test:watch
```

### Test Strategy

- **Unit tests** --- Business logic, services, utilities
- **Integration tests** --- API endpoints, database queries
- **E2E tests** --- Critical user flows
- **Property-based tests** --- Financial calculations, validation logic

## Deployment

### Environments

| Environment | Branch | Auto-deploy | URL |
|-------------|--------|-------------|-----|
| Development | `*` | No | `localhost` |
| Staging | `main` | Yes | `staging.soloadvertiser.com` |
| Production | `v*` tags | Yes | `app.soloadvertiser.com` |

### CI/CD Pipeline

1. **Lint & Type Check** --- On every PR
2. **Unit Tests** --- On every PR
3. **Build** --- On merge to main
4. **Deploy Staging** --- Automatic on main
5. **Deploy Production** --- On version tag

### Infrastructure

- **Compute:** AWS ECS / Kubernetes
- **Database:** AWS RDS (PostgreSQL 16)
- **Cache:** AWS ElastiCache (Redis 7)
- **Storage:** AWS S3
- **CDN:** CloudFront
- **CI/CD:** GitHub Actions

## Contributing

1. Fork the repository
2. Create a feature branch (`feat/my-feature`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
4. Push to your branch
5. Open a Pull Request

### Commit Convention

```
feat(scope): add new feature
fix(scope): resolve bug
chore(scope): maintenance task
docs(scope): documentation update
test(scope): add/update tests
refactor(scope): code refactoring
```

### Code Quality

- **ESLint** --- Enforced linting rules
- **Prettier** --- Consistent formatting
- **Husky** --- Pre-commit hooks (lint-staged)
- **Commitlint** --- Conventional commit enforcement
- **TypeScript** --- Strict mode enabled

See `.github/PULL_REQUEST_TEMPLATE.md` for PR guidelines.

## License

MIT License --- see [LICENSE](./LICENSE) for details.

---

<p align="center">
  Built with care by the Solo Advertiser team.
</p>
