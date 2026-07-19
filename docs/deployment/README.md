# Deployment Guide

## Environments
- Development: `docker-compose.dev.yml`
- Staging: `docker-compose.staging.yml`
- Production: `docker-compose.production.yml`

## CI/CD Pipeline
Push to main triggers: lint → typecheck → test → build → deploy

## Manual Deployment
1. SSH to VPS
2. `cd /opt/soloadvertiser`
3. `docker compose -f docker-compose.production.yml pull`
4. `docker compose -f docker-compose.production.yml up -d`
5. Verify: `curl http://localhost:3000/api/v1/health`

## Rollback
1. `docker compose -f docker-compose.production.yml down`
2. Update image tags to previous version
3. `docker compose -f docker-compose.production.yml up -d`

## Backups
- PostgreSQL: Daily pg_dump via cron (02:00 NPT)
- Stored in Cloudflare R2 (soloadvertiser-backups bucket)
- Retention: 7 daily + 4 weekly
