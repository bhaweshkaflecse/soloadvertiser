# ADR-004: PostgreSQL as Primary Database

## Status
Accepted

## Context
The platform requires a relational database for transactional data (users, campaigns, rides, payments) with strong consistency guarantees and mature tooling.

## Decision
We use PostgreSQL 16 as the primary database, accessed through Prisma ORM.

## Consequences
**Positive:**
- ACID compliance for financial transactions
- Rich indexing (B-tree, GIN, trigram) for search operations
- JSON/JSONB support for semi-structured data
- Mature ecosystem with excellent monitoring tools
- Schema separation for domain boundaries

**Negative:**
- Vertical scaling limitations (mitigated by read replicas)
- Requires careful schema migration management
- Connection pooling needed for high-concurrency scenarios
- Prisma adds an abstraction layer that may limit advanced queries
