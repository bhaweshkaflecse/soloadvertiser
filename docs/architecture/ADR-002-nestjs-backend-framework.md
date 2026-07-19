# ADR-002: NestJS as Backend Framework

## Status
Accepted

## Context
We need a backend framework that supports TypeScript natively, provides structure for large applications, and integrates well with our toolchain (Prisma, Bull, WebSockets).

## Decision
We use NestJS as the backend framework for the API service.

## Consequences
**Positive:**
- First-class TypeScript support with decorators and dependency injection
- Modular architecture aligns with domain-driven design
- Built-in support for WebSockets, GraphQL, microservices
- Large ecosystem of official and community modules
- Excellent testing utilities

**Negative:**
- Steeper learning curve than Express
- Decorator-heavy code may be unfamiliar to some developers
- Opinionated structure requires adherence to NestJS patterns
- Slightly larger bundle size due to reflection metadata
