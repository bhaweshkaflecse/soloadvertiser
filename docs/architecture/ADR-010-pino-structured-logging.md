# ADR-010: Pino for Structured Logging

## Status
Accepted

## Context
We need a logging solution that produces structured (JSON) output for production log aggregation while remaining human-readable during development.

## Decision
We use Pino as the logging library across all Node.js services.

## Consequences
**Positive:**
- Extremely fast (low overhead in hot paths)
- Structured JSON output for log aggregation (ELK, DataDog)
- pino-pretty for human-readable development output
- Child loggers for request-scoped context
- Minimal dependencies

**Negative:**
- JSON output is not human-readable without pino-pretty
- Less feature-rich than Winston (no built-in transports)
- Async logging mode can lose messages on crash
- Requires consistent log level discipline across team
