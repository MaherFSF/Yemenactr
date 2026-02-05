# Deployment Secrets Configuration

This document describes the GitHub Secrets required for the AWS deployment workflow.

## Required GitHub Secrets

Configure these secrets in your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

### AWS Configuration

#### Option 1: OIDC Role (Recommended)

**`AWS_ROLE_TO_ASSUME`** (Required)
- **Description**: ARN of the IAM role for GitHub Actions OIDC authentication
- **Format**: `arn:aws:iam::ACCOUNT_ID:role/GitHubActionsDeployRole`
- **Security**: Uses OpenID Connect - no long-lived credentials needed
- **Permissions Required**:
  - `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` on deployment bucket
  - `cloudfront:CreateInvalidation` on CloudFront distribution

**Example IAM Role Trust Policy**:
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
          "token.actions.githubusercontent.com:sub": "repo:MaherFSF/Yemenactr:*"
        }
      }
    }
  ]
}
```

**Example IAM Role Policy**:
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
        "arn:aws:s3:::YOUR-BUCKET-NAME/*",
        "arn:aws:s3:::YOUR-BUCKET-NAME"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::ACCOUNT_ID:distribution/YOUR-DISTRIBUTION-ID"
    }
  ]
}
```

#### Option 2: Access Keys (Alternative)

If OIDC is not available, use IAM access keys:

**`AWS_ACCESS_KEY_ID`** (Alternative to OIDC)
- **Description**: AWS IAM user access key ID
- **Security**: Long-lived credential - rotate regularly
- **Format**: `AKIA...` (20 characters)

**`AWS_SECRET_ACCESS_KEY`** (Alternative to OIDC)
- **Description**: AWS IAM user secret access key
- **Security**: Highly sensitive - never commit or log
- **Format**: 40-character string

⚠️ **Note**: If using access keys, modify `.github/workflows/deploy.yml`:
```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ secrets.AWS_REGION }}
```

### AWS Infrastructure Secrets

**`AWS_REGION`** (Required)
- **Description**: AWS region where resources are deployed
- **Example**: `us-east-1`, `eu-west-1`, `ap-southeast-1`
- **Default**: `us-east-1` (if CloudFront is used)

**`S3_BUCKET`** (Required)
- **Description**: Name of the S3 bucket for hosting static files
- **Format**: Bucket name only (no `s3://` prefix)
- **Example**: `yeto-production-website`
- **Configuration**: Bucket must be configured for static website hosting

**`CLOUDFRONT_DISTRIBUTION_ID`** (Required)
- **Description**: CloudFront distribution ID for cache invalidation
- **Format**: 14-character alphanumeric string
- **Example**: `E1234ABCD5EFGH`
- **Find**: AWS Console → CloudFront → Distributions → ID column

**`CLOUDFRONT_DOMAIN`** (Required)
- **Description**: CloudFront distribution domain name (or custom domain)
- **Format**: Domain name without protocol
- **Example**: `d111111abcdef8.cloudfront.net` or `yeto.example.com`
- **Purpose**: Used for smoke tests and deployment summaries

## Setting Up OIDC (Recommended Approach)

### Step 1: Create OIDC Provider in AWS

In AWS IAM Console:
1. Go to **IAM → Identity providers → Add provider**
2. Provider type: **OpenID Connect**
3. Provider URL: `https://token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Click **Add provider**

### Step 2: Create IAM Role

1. Go to **IAM → Roles → Create role**
2. Trusted entity type: **Web identity**
3. Identity provider: `token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Add the trust policy shown above (with your GitHub org/repo)
6. Attach the permissions policy shown above (with your bucket/distribution)
7. Name: `GitHubActionsDeployRole`
8. Copy the Role ARN

### Step 3: Add GitHub Secret

1. Go to GitHub repository → **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `AWS_ROLE_TO_ASSUME`
4. Value: The Role ARN from step 2
5. Save

## Security Best Practices

### Secret Management
- ✅ **Use OIDC** instead of access keys when possible
- ✅ **Rotate secrets** regularly (every 90 days minimum)
- ✅ **Limit permissions** to least privilege required
- ✅ **Use environment protection** for production deployments
- ✅ **Audit access** regularly in CloudTrail

### GitHub Environments
Configure production environment protection:
1. Go to **Settings → Environments → New environment**
2. Name: `production`
3. Enable **Required reviewers** (optional but recommended)
4. Set **Wait timer** if desired
5. Add environment-specific secrets if needed

### Monitoring
- Enable CloudTrail logging for S3 and CloudFront API calls
- Set up CloudWatch alarms for unusual deployment activity
- Review GitHub Actions logs regularly

## Troubleshooting

### "AssumeRoleWithWebIdentity failed"
- Verify OIDC provider is configured in AWS
- Check trust policy includes correct GitHub repo path
- Ensure `id-token: write` permission in workflow

### "Access Denied" on S3
- Verify IAM role has `s3:PutObject`, `s3:ListBucket` permissions
- Check bucket policy doesn't block the role
- Confirm bucket name matches exactly

### "Access Denied" on CloudFront
- Verify IAM role has `cloudfront:CreateInvalidation` permission
- Check distribution ID is correct
- Ensure distribution is not disabled

### Secrets Not Available
- Verify secret names match exactly (case-sensitive)
- Check secrets are in correct GitHub environment
- Ensure workflow has access to repository secrets

## Testing Secrets Configuration

You can test the deployment workflow with `workflow_dispatch`:
1. Go to **Actions → Deploy to AWS → Run workflow**
2. Select branch
3. Click **Run workflow**
4. Check logs for any secret-related errors

## Updating Secrets

When rotating credentials:
1. Create new credentials in AWS
2. Update GitHub secret with new value
3. Test deployment workflow
4. Delete old credentials in AWS (after successful test)

## Reference Documentation

- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS IAM Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)
- [S3 Bucket Policy](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html)
- [CloudFront Invalidation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html)

## Support

For issues with deployment:
- **GitHub Actions**: Check workflow logs in Actions tab
- **AWS Permissions**: Review IAM role policies in AWS Console
- **Infrastructure**: See `docs/AWS_DEPLOYMENT_GUIDE.md`
