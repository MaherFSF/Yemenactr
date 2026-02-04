# ENVIRONMENT VARIABLES INVENTORY

**Repository:** YETO Platform (Yemen Economic Transparency Observatory)  
**Audit Date:** February 4, 2026  
**Auditor:** Lead Engineer Onboarding  
**Branch:** cursor/repo-baseline-audit-3194

---

## Executive Summary

This document provides a comprehensive inventory of all environment variables used throughout the YETO platform. Each variable includes:
- Variable name
- Purpose/description
- Required for which environments (dev/prod)
- Which subsystem(s) use it
- File references where it's accessed

**Total Variables Identified:** 23

---

## Core Application Variables

### DATABASE_URL

**Purpose:** MySQL connection string for database access  
**Format:** `mysql://user:password@host:port/database`  
**Required:** ✅ Dev, ✅ Prod  
**Used By:** ORM, migrations, connectors, services, scripts

**References:**
- `/workspace/server/_core/env.ts:4` - Centralized config
- `/workspace/drizzle.config.ts:3` - Drizzle migrations
- `/workspace/server/db.ts:30` - Drizzle ORM initialization
- `/workspace/server/_core/context.ts:10` - Connection pooling
- `/workspace/server/routers/entities.ts:17` - Entity queries
- `/workspace/server/services/bankingKnowledgeBase.ts:39,86,123,167,242` - Banking services
- `/workspace/server/connectors/bankingDocuments.ts:258,357,450` - Banking connectors
- All scripts in `/workspace/scripts/*.{ts,mjs}` - Database seeding and utilities

**Example:**
```bash
DATABASE_URL="mysql://root:password@localhost:3306/yeto_platform"
```

---

### NODE_ENV

**Purpose:** Specifies the runtime environment  
**Valid Values:** `development`, `production`  
**Required:** ✅ Dev, ✅ Prod  
**Used By:** Server initialization, build process, conditional logic

**References:**
- `/workspace/server/_core/env.ts:7` - Environment detection
- `/workspace/server/_core/index.ts:49` - Vite vs static serving
- `/workspace/server/_core/vite.ts:52` - Development mode check
- `/workspace/server/security/auditLogger.ts:80` - Logging behavior
- `/workspace/server/hardening/productionReadiness.ts:446,450,458,470` - Production checks
- `/workspace/package.json:7,9` - npm scripts

**Example:**
```bash
NODE_ENV="development"
# or
NODE_ENV="production"
```

---

### JWT_SECRET

**Purpose:** Secret key for JWT token signing and cookie encryption  
**Required:** ✅ Dev, ✅ Prod  
**Used By:** Authentication, session management

**References:**
- `/workspace/server/_core/env.ts:3` - Centralized config (as cookieSecret)
- `/workspace/server/hardening/productionReadiness.ts:479` - Security validation

**Security Note:** Must be a strong, randomly generated secret. Minimum 32 characters recommended.

**Example:**
```bash
JWT_SECRET="your-super-secret-key-min-32-chars-long-random-string"
```

---

### PORT

**Purpose:** HTTP server port  
**Default:** 3000  
**Required:** ❌ Dev, ⚠️ Prod (recommended)  
**Used By:** Express server initialization

**References:**
- `/workspace/server/_core/index.ts:55` - Port selection with fallback
- `/workspace/Dockerfile:48,70` - Container port

**Example:**
```bash
PORT="3000"
```

---

## OAuth / Authentication

### VITE_APP_ID

**Purpose:** Application identifier for OAuth/SSO  
**Required:** ⚠️ Dev, ✅ Prod (if using OAuth)  
**Used By:** OAuth integration

**References:**
- `/workspace/server/_core/env.ts:2` - OAuth config

**Example:**
```bash
VITE_APP_ID="yeto-platform-app-id"
```

---

### OAUTH_SERVER_URL

**Purpose:** OAuth server endpoint URL  
**Required:** ⚠️ Dev, ✅ Prod (if using OAuth)  
**Used By:** OAuth authentication flow

**References:**
- `/workspace/server/_core/env.ts:5` - OAuth config

**Example:**
```bash
OAUTH_SERVER_URL="https://oauth.example.com"
```

---

### OWNER_OPEN_ID

**Purpose:** OpenID of the platform owner/super admin  
**Required:** ⚠️ Dev, ✅ Prod (if using OAuth)  
**Used By:** Authorization, admin access

**References:**
- `/workspace/server/_core/env.ts:6` - OAuth config

**Example:**
```bash
OWNER_OPEN_ID="user-12345-openid"
```

---

## Storage / File Management

### BUILT_IN_FORGE_API_URL

**Purpose:** URL for Manus Forge API (file storage service)  
**Required:** ❌ Dev, ✅ Prod (if using file uploads)  
**Used By:** File storage, document uploads

**References:**
- `/workspace/server/_core/env.ts:8` - Forge API config
- `/workspace/scripts/upload-banking-reports.mjs:14` - Banking document uploads
- `/workspace/scripts/release-gate.mjs:101` - Storage configuration check

**Example:**
```bash
BUILT_IN_FORGE_API_URL="https://forge.example.com/api"
```

---

### BUILT_IN_FORGE_API_KEY

**Purpose:** API key for Manus Forge authentication  
**Required:** ❌ Dev, ✅ Prod (if using file uploads)  
**Used By:** File storage, document uploads

**References:**
- `/workspace/server/_core/env.ts:9` - Forge API config
- `/workspace/scripts/upload-banking-reports.mjs:15` - Banking document uploads
- `/workspace/scripts/release-gate.mjs:101` - Storage configuration check

**Security Note:** Keep this secret secure. Grants access to file storage.

**Example:**
```bash
BUILT_IN_FORGE_API_KEY="forge-api-key-secret"
```

---

## AWS / S3 (Optional)

### AWS_REGION

**Purpose:** AWS region for S3 bucket  
**Default:** us-east-1  
**Required:** ❌ Dev, ⚠️ Prod (if using S3)  
**Used By:** S3 asset uploads

**References:**
- `/workspace/scripts/upload-assets-to-s3.mjs:53` - S3 configuration

**Example:**
```bash
AWS_REGION="us-east-1"
```

---

### AWS_ACCESS_KEY_ID

**Purpose:** AWS access key for S3 authentication  
**Required:** ❌ Dev, ⚠️ Prod (if using S3)  
**Used By:** S3 asset uploads

**References:**
- `/workspace/scripts/upload-assets-to-s3.mjs:55` - S3 credentials

**Security Note:** AWS credential. Store securely.

**Example:**
```bash
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
```

---

### AWS_SECRET_ACCESS_KEY

**Purpose:** AWS secret key for S3 authentication  
**Required:** ❌ Dev, ⚠️ Prod (if using S3)  
**Used By:** S3 asset uploads

**References:**
- `/workspace/scripts/upload-assets-to-s3.mjs:56` - S3 credentials

**Security Note:** AWS secret. Never commit to version control.

**Example:**
```bash
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
```

---

### S3_BUCKET

**Purpose:** S3 bucket name for asset storage  
**Required:** ❌ Dev, ⚠️ Prod (if using S3)  
**Used By:** S3 asset uploads

**References:**
- `/workspace/scripts/upload-assets-to-s3.mjs:60` - S3 bucket target

**Example:**
```bash
S3_BUCKET="yeto-platform-assets"
```

---

## External API Keys

### ACLED_API_KEY

**Purpose:** API key for ACLED (Armed Conflict Location & Event Data) connector  
**Required:** ❌ Dev, ⚠️ Prod (if using ACLED data)  
**Used By:** ACLED data ingestion connector

**References:**
- `/workspace/server/connectors/acledConnector.ts:97,357` - ACLED connector
- `/workspace/server/services/dataIngestionService.ts:471` - Data ingestion service

**Example:**
```bash
ACLED_API_KEY="acled-api-key-here"
```

---

### ACLED_EMAIL

**Purpose:** Email address for ACLED API authentication  
**Required:** ❌ Dev, ⚠️ Prod (if using ACLED data)  
**Used By:** ACLED data ingestion connector

**References:**
- `/workspace/server/connectors/acledConnector.ts:98,357` - ACLED connector

**Example:**
```bash
ACLED_EMAIL="your-email@example.com"
```

---

## AgentOS / AI Integration

### AI_PROVIDER

**Purpose:** AI provider selection for AgentOS  
**Valid Values:** `local`, `openai`, custom  
**Default:** `local`  
**Required:** ❌ Dev, ⚠️ Prod (if using AI features)  
**Used By:** AgentOS runtime

**References:**
- `/workspace/agentos/runtime/registry.ts:22` - Provider selection

**Example:**
```bash
AI_PROVIDER="openai"
```

---

### AI_API_KEY

**Purpose:** API key for AI provider (OpenAI, etc.)  
**Required:** ❌ Dev, ⚠️ Prod (if using AI features)  
**Used By:** AgentOS OpenAI adapter

**References:**
- `/workspace/agentos/runtime/adapters/openai/adapter.ts:34` - OpenAI authentication

**Example:**
```bash
AI_API_KEY="sk-proj-..."
```

---

### AI_API_URL

**Purpose:** Base URL for AI API endpoint  
**Default:** `https://api.openai.com/v1`  
**Required:** ❌ Dev, ⚠️ Prod (if using custom AI endpoint)  
**Used By:** AgentOS OpenAI adapter

**References:**
- `/workspace/agentos/runtime/adapters/openai/adapter.ts:35` - API endpoint config

**Example:**
```bash
AI_API_URL="https://api.openai.com/v1"
```

---

### AI_MODEL

**Purpose:** AI model identifier  
**Default:** `gpt-4o`  
**Required:** ❌ Dev, ⚠️ Prod (if using AI features)  
**Used By:** AgentOS OpenAI adapter

**References:**
- `/workspace/agentos/runtime/adapters/openai/adapter.ts:36` - Model selection

**Example:**
```bash
AI_MODEL="gpt-4o"
```

---

### AI_EMBED_MODEL

**Purpose:** Embedding model for vector operations  
**Default:** `text-embedding-3-small`  
**Required:** ❌ Dev, ⚠️ Prod (if using embeddings)  
**Used By:** AgentOS OpenAI adapter

**References:**
- `/workspace/agentos/runtime/adapters/openai/adapter.ts:37` - Embedding model

**Example:**
```bash
AI_EMBED_MODEL="text-embedding-3-small"
```

---

## Application Configuration

### REVIEW_MODE

**Purpose:** Enable/disable review mode for QA  
**Valid Values:** `true`, `false`  
**Default:** `false`  
**Required:** ❌ Dev, ❌ Prod  
**Used By:** Review mode features, banner display

**References:**
- `/workspace/server/middleware/reviewMode.ts:14` - Review mode flag

**Example:**
```bash
REVIEW_MODE="true"
```

---

### APP_ENV

**Purpose:** Application environment identifier  
**Valid Values:** `local`, `staging`, `prod`  
**Default:** `local`  
**Required:** ❌ Dev, ⚠️ Prod  
**Used By:** Environment-specific features, configuration

**References:**
- `/workspace/server/middleware/reviewMode.ts:15` - Environment detection

**Example:**
```bash
APP_ENV="prod"
```

---

### INGESTION_WEBHOOKS

**Purpose:** Webhook URLs for ingestion notifications (JSON array)  
**Required:** ❌ Dev, ❌ Prod  
**Used By:** Ingestion webhook service

**References:**
- `/workspace/server/services/ingestion-webhooks.ts:185` - Webhook configuration

**Example:**
```bash
INGESTION_WEBHOOKS='[{"url":"https://example.com/webhook","events":["success","error"]}]'
```

---

## Testing / CI Variables

### CI

**Purpose:** Indicates running in CI environment  
**Valid Values:** Any truthy value  
**Required:** N/A (set by CI system)  
**Used By:** Test configuration, retry logic

**References:**
- `/workspace/playwright.config.ts:15,18,21,74` - Playwright CI configuration

**Example:**
```bash
CI="true"
```

---

### BASE_URL

**Purpose:** Base URL for E2E tests  
**Default:** `http://localhost:3000`  
**Required:** ❌ Dev, ⚠️ Prod (for E2E tests)  
**Used By:** Playwright E2E tests

**References:**
- `/workspace/playwright.config.ts:32` - Test base URL

**Example:**
```bash
BASE_URL="http://localhost:3000"
```

---

### DEBUG

**Purpose:** Enable debug mode  
**Valid Values:** `true`, `false`  
**Required:** ❌ Dev, ❌ Prod  
**Used By:** Production readiness checks

**References:**
- `/workspace/server/hardening/productionReadiness.ts:447,458` - Debug detection

**Example:**
```bash
DEBUG="true"
```

---

### VITE_DEBUG

**Purpose:** Enable Vite debug mode  
**Valid Values:** `true`, `false`  
**Required:** ❌ Dev, ❌ Prod  
**Used By:** Production readiness checks

**References:**
- `/workspace/server/hardening/productionReadiness.ts:448` - Debug detection

**Example:**
```bash
VITE_DEBUG="true"
```

---

## Summary Tables

### Required for Development

| Variable | Purpose | Default |
|----------|---------|---------|
| DATABASE_URL | Database connection | - |
| NODE_ENV | Environment | development |
| JWT_SECRET | Session security | - |

### Required for Production

| Variable | Purpose | Default |
|----------|---------|---------|
| DATABASE_URL | Database connection | - |
| NODE_ENV | Environment | production |
| JWT_SECRET | Session security | - |
| PORT | Server port | 3000 |

### Optional (Feature-Dependent)

| Variable | Feature | Required When |
|----------|---------|---------------|
| VITE_APP_ID | OAuth | Using OAuth |
| OAUTH_SERVER_URL | OAuth | Using OAuth |
| OWNER_OPEN_ID | OAuth | Using OAuth |
| BUILT_IN_FORGE_API_URL | File uploads | Using Forge storage |
| BUILT_IN_FORGE_API_KEY | File uploads | Using Forge storage |
| AWS_REGION | S3 storage | Using S3 |
| AWS_ACCESS_KEY_ID | S3 storage | Using S3 |
| AWS_SECRET_ACCESS_KEY | S3 storage | Using S3 |
| S3_BUCKET | S3 storage | Using S3 |
| ACLED_API_KEY | ACLED data | Ingesting ACLED |
| ACLED_EMAIL | ACLED data | Ingesting ACLED |
| AI_PROVIDER | AI features | Using AI |
| AI_API_KEY | AI features | Using AI |
| AI_API_URL | AI features | Custom AI endpoint |
| AI_MODEL | AI features | Using AI |
| AI_EMBED_MODEL | Embeddings | Using embeddings |

---

## Environment File Template

### .env.example (Development)

```bash
# Database
DATABASE_URL="mysql://root:password@localhost:3306/yeto_platform"

# Application
NODE_ENV="development"
PORT="3000"

# Security
JWT_SECRET="generate-a-secure-random-string-min-32-chars"

# OAuth (Optional)
# VITE_APP_ID="your-app-id"
# OAUTH_SERVER_URL="https://oauth.example.com"
# OWNER_OPEN_ID="owner-openid"

# File Storage (Optional)
# BUILT_IN_FORGE_API_URL="https://forge.example.com/api"
# BUILT_IN_FORGE_API_KEY="your-forge-api-key"

# AWS S3 (Optional)
# AWS_REGION="us-east-1"
# AWS_ACCESS_KEY_ID="your-access-key"
# AWS_SECRET_ACCESS_KEY="your-secret-key"
# S3_BUCKET="yeto-platform-assets"

# External APIs (Optional)
# ACLED_API_KEY="your-acled-api-key"
# ACLED_EMAIL="your-email@example.com"

# AI Integration (Optional)
# AI_PROVIDER="openai"
# AI_API_KEY="sk-proj-..."
# AI_API_URL="https://api.openai.com/v1"
# AI_MODEL="gpt-4o"
# AI_EMBED_MODEL="text-embedding-3-small"

# Application Config (Optional)
# REVIEW_MODE="false"
# APP_ENV="local"
# INGESTION_WEBHOOKS='[]'
```

### .env.production (Production)

```bash
# Database
DATABASE_URL="mysql://user:password@db-host:3306/yeto_production"

# Application
NODE_ENV="production"
PORT="3000"

# Security
JWT_SECRET="<strong-random-secret-from-secrets-manager>"

# OAuth
VITE_APP_ID="<production-app-id>"
OAUTH_SERVER_URL="https://oauth.production.com"
OWNER_OPEN_ID="<owner-openid>"

# File Storage
BUILT_IN_FORGE_API_URL="<forge-url>"
BUILT_IN_FORGE_API_KEY="<forge-api-key>"

# External APIs
ACLED_API_KEY="<acled-key>"
ACLED_EMAIL="<acled-email>"

# AI Integration
AI_PROVIDER="openai"
AI_API_KEY="<openai-key>"
AI_MODEL="gpt-4o"
AI_EMBED_MODEL="text-embedding-3-small"

# Application Config
APP_ENV="prod"
```

---

## Security Best Practices

1. **Never commit .env files to version control**
   - Add `.env*` to `.gitignore` (except `.env.example`)

2. **Use secrets management in production**
   - Use Cursor Cloud Agents > Secrets
   - Use Kubernetes secrets
   - Use cloud provider secret managers (AWS Secrets Manager, etc.)

3. **Rotate secrets regularly**
   - JWT_SECRET
   - API keys
   - Database passwords

4. **Use strong, random values**
   - Minimum 32 characters for JWT_SECRET
   - Use cryptographically secure random generation

5. **Principle of least privilege**
   - Only provide variables needed for specific environment
   - Use separate credentials for dev/staging/prod

---

## Validation Checklist

### Development Environment
- [ ] DATABASE_URL configured and accessible
- [ ] NODE_ENV set to "development"
- [ ] JWT_SECRET set (can be simple for dev)
- [ ] Port 3000 available or PORT configured

### Production Environment
- [ ] DATABASE_URL using production database
- [ ] NODE_ENV set to "production"
- [ ] JWT_SECRET is strong and secure
- [ ] PORT configured appropriately
- [ ] OAuth variables configured
- [ ] File storage variables configured
- [ ] External API keys configured
- [ ] No DEBUG flags enabled

### CI/CD Environment
- [ ] DATABASE_URL for test database
- [ ] CI flag set
- [ ] BASE_URL for E2E tests
- [ ] Minimal required variables only

---

## Troubleshooting

### Missing DATABASE_URL
**Symptom:** Application crashes on startup with "DATABASE_URL is required"  
**Solution:** Set DATABASE_URL in .env file or environment

**Reference:** `/workspace/drizzle.config.ts:4-6`

### Invalid JWT_SECRET
**Symptom:** Authentication fails, security warnings  
**Solution:** Set strong JWT_SECRET (min 32 chars)

**Reference:** `/workspace/server/hardening/productionReadiness.ts:479`

### Connector Failures
**Symptom:** ACLED connector fails with authentication error  
**Solution:** Set ACLED_API_KEY and ACLED_EMAIL

**Reference:** `/workspace/server/connectors/acledConnector.ts:97-98`

### File Upload Errors
**Symptom:** Cannot upload banking documents or reports  
**Solution:** Configure BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY

**Reference:** `/workspace/server/_core/env.ts:8-9`

---

## Document Status

**Status:** ✅ Complete  
**Last Updated:** February 4, 2026  
**Next Review:** When new features requiring env vars are added

---

## Related Documentation

- **Engineering Baseline:** `/workspace/docs/ENGINEERING_BASELINE.md`
- **Route Inventory:** `/workspace/docs/ROUTE_REALITY_CHECK.md`
- **Deployment Guide:** `/workspace/docs/DEPLOYMENT_GUIDE.md`
- **Security Guidelines:** `/workspace/SECURITY.md`
