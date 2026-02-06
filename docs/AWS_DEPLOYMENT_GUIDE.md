# YETO Platform - AWS Deployment Guide

**Yemen Economic Transparency Observatory**  
**Version:** 1.0  
**Last Updated:** February 2025  
**Author:** CauseWay Financial & Banking Consultancies

---

## Executive Summary

This document provides comprehensive guidance for deploying the YETO (Yemen Economic Transparency Observatory) platform on Amazon Web Services (AWS). YETO is a full-stack Node.js application consisting of a React 19 frontend, Express/tRPC backend, and MySQL/TiDB database. Unlike static websites that can be hosted directly on S3, YETO requires compute resources for its server-side logic, scheduled data ingestion jobs, and real-time API endpoints.

The recommended architecture uses **AWS Elastic Container Service (ECS) with Fargate** for serverless container orchestration, **Amazon RDS** or **TiDB Cloud** for the database, **Amazon S3** for file storage, and **Amazon CloudFront** as the CDN layer. This setup provides high availability, automatic scaling, and cost efficiency for production workloads.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Infrastructure Components](#infrastructure-components)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [SSL/TLS Configuration](#ssltls-configuration)
8. [DNS Configuration](#dns-configuration)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Cost Estimation](#cost-estimation)
11. [Security Best Practices](#security-best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### High-Level Architecture Diagram

```
                                    ┌─────────────────────────────────────────────────────────────┐
                                    │                        AWS Cloud                             │
                                    │                                                              │
    ┌──────────┐                    │   ┌─────────────┐      ┌─────────────────────────────────┐  │
    │  Users   │───HTTPS───────────▶│   │ CloudFront  │─────▶│        Application Load         │  │
    │          │                    │   │    (CDN)    │      │         Balancer (ALB)          │  │
    └──────────┘                    │   └─────────────┘      └───────────────┬─────────────────┘  │
                                    │         │                              │                     │
                                    │         │ Static                       │ API Requests        │
                                    │         │ Assets                       │                     │
                                    │         ▼                              ▼                     │
                                    │   ┌─────────────┐      ┌─────────────────────────────────┐  │
                                    │   │     S3      │      │      ECS Fargate Cluster        │  │
                                    │   │  (Assets)   │      │  ┌─────────┐    ┌─────────┐     │  │
                                    │   └─────────────┘      │  │ Task 1  │    │ Task 2  │     │  │
                                    │                        │  │ (Node)  │    │ (Node)  │     │  │
                                    │                        │  └────┬────┘    └────┬────┘     │  │
                                    │                        └───────┼──────────────┼──────────┘  │
                                    │                                │              │              │
                                    │                                ▼              ▼              │
                                    │                        ┌─────────────────────────────────┐  │
                                    │                        │    Amazon RDS (MySQL 8.0)       │  │
                                    │                        │    or TiDB Cloud                │  │
                                    │                        │    (Multi-AZ Deployment)        │  │
                                    │                        └─────────────────────────────────┘  │
                                    │                                                              │
                                    │   ┌─────────────┐      ┌─────────────────────────────────┐  │
                                    │   │ ElastiCache │      │        Secrets Manager          │  │
                                    │   │   (Redis)   │      │     (API Keys, DB Creds)        │  │
                                    │   └─────────────┘      └─────────────────────────────────┘  │
                                    │                                                              │
                                    └─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | AWS Service |
|-----------|------------|-------------|
| Frontend | React 19 + Vite + Tailwind CSS 4 | S3 + CloudFront |
| Backend | Node.js 20 + Express + tRPC | ECS Fargate |
| Database | MySQL 8.0 / TiDB | RDS / TiDB Cloud |
| Cache | Redis 7 | ElastiCache |
| File Storage | S3-compatible | Amazon S3 |
| Search | OpenSearch | Amazon OpenSearch |
| Secrets | Environment Variables | Secrets Manager |
| DNS | Route 53 | Route 53 |
| SSL/TLS | ACM Certificates | ACM |
| CDN | CloudFront | CloudFront |
| Container Registry | Docker Images | ECR |

---

## Prerequisites

Before beginning the deployment, ensure you have the following:

### AWS Account Requirements

1. **AWS Account** with administrative access
2. **AWS CLI** installed and configured (`aws configure`)
3. **Docker** installed locally for building images
4. **Domain name** configured in Route 53 (e.g., `yeto.causewaygrp.com`)

### Local Development Requirements

1. **Node.js 20+** and **pnpm** package manager
2. **Git** for version control
3. **Terraform** (optional, for infrastructure as code)

### Required IAM Permissions

The deployment user/role needs permissions for:
- ECS (CreateCluster, CreateService, RegisterTaskDefinition)
- ECR (CreateRepository, PutImage)
- RDS (CreateDBInstance, CreateDBSubnetGroup)
- S3 (CreateBucket, PutObject, PutBucketPolicy)
- CloudFront (CreateDistribution, CreateOriginAccessControl)
- ACM (RequestCertificate, DescribeCertificate)
- Route 53 (ChangeResourceRecordSets)
- Secrets Manager (CreateSecret, GetSecretValue)
- IAM (CreateRole, AttachRolePolicy)
- VPC (CreateVpc, CreateSubnet, CreateSecurityGroup)
- CloudWatch (CreateLogGroup, PutMetricAlarm)

---

## Infrastructure Components

### 1. Virtual Private Cloud (VPC)

Create a VPC with public and private subnets across multiple Availability Zones for high availability.

**Recommended Configuration:**

| Resource | Configuration |
|----------|---------------|
| VPC CIDR | 10.0.0.0/16 |
| Public Subnets | 10.0.1.0/24, 10.0.2.0/24 (AZ-a, AZ-b) |
| Private Subnets | 10.0.10.0/24, 10.0.11.0/24 (AZ-a, AZ-b) |
| NAT Gateway | 1 per AZ (for private subnet internet access) |
| Internet Gateway | 1 (for public subnet internet access) |

### 2. Amazon ECS with Fargate

ECS Fargate provides serverless container orchestration, eliminating the need to manage EC2 instances.

**Task Definition Specifications:**

| Parameter | Value |
|-----------|-------|
| CPU | 1024 (1 vCPU) |
| Memory | 2048 MB |
| Container Port | 3000 |
| Health Check Path | /api/health |
| Desired Count | 2 (minimum for HA) |
| Auto Scaling | 2-10 tasks based on CPU/Memory |

### 3. Application Load Balancer (ALB)

The ALB distributes traffic across ECS tasks and handles SSL termination.

**Configuration:**

| Parameter | Value |
|-----------|-------|
| Scheme | Internet-facing |
| Listeners | HTTP (80) → HTTPS redirect, HTTPS (443) |
| Target Group | ECS tasks on port 3000 |
| Health Check | /api/health, 30s interval |
| Stickiness | Disabled (stateless API) |

### 4. Amazon RDS (MySQL)

For production, use RDS MySQL with Multi-AZ deployment for automatic failover.

**Recommended Configuration:**

| Parameter | Value |
|-----------|-------|
| Engine | MySQL 8.0 |
| Instance Class | db.t3.medium (production: db.r6g.large) |
| Storage | 100 GB gp3 (auto-scaling enabled) |
| Multi-AZ | Yes |
| Backup Retention | 7 days |
| Encryption | Enabled (KMS) |

**Alternative: TiDB Cloud**

If you're already using TiDB Cloud (as YETO currently does), you can continue using it. Ensure your ECS tasks can reach TiDB Cloud's endpoint through NAT Gateway.

### 5. Amazon S3

S3 stores static assets, user uploads, and generated reports.

**Buckets Required:**

| Bucket | Purpose | Access |
|--------|---------|--------|
| yeto-assets | Static frontend assets | Public (via CloudFront) |
| yeto-storage | User uploads, reports | Private (signed URLs) |
| yeto-backups | Database backups | Private |

**Release manifest:** publish `docs/releases/latest.json` to
`s3://yeto-assets/releases/latest.json` so production can expose a verifiable
version via CloudFront/ALB. ACM handles TLS only.

### 6. Amazon CloudFront

CloudFront serves as the CDN, caching static assets and routing API requests to the ALB.

**Distribution Configuration:**

| Origin | Path Pattern | Cache Policy |
|--------|--------------|--------------|
| S3 (yeto-assets) | /assets/*, /static/* | CachingOptimized |
| ALB | /api/* | CachingDisabled |
| ALB | Default (*) | CachingDisabled |

### 7. Amazon ElastiCache (Redis)

Redis provides caching and session storage for improved performance.

**Configuration:**

| Parameter | Value |
|-----------|-------|
| Engine | Redis 7.x |
| Node Type | cache.t3.micro (production: cache.r6g.large) |
| Cluster Mode | Disabled |
| Multi-AZ | Yes (with automatic failover) |

---

## Step-by-Step Deployment

### Step 1: Create the VPC and Networking

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=yeto-vpc}]'

# Note the VPC ID from the output, then create subnets
export VPC_ID=vpc-xxxxxxxxx

# Create public subnets
aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --availability-zone us-east-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=yeto-public-1a}]'
aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 --availability-zone us-east-1b --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=yeto-public-1b}]'

# Create private subnets
aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.10.0/24 --availability-zone us-east-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=yeto-private-1a}]'
aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.11.0/24 --availability-zone us-east-1b --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=yeto-private-1b}]'

# Create Internet Gateway
aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=yeto-igw}]'
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id igw-xxxxxxxxx

# Create NAT Gateway (requires Elastic IP)
aws ec2 allocate-address --domain vpc
aws ec2 create-nat-gateway --subnet-id subnet-public-1a --allocation-id eipalloc-xxxxxxxxx
```

### Step 2: Create Security Groups

```bash
# ALB Security Group (allows HTTP/HTTPS from internet)
aws ec2 create-security-group --group-name yeto-alb-sg --description "YETO ALB Security Group" --vpc-id $VPC_ID
aws ec2 authorize-security-group-ingress --group-id sg-alb --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id sg-alb --protocol tcp --port 443 --cidr 0.0.0.0/0

# ECS Tasks Security Group (allows traffic from ALB only)
aws ec2 create-security-group --group-name yeto-ecs-sg --description "YETO ECS Tasks Security Group" --vpc-id $VPC_ID
aws ec2 authorize-security-group-ingress --group-id sg-ecs --protocol tcp --port 3000 --source-group sg-alb

# RDS Security Group (allows traffic from ECS only)
aws ec2 create-security-group --group-name yeto-rds-sg --description "YETO RDS Security Group" --vpc-id $VPC_ID
aws ec2 authorize-security-group-ingress --group-id sg-rds --protocol tcp --port 3306 --source-group sg-ecs

# Redis Security Group (allows traffic from ECS only)
aws ec2 create-security-group --group-name yeto-redis-sg --description "YETO Redis Security Group" --vpc-id $VPC_ID
aws ec2 authorize-security-group-ingress --group-id sg-redis --protocol tcp --port 6379 --source-group sg-ecs
```

### Step 3: Create Amazon ECR Repository

```bash
# Create ECR repository for YETO Docker images
aws ecr create-repository --repository-name yeto-platform --image-scanning-configuration scanOnPush=true

# Get the repository URI
export ECR_URI=$(aws ecr describe-repositories --repository-names yeto-platform --query 'repositories[0].repositoryUri' --output text)
echo "ECR URI: $ECR_URI"
```

### Step 4: Build and Push Docker Image

```bash
# Navigate to YETO project directory
cd /path/to/yeto-platform

# Build the production Docker image
docker build -t yeto-platform:latest .

# Authenticate with ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URI

# Tag and push the image
docker tag yeto-platform:latest $ECR_URI:latest
docker tag yeto-platform:latest $ECR_URI:$(git rev-parse --short HEAD)
docker push $ECR_URI:latest
docker push $ECR_URI:$(git rev-parse --short HEAD)
```

### Step 5: Create Amazon RDS Database

```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name yeto-db-subnet \
  --db-subnet-group-description "YETO Database Subnet Group" \
  --subnet-ids subnet-private-1a subnet-private-1b

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier yeto-db \
  --db-instance-class db.t3.medium \
  --engine mysql \
  --engine-version 8.0 \
  --master-username yeto_admin \
  --master-user-password "YOUR_SECURE_PASSWORD" \
  --allocated-storage 100 \
  --storage-type gp3 \
  --vpc-security-group-ids sg-rds \
  --db-subnet-group-name yeto-db-subnet \
  --multi-az \
  --storage-encrypted \
  --backup-retention-period 7 \
  --db-name yeto

# Wait for RDS to be available (takes 10-15 minutes)
aws rds wait db-instance-available --db-instance-identifier yeto-db

# Get the endpoint
aws rds describe-db-instances --db-instance-identifier yeto-db --query 'DBInstances[0].Endpoint.Address' --output text
```

### Step 6: Create S3 Buckets

```bash
# Create buckets
aws s3 mb s3://yeto-assets-prod --region us-east-1
aws s3 mb s3://yeto-storage-prod --region us-east-1

# Configure CORS for storage bucket
cat > cors.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["https://yeto.causewaygrp.com"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF
aws s3api put-bucket-cors --bucket yeto-storage-prod --cors-configuration file://cors.json
```

### Step 7: Create Secrets in AWS Secrets Manager

```bash
# Create secret for database credentials
aws secretsmanager create-secret \
  --name yeto/database \
  --description "YETO Database Credentials" \
  --secret-string '{
    "username": "yeto_admin",
    "password": "YOUR_SECURE_PASSWORD",
    "host": "yeto-db.xxxxxxxxx.us-east-1.rds.amazonaws.com",
    "port": 3306,
    "database": "yeto"
  }'

# Create secret for application secrets
aws secretsmanager create-secret \
  --name yeto/app \
  --description "YETO Application Secrets" \
  --secret-string '{
    "JWT_SECRET": "your-jwt-secret-min-32-chars",
    "OAUTH_SERVER_URL": "https://api.manus.im",
    "VITE_APP_ID": "your-app-id",
    "BUILT_IN_FORGE_API_KEY": "your-forge-api-key"
  }'
```

### Step 8: Create ECS Cluster and Task Definition

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name yeto-cluster --capacity-providers FARGATE FARGATE_SPOT

# Create CloudWatch log group
aws logs create-log-group --log-group-name /ecs/yeto-platform

# Create task execution role
aws iam create-role --role-name yetoEcsTaskExecutionRole --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ecs-tasks.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}'

aws iam attach-role-policy --role-name yetoEcsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
aws iam attach-role-policy --role-name yetoEcsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

Create the task definition file `task-definition.json`:

```json
{
  "family": "yeto-platform",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/yetoEcsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/yetoEcsTaskRole",
  "containerDefinitions": [
    {
      "name": "yeto-web",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/yeto-platform:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3000"}
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:yeto/database:DATABASE_URL::"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:yeto/app:JWT_SECRET::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/yeto-platform",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

Register the task definition:

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### Step 9: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name yeto-alb \
  --subnets subnet-public-1a subnet-public-1b \
  --security-groups sg-alb \
  --scheme internet-facing \
  --type application

# Create target group
aws elbv2 create-target-group \
  --name yeto-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-path /api/health \
  --health-check-interval-seconds 30

# Create HTTPS listener (after ACM certificate is validated)
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:loadbalancer/app/yeto-alb/xxxxx \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/xxxxx \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/yeto-tg/xxxxx
```

### Step 10: Create ECS Service

```bash
aws ecs create-service \
  --cluster yeto-cluster \
  --service-name yeto-service \
  --task-definition yeto-platform \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-private-1a,subnet-private-1b],securityGroups=[sg-ecs],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/yeto-tg/xxxxx,containerName=yeto-web,containerPort=3000" \
  --health-check-grace-period-seconds 120
```

### Step 11: Request SSL Certificate (ACM)

```bash
# Request certificate (must be in us-east-1 for CloudFront)
aws acm request-certificate \
  --domain-name yeto.causewaygrp.com \
  --subject-alternative-names "*.causewaygrp.com" \
  --validation-method DNS \
  --region us-east-1

# Get validation records
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/xxxxx \
  --query 'Certificate.DomainValidationOptions'
```

Add the CNAME validation records to Route 53, then wait for validation:

```bash
aws acm wait certificate-validated --certificate-arn arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/xxxxx
```

### Step 12: Create CloudFront Distribution

```bash
# Create Origin Access Control for S3
aws cloudfront create-origin-access-control \
  --origin-access-control-config '{
    "Name": "yeto-s3-oac",
    "Description": "OAC for YETO S3 bucket",
    "SigningProtocol": "sigv4",
    "SigningBehavior": "always",
    "OriginAccessControlOriginType": "s3"
  }'
```

Create CloudFront distribution configuration `cloudfront-config.json`:

```json
{
  "CallerReference": "yeto-distribution-2025",
  "Comment": "YETO Platform CDN",
  "Enabled": true,
  "Aliases": {
    "Quantity": 1,
    "Items": ["yeto.causewaygrp.com"]
  },
  "DefaultRootObject": "",
  "Origins": {
    "Quantity": 2,
    "Items": [
      {
        "Id": "yeto-alb",
        "DomainName": "yeto-alb-xxxxx.us-east-1.elb.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only",
          "OriginSslProtocols": {"Quantity": 1, "Items": ["TLSv1.2"]}
        }
      },
      {
        "Id": "yeto-s3-assets",
        "DomainName": "yeto-assets-prod.s3.us-east-1.amazonaws.com",
        "S3OriginConfig": {"OriginAccessIdentity": ""},
        "OriginAccessControlId": "EXXXXXXXXX"
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "yeto-alb",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {"Quantity": 7, "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]},
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
    "OriginRequestPolicyId": "216adef6-5c7f-47e4-b989-5492eafa07d3",
    "Compress": true
  },
  "CacheBehaviors": {
    "Quantity": 1,
    "Items": [
      {
        "PathPattern": "/assets/*",
        "TargetOriginId": "yeto-s3-assets",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"]},
        "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
        "Compress": true
      }
    ]
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {"ErrorCode": 403, "ResponsePagePath": "/index.html", "ResponseCode": "200", "ErrorCachingMinTTL": 10},
      {"ErrorCode": 404, "ResponsePagePath": "/index.html", "ResponseCode": "200", "ErrorCachingMinTTL": 10}
    ]
  },
  "ViewerCertificate": {
    "ACMCertificateArn": "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/xxxxx",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "HttpVersion": "http2and3",
  "PriceClass": "PriceClass_100"
}
```

```bash
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### Step 13: Configure DNS (Route 53)

```bash
# Get CloudFront distribution domain name
export CF_DOMAIN=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[0]=='yeto.causewaygrp.com'].DomainName" --output text)

# Create A record (Alias to CloudFront)
aws route53 change-resource-record-sets --hosted-zone-id ZXXXXXXXXXXXXX --change-batch '{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "yeto.causewaygrp.com",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "Z2FDTNDATAQYW2",
        "DNSName": "'$CF_DOMAIN'",
        "EvaluateTargetHealth": false
      }
    }
  }]
}'

# Create AAAA record for IPv6
aws route53 change-resource-record-sets --hosted-zone-id ZXXXXXXXXXXXXX --change-batch '{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "yeto.causewaygrp.com",
      "Type": "AAAA",
      "AliasTarget": {
        "HostedZoneId": "Z2FDTNDATAQYW2",
        "DNSName": "'$CF_DOMAIN'",
        "EvaluateTargetHealth": false
      }
    }
  }]
}'
```

---

## Environment Variables

The following environment variables must be configured for the YETO application:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:3306/yeto` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your-secure-jwt-secret-here` |
| `VITE_APP_ID` | Manus OAuth App ID | `app-xxxxx` |
| `OAUTH_SERVER_URL` | Manus OAuth server | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal | `https://manus.im/login` |
| `OWNER_OPEN_ID` | Owner's Manus Open ID | `user-xxxxx` |
| `OWNER_NAME` | Owner's display name | `CauseWay` |
| `BUILT_IN_FORGE_API_URL` | Manus Forge API URL | `https://api.manus.im/forge` |
| `BUILT_IN_FORGE_API_KEY` | Manus Forge API key | `key-xxxxx` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIAXXXXXXXX` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `xxxxxxxx` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `S3_BUCKET` | S3 storage bucket | `yeto-storage-prod` |
| `REDIS_URL` | Redis connection URL | `redis://yeto-redis.xxxxx.cache.amazonaws.com:6379` |

---

## Database Setup

### Running Migrations

After the RDS instance is available, run database migrations:

```bash
# Connect to a bastion host or use AWS Session Manager
# Then run migrations from the YETO project

export DATABASE_URL="mysql://yeto_admin:PASSWORD@yeto-db.xxxxx.us-east-1.rds.amazonaws.com:3306/yeto"

# Generate and run migrations
pnpm db:push
```

### Database Backup Strategy

Configure automated backups in RDS:

1. **Automated Backups**: Enabled with 7-day retention
2. **Manual Snapshots**: Before major deployments
3. **Cross-Region Replication**: For disaster recovery (optional)

---

## Monitoring and Logging

### CloudWatch Alarms

Create alarms for critical metrics:

```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name yeto-high-cpu \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --dimensions Name=ClusterName,Value=yeto-cluster Name=ServiceName,Value=yeto-service \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:yeto-alerts

# Unhealthy targets alarm
aws cloudwatch put-metric-alarm \
  --alarm-name yeto-unhealthy-targets \
  --metric-name UnHealthyHostCount \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 60 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 2 \
  --dimensions Name=TargetGroup,Value=targetgroup/yeto-tg/xxxxx Name=LoadBalancer,Value=app/yeto-alb/xxxxx \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:yeto-alerts
```

### Log Groups

All application logs are sent to CloudWatch Logs:

| Log Group | Description |
|-----------|-------------|
| `/ecs/yeto-platform` | Application logs |
| `/aws/rds/instance/yeto-db/error` | Database error logs |
| `/aws/rds/instance/yeto-db/slowquery` | Slow query logs |

---

## Cost Estimation

Estimated monthly costs for production deployment (us-east-1):

| Service | Configuration | Estimated Cost |
|---------|---------------|----------------|
| ECS Fargate | 2 tasks × 1 vCPU × 2GB | $60-80 |
| RDS MySQL | db.t3.medium, Multi-AZ | $120-150 |
| ElastiCache | cache.t3.micro | $15-20 |
| ALB | Standard usage | $20-30 |
| CloudFront | 100GB transfer | $10-20 |
| S3 | 50GB storage | $2-5 |
| Route 53 | 1 hosted zone | $0.50 |
| Secrets Manager | 5 secrets | $2 |
| CloudWatch | Standard logs/metrics | $10-20 |
| **Total** | | **$240-330/month** |

For cost optimization:
- Use Fargate Spot for non-critical tasks (up to 70% savings)
- Use Reserved Instances for RDS (up to 40% savings)
- Enable S3 Intelligent-Tiering for infrequently accessed data

---

## Security Best Practices

1. **Network Security**
   - Keep database and cache in private subnets
   - Use security groups to restrict traffic
   - Enable VPC Flow Logs for network monitoring

2. **Data Security**
   - Enable encryption at rest (RDS, S3, ElastiCache)
   - Enable encryption in transit (TLS 1.2+)
   - Use AWS Secrets Manager for credentials

3. **Access Control**
   - Use IAM roles instead of access keys where possible
   - Enable MFA for AWS console access
   - Follow principle of least privilege

4. **Application Security**
   - Keep dependencies updated
   - Enable container image scanning in ECR
   - Use AWS WAF for web application firewall (optional)

---

## Troubleshooting

### Common Issues

**Issue: ECS tasks failing to start**
- Check CloudWatch logs for error messages
- Verify secrets are accessible
- Ensure security groups allow outbound traffic

**Issue: Database connection refused**
- Verify RDS security group allows traffic from ECS
- Check DATABASE_URL format
- Ensure RDS is in "available" state

**Issue: 502 Bad Gateway from ALB**
- Check ECS task health status
- Verify target group health checks
- Review application startup logs

**Issue: CloudFront returning 403**
- Update S3 bucket policy for OAC
- Check Origin Access Control configuration
- Verify bucket name matches origin

### Useful Commands

```bash
# View ECS service events
aws ecs describe-services --cluster yeto-cluster --services yeto-service --query 'services[0].events[:5]'

# View recent logs
aws logs tail /ecs/yeto-platform --since 1h

# Force new deployment
aws ecs update-service --cluster yeto-cluster --service yeto-service --force-new-deployment

# Check RDS status
aws rds describe-db-instances --db-instance-identifier yeto-db --query 'DBInstances[0].DBInstanceStatus'
```

---

## Appendix: Terraform Configuration

For infrastructure as code, a complete Terraform configuration is available in the `/infrastructure/terraform` directory of the YETO repository. This allows reproducible deployments and version-controlled infrastructure changes.

---

## Support

For deployment assistance or issues, contact:
- **Email**: yeto@causewaygrp.com
- **Documentation**: https://docs.yeto.causewaygrp.com
- **GitHub Issues**: https://github.com/causeway/yeto-platform/issues

---

*Document prepared by CauseWay Financial & Banking Consultancies*  
*© 2025 CauseWay. All rights reserved.*
