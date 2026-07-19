# Development Guide

## Code Standards
- TypeScript strict mode
- ESLint + Prettier (auto-format on save)
- Conventional Commits (enforced by commitlint)
- PR required for all changes to main

## Module Development
Each NestJS module follows this structure:
```
modules/{name}/
├── {name}.module.ts
├── {name}.controller.ts
├── {name}.service.ts
├── dto/
├── interfaces/
└── events/
```

## Testing
- `pnpm test` — Run all tests
- `pnpm test:cov` — Coverage report
- Target: 80% line coverage

## Database
- Schema: `packages/database/prisma/schema.prisma`
- Migrations: `pnpm db:migrate`
- Studio: `pnpm db:studio`
