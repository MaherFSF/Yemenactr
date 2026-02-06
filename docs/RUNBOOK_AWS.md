# YETO Platform - AWS Deployment Runbook

## Overview

This runbook provides step-by-step instructions for deploying YETO on AWS infrastructure. The platform is designed to be portable and can run on any cloud provider or on-premises infrastructure.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Cloud                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     VPC (10.0.0.0/16)                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │ Public      │  │ Private     │  │ Database    │     │   │
│  │  │ Subnet      │  │ Subnet      │  │ Subnet      │     │   │
│  │  │ 10.0.1.0/24 │  │ 10.0.2.0/24 │  │ 10.0.3.0/24 │     │   │
│  │  │             │  │             │  │             │     │   │
│  │  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │     │   │
│  │  │ │   ALB   │ │  │ │   ECS   │ │  │ │   RDS   │ │     │   │
│  │  │ └─────────┘ │  │ │ Fargate │ │  │ │  MySQL  │ │     │   │
│  │  │             │  │ └─────────┘ │  │ └─────────┘ │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  │                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │     S3      │  │ ElastiCache │  │  CloudWatch │     │   │
│  │  │   Bucket    │  │   Redis     │  │    Logs     │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- AWS CLI configured with appropriate permissions
- Terraform 1.5+ (optional, for IaC deployment)
- Docker installed locally
- Access to AWS ECR for container images

## Quick Start

### 1. Set Environment Variables

```bash
export AWS_REGION=me-south-1  # Bahrain (closest to Yemen)
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export YETO_ENV=production
```

### 2. Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name yeto/platform \
  --region $AWS_REGION

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

### 3. Build and Push Image

```bash
# Build image
docker build -t yeto/platform:latest .

# Tag for ECR
docker tag yeto/platform:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/yeto/platform:latest

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/yeto/platform:latest
```

### 4. Create RDS Database

```bash
aws rds create-db-instance \
  --db-instance-identifier yeto-db \
  --db-instance-class db.t3.medium \
  --engine mysql \
  --engine-version 8.0 \
  --master-username yeto_admin \
  --master-user-password <SECURE_PASSWORD> \
  --allocated-storage 100 \
  --storage-type gp3 \
  --vpc-security-group-ids <SECURITY_GROUP_ID> \
  --db-subnet-group-name yeto-db-subnet \
  --backup-retention-period 7 \
  --multi-az \
  --storage-encrypted
```

### 5. Create S3 Bucket

```bash
aws s3 mb s3://yeto-storage-$AWS_ACCOUNT_ID --region $AWS_REGION

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket yeto-storage-$AWS_ACCOUNT_ID \
  --versioning-configuration Status=Enabled

# Set CORS for browser uploads
aws s3api put-bucket-cors \
  --bucket yeto-storage-$AWS_ACCOUNT_ID \
  --cors-configuration file://infra/aws/s3-cors.json
```

### 5.1 Publish Release Manifest (Recommended)

Publish the release manifest so production can expose a verifiable version:

```bash
# Suggested public path for the manifest
aws s3 cp docs/releases/latest.json \
  s3://yeto-assets/releases/latest.json
```

This manifest is served via CloudFront/ALB. ACM only handles TLS.

### 6. Create ElastiCache Redis

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id yeto-redis \
  --cache-node-type cache.t3.medium \
  --engine redis \
  --num-cache-nodes 1 \
  --cache-subnet-group-name yeto-cache-subnet \
  --security-group-ids <SECURITY_GROUP_ID>
```

### 7. Deploy ECS Service

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name yeto-cluster

# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://infra/aws/ecs-task-definition.json

# Create service
aws ecs create-service \
  --cluster yeto-cluster \
  --service-name yeto-app \
  --task-definition yeto-app:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[<SUBNET_IDS>],securityGroups=[<SG_ID>],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=<TARGET_GROUP_ARN>,containerName=yeto,containerPort=3000"
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string | Yes |
| `JWT_SECRET` | Session signing secret | Yes |
| `S3_BUCKET` | S3 bucket name | Yes |
| `AWS_ACCESS_KEY_ID` | AWS credentials | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials | Yes |
| `AWS_REGION` | AWS region | Yes |
| `REDIS_URL` | ElastiCache endpoint | Yes |
| `AI_PROVIDER` | AI provider (openai/anthropic/local) | No |
| `AI_API_KEY` | AI provider API key | No |

## Monitoring

### CloudWatch Alarms

```bash
# CPU utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name yeto-cpu-high \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions <SNS_TOPIC_ARN>

# Memory utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name yeto-memory-high \
  --metric-name MemoryUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 85 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions <SNS_TOPIC_ARN>
```

### Health Check Endpoint

The application exposes `/api/health` for load balancer health checks:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-01-29T12:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "s3": "connected"
  }
}
```

## Backup & Recovery

### Database Backups

RDS automated backups are enabled with 7-day retention. For manual snapshots:

```bash
aws rds create-db-snapshot \
  --db-instance-identifier yeto-db \
  --db-snapshot-identifier yeto-db-$(date +%Y%m%d)
```

### S3 Versioning

S3 versioning is enabled for document recovery. To restore a previous version:

```bash
aws s3api list-object-versions \
  --bucket yeto-storage-$AWS_ACCOUNT_ID \
  --prefix documents/

aws s3api get-object \
  --bucket yeto-storage-$AWS_ACCOUNT_ID \
  --key documents/example.pdf \
  --version-id <VERSION_ID> \
  restored-example.pdf
```

## Scaling

### Auto Scaling

ECS auto scaling is configured based on CPU and memory utilization:

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/yeto-cluster/yeto-app \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/yeto-cluster/yeto-app \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name yeto-cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://infra/aws/scaling-policy.json
```

## Troubleshooting

### Common Issues

1. **Container fails to start**
   - Check CloudWatch logs: `aws logs get-log-events --log-group-name /ecs/yeto-app`
   - Verify environment variables in task definition
   - Check security group rules for database access

2. **Database connection errors**
   - Verify RDS security group allows inbound from ECS tasks
   - Check DATABASE_URL format: `mysql://user:pass@host:3306/dbname`
   - Ensure RDS is in the correct VPC subnet

3. **S3 access denied**
   - Verify IAM role attached to ECS task has S3 permissions
   - Check bucket policy allows the task role

### Support

For issues specific to YETO platform:
- GitHub Issues: https://github.com/yeto/platform/issues
- Documentation: https://docs.yeto.org

## Security Considerations

1. **Secrets Management**: Use AWS Secrets Manager for sensitive values
2. **Network Security**: Keep database in private subnet, no public access
3. **Encryption**: Enable encryption at rest for RDS and S3
4. **IAM**: Use least-privilege IAM roles for ECS tasks
5. **Logging**: Enable CloudTrail for audit logging
