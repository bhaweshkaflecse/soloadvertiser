# Document 15 - Deployment and Operations Specification

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every deployment procedure, infrastructure configuration, CI/CD pipeline, backup strategy, and operational runbook defined in this document is the AUTHORITATIVE specification for production operations. No deployment, infrastructure change, or operational procedure may deviate from this document without formal amendment.

---

## 1. Purpose and Scope

This document defines the complete deployment architecture, CI/CD pipeline, operational procedures, backup strategy, disaster recovery plan, and day-to-day runbook for the Solo Advertiser platform operated by a 5-person team.

### 1.1 Scope

| Dimension | Boundary |
|-----------|----------|
| Infrastructure | Single Contabo VPS 6 instance |
| Containerization | Docker 24+ with Docker Compose 2.x |
| CI/CD | GitHub Actions |
| Monitoring | Script-based + health endpoints |
| Backup storage | Cloudflare R2 |
| Team size | 5 operations staff |

### 1.2 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Service identifiers use prefix SVC-NNN (from Document 04).
- Deployment procedure identifiers use prefix DPL-NNN.
- Runbook procedure identifiers use prefix RBK-NNN.

### 1.3 Upstream References

| Document | Relevant Sections |
|----------|-------------------|
| Document 01 | REQ-PRD-205 through REQ-PRD-208, REQ-PRD-225 |
| Document 04 | §2 Architecture Overview, §3 Technology Stack, SVC-001 through SVC-008 |

---

## 2. Infrastructure Specification

### 2.1 Server Configuration

| Specification | Value |
|--------------|-------|
| Provider | Contabo |
| Plan | VPS 6 |
| vCPUs | 6 |
| RAM | 12 GB |
| Storage | 200 GB SSD |
| OS | Ubuntu 22.04 LTS |
| Location | EU (nearest to Nepal with acceptable latency) |
| IPv4 | 1 dedicated |
| Bandwidth | Unlimited (fair use) |

### 2.2 Software Prerequisites

| Software | Version | Purpose |
|----------|---------|---------|
| Docker | 24+ | Container runtime |
| Docker Compose | 2.x | Multi-container orchestration |
| Nginx | Latest stable | Reverse proxy (containerized) |
| UFW | System default | Host-level firewall |
| Fail2ban | Latest | SSH brute-force protection |
| Certbot | N/A | Not needed (Cloudflare handles SSL) |

### 2.3 Network Configuration

| Port | Service | Access |
|------|---------|--------|
| 22 | SSH | Restricted to team IPs only |
| 80 | HTTP | Open (Cloudflare redirect to HTTPS) |
| 443 | HTTPS | Open (via Cloudflare proxy) |
| 5432 | PostgreSQL | Docker internal only (NOT exposed) |
| 6379 | Redis | Docker internal only (NOT exposed) |
| 3000 | Backend API | Docker internal only (Nginx proxies) |
| 3001 | Admin Panel | Docker internal only (Nginx proxies) |
| 3002 | Business Portal | Docker internal only (Nginx proxies) |

### 2.4 DNS and SSL

- Domain: soloadvertiser.com (and subdomains)
- DNS: Managed via Cloudflare
- SSL: Cloudflare Origin Certificate (Full Strict mode)
- Subdomains: api.soloadvertiser.com, admin.soloadvertiser.com, business.soloadvertiser.com

---

## 3. Docker Compose Configuration

### 3.1 Development Configuration (docker-compose.dev.yml)

| Service | Image | Ports (Host) | Resource Limits |
|---------|-------|-------------|-----------------|
| backend | node:20-alpine (dev) | 3000 | None (dev) |
| postgres | postgres:16-alpine | 5432 | None (dev) |
| redis | redis:7-alpine | 6379 | None (dev) |
| worker | node:20-alpine (dev) | — | None (dev) |

Development configuration SHALL:
- Mount source code as volumes for hot-reload
- Use .env.development for environment variables
- Expose database ports for local tooling access
- Skip Nginx (direct port access)
- Include pgAdmin for database inspection

### 3.2 Production Configuration (docker-compose.prod.yml)

| Service | Image | Resource Limits | Restart Policy |
|---------|-------|-----------------|----------------|
| SVC-001: nginx | nginx:stable-alpine | 256MB RAM, 0.5 CPU | always |
| SVC-002: backend | soloadvertiser/backend:tag | 2GB RAM, 2 CPU | always |
| SVC-003: worker | soloadvertiser/worker:tag | 1GB RAM, 1 CPU | always |
| SVC-004: admin | soloadvertiser/admin:tag | 512MB RAM, 0.5 CPU | always |
| SVC-005: business | soloadvertiser/business:tag | 512MB RAM, 0.5 CPU | always |
| SVC-006: postgres | postgres:16-alpine | 4GB RAM, 2 CPU | always |
| SVC-007: redis | redis:7-alpine | 512MB RAM, 0.5 CPU | always |
| SVC-008: cron | soloadvertiser/cron:tag | 512MB RAM, 0.5 CPU | always |

**Total Resource Allocation:** ~9.5GB RAM, 8 CPU shares (within 12GB/6vCPU limits with OS overhead)

### 3.3 Docker Network Configuration

```yaml
networks:
  frontend:
    driver: bridge
    # nginx, backend, admin, business
  backend:
    driver: bridge
    # backend, worker, cron, postgres, redis
```

- Frontend network: Nginx ↔ application containers
- Backend network: Application ↔ database/cache
- No container SHALL be directly exposed to the host network
- Inter-service communication uses Docker DNS (service names)

### 3.4 Volume Configuration

```yaml
volumes:
  postgres_data:
    driver: local
    # Persistent database storage
  redis_data:
    driver: local
    # Redis RDB snapshots
  nginx_logs:
    driver: local
    # Access and error logs
  app_uploads:
    driver: local
    # Temporary upload staging (before R2)
```

---

## 4. CI/CD Pipeline

### 4.1 GitHub Actions Workflow Stages

```
Push/PR → Lint → Test → Build → Push Image → Deploy → Health Check
```

| Stage | Trigger | Timeout | Failure Action |
|-------|---------|---------|---------------|
| Lint | PR opened, push to main | 5 min | Block merge |
| Test | PR opened, push to main | 15 min | Block merge |
| Build | Push to main | 10 min | Alert team |
| Push Image | Build success | 5 min | Alert team |
| Deploy | Image pushed | 10 min | Auto-rollback |
| Health Check | Deploy complete | 2 min | Trigger rollback |

### 4.2 Branch Strategy

| Branch | Purpose | CI Behavior | Deploy Target |
|--------|---------|-------------|--------------|
| main | Production-ready code | Full pipeline + deploy | Production |
| feature/* | Feature development | Lint + Test only | None |
| hotfix/* | Critical fixes | Full pipeline + deploy | Production |

### 4.3 Pipeline Configuration

**Lint Stage:**
- ESLint (TypeScript rules)
- Prettier (format check)
- TypeScript compilation (tsc --noEmit)

**Test Stage:**
- Unit tests (Jest)
- Integration tests (with test database)
- Coverage report generation
- Fail if coverage < 80%

**Build Stage:**
- Docker multi-stage build
- Production dependencies only
- Image tagged with commit SHA + `latest`

**Push Stage:**
- Push to GitHub Container Registry (ghcr.io)
- Retain last 10 image tags

**Deploy Stage:**
- SSH to production server
- Pull latest images
- Docker Compose rolling update
- Database migrations (if any)

### 4.4 Rollback Procedure

**Automatic Rollback Triggers:**
- Health check fails after deploy
- Application returns 5xx on health endpoint
- Container restart loop detected (> 3 restarts in 60s)

**Rollback Steps (DPL-001):**
1. Identify previous working image tag from deployment log
2. Update docker-compose.prod.yml with previous tag
3. Execute `docker compose -f docker-compose.prod.yml up -d`
4. Verify health endpoint returns 200
5. Notify team via configured channel
6. Create incident report

---

## 5. Deployment Procedure

### 5.1 Zero-Downtime Deployment (DPL-002)

1. Pull new Docker images on production server
2. Run database migrations (if needed) — backwards-compatible only
3. Scale up new container alongside existing
4. Health check new container (GET /api/v1/health)
5. Switch Nginx upstream to new container
6. Drain existing container (wait for in-flight requests, max 30s)
7. Remove old container
8. Verify all health endpoints

### 5.2 Database Migration Protocol

- Migrations SHALL be backwards-compatible (additive only)
- New columns SHALL have defaults or be nullable
- Column removals SHALL be deferred to next release (two-phase)
- Migration rollback scripts SHALL be prepared for each migration
- Migrations run BEFORE application container swap

### 5.3 Health Check Specification

**Endpoint:** `GET /api/v1/health`

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.2.3",
  "commit": "abc1234",
  "uptime": 86400,
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "storage": "healthy"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "checks": {
    "database": "unhealthy",
    "redis": "healthy",
    "storage": "healthy"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### 5.4 Deployment Checklist

- [ ] All tests passing on main branch
- [ ] Docker image built and pushed successfully
- [ ] Database backup taken before migration
- [ ] Migration script reviewed and tested
- [ ] Rollback procedure documented for this release
- [ ] Team notified of deployment window
- [ ] Health check passes post-deploy
- [ ] Smoke test of critical paths

---

## 6. Environment Management

### 6.1 Environment Files

| File | Purpose | Stored In |
|------|---------|-----------|
| .env.example | Template with all required keys | Git repository |
| .env.development | Local development values | Local only (gitignored) |
| .env.test | Test environment values | Git (non-sensitive only) |
| .env.production | Production secrets | Server only (GitHub Secrets → deploy) |

### 6.2 Required Environment Variables

| Variable | Service | Example | Secret |
|----------|---------|---------|--------|
| DATABASE_URL | Backend, Worker | postgresql://user:pass@postgres:5432/solo | Yes |
| REDIS_URL | Backend, Worker | redis://redis:6379 | No |
| JWT_PRIVATE_KEY | Backend | RS256 private key (PEM) | Yes |
| JWT_PUBLIC_KEY | Backend | RS256 public key (PEM) | Yes |
| R2_ACCESS_KEY | Backend | Cloudflare R2 key | Yes |
| R2_SECRET_KEY | Backend | Cloudflare R2 secret | Yes |
| R2_BUCKET_NAME | Backend | soloadvertiser-prod | No |
| R2_ENDPOINT | Backend | https://account.r2.cloudflarestorage.com | No |
| FIREBASE_PROJECT_ID | Backend | solo-advertiser-prod | No |
| FIREBASE_PRIVATE_KEY | Backend | Firebase service account key | Yes |
| SMTP_HOST | Backend | smtp.provider.com | No |
| SMTP_PASSWORD | Backend | email service password | Yes |
| OTP_SECRET | Backend | HMAC secret for OTP generation | Yes |
| NODE_ENV | All | production | No |
| LOG_LEVEL | All | info | No |

### 6.3 Secret Management

- Production secrets SHALL be stored in GitHub Secrets
- Secrets are injected during deployment via SSH + environment file generation
- No secrets SHALL be committed to the repository
- No hardcoded IP addresses — Docker service names SHALL be used for internal communication
- Secret rotation procedure: update GitHub Secret → trigger re-deploy

---

## 7. Backup Strategy

### 7.1 PostgreSQL Backup

| Parameter | Value |
|-----------|-------|
| Method | pg_dump (full logical backup) |
| Frequency | Daily at 03:00 UTC |
| Retention: Daily | 7 backups |
| Retention: Weekly | 4 backups (Sunday) |
| Storage | Cloudflare R2 (soloadvertiser-backups bucket) |
| Encryption | AES-256 before upload |
| Compression | gzip |

**Backup Script (DPL-003):**
```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="solo_backup_${TIMESTAMP}.sql.gz"

docker exec postgres pg_dump -U solo_user solo_db | gzip > /tmp/${FILENAME}
# Encrypt and upload to R2
# Cleanup local file
# Verify upload integrity (checksum)
```

### 7.2 Redis Backup

| Parameter | Value |
|-----------|-------|
| Method | RDB snapshots |
| Frequency | Every 6 hours |
| Retention | 24 hours (non-critical cache data) |
| Criticality | LOW — Redis data is reconstructable |

### 7.3 Application Data

| Data Type | Backup Method | Location |
|-----------|---------------|----------|
| User uploads | Already in R2 | Cloudflare R2 (durable) |
| Generated PDFs | Already in R2 | Cloudflare R2 (durable) |
| Logs | Rotated, not backed up | Local only |
| Docker volumes | PostgreSQL backup covers critical data | — |

### 7.4 Recovery Procedures

**Database Restore (RBK-001):**
1. Download backup from R2
2. Decrypt backup file
3. Stop application containers
4. Drop and recreate database
5. Restore: `gunzip -c backup.sql.gz | docker exec -i postgres psql -U solo_user solo_db`
6. Verify row counts against backup manifest
7. Start application containers
8. Verify health endpoints

**Recovery Targets:**

| Metric | Target | Justification |
|--------|--------|--------------|
| RTO (Recovery Time Objective) | < 1 hour | Manual process on single VPS |
| RPO (Recovery Point Objective) | < 24 hours | Daily backup frequency |

---

## 8. Monitoring

### 8.1 Health Endpoint Monitoring

- External uptime monitor (UptimeRobot or similar) SHALL ping `/api/v1/health` every 60 seconds.
- Alert if response time > 5 seconds or status ≠ 200.
- Alert via email + SMS to on-call person.

### 8.2 Container Monitoring

Docker restart policies SHALL be set to `always` for all production containers. Additionally:

| Check | Threshold | Action |
|-------|-----------|--------|
| Container restart count | > 3 in 5 min | Alert team, investigate |
| Container CPU | > 80% sustained 5 min | Alert team |
| Container memory | > 90% of limit | Alert team |

### 8.3 System Resource Monitoring

A monitoring script SHALL run every 5 minutes via cron:

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Disk usage | > 70% | > 85% | Alert + log cleanup |
| RAM usage | > 80% | > 90% | Alert + investigate |
| CPU load average | > 4 (5 min) | > 5 (5 min) | Alert + investigate |
| Swap usage | > 50% | > 80% | Alert (indicates RAM pressure) |
| Postgres connections | > 80 | > 95 | Alert + pool check |

### 8.4 Structured Logging

All application services SHALL output logs as JSON to stdout:

```json
{
  "timestamp": "2024-01-15T10:00:00.000Z",
  "level": "info",
  "service": "backend",
  "correlationId": "uuid-v4",
  "message": "Request completed",
  "method": "POST",
  "path": "/api/v1/campaigns",
  "statusCode": 201,
  "duration": 145,
  "userId": "uuid"
}
```

### 8.5 Correlation ID Tracing

- Every inbound request SHALL be assigned a correlation ID (UUID v4).
- The correlation ID SHALL be propagated to all downstream operations (DB queries, queue jobs, external calls).
- Log entries SHALL include the correlation ID for distributed tracing.
- Response header: `X-Correlation-Id: uuid`

### 8.6 Log Retention

| Log Type | Retention | Storage |
|----------|-----------|---------|
| Application logs | 30 days | Docker log rotation (10MB × 5 files) |
| Nginx access logs | 30 days | Volume with rotation |
| Nginx error logs | 90 days | Volume with rotation |
| Audit logs | 3 years | PostgreSQL (never deleted) |

---

## 9. Operational Runbook

### 9.1 Daily Checks (RBK-002)

The on-duty operations staff SHALL perform daily:

| # | Check | Expected | If Failed |
|---|-------|----------|-----------|
| 1 | Health endpoint status | 200 OK | Investigate containers |
| 2 | Disk usage | < 70% | Run cleanup script |
| 3 | Backup completion | Today's backup exists in R2 | Re-run backup manually |
| 4 | Container status | All 8 containers running | Restart failed container |
| 5 | Error log review | No CRITICAL entries | Escalate to developer |
| 6 | Reconciliation status | No discrepancies | Escalate to Finance Staff |

### 9.2 Common Issues and Resolutions

| Issue | Symptoms | Resolution |
|-------|----------|------------|
| Database connection pool exhausted | 503 errors, health check fails on DB | Restart backend container; check for connection leaks |
| Redis memory full | Queue jobs failing | Flush non-critical cache; check memory policy |
| Disk full | Write failures, backup fails | Remove old Docker images: `docker system prune`; rotate logs |
| Container OOM killed | Container restarts repeatedly | Check for memory leaks; increase limit if justified |
| SSL certificate issue | Browser security warnings | Verify Cloudflare origin certificate; re-issue if expired |
| Slow API responses | p95 > 500ms | Check PostgreSQL slow query log; verify indexes |

### 9.3 Escalation Procedures

| Level | Condition | Responder | SLA |
|-------|-----------|-----------|-----|
| L1 | Non-critical alerts | On-duty Ops Staff | 4 hours |
| L2 | Service degradation | Senior Ops + Developer | 1 hour |
| L3 | Full outage | All team + external if needed | 15 minutes |

### 9.4 Maintenance Windows

- **Scheduled:** Sundays 02:00-04:00 NPT (UTC+5:45)
- **Duration:** Maximum 2 hours
- **Notification:** 48 hours advance notice to all users
- **Activities:** OS updates, Docker updates, major deployments, database maintenance
- **Emergency:** No window required; immediate action with post-incident review

---

## 10. Disaster Recovery

### 10.1 Disaster Scenarios

| Scenario | Probability | Impact | Recovery Strategy |
|----------|-------------|--------|-------------------|
| VPS hardware failure | Low | Total outage | New VPS + restore from backup |
| Data corruption | Low | Data loss risk | Restore from latest backup |
| Security breach | Medium | Data exposure | Isolate, assess, restore clean |
| Accidental deletion | Medium | Partial data loss | Point-in-time restore from backup |
| DDoS attack | Medium | Service unavailable | Cloudflare mitigation (automatic) |

### 10.2 Full System Restore Procedure (DPL-004)

**RTO Target: < 1 hour**

| Step | Action | Time Estimate |
|------|--------|---------------|
| 1 | Provision new VPS (if needed) | 15 min |
| 2 | Install Docker + Docker Compose | 5 min |
| 3 | Clone deployment repository | 2 min |
| 4 | Download latest backup from R2 | 5 min |
| 5 | Restore database | 10 min |
| 6 | Pull Docker images from registry | 5 min |
| 7 | Deploy with docker-compose.prod.yml | 3 min |
| 8 | Verify health endpoints | 2 min |
| 9 | Update DNS (if IP changed) | 5 min (+ propagation) |
| 10 | Verify end-to-end functionality | 5 min |

**Total Estimated Recovery Time: ~57 minutes**

### 10.3 Recovery Validation

After restore, the following SHALL be verified:
- Health endpoint returns 200 with all checks healthy
- User login functional (JWT issuance)
- Database row counts match backup manifest (±1 day of data)
- File uploads accessible (R2 independent of VPS)
- Cron jobs executing on schedule
- WebSocket connections establishing

---

## 11. Traceability Matrix

| Specification Element | Upstream Reference |
|----------------------|-------------------|
| Docker containerization | REQ-PRD-225, ARCH-002 |
| Single VPS deployment | REQ-PRD-205 |
| CI/CD pipeline | REQ-PRD-206 |
| Health monitoring | REQ-PRD-207 |
| Backup strategy | REQ-PRD-208 |
| Modular monolith deployment | REQ-PRD-221, ARCH-001 |
| Zero-downtime deployment | REQ-PRD-206 |
| Structured logging | REQ-PRD-207 |

---

*End of Document 15*
