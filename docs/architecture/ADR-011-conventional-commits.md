# ADR-011: Conventional Commits

## Status
Accepted

## Context
We need a consistent commit message format that enables automated changelog generation, semantic versioning, and clear project history.

## Decision
We enforce Conventional Commits via commitlint with Husky git hooks.

## Consequences
**Positive:**
- Automated changelog generation from commit history
- Clear categorization of changes (feat, fix, chore, docs)
- Enables semantic-release for automated versioning
- Breaking changes are explicitly marked
- Easy to scan git log for specific change types

**Negative:**
- Additional friction for new contributors
- Requires Husky setup (can be bypassed with --no-verify)
- Squash merges may lose granular commit information
- Learning curve for commit message format
