# ADR-006: Docker for Containerization

## Status
Accepted

## Context
We need consistent environments across development, staging, and production. Developers should be able to run the full stack locally with minimal setup.

## Decision
We use Docker with multi-stage builds for all services, with docker-compose for local development and production orchestration.

## Consequences
**Positive:**
- Identical environments across all stages
- Multi-stage builds minimize production image sizes
- docker-compose simplifies local development setup
- Easy horizontal scaling in production
- Reproducible builds for CI/CD

**Negative:**
- Docker adds complexity to the development workflow
- Image build times can be slow without layer caching
- Resource overhead on developer machines
- Requires Docker knowledge from all team members
