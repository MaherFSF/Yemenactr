# AWS Deployment Guide

This document describes the GitHub Actions → AWS deployment pipeline for the Yemen ACTR platform.

## Overview

The deployment pipeline automatically builds and deploys the application to AWS S3 and CloudFront when changes are pushed to the `main` branch.

## Architecture

```
GitHub Actions → Build → AWS S3 → CloudFront CDN → Users
```

## Required GitHub Secrets

Configure these secrets in **Settings → Secrets and variables → Actions** in your GitHub repository:

### Required Secrets

| Secret Name | Description | Example |
|------------|-------------|---------|
| `AWS_ROLE_ARN` | ARN of the AWS IAM role for OIDC authentication | `arn:aws:iam::123456789012:role/GitHubActionsDeployRole` |
| `AWS_S3_BUCKET` | Name of the S3 bucket for hosting static files | `yemenactr-production` |
| `AWS_REGION` | AWS region (optional, defaults to `us-east-1`) | `us-east-1` |

### Optional Secrets

| Secret Name | Description | Example |
|------------|-------------|---------|
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID for cache invalidation | `E1234EXAMPLE` |

## AWS Infrastructure Setup

### 1. Create S3 Bucket

```bash
aws s3 mb s3://yemenactr-production --region us-east-1
```

Configure the bucket for static website hosting:

```bash
aws s3 website s3://yemenactr-production \
  --index-document index.html \
  --error-document index.html
```

### 2. Create IAM Role for GitHub Actions

Create an IAM role with OIDC federation for GitHub Actions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/YOUR_REPO:*"
        }
      }
    }
  ]
}
```

Attach this policy to the role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::yemenactr-production",
        "arn:aws:s3:::yemenactr-production/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::ACCOUNT_ID:distribution/*"
    }
  ]
}
```

### 3. Create CloudFront Distribution (Optional)

For better performance and HTTPS support:

```bash
aws cloudfront create-distribution \
  --origin-domain-name yemenactr-production.s3.amazonaws.com \
  --default-root-object index.html
```

Note the Distribution ID and add it as `AWS_CLOUDFRONT_DISTRIBUTION_ID` secret.

## Workflow Configuration

The deployment workflow (`.github/workflows/deploy.yml`) automatically:

1. Checks out the code
2. Installs dependencies with `pnpm`
3. Builds the application with `pnpm build`
4. Authenticates with AWS using OIDC (no long-lived credentials needed)
5. Syncs built files to S3 with appropriate cache headers
6. Invalidates CloudFront cache (if configured)

## Cache Strategy

The deployment uses the following cache control headers:

- **Static assets** (JS, CSS, images): `max-age=31536000, immutable` (1 year)
- **HTML files**: `max-age=0, must-revalidate` (always check for updates)

## Manual Deployment

To manually trigger a deployment:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to AWS** workflow
3. Click **Run workflow**
4. Select the branch (usually `main`)

## Troubleshooting

### Build fails with "No dist directory found"

Ensure `pnpm build` creates either `client/dist/` or `dist/` directory.

### AWS authentication fails

- Verify the `AWS_ROLE_ARN` is correct
- Ensure the GitHub OIDC provider is configured in AWS IAM
- Check the trust policy allows your repository

### S3 sync fails

- Verify the IAM role has `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket` permissions
- Check the bucket name in `AWS_S3_BUCKET` secret

### CloudFront invalidation fails

- Verify the IAM role has `cloudfront:CreateInvalidation` permission
- Check the distribution ID in `AWS_CLOUDFRONT_DISTRIBUTION_ID` secret

## Security Best Practices

1. **Use OIDC instead of access keys** - The workflow uses short-lived tokens via OIDC
2. **Principle of least privilege** - IAM role only has permissions needed for deployment
3. **No secrets in code** - All credentials configured as GitHub secrets
4. **Enable S3 bucket versioning** - Allows rollback if needed
5. **Enable CloudFront logging** - Monitor access patterns

## Rollback Procedure

If a deployment causes issues:

1. Revert the commit in GitHub
2. Wait for automatic redeployment, or
3. Use S3 versioning to restore previous version:

```bash
aws s3 sync s3://yemenactr-production/ ./backup/ --source-region us-east-1
```

## Cost Estimation

Approximate AWS costs (USD/month):

- S3 storage: $0.023/GB (~$2-5 for typical app)
- S3 requests: $0.0004/1000 GET requests
- CloudFront: $0.085/GB data transfer (first 10 TB)
- CloudFront requests: $0.0075/10,000 HTTPS requests

Expected monthly cost: **$10-50** depending on traffic.

## Support

For infrastructure issues, contact the DevOps team or raise an issue in the repository.
