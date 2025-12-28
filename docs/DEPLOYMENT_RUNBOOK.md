# YETO Platform - Deployment Runbook

## دليل النشر | Deployment Guide

This document provides comprehensive procedures for deploying the YETO (Yemen Economic Transparency Observatory) platform across all environments.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Development Deployment](#development-deployment)
5. [Staging Deployment](#staging-deployment)
6. [Production Deployment](#production-deployment)
7. [DNS Configuration](#dns-configuration)
8. [TLS/SSL Setup](#tlsssl-setup)
9. [Database Migrations](#database-migrations)
10. [Rollback Procedures](#rollback-procedures)
11. [Health Checks](#health-checks)
12. [Troubleshooting](#troubleshooting)

---

## Overview

YETO uses a containerized deployment architecture with the following components:

| Component | Technology | Purpose |
|-----------|------------|---------|
| Application | Node.js 22 + Express | API and SSR |
| Database | MySQL 8.0 / TiDB | Primary data store |
| Cache | Redis 7 | Session and query cache |
| Reverse Proxy | Traefik | TLS termination, routing |
| Storage | S3-compatible | File and document storage |

### Deployment Environments

| Environment | Domain | Purpose |
|-------------|--------|---------|
| Development | localhost:3000 | Local development |
| Staging | staging.yeto.causewaygrp.com | Pre-production testing |
| Production | yeto.causewaygrp.com | Live platform |

---

## Prerequisites

### Required Software

```bash
# Node.js 22.x
node --version  # Should be v22.x.x

# pnpm 9.x
pnpm --version  # Should be 9.x.x

# Docker & Docker Compose
docker --version
docker compose version

# Git
git --version
```

### Required Access

- SSH access to deployment servers (staging/production)
- Database credentials
- S3 storage credentials
- OAuth provider configuration
- DNS management access (for domain configuration)

---

## Environment Configuration

### Environment Files

| File | Purpose |
|------|---------|
| `.env` | Active environment (auto-selected) |
| `.env.example` | Template with all variables |
| `.env.development` | Development overrides |
| `.env.staging` | Staging configuration |
| `.env.production` | Production configuration |

### Required Environment Variables

```bash
# Core Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=mysql://user:password@host:3306/database

# Authentication
JWT_SECRET=<secure-random-string-min-32-chars>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login
VITE_APP_ID=<your-app-id>

# Owner Information
OWNER_OPEN_ID=<owner-open-id>
OWNER_NAME=<owner-name>

# Application Branding
VITE_APP_TITLE=YETO
VITE_APP_LOGO=/yeto-logo.svg

# API Keys
BUILT_IN_FORGE_API_URL=<forge-api-url>
BUILT_IN_FORGE_API_KEY=<forge-api-key>
VITE_FRONTEND_FORGE_API_KEY=<frontend-forge-key>
VITE_FRONTEND_FORGE_API_URL=<frontend-forge-url>

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=<analytics-endpoint>
VITE_ANALYTICS_WEBSITE_ID=<website-id>

# Production Only
DOMAIN=yeto.causewaygrp.com
ACME_EMAIL=admin@causewaygrp.com
```

### Generating Secure Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate database password
openssl rand -base64 24
```

---

## Development Deployment

### Quick Start

```bash
# Clone repository
git clone https://github.com/MaherFSF/yeto-platform.git
cd yeto-platform

# Run bootstrap script
./scripts/bootstrap_dev.sh

# Or manually:
pnpm install
cp .env.example .env
# Edit .env with your configuration
pnpm dev
```

### With Docker Services

```bash
# Start with local database and cache
./scripts/bootstrap_dev.sh --with-docker

# Or manually:
docker compose up -d db redis
pnpm dev
```

### Verification

```bash
# Check application
curl http://localhost:3000/api/trpc/monitoring.getLiveness

# Run tests
pnpm test

# Type check
pnpm typecheck
```

---

## Staging Deployment

### Prerequisites Checklist

- [ ] Staging server provisioned (min 4GB RAM, 2 vCPU)
- [ ] Docker and Docker Compose installed on server
- [ ] `.env.staging` configured with staging values
- [ ] SSH access configured

### Deployment Steps

```bash
# 1. Run staging bootstrap
./scripts/bootstrap_staging.sh

# For remote deployment:
./scripts/bootstrap_staging.sh --remote user@staging-server

# 2. Verify deployment
curl https://staging.yeto.causewaygrp.com/api/trpc/monitoring.getHealth
```

### Staging-Specific Configuration

```bash
# .env.staging
NODE_ENV=staging
DOMAIN=staging.yeto.causewaygrp.com
VITE_APP_TITLE=YETO (Staging)

# Use staging database
DATABASE_URL=mysql://yeto:password@db:3306/yeto_staging
```

---

## Production Deployment

### Pre-Deployment Checklist

| Check | Command | Expected |
|-------|---------|----------|
| Type check | `pnpm typecheck` | No errors |
| Tests | `pnpm test` | All pass |
| Security audit | `pnpm audit` | No high/critical |
| Build | `pnpm build` | Success |
| Staging verified | Manual | All features work |

### Deployment Steps

```bash
# 1. Ensure all checks pass
pnpm typecheck && pnpm test && pnpm build

# 2. Run production bootstrap
./scripts/bootstrap_prod.sh

# 3. Monitor deployment
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# 4. Verify health
curl https://yeto.causewaygrp.com/api/trpc/monitoring.getHealth
```

### Zero-Downtime Deployment

For zero-downtime deployments, use rolling updates:

```bash
# Scale up new version
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale web=2 --no-recreate

# Wait for new container to be healthy
sleep 30

# Remove old container
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale web=1
```

---

## DNS Configuration

### Required DNS Records

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | yeto | `<server-ip>` | 300 |
| A | staging.yeto | `<staging-ip>` | 300 |
| CNAME | www.yeto | yeto.causewaygrp.com | 300 |
| TXT | _dmarc.yeto | `v=DMARC1; p=quarantine` | 3600 |

### DNS Propagation Check

```bash
# Check A record
dig yeto.causewaygrp.com A

# Check from multiple locations
curl -s "https://dns.google/resolve?name=yeto.causewaygrp.com&type=A" | jq
```

---

## TLS/SSL Setup

### Automatic (Let's Encrypt via Traefik)

Traefik automatically obtains and renews certificates:

```yaml
# docker-compose.prod.yml
traefik:
  command:
    - "--certificatesresolvers.letsencrypt.acme.email=admin@causewaygrp.com"
    - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
```

### Manual Certificate Installation

```bash
# Create certificate directory
mkdir -p /opt/yeto/certs

# Copy certificates
cp fullchain.pem /opt/yeto/certs/
cp privkey.pem /opt/yeto/certs/

# Update Traefik configuration
# traefik/dynamic/certs.yml
tls:
  certificates:
    - certFile: /certs/fullchain.pem
      keyFile: /certs/privkey.pem
```

### Certificate Verification

```bash
# Check certificate
openssl s_client -connect yeto.causewaygrp.com:443 -servername yeto.causewaygrp.com < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Check SSL grade
curl -s "https://api.ssllabs.com/api/v3/analyze?host=yeto.causewaygrp.com" | jq '.endpoints[0].grade'
```

---

## Database Migrations

### Running Migrations

```bash
# Development
pnpm db:push

# Production (via Docker)
docker compose exec web pnpm db:push

# View current schema
pnpm db:studio
```

### Migration Safety

1. **Always backup before migrations**:
```bash
docker compose exec db mysqldump -u yeto -p yeto > backup-$(date +%Y%m%d).sql
```

2. **Test migrations on staging first**

3. **Use transactions for data migrations**

### Rollback Migration

```bash
# Restore from backup
docker compose exec -T db mysql -u yeto -p yeto < backup-YYYYMMDD.sql
```

---

## Rollback Procedures

### Application Rollback

```bash
# List available backups
ls -la /opt/yeto/backups/

# Rollback to specific version
./scripts/bootstrap_prod.sh --rollback yeto-v1.0.0-20241228-120000
```

### Database Rollback

```bash
# Stop application
docker compose stop web

# Restore database
gunzip -c /opt/yeto/backups/yeto-v1.0.0-db.sql.gz | docker compose exec -T db mysql -u yeto -p yeto

# Restart application
docker compose start web
```

### Full System Rollback

```bash
# 1. Stop all services
docker compose down

# 2. Restore application files
cp -r /opt/yeto/backups/yeto-v1.0.0/* /opt/yeto/

# 3. Restore database
gunzip -c /opt/yeto/backups/yeto-v1.0.0-db.sql.gz | docker compose exec -T db mysql -u yeto -p yeto

# 4. Start services
docker compose up -d
```

---

## Health Checks

### Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/api/trpc/monitoring.getLiveness` | Kubernetes liveness | `{"alive": true}` |
| `/api/trpc/monitoring.getReadiness` | Kubernetes readiness | `{"ready": true}` |
| `/api/trpc/monitoring.getHealth` | Full health status | Health object |

### Monitoring Commands

```bash
# Quick health check
curl -sf http://localhost:3000/api/trpc/monitoring.getLiveness && echo "OK" || echo "FAIL"

# Detailed health
curl -s http://localhost:3000/api/trpc/monitoring.getHealth | jq

# Container health
docker compose ps
docker compose logs --tail=50 web
```

### Automated Health Monitoring

```bash
# Add to crontab
*/5 * * * * curl -sf https://yeto.causewaygrp.com/api/trpc/monitoring.getLiveness || echo "YETO DOWN" | mail -s "Alert" admin@causewaygrp.com
```

---

## Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check logs
docker compose logs web

# Common causes:
# - Missing environment variables
# - Database connection failed
# - Port already in use

# Fix: Verify .env and database connectivity
docker compose exec web env | grep DATABASE
docker compose exec web nc -zv db 3306
```

#### Database Connection Failed

```bash
# Test database connectivity
docker compose exec db mysqladmin ping -h localhost

# Check credentials
docker compose exec db mysql -u yeto -p -e "SELECT 1"

# Check network
docker network inspect yeto-network
```

#### SSL Certificate Issues

```bash
# Check certificate status
docker compose exec traefik cat /letsencrypt/acme.json | jq

# Force certificate renewal
docker compose restart traefik

# Check Traefik logs
docker compose logs traefik
```

#### High Memory Usage

```bash
# Check container stats
docker stats

# Restart with memory limits
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Log Locations

| Log | Location | Command |
|-----|----------|---------|
| Application | Container stdout | `docker compose logs web` |
| Database | Container stdout | `docker compose logs db` |
| Traefik | Container stdout | `docker compose logs traefik` |
| System | `/var/log/syslog` | `tail -f /var/log/syslog` |

### Support Contacts

- **Technical Issues**: yeto@causewaygrp.com
- **Security Issues**: security@causewaygrp.com
- **Emergency**: See INCIDENT_RESPONSE.md

---

## Appendix

### Quick Reference Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Restart specific service
docker compose restart web

# Shell into container
docker compose exec web sh

# Database shell
docker compose exec db mysql -u yeto -p

# Run migrations
docker compose exec web pnpm db:push

# Create backup
./scripts/backup.sh

# Deploy to production
./scripts/bootstrap_prod.sh
```

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-28 | Initial release |

---

*Last updated: December 28, 2024*
