# ADR-008: Prisma as ORM

## Status
Accepted

## Context
We need a type-safe database access layer that integrates with TypeScript, supports migrations, and provides a good developer experience.

## Decision
We use Prisma as the ORM for database access, migrations, and schema management.

## Consequences
**Positive:**
- Auto-generated TypeScript types from schema
- Declarative schema definition with migration support
- Prisma Studio for visual database browsing
- Excellent query performance with connection pooling
- Strong community and documentation

**Negative:**
- Generated client adds to bundle size
- Complex raw queries require falling back to $queryRaw
- Schema-first approach requires regeneration on changes
- N+1 query patterns require explicit include/select
