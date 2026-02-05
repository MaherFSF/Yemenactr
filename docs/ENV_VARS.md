# YETO Platform - Environment Variables Inventory

**Generated:** 2026-02-04  
**Purpose:** Complete inventory of all environment variables used in YETO  
**Status:** ✅ Verified from codebase

---

## Table of Contents

1. [Required Variables](#required-variables)
2. [Optional Variables](#optional-variables)
3. [Service-Specific Variables](#service-specific-variables)
4. [Development vs Production](#development-vs-production)
5. [Variable Usage by Subsystem](#variable-usage-by-subsystem)
6. [Quick Setup Guide](#quick-setup-guide)

---

## Required Variables

These variables MUST be set for the application to function.

### Core Application

| Variable | Description | Required For | Default | File Reference |
|----------|-------------|--------------|---------|----------------|
| `DATABASE_URL` | MySQL connection string | All | None | `/server/_core/env.ts` line 4<br>`/drizzle.config.ts` line 3 |
| `JWT_SECRET` | Secret for JWT token signing | Authentication | None | `/server/_core/env.ts` line 3<br>`/docker-compose.yml` line 35 |
| `NODE_ENV` | Runtime environment | All | `development` | `/server/_core/env.ts` line 7<br>`/server/_core/index.ts` line 49 |

**DATABASE_URL Format:**
```
mysql://username:password@host:port/database

Examples:
- Local: mysql://yeto:yeto_password@localhost:3306/yeto
- Docker: mysql://yeto:yeto_password@db:3306/yeto
- Production: mysql://user:pass@prod-host.com:3306/yeto_prod
```

**File References:**
- Used in: `/server/db.ts` lines 30, 34, 36
- Used in: `/server/_core/context.ts` lines 10, 13
- Used in: `/server/routers/entities.ts` line 17, 20
- Used in: All scripts: `/scripts/*.ts` (50+ files)

**JWT_SECRET:**
- Must be a strong random string (minimum 32 characters recommended)
- Used for: Cookie signing, session management
- Security: Change in production, never commit to git
- Reference: `/server/_core/env.ts` line 3

---

## Optional Variables

These variables enable specific features but are not required for basic operation.

### Server Configuration

| Variable | Description | Default | File Reference |
|----------|-------------|---------|----------------|
| `PORT` | Server port | `3000` | `/server/_core/index.ts` line 55 |

**Note:** If port is unavailable, server auto-selects next available port (lines 23-30 in `/server/_core/index.ts`).

### OAuth & Authentication

| Variable | Description | Required For | Default | File Reference |
|----------|-------------|--------------|---------|----------------|
| `OAUTH_SERVER_URL` | OAuth provider URL | OAuth login | `""` | `/server/_core/env.ts` line 5 |
| `OWNER_OPEN_ID` | Platform owner's OpenID | Admin access | `""` | `/server/_core/env.ts` line 6 |
| `VITE_APP_ID` | Application identifier | OAuth flow | `""` | `/server/_core/env.ts` line 2 |

**Usage:**
- OAuth routes: `/server/_core/oauth.ts`
- Authentication: `/server/_core/context.ts`

### AI / LLM Integration

| Variable | Description | Required For | Default | File Reference |
|----------|-------------|--------------|---------|----------------|
| `AI_API_KEY` | API key for AI provider | AI Assistant | `""` | `/agentos/runtime/adapters/openai/adapter.ts` line 34 |
| `AI_API_URL` | AI API endpoint | AI Assistant | `https://api.openai.com/v1` | `/agentos/runtime/adapters/openai/adapter.ts` line 35 |
| `AI_MODEL` | LLM model name | AI Assistant | `gpt-4o` | `/agentos/runtime/adapters/openai/adapter.ts` line 36 |
| `AI_EMBED_MODEL` | Embedding model | Vector embeddings | `text-embedding-3-small` | `/agentos/runtime/adapters/openai/adapter.ts` line 37 |

**Compatible Providers:**
- OpenAI
- Azure OpenAI
- Any OpenAI-compatible endpoint (e.g., vLLM, Ollama, LocalAI)

**Used In:**
- AI Assistant: `/client/src/pages/AIAssistantEnhanced.tsx`
- Research Assistant: `/client/src/pages/ResearchAssistant.tsx`
- One Brain system: `/server/ml/core/oneBrainDirective.ts`

### Storage / S3

| Variable | Description | Required For | Default | File Reference |
|----------|-------------|--------------|---------|----------------|
| `BUILT_IN_FORGE_API_URL` | Storage proxy API URL | File storage | None | `/server/_core/env.ts` line 8<br>`/server/storage.ts` line 9 |
| `BUILT_IN_FORGE_API_KEY` | Storage proxy API key | File storage | None | `/server/_core/env.ts` line 9<br>`/server/storage.ts` line 10 |
| `S3_ENDPOINT` | S3 endpoint URL | Direct S3 access | `http://minio:9000` | `/docker-compose.yml` line 30 |
| `S3_ACCESS_KEY` | S3 access key | Direct S3 access | `minioadmin` | `/docker-compose.yml` line 31 |
| `S3_SECRET_KEY` | S3 secret key | Direct S3 access | `minioadmin` | `/docker-compose.yml` line 32 |
| `S3_BUCKET` | S3 bucket name | Direct S3 access | `yeto-storage` | `/docker-compose.yml` line 33 |

**Storage Architecture:**
- The platform uses a dual storage system:
  1. **Built-in Forge** (preferred): Proxy-based storage via `BUILT_IN_FORGE_*` variables
  2. **Direct S3** (optional): MinIO or AWS S3 via `S3_*` variables

**File References:**
- Storage service: `/server/services/s3StorageService.ts`
- Storage helpers: `/server/storage.ts` lines 1-103
- Storage prefixes: `/server/services/s3StorageService.ts` lines 21-31

### Cache / Redis

| Variable | Description | Required For | Default | File Reference |
|----------|-------------|--------------|---------|----------------|
| `REDIS_URL` | Redis connection URL | Caching | `redis://redis:6379` | `/docker-compose.yml` line 29 |

**Format:**
```
redis://[username:password@]host:port[/database]

Examples:
- Local: redis://localhost:6379
- Docker: redis://redis:6379
- Auth: redis://user:pass@host:6379/0
```

**Used For:**
- Session storage
- Cache layer
- Rate limiting (if implemented)

### Search / OpenSearch

| Variable | Description | Required For | Default | File Reference |
|----------|-------------|--------------|---------|----------------|
| `OPENSEARCH_URL` | OpenSearch endpoint | Full-text search | `http://opensearch:9200` | `/docker-compose.yml` line 34 |

**Used For:**
- Research library full-text search
- Document indexing
- Search autocomplete

**OpenSearch Configuration:**
- Single-node mode (development)
- Security plugin disabled (enable in production)
- Dashboard available on port 5601 (debug profile)
- Reference: `/docker-compose.yml` lines 135-180

### Analytics

| Variable | Description | Required For | Default | File Reference |
|----------|-------------|--------------|---------|----------------|
| `VITE_ANALYTICS_ENDPOINT` | Analytics service URL | Usage tracking | None | `/client/index.html` line 33 |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics site ID | Usage tracking | None | `/client/index.html` line 34 |

**Used In:**
- Client HTML: `/client/index.html` lines 33-34
- Analytics provider: Umami (self-hosted)

**Note:** These are Vite environment variables (prefixed with `VITE_`) and are exposed to the browser.

---

## Service-Specific Variables

### Data Ingestion Connectors

Most connectors use public APIs and don't require API keys. The following are exceptions:

| Connector | Variable | Required | Notes | File Reference |
|-----------|----------|----------|-------|----------------|
| ACLED | `ACLED_API_KEY` | Yes* | Conflict data | `/server/connectors/acledConnector.ts` |
| HDX HAPI | `HDX_API_KEY` | Optional | Humanitarian data | `/server/connectors/hdxCkanConnector.ts` |

*Note: ACLED is currently marked as `status: 'blocked'` in connector registry due to requiring API key. Reference: `/server/connectors/index.ts` line 846.

**Public API Connectors (No Key Required):**
- World Bank
- IMF
- FAO
- OCHA FTS
- ReliefWeb
- IATI
- UNHCR
- WHO
- UNICEF
- WFP
- UNDP
- Central Bank of Yemen (Aden & Sana'a)

**Reference:** `/server/connectors/index.ts` lines 785-867

### Docker Compose Defaults

Docker Compose sets these for local development:

| Variable | Default Value | Service | File Reference |
|----------|---------------|---------|----------------|
| `MYSQL_ROOT_PASSWORD` | `root_password` | MySQL | `/docker-compose.yml` line 63 |
| `MYSQL_DATABASE` | `yeto` | MySQL | `/docker-compose.yml` line 64 |
| `MYSQL_USER` | `yeto` | MySQL | `/docker-compose.yml` line 65 |
| `MYSQL_PASSWORD` | `yeto_password` | MySQL | `/docker-compose.yml` line 66 |
| `MINIO_ROOT_USER` | `minioadmin` | MinIO | `/docker-compose.yml` line 104 |
| `MINIO_ROOT_PASSWORD` | `minioadmin` | MinIO | `/docker-compose.yml` line 105 |

**Security Warning:** Change these defaults in production!

---

## Development vs Production

### Development Environment

**Minimum Required:**
```bash
DATABASE_URL=mysql://yeto:yeto_password@localhost:3306/yeto
JWT_SECRET=dev-jwt-secret-change-in-production
NODE_ENV=development
```

**Recommended (with all services):**
```bash
# Core
DATABASE_URL=mysql://yeto:yeto_password@localhost:3306/yeto
JWT_SECRET=dev-jwt-secret-change-in-production
NODE_ENV=development
PORT=3000

# Storage (if using Forge proxy)
BUILT_IN_FORGE_API_URL=https://api.example.com
BUILT_IN_FORGE_API_KEY=your-api-key

# OR Direct S3 (if using MinIO/S3)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=yeto-storage

# Cache
REDIS_URL=redis://localhost:6379

# Search
OPENSEARCH_URL=http://localhost:9200

# AI (optional)
AI_API_KEY=sk-...
AI_API_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o
AI_EMBED_MODEL=text-embedding-3-small
```

**Development Mode Features:**
- Vite HMR (Hot Module Replacement) - Reference: `/server/_core/vite.ts` line 52
- Auto-restart on server changes via `tsx watch`
- Verbose logging
- Auto-port selection if 3000 is busy

### Production Environment

**Required:**
```bash
DATABASE_URL=mysql://prod_user:strong_password@prod-host:3306/yeto_prod
JWT_SECRET=<STRONG_RANDOM_STRING_64_CHARS>
NODE_ENV=production
PORT=3000

# Storage
BUILT_IN_FORGE_API_URL=https://storage.production.com
BUILT_IN_FORGE_API_KEY=<PRODUCTION_API_KEY>

# OR S3
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=<AWS_ACCESS_KEY>
S3_SECRET_KEY=<AWS_SECRET_KEY>
S3_BUCKET=yeto-production

# Cache
REDIS_URL=redis://prod-redis:6379

# Search
OPENSEARCH_URL=https://opensearch.production.com:9200

# AI
AI_API_KEY=<PRODUCTION_API_KEY>
AI_API_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o
AI_EMBED_MODEL=text-embedding-3-small

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.yourdomain.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

**Production Mode Features:**
- Static file serving from `/dist/public`
- Minified assets
- Optimized build
- Production logging level
- Reference: `/server/_core/index.ts` lines 49-53

**Production Checklist:**
- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Change all default passwords
- [ ] Use SSL/TLS for all connections
- [ ] Enable OpenSearch security plugin
- [ ] Set up database backups
- [ ] Configure monitoring and alerts
- [ ] Use environment-specific API keys
- [ ] Never log sensitive data

---

## Variable Usage by Subsystem

### Core Server

**Used by:** `/server/_core/index.ts`, `/server/_core/env.ts`

```bash
NODE_ENV          # Runtime mode
PORT              # Server port
DATABASE_URL      # Database connection
JWT_SECRET        # Auth signing
```

**Critical for:** Server startup, authentication, database access

### Database Layer

**Used by:** `/server/db.ts`, `/drizzle.config.ts`, all `/server/routers/*.ts`

```bash
DATABASE_URL      # MySQL connection
```

**Critical for:** All data operations, ORM queries, migrations

**Note:** Used in 50+ files across the codebase. Search pattern: `process.env.DATABASE_URL`

### Authentication

**Used by:** `/server/_core/context.ts`, `/server/_core/oauth.ts`, `/server/_core/cookies.ts`

```bash
JWT_SECRET        # Token signing
OAUTH_SERVER_URL  # OAuth provider
OWNER_OPEN_ID     # Admin identification
VITE_APP_ID       # OAuth client ID
```

**Critical for:** User login, session management, admin access

### Storage System

**Used by:** `/server/storage.ts`, `/server/services/s3StorageService.ts`

```bash
# Option A: Forge Proxy (preferred)
BUILT_IN_FORGE_API_URL
BUILT_IN_FORGE_API_KEY

# Option B: Direct S3
S3_ENDPOINT
S3_ACCESS_KEY
S3_SECRET_KEY
S3_BUCKET
```

**Critical for:** Document uploads, asset storage, backups

**Storage Prefixes:**
- `documents/` - PDFs, reports
- `raw-data/` - Ingestion payloads
- `processed-data/` - Normalized data
- `exports/` - User exports
- `logs/` - Application logs
- `backups/` - Database backups
- `assets/` - Media files
- `temp/` - Temporary files

**Reference:** `/server/services/s3StorageService.ts` lines 21-31

### AI / ML System

**Used by:** `/agentos/runtime/adapters/openai/adapter.ts`, `/server/ml/core/*.ts`

```bash
AI_API_KEY        # API authentication
AI_API_URL        # API endpoint
AI_MODEL          # LLM model
AI_EMBED_MODEL    # Embedding model
```

**Critical for:** AI Assistant, research analysis, evidence synthesis

**AI Features:**
- General AI Assistant (`/ai-assistant`)
- Research Assistant (`/research-assistant`)
- One Brain intelligence system
- Automatic evidence packs
- Document summarization

### Data Ingestion

**Used by:** `/server/connectors/*.ts`, `/server/init-scheduler.ts`

```bash
# Most connectors use public APIs
# Exceptions:
ACLED_API_KEY     # Conflict data (if enabled)
HDX_API_KEY       # Humanitarian data (optional)
```

**Critical for:** Automated data updates, connector health

**Scheduler:**
- Initializes on server startup
- Runs every 5 minutes
- Reference: `/server/_core/index.ts` lines 65-84

### Frontend / Vite

**Used by:** `/client/index.html`, Vite build process

```bash
VITE_ANALYTICS_ENDPOINT     # Analytics service
VITE_ANALYTICS_WEBSITE_ID   # Analytics ID
```

**Note:** `VITE_*` variables are:
- Exposed to browser (public)
- Replaced at build time
- Should NOT contain secrets

**Reference:** `/client/index.html` lines 33-34

### Testing

**Used by:** `/playwright.config.ts`

```bash
BASE_URL          # E2E test base URL (default: http://localhost:3000)
CI                # CI environment flag
```

**Reference:** `/playwright.config.ts` lines 15-32

---

## Quick Setup Guide

### 1. Create .env File

```bash
# Copy from example (if exists)
cp .env.example .env

# Or create new
touch .env
```

### 2. Minimum Development Setup

```bash
# .env
DATABASE_URL=mysql://yeto:yeto_password@localhost:3306/yeto
JWT_SECRET=dev-secret-change-in-production
NODE_ENV=development
```

### 3. Start Docker Services (Optional)

```bash
# Start all services
docker-compose up -d

# Or just database
docker-compose up -d db

# Check status
docker-compose ps
```

**Note:** Docker Compose automatically sets most environment variables.  
**Reference:** `/docker-compose.yml` lines 26-40

### 4. Verify Configuration

```bash
# Check database connection
pnpm run db:push

# Start dev server
pnpm run dev

# Server should start on http://localhost:3000
```

### 5. Add Optional Services

As needed, add:
- Redis for caching
- MinIO for storage
- OpenSearch for full-text search
- AI credentials for AI features
- Analytics for tracking

---

## Security Best Practices

### Secret Management

1. **Never commit secrets to git**
   - Add `.env` to `.gitignore` (already done)
   - Use `.env.example` for documentation only

2. **Use strong secrets**
   - JWT_SECRET: minimum 64 characters, cryptographically random
   - Database passwords: 16+ characters
   - API keys: as provided by service

3. **Rotate secrets regularly**
   - JWT_SECRET: every 90 days
   - Database passwords: every 180 days
   - API keys: per provider recommendations

4. **Environment-specific secrets**
   - Different secrets for dev/staging/prod
   - Never use dev secrets in production
   - Never use prod secrets in development

### Production Hardening

```bash
# Production JWT_SECRET generation (example)
openssl rand -base64 64

# Example output:
# JWT_SECRET=xK9mP...64_chars...zT2nQ
```

**Production Security:**
- Use SSL/TLS for all connections
- Enable database encryption at rest
- Use VPC/private networks
- Enable audit logging
- Set up secret rotation
- Use secret management service (AWS Secrets Manager, HashiCorp Vault, etc.)

**Reference:** `/server/hardening/security.ts`

---

## Troubleshooting

### Database Connection Issues

**Error:** `DATABASE_URL is required`

**Solution:**
```bash
# Check .env file exists
ls -la .env

# Verify DATABASE_URL is set
grep DATABASE_URL .env

# Test connection
mysql -h localhost -u yeto -p
```

**Reference:** `/drizzle.config.ts` lines 3-6

### JWT Secret Missing

**Error:** Cookie/auth errors

**Solution:**
```bash
# Add to .env
JWT_SECRET=your-secret-here

# Or for quick dev:
JWT_SECRET=dev-secret-change-in-production
```

### Storage Not Working

**Error:** File upload fails

**Check:**
1. Is `BUILT_IN_FORGE_API_URL` set? (preferred)
2. Or are `S3_*` variables set?
3. Is MinIO running? `docker-compose ps minio`

**Reference:** `/server/storage.ts` lines 8-19

### AI Features Not Working

**Error:** AI Assistant returns errors

**Check:**
```bash
# Verify AI variables are set
echo $AI_API_KEY
echo $AI_API_URL

# Test API endpoint
curl -H "Authorization: Bearer $AI_API_KEY" $AI_API_URL/models
```

**Reference:** `/agentos/runtime/adapters/openai/adapter.ts` lines 34-50

---

## Environment Variable Checklist

Use this checklist to ensure proper configuration:

### Development
- [ ] `DATABASE_URL` set
- [ ] `JWT_SECRET` set (dev secret OK)
- [ ] `NODE_ENV=development`
- [ ] Database accessible (test with `pnpm run db:push`)
- [ ] Server starts successfully (`pnpm run dev`)

### Production
- [ ] `DATABASE_URL` set (production database)
- [ ] `JWT_SECRET` set (strong random secret, 64+ chars)
- [ ] `NODE_ENV=production`
- [ ] Storage configured (`BUILT_IN_FORGE_*` or `S3_*`)
- [ ] Redis configured (if using caching)
- [ ] OpenSearch configured (if using search)
- [ ] AI configured (if using AI features)
- [ ] Analytics configured (if tracking usage)
- [ ] All secrets rotated from development
- [ ] Database backups configured
- [ ] SSL/TLS enabled

---

## Related Documentation

- **Setup Guide:** [ENGINEERING_BASELINE.md](./ENGINEERING_BASELINE.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Deployment:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Security:** [SECURITY.md](./SECURITY.md)

---

## Changelog

- **2026-02-04:** Initial comprehensive environment variable inventory
  - Verified all variables from source code
  - Added file references for every variable
  - Documented development vs production requirements
  - Added security best practices
