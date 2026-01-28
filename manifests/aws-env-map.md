# AWS Environment Mapping — YETO Platform

> **Single source of truth for AWS resource allocation and environment variables**

---

## Environment Overview

| Environment | AWS Region | VPC | RDS Instance | S3 Bucket | Status |
|-------------|-----------|-----|--------------|-----------|--------|
| **Production** | us-east-1 | yeto-prod-vpc | yeto-prod-mysql | yeto-data-prod | 🟢 Active |
| **Staging** | us-east-1 | yeto-staging-vpc | yeto-staging-mysql | yeto-data-staging | 🟢 Active |
| **Development** | us-east-1 | yeto-dev-vpc | yeto-dev-mysql | yeto-data-dev | 🟡 On-demand |

---

## Environment Variables Mapping

### Production Environment

```bash
# Database
DATABASE_URL=mysql://yeto_prod:${PROD_DB_PASS}@yeto-prod-mysql.c9akciq32.us-east-1.rds.amazonaws.com:3306/yeto_prod?ssl=true

# AWS S3
S3_BUCKET=yeto-data-prod
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=${PROD_AWS_KEY}
AWS_SECRET_ACCESS_KEY=${PROD_AWS_SECRET}

# Authentication
JWT_SECRET=${PROD_JWT_SECRET}
VITE_APP_ID=yeto-prod-oauth
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth

# LLM Services
BUILT_IN_FORGE_API_URL=https://api.forge.manus.im
BUILT_IN_FORGE_API_KEY=${PROD_FORGE_KEY}
VITE_FRONTEND_FORGE_API_KEY=${PROD_FRONTEND_FORGE_KEY}

# Monitoring
VITE_ANALYTICS_ENDPOINT=https://analytics.causewaygrp.com
VITE_ANALYTICS_WEBSITE_ID=yeto-prod

# Application
VITE_APP_TITLE=YETO — Yemen Economic Transparency Observatory
NODE_ENV=production
LOG_LEVEL=info
```

### Staging Environment

```bash
# Database
DATABASE_URL=mysql://yeto_staging:${STAGING_DB_PASS}@yeto-staging-mysql.c9akciq32.us-east-1.rds.amazonaws.com:3306/yeto_staging?ssl=true

# AWS S3
S3_BUCKET=yeto-data-staging
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=${STAGING_AWS_KEY}
AWS_SECRET_ACCESS_KEY=${STAGING_AWS_SECRET}

# Authentication
JWT_SECRET=${STAGING_JWT_SECRET}
VITE_APP_ID=yeto-staging-oauth
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth

# LLM Services
BUILT_IN_FORGE_API_URL=https://api.forge.manus.im
BUILT_IN_FORGE_API_KEY=${STAGING_FORGE_KEY}
VITE_FRONTEND_FORGE_API_KEY=${STAGING_FRONTEND_FORGE_KEY}

# Monitoring
VITE_ANALYTICS_ENDPOINT=https://analytics-staging.causewaygrp.com
VITE_ANALYTICS_WEBSITE_ID=yeto-staging

# Application
VITE_APP_TITLE=YETO Staging — Yemen Economic Transparency Observatory
NODE_ENV=production
LOG_LEVEL=debug
```

### Development Environment (Local)

```bash
# Database
DATABASE_URL=mysql://root:password@localhost:3306/yeto_dev

# AWS S3 (Local Mock)
S3_BUCKET=yeto-data-dev
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local

# Authentication
JWT_SECRET=local-secret-key-min-32-chars
VITE_APP_ID=local-app-id
OAUTH_SERVER_URL=http://localhost:3000/api/oauth
VITE_OAUTH_PORTAL_URL=http://localhost:3000/oauth

# LLM Services
BUILT_IN_FORGE_API_URL=http://localhost:3000/api/forge
BUILT_IN_FORGE_API_KEY=local-key
VITE_FRONTEND_FORGE_API_KEY=local-key

# Monitoring
VITE_ANALYTICS_ENDPOINT=http://localhost:8080
VITE_ANALYTICS_WEBSITE_ID=yeto-local

# Application
VITE_APP_TITLE=YETO (Local Development)
NODE_ENV=development
LOG_LEVEL=debug
```

---

## AWS Resource Details

### RDS MySQL Instances

| Resource | Production | Staging | Development |
|----------|-----------|---------|-------------|
| **Instance Class** | db.r5.2xlarge | db.t3.large | db.t3.micro |
| **Storage** | 500 GB | 100 GB | 20 GB |
| **Backup Retention** | 30 days | 7 days | 1 day |
| **Multi-AZ** | Yes | No | No |
| **Encryption** | AES-256 | AES-256 | AES-256 |
| **Port** | 3306 | 3306 | 3306 |
| **Parameter Group** | yeto-prod-params | yeto-staging-params | yeto-dev-params |

### S3 Buckets

| Bucket | Region | Versioning | Encryption | Replication |
|--------|--------|-----------|-----------|------------|
| **yeto-data-prod** | us-east-1 | Enabled | AES-256 | Cross-region |
| **yeto-data-staging** | us-east-1 | Enabled | AES-256 | None |
| **yeto-data-dev** | us-east-1 | Disabled | AES-256 | None |

### IAM Roles & Policies

```yaml
# Production Application Role
Role: yeto-prod-app-role
Policies:
  - s3:GetObject (yeto-data-prod/*)
  - s3:PutObject (yeto-data-prod/exports/*, yeto-data-prod/logs/*)
  - rds-db:connect (yeto-prod-mysql)
  - logs:CreateLogStream (yeto-prod-logs)
  - logs:PutLogEvents (yeto-prod-logs)

# Staging Application Role
Role: yeto-staging-app-role
Policies:
  - s3:GetObject (yeto-data-staging/*)
  - s3:PutObject (yeto-data-staging/exports/*, yeto-data-staging/logs/*)
  - rds-db:connect (yeto-staging-mysql)
  - logs:CreateLogStream (yeto-staging-logs)
  - logs:PutLogEvents (yeto-staging-logs)
```

---

## Secrets Management

### AWS Secrets Manager

| Secret | Environment | Rotation | Access |
|--------|-------------|----------|--------|
| `yeto/prod/db-password` | Production | 90 days | App role |
| `yeto/prod/jwt-secret` | Production | Manual | App role |
| `yeto/prod/forge-api-key` | Production | Manual | App role |
| `yeto/staging/db-password` | Staging | 30 days | App role |
| `yeto/staging/jwt-secret` | Staging | Manual | App role |

### GitHub Secrets

| Secret | Purpose | Rotation |
|--------|---------|----------|
| `AWS_ACCESS_KEY_ID` | CI/CD deployment | 90 days |
| `AWS_SECRET_ACCESS_KEY` | CI/CD deployment | 90 days |
| `PROD_DB_PASS` | Production database | 90 days |
| `STAGING_DB_PASS` | Staging database | 30 days |
| `PROD_JWT_SECRET` | Production JWT signing | Manual |
| `PROD_FORGE_KEY` | Production LLM API | Manual |

---

## Network Configuration

### VPC & Security Groups

```
Production VPC (10.0.0.0/16)
├── Public Subnet (10.0.1.0/24)
│   └── Application Load Balancer
├── Private Subnet (10.0.2.0/24)
│   └── ECS Cluster (Application)
└── Private Subnet (10.0.3.0/24)
    └── RDS MySQL (yeto-prod-mysql)

Staging VPC (10.1.0.0/16)
├── Public Subnet (10.1.1.0/24)
│   └── Application Load Balancer
├── Private Subnet (10.1.2.0/24)
│   └── ECS Cluster (Application)
└── Private Subnet (10.1.3.0/24)
    └── RDS MySQL (yeto-staging-mysql)
```

### Security Groups

| Group | Inbound | Outbound |
|-------|---------|----------|
| **ALB-SG** | 80, 443 from 0.0.0.0/0 | All to 0.0.0.0/0 |
| **App-SG** | 3000 from ALB-SG | All to 0.0.0.0/0 |
| **RDS-SG** | 3306 from App-SG | None (inbound only) |

---

## Deployment Pipeline

```
GitHub Push
    ↓
GitHub Actions (CI/CD)
    ├── Lint & Type Check
    ├── Unit Tests
    ├── E2E Tests
    ├── Build Docker Image
    └── Push to ECR
    ↓
Manual Approval (for production)
    ↓
ECS Task Update
    ├── Pull image from ECR
    ├── Update task definition
    └── Deploy to ECS cluster
    ↓
Health Checks
    ├── API /health endpoint
    ├── Database connectivity
    └── S3 access
    ↓
Smoke Tests
    └── Verify critical flows
```

---

## Monitoring & Logging

### CloudWatch Metrics

| Metric | Threshold | Action |
|--------|-----------|--------|
| **CPU Utilization** | > 80% | Scale up |
| **Memory Utilization** | > 85% | Scale up |
| **RDS Connections** | > 80% pool | Alert |
| **API Response Time** | > 2000ms | Investigate |
| **Error Rate** | > 5% | Page on-call |

### Log Groups

```
/aws/ecs/yeto-prod/application
/aws/ecs/yeto-prod/database
/aws/ecs/yeto-prod/scheduler
/aws/rds/yeto-prod-mysql/error
/aws/rds/yeto-prod-mysql/slowquery
```

---

## Disaster Recovery

### RTO & RPO Targets

| Scenario | RTO | RPO |
|----------|-----|-----|
| **Database Failure** | 1 hour | 1 hour |
| **Application Crash** | 5 minutes | 0 |
| **Region Outage** | 4 hours | 24 hours |
| **Complete Failure** | 8 hours | 24 hours |

### Backup Strategy

- **Daily Full Backups**: 2:00 AM UTC → S3
- **Hourly Incremental**: Every hour → S3
- **Weekly Archive**: Sunday 3:00 AM UTC → S3 Glacier
- **Retention**: 30 days (daily), 7 days (hourly), 1 year (archive)

---

## Cost Optimization

### Estimated Monthly Costs

| Resource | Production | Staging | Development |
|----------|-----------|---------|-------------|
| **RDS MySQL** | $1,200 | $150 | $20 |
| **S3 Storage** | $500 | $50 | $10 |
| **Data Transfer** | $300 | $50 | $10 |
| **CloudWatch** | $100 | $20 | $5 |
| **Total** | **$2,100** | **$270** | **$45** |

### Cost Reduction Strategies

1. **Reserved Instances**: Save 40% on RDS (1-year commitment)
2. **S3 Lifecycle**: Move old data to Glacier (90% cheaper)
3. **Spot Instances**: Use for non-critical workloads (70% discount)
4. **Auto-scaling**: Scale down during off-hours

---

## Compliance & Security

### Certifications

- ✅ SOC 2 Type II
- ✅ GDPR Compliant
- ✅ ISO 27001 (in progress)

### Data Protection

- ✅ Encryption at rest (AES-256)
- ✅ Encryption in transit (TLS 1.3)
- ✅ Database encryption
- ✅ S3 encryption
- ✅ Backup encryption

### Access Control

- ✅ IAM roles & policies
- ✅ VPC isolation
- ✅ Security groups
- ✅ Secrets Manager
- ✅ Audit logging

---

**Last Updated:** 2026-01-28  
**Next Review:** 2026-02-28  
**Maintained By:** DevOps Team
