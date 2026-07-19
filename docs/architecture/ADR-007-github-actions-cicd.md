# ADR-007: GitHub Actions for CI/CD

## Status
Accepted

## Context
We need automated pipelines for linting, testing, building, and deploying. The pipeline should be fast, reliable, and integrated with our version control.

## Decision
We use GitHub Actions for all CI/CD workflows with Turborepo remote caching.

## Consequences
**Positive:**
- Native GitHub integration (PR checks, deployment environments)
- Rich marketplace of reusable actions
- Matrix builds for parallel testing
- Free tier sufficient for initial development
- Secrets management built in

**Negative:**
- Vendor lock-in to GitHub ecosystem
- YAML-based configuration can become complex
- Limited local testing (act tool helps but isn't perfect)
- Runner minutes are metered on private repositories
