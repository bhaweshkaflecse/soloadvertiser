# ADR-001: Monorepo with Turborepo

## Status
Accepted

## Context
Solo Advertiser consists of multiple applications (API, admin panel, business portal, rider app) and shared packages. We need a strategy for code organization that enables code sharing, consistent tooling, and efficient CI/CD.

## Decision
We adopt a monorepo architecture using Turborepo for build orchestration and pnpm workspaces for package management.

## Consequences
**Positive:**
- Shared packages (types, validation, config) are immediately available across all apps
- Single CI pipeline covers the entire codebase
- Atomic commits across multiple packages
- Turborepo remote caching significantly speeds up CI
- Consistent tooling and coding standards

**Negative:**
- Larger repository size over time
- Requires discipline in package boundaries
- CI must be carefully configured to avoid unnecessary rebuilds
- Flutter (rider-app) remains semi-external due to toolchain differences
