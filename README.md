# Solo Advertiser

**Advertising Inventory Marketplace** — A platform connecting businesses with delivery riders for mobile advertising campaigns.

## Vision

Solo Advertiser transforms delivery riders into mobile advertising assets. Businesses create campaigns, riders apply branding to their vehicles, and the platform handles verification, tracking, and payouts — creating a new revenue stream for the gig economy.

## Architecture

```
soloadvertiser/
├── apps/
│   ├── api/              # NestJS backend (REST API, WebSockets)
│   ├── admin-web/        # Next.js admin panel
│   ├── business-web/     # Next.js business portal
│   └── rider-app/        # Flutter mobile app (separate toolchain)
├── packages/
│   ├── config/           # Environment configuration & validation
│   ├── contracts/        # Error codes, event payload types
│   ├── database/         # Prisma client & schema
│   ├── eslint-config/    # Shared ESLint configurations
│   ├── events/           # Event bus interfaces & constants
│   ├── logger/           # Structured logging (Pino)
│   ├── sdk/              # Public API client SDK
│   ├── shared/           # Common utilities
│   ├── tsconfig/         # TypeScript configurations
│   ├── types/            # Shared type definitions
│   ├── ui/               # Shared React component library
│   └── validation/       # Zod schemas for runtime validation
├── infrastructure/
│   ├── docker/           # Dockerfiles (multi-stage builds)
│   ├── nginx/            # Reverse proxy configuration
│   ├── postgres/         # Database initialization
│   └── redis/            # Cache configuration
├── docs/                 # Product & architecture documentation
│   └── architecture/     # Architecture Decision Records (ADRs)
└── scripts/              # Development & deployment scripts
```

## Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Docker** & Docker Compose (for local services)

### Setup

```bash
# Clone the repository
git clone https://github.com/bhaweshkaflecse/soloadvertiser.git
cd soloadvertiser

# Run setup script (installs deps, creates .env, starts Docker services)
chmod +x scripts/setup.sh
./scripts/setup.sh

# Or manually:
pnpm install
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d
```

### Development

```bash
# Start all services in development mode
pnpm dev

# Build all packages and apps
pnpm build

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Run tests
pnpm test

# Format code
pnpm format
```

### Services (Development)

| Service        | URL                     | Description          |
|---------------|-------------------------|----------------------|
| API           | http://localhost:3000    | NestJS backend       |
| Admin Panel   | http://localhost:3001    | Admin dashboard      |
| Business Portal | http://localhost:3002  | Business owner portal|
| PostgreSQL    | localhost:5432          | Primary database     |
| Redis         | localhost:6379          | Cache & events       |

## Development Guide

### Package Management

This is a pnpm workspace monorepo. Common commands:

```bash
# Add a dependency to a specific package
pnpm --filter @soloadvertiser/api add express

# Add a dev dependency to root
pnpm add -D -w some-tool

# Run a script in a specific package
pnpm --filter @soloadvertiser/api dev
```

### Creating a New Package

1. Create directory under `packages/` or `apps/`
2. Add `package.json` with `@soloadvertiser/` scope
3. Add `tsconfig.json` extending the appropriate base config
4. Add the package to dependent `package.json` files

### Git Workflow

- **Conventional Commits** enforced via commitlint
- **Branch naming**: `feat/`, `fix/`, `chore/`, `docs/`
- **PR required** for all changes to `main`
- **CI must pass** before merge

```bash
# Commit format
git commit -m "feat(api): add user registration endpoint"
git commit -m "fix(admin): resolve pagination bug"
git commit -m "chore(deps): update NestJS to v10.4"
```

## Deployment

### Local (Docker Compose)

```bash
# Start all services
docker compose -f docker-compose.production.yml up --build

# Stop services
docker compose -f docker-compose.production.yml down
```

### Production

See `infrastructure/` directory and `.github/workflows/deploy.yml` for deployment pipeline details.

**Environments:**
- **Development**: Local Docker Compose
- **Staging**: Auto-deployed from `main` branch
- **Production**: Deployed on version tags (`v*`)

## Roadmap

- [x] **CR-007**: Foundation Sprint (monorepo, DevOps, standards)
- [ ] **CR-008**: Authentication & Authorization
- [ ] **CR-009**: User Management (riders, businesses)
- [ ] **CR-010**: Campaign Management
- [ ] **CR-011**: Ride Tracking & Verification
- [ ] **CR-012**: Payment Processing
- [ ] **CR-013**: Analytics Dashboard
- [ ] **CR-014**: Notification System
- [ ] **CR-015**: Marketplace & Inventory

## Contributing

1. Fork the repository
2. Create a feature branch (`feat/my-feature`)
3. Commit changes using conventional commits
4. Push to your branch
5. Open a Pull Request

See `.github/PULL_REQUEST_TEMPLATE.md` for PR guidelines.

## Architecture Decisions

See `docs/architecture/` for all Architecture Decision Records (ADRs).

## License

MIT License — see [LICENSE](./LICENSE) for details.
