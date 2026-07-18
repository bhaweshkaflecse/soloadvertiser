# Contributing Guide

## Branch Strategy
- `main` — Production-ready code
- `feat/*` — Feature branches
- `fix/*` — Bug fix branches
- `hotfix/*` — Critical production fixes

## Commit Convention
Follow Conventional Commits:
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `refactor:` — Code restructuring
- `test:` — Test additions
- `chore:` — Maintenance

## PR Requirements
1. All tests pass
2. TypeScript compiles without errors
3. ESLint passes
4. At least 1 reviewer approval
5. Squash merge to main

## Code Review Checklist
- [ ] Business rules reference Document 02
- [ ] State transitions recorded in history table
- [ ] Domain events emitted for state changes
- [ ] Error codes from packages/contracts used
- [ ] API envelope format followed
- [ ] Role-based access enforced
