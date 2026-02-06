# YETO Platform — AWS Production Deployment Plan

**Version:** 1.0  
**Date:** February 1, 2026  
**Author:** CauseWay Financial & Banking Consultancies  
**Status:** Ready for Implementation

---

## Executive Summary

This document provides a comprehensive deployment plan for the YETO (Yemen Economic Transparency Observatory) platform on Amazon Web Services (AWS). The architecture is designed for high availability, security, cost-efficiency, and scalability to support Yemen's economic intelligence needs.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Infrastructure Components](#2-infrastructure-components)
3. [Environment Configuration](#3-environment-configuration)
4. [Deployment Strategy](#4-deployment-strategy)
5. [Database Migration](#5-database-migration)
6. [S3 Asset Migration](#6-s3-asset-migration)
7. [Security Configuration](#7-security-configuration)
8. [Monitoring & Observability](#8-monitoring--observability)
9. [Cost Estimation](#9-cost-estimation)
10. [Rollback Procedures](#10-rollback-procedures)
11. [Post-Deployment Checklist](#11-post-deployment-checklist)

---

## 1. Architecture Overview

### Recommended Architecture: ECS Fargate + RDS + S3

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Cloud                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    VPC (10.0.0.0/16)                     │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │ Public      │  │ Private     │  │ Private     │      │    │
│  │  │ Subnet A    │  │ Subnet A    │  │ Subnet B    │      │    │
│  │  │ (ALB)       │  │ (ECS)       │  │ (RDS)       │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Route 53 │  │ ACM      │  │ CloudFront│  │ S3       │        │
│  │ (DNS)    │  │ (SSL)    │  │ (CDN)    │  │ (Assets) │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | AWS Service | Purpose |
|-----------|-------------|---------|
| Compute | ECS Fargate | Serverless container hosting |
| Database | RDS MySQL 8.0 | Managed relational database |
| Storage | S3 | Static assets, documents, images |
| CDN | CloudFront | Global content delivery |
| DNS | Route 53 | Domain management |
| SSL | ACM | Free SSL certificates |
| Secrets | Secrets Manager | Secure credential storage |
| Monitoring | CloudWatch | Logs, metrics, alarms |

---

## 2. Infrastructure Components

### 2.1 Compute (ECS Fargate)

**Task Definition:**
```json
{
  "family": "yeto-platform",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "yeto-app",
      "image": "ECR_REPO_URI:latest",
      "portMappings": [
        { "containerPort": 3000, "protocol": "tcp" }
      ],
      "environment": [],
      "secrets": [
        { "name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:..." },
        { "name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:..." }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/yeto-platform",
          "awslogs-region": "me-south-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

**Service Configuration:**
- Desired count: 2 (minimum for HA)
- Auto-scaling: 2-10 tasks based on CPU/memory
- Health check: `/api/health`
- Deployment: Rolling update (100% min healthy)

### 2.2 Database (RDS MySQL)

**Instance Specification:**
| Parameter | Value |
|-----------|-------|
| Engine | MySQL 8.0 |
| Instance Class | db.t3.medium (start), db.r6g.large (scale) |
| Storage | 100 GB gp3 (auto-scaling to 500 GB) |
| Multi-AZ | Yes (production) |
| Backup Retention | 7 days |
| Encryption | AES-256 (at rest) |

**Connection String Format:**
```
mysql://yeto_admin:PASSWORD@yeto-db.xxxx.me-south-1.rds.amazonaws.com:3306/yeto_production?ssl=true
```

### 2.3 Storage (S3)

**Bucket Structure:**
```
yeto-production-assets/
├── documents/           # PDFs, reports
├── images/              # Generated images, logos
│   ├── generated/
│   ├── sectors/
│   └── yemen/
├── exports/             # Data exports
└── uploads/             # User uploads
```

**Bucket Policy:**
- Public read for `/images/*` and `/documents/*`
- Private for `/exports/*` and `/uploads/*`
- Lifecycle: Move to Glacier after 90 days for archives

### 2.4 CDN (CloudFront)

**Distribution Configuration:**
| Setting | Value |
|---------|-------|
| Origin | ALB (dynamic) + S3 (static) |
| Price Class | PriceClass_200 (includes Middle East) |
| SSL | ACM certificate (yeto.causeway.ye) |
| Cache Policy | CachingOptimized for static, CachingDisabled for API |
| WAF | AWS WAF with managed rules |

---

## 3. Environment Configuration

### 3.1 Required Environment Variables

```bash
# Database
DATABASE_URL=mysql://user:pass@host:3306/yeto_production?ssl=true

# Authentication
JWT_SECRET=<32-byte-random-string>
VITE_APP_ID=<manus-app-id>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth

# AWS S3
AWS_ACCESS_KEY_ID=<iam-access-key>
AWS_SECRET_ACCESS_KEY=<iam-secret-key>
AWS_REGION=me-south-1
S3_BUCKET=yeto-production-assets

# Application
NODE_ENV=production
PORT=3000
VITE_APP_TITLE=YETO - Yemen Economic Transparency Observatory
```

### 3.2 Secrets Manager Structure

```
/yeto/production/
├── database           # DATABASE_URL
├── jwt                # JWT_SECRET
├── aws-s3             # S3 credentials
├── oauth              # OAuth secrets
└── api-keys           # Third-party API keys
```

---

## 4. Deployment Strategy

### 4.1 CI/CD Pipeline (GitHub Actions → ECR → ECS)

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: me-south-1
      
      - name: Login to Amazon ECR
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build and push Docker image
        run: |
          docker build -t yeto-platform .
          docker tag yeto-platform:latest $ECR_REGISTRY/yeto-platform:${{ github.ref_name }}
          docker push $ECR_REGISTRY/yeto-platform:${{ github.ref_name }}
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster yeto-production \
            --service yeto-platform \
            --force-new-deployment
```

### 4.2 Dockerfile

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/server/index.js"]
```

---

## 5. Database Migration

### 5.1 Migration Steps

1. **Create RDS instance** in private subnet
2. **Enable SSL** and configure security group
3. **Run schema migration:**
   ```bash
   DATABASE_URL=<production-url> pnpm db:push
   ```
4. **Verify tables:**
   ```sql
   SHOW TABLES;
   SELECT COUNT(*) FROM entities;
   SELECT COUNT(*) FROM source_registry;
   ```

### 5.2 Data Migration (if needed)

```bash
# Export from development
mysqldump -h dev-host -u user -p yeto_dev > yeto_backup.sql

# Import to production
mysql -h prod-host -u user -p yeto_production < yeto_backup.sql
```

---

## 6. S3 Asset Migration

### 6.1 Upload Large Assets

The following assets were excluded from Git and must be uploaded to S3:

| Category | Size | S3 Path |
|----------|------|---------|
| Generated images | ~60 MB | `images/generated/` |
| Sector images | ~15 MB | `images/sectors/` |
| Yemen images | ~10 MB | `images/yemen/` |
| Documents/PDFs | ~16 MB | `documents/` |
| Brand assets | ~20 MB | `images/brand/` |

### 6.2 Upload Script

```bash
#!/bin/bash
# scripts/upload-assets-to-s3.sh

S3_BUCKET="yeto-production-assets"

# Upload images
aws s3 sync client/public/images/generated/ s3://$S3_BUCKET/images/generated/ --acl public-read
aws s3 sync client/public/images/sectors/ s3://$S3_BUCKET/images/sectors/ --acl public-read
aws s3 sync client/public/images/yemen/ s3://$S3_BUCKET/images/yemen/ --acl public-read

# Upload documents
aws s3 sync public/documents/ s3://$S3_BUCKET/documents/ --acl public-read

# Upload brand assets
aws s3 cp client/public/yeto-logo.png s3://$S3_BUCKET/images/brand/yeto-logo.png --acl public-read
aws s3 cp client/public/images/brand/causeway-logo-mark.svg s3://$S3_BUCKET/images/brand/causeway-logo-mark.svg --acl public-read
aws s3 cp client/public/images/brand/causeway-logo-lockup.svg s3://$S3_BUCKET/images/brand/causeway-logo-lockup.svg --acl public-read
```

### 6.3 Update Application References

After uploading, update image references in the application to use CloudFront URLs:

```typescript
// Before (local)
const imageUrl = "/images/generated/sector-banking.png";

// After (S3/CloudFront)
const imageUrl = "https://d1234567890.cloudfront.net/images/generated/sector-banking.png";
```

---

## 7. Security Configuration

### 7.1 IAM Roles

**ECS Task Role:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::yeto-production-assets/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:me-south-1:*:secret:/yeto/production/*"
    }
  ]
}
```

### 7.2 Security Groups

| Security Group | Inbound | Outbound |
|----------------|---------|----------|
| ALB | 80, 443 from 0.0.0.0/0 | All to VPC |
| ECS | 3000 from ALB SG | All |
| RDS | 3306 from ECS SG | None |

### 7.3 WAF Rules

- AWS Managed Rules: Common Rule Set
- Rate limiting: 2000 requests/5 minutes per IP
- Geo-blocking: None (global access required)
- SQL injection protection: Enabled
- XSS protection: Enabled

---

## 8. Monitoring & Observability

### 8.1 CloudWatch Alarms

| Alarm | Metric | Threshold | Action |
|-------|--------|-----------|--------|
| High CPU | ECS CPU Utilization | > 80% for 5 min | Scale out + SNS |
| High Memory | ECS Memory Utilization | > 80% for 5 min | Scale out + SNS |
| 5XX Errors | ALB 5XX Count | > 10 in 1 min | SNS alert |
| DB Connections | RDS Connections | > 80% max | SNS alert |
| Disk Space | RDS Free Storage | < 10 GB | SNS alert |

### 8.2 Log Groups

```
/ecs/yeto-platform          # Application logs
/aws/rds/yeto-production    # Database logs
/aws/alb/yeto-production    # Load balancer logs
```

### 8.3 Dashboard

Create a CloudWatch dashboard with:
- Request count and latency (p50, p95, p99)
- Error rates (4XX, 5XX)
- ECS task count and health
- RDS connections and query performance
- S3 request metrics

---

## 9. Cost Estimation

### Monthly Cost Breakdown (Production)

| Service | Configuration | Estimated Cost |
|---------|---------------|----------------|
| ECS Fargate | 2 tasks × 1 vCPU × 2 GB | $70 |
| RDS MySQL | db.t3.medium, Multi-AZ | $120 |
| S3 | 200 GB storage + requests | $10 |
| CloudFront | 500 GB transfer | $50 |
| Route 53 | 1 hosted zone | $0.50 |
| Secrets Manager | 10 secrets | $4 |
| CloudWatch | Logs + metrics | $20 |
| NAT Gateway | 1 gateway | $35 |
| **Total** | | **~$310/month** |

### Cost Optimization Tips

1. Use Reserved Instances for RDS (up to 60% savings)
2. Enable S3 Intelligent-Tiering for documents
3. Use Spot instances for non-critical workloads
4. Set up billing alerts at $300, $400, $500

---

## 10. Rollback Procedures

### 10.1 Application Rollback

```bash
# Rollback to previous ECS task definition
aws ecs update-service \
  --cluster yeto-production \
  --service yeto-platform \
  --task-definition yeto-platform:PREVIOUS_REVISION
```

### 10.2 Database Rollback

```bash
# Restore from automated backup
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier yeto-production \
  --target-db-instance-identifier yeto-production-restored \
  --restore-time 2026-02-01T00:00:00Z
```

### 10.3 Emergency Contacts

| Role | Contact |
|------|---------|
| DevOps Lead | devops@causeway.ye |
| Database Admin | dba@causeway.ye |
| Security | security@causeway.ye |

---

## 11. Post-Deployment Checklist

### Pre-Launch

- [ ] RDS instance created and accessible
- [ ] S3 bucket created with correct policies
- [ ] CloudFront distribution configured
- [ ] SSL certificate issued and validated
- [ ] Secrets stored in Secrets Manager
- [ ] ECS cluster and service created
- [ ] Health check endpoint responding
- [ ] Database migrations applied
- [ ] Assets uploaded to S3

### Launch Day

- [ ] DNS cutover to CloudFront/ALB
- [ ] Verify all pages load correctly
- [ ] Test authentication flow
- [ ] Test data queries (entities, sources)
- [ ] Verify S3 image loading
- [ ] Check CloudWatch logs for errors
- [ ] Run smoke tests on all major features

### Post-Launch (24-48 hours)

- [ ] Monitor error rates
- [ ] Check database performance
- [ ] Verify backup jobs running
- [ ] Review CloudWatch alarms
- [ ] Collect user feedback
- [ ] Document any issues

---

## Appendix A: Terraform Quick Start

For infrastructure-as-code deployment, use the following Terraform modules:

```hcl
# main.tf
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  name   = "yeto-production"
  cidr   = "10.0.0.0/16"
  azs    = ["me-south-1a", "me-south-1b"]
}

module "ecs" {
  source = "terraform-aws-modules/ecs/aws"
  cluster_name = "yeto-production"
}

module "rds" {
  source = "terraform-aws-modules/rds/aws"
  identifier = "yeto-production"
  engine     = "mysql"
  engine_version = "8.0"
}
```

---

## Appendix B: Quick Reference Commands

```bash
# Deploy new version
aws ecs update-service --cluster yeto-production --service yeto-platform --force-new-deployment

# View logs
aws logs tail /ecs/yeto-platform --follow

# Scale service
aws ecs update-service --cluster yeto-production --service yeto-platform --desired-count 4

# Check service status
aws ecs describe-services --cluster yeto-production --services yeto-platform
```

---

**Document End**

*For questions or support, contact: devops@causeway.ye*
