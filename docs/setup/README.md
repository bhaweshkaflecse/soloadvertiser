# Developer Setup Guide

## Prerequisites
- Node.js 20+ (use .nvmrc: `nvm use`)
- pnpm 9+ (`npm install -g pnpm`)
- Docker & Docker Compose
- Git

## Quick Start
1. Clone: `git clone https://github.com/bhaweshkaflecse/soloadvertiser.git`
2. Install: `pnpm install`
3. Start infra: `docker compose -f docker-compose.dev.yml up -d`
4. Run migrations: `pnpm db:migrate`
5. Seed data: `pnpm db:seed`
6. Start dev: `pnpm dev`

## Services
- API: http://localhost:3000
- Admin: http://localhost:3001
- Business: http://localhost:3002
- PostgreSQL: localhost:5432
- Redis: localhost:6379
