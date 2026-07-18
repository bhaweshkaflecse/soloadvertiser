# ADR-003: Next.js for Web Applications

## Status
Accepted

## Context
We have two web applications (admin panel, business portal) that need server-side rendering for SEO, fast initial load times, and a productive developer experience.

## Decision
We use Next.js (App Router) for both admin-web and business-web applications.

## Consequences
**Positive:**
- Server-side rendering and static generation out of the box
- App Router provides modern React Server Components
- Built-in API routes for BFF (Backend for Frontend) patterns
- Excellent performance with automatic code splitting
- Vercel deployment option for rapid iteration

**Negative:**
- Tight coupling to Vercel ecosystem (mitigated by standalone output)
- App Router is newer with evolving best practices
- Two separate Next.js apps increase build times
- Server Components require careful state management strategy
