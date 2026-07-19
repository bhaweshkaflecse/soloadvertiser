# ADR-009: Zod for Runtime Validation

## Status
Accepted

## Context
TypeScript provides compile-time type safety, but we also need runtime validation for API inputs, environment variables, and external data. We need a library that integrates well with TypeScript's type system.

## Decision
We use Zod for all runtime validation and schema definition.

## Consequences
**Positive:**
- TypeScript-first with automatic type inference
- Composable schemas enable reuse across packages
- Built-in transformations (coerce, transform, refine)
- Works with NestJS validation pipes
- Small bundle size

**Negative:**
- Another abstraction layer alongside TypeScript types
- Performance overhead for high-throughput validation
- Schemas can become verbose for complex objects
- Must keep Zod schemas in sync with Prisma models
