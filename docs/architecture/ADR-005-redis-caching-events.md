# ADR-005: Redis for Caching and Event Bus

## Status
Accepted

## Context
We need a fast caching layer for session data, API response caching, and rate limiting. We also need a lightweight pub/sub mechanism for inter-service events before scaling to a dedicated message broker.

## Decision
We use Redis 7 for caching, session storage, rate limiting, and as an initial event bus (pub/sub).

## Consequences
**Positive:**
- Sub-millisecond read/write latency
- Built-in pub/sub for event distribution
- Excellent for rate limiting and distributed locks
- BullMQ integration for background job processing
- Persistence options (AOF + RDB) for data safety

**Negative:**
- Memory-bound storage (requires eviction policies)
- Pub/sub is fire-and-forget (no message persistence)
- Will need migration to RabbitMQ/Kafka at scale
- Single-threaded model limits throughput for CPU-heavy operations
