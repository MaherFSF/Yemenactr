# Cursor Operating System & AWS Deployment Setup

This document describes the Cursor-based development setup and AWS deployment pipeline added to the YemenACTR repository.

## Overview

This setup enables:
1. **Cursor AI-assisted development** with custom rules, commands, and agent configurations
2. **Automated AWS deployment** via GitHub Actions to S3 and CloudFront

## What Was Added

### 1. Cursor Operating System

The cursor pack adds a comprehensive development environment:

#### `.cursor/` Directory
- **`.cursor/rules/`**: Cursor AI rules for the project
  - `00-execution-mode.mdc`: Execution guidelines
  - `01-evidence-provenance-laws.mdc`: Evidence and data provenance rules
  - `02-yemen-split-system.mdc`: Yemen-specific system rules
  - `03-licensing-safety-neutrality.mdc`: Licensing and safety guidelines
  - `04-bilingual-rtl.mdc`: Bilingual RTL support rules
  - `20-db-migrations-governance.mdc`: Database migration governance
  - `30-testing-release-gates.mdc`: Testing and release gate requirements

- **`.cursor/commands/`**: Custom Cursor commands
  - `schema-v25-governance-safe.md`: Schema v2.5 governance command
  - `release-gate-admin.md`: Release gate administration command
  - `route-inventory-playwright.md`: Route inventory testing command
  - `source-registry-import.md`: Source registry import command

#### `agentos/` Directory
Updated agent operating system with:
- **`agentos/prompts/`**: Prompt libraries for various tasks
- **`agentos/evals/`**: Evaluation checklists and configs
- **`agentos/policies/`**: Policy documents (e.g., EVIDENCE_LAWS.md)
- **`agentos/README.md`**: AgentOS documentation

**Note**: The previous `agentos/` directory was backed up to `agentos.bak`

#### `docs/` Directory
Added cursor-specific documentation:
- `CURSOR_MASTER_EXECUTION_CONTRACT_YEMENACTR.md`: Master execution contract
- `GAP_TICKETS.md`: Gap analysis tickets
- `DECISIONS.md`: Architectural decisions
- `ROUTE_INVENTORY.md`: Route inventory
- `RELEASE_GATES.md`: Release gate criteria
- `NEXT_ACTIONS.md`: Next action items

#### `data/source_registry/` Directory
- Production-ready data source registry spreadsheet
- `YETO_Sources_Universe_Master_PRODUCTION_READY_v2_0.xlsx`
- `README.md`: Registry documentation

### 2. AWS Deployment Pipeline

#### GitHub Actions Workflow: `.github/workflows/deploy.yml`

Automated deployment workflow that:
1. Builds the application using `pnpm build`
2. Verifies build output (checks `client/dist`, `dist`, or `build`)
3. Syncs built files to AWS S3 with appropriate cache headers
4. Invalidates CloudFront distribution (optional)

**Triggers**:
- Push to `main` branch
- Manual workflow dispatch

**Build Output Detection**:
The workflow automatically detects the build directory from:
- `client/dist` (primary)
- `dist` (fallback)
- `build` (fallback)

## AWS Deployment Configuration

### Required GitHub Secrets

To enable AWS deployment, add the following secrets to your GitHub repository:

1. **`AWS_ACCESS_KEY_ID`** (required)
   - AWS access key with S3 and CloudFront permissions

2. **`AWS_SECRET_ACCESS_KEY`** (required)
   - AWS secret access key

3. **`S3_BUCKET_NAME`** (required)
   - Name of the S3 bucket for deployment
   - Example: `yemenactr-production`

4. **`AWS_REGION`** (optional)
   - AWS region for resources
   - Default: `us-east-1`

5. **`CLOUDFRONT_DISTRIBUTION_ID`** (optional)
   - CloudFront distribution ID for cache invalidation
   - Only needed if using CloudFront CDN

### Adding Secrets

#### Via GitHub Web UI:
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with its value

#### Via GitHub CLI:
```bash
gh secret set AWS_ACCESS_KEY_ID --body "YOUR_ACCESS_KEY"
gh secret set AWS_SECRET_ACCESS_KEY --body "YOUR_SECRET_KEY"
gh secret set S3_BUCKET_NAME --body "your-bucket-name"
gh secret set AWS_REGION --body "us-east-1"
gh secret set CLOUDFRONT_DISTRIBUTION_ID --body "E1234567890ABC"
```

### AWS IAM Permissions

The AWS credentials must have the following permissions:

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
        "arn:aws:s3:::YOUR-BUCKET-NAME",
        "arn:aws:s3:::YOUR-BUCKET-NAME/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::ACCOUNT-ID:distribution/DISTRIBUTION-ID"
    }
  ]
}
```

## Testing the Setup

### Local Build Test
```bash
# Install dependencies
pnpm install

# Run build
pnpm build

# Verify output
ls -la client/dist
```

### Test Deployment Workflow Locally
```bash
# Using act (GitHub Actions local runner)
act -s AWS_ACCESS_KEY_ID="..." -s AWS_SECRET_ACCESS_KEY="..." -s S3_BUCKET_NAME="..."
```

## Deployment Process

### Automatic Deployment
When code is pushed to `main`:
1. CI workflow runs tests and release gates
2. If tests pass, deployment workflow triggers
3. Application is built
4. Build artifacts are synced to S3
5. CloudFront cache is invalidated (if configured)

### Manual Deployment
Trigger manually via GitHub Actions UI:
1. Go to Actions → Deploy to AWS
2. Click "Run workflow"
3. Select branch and run

## Cache Control Strategy

The deployment uses optimized cache headers:

- **Static assets** (JS, CSS, images): `max-age=31536000, immutable`
  - Cached for 1 year
  - Use content hashing in filenames for cache busting

- **HTML and JSON files**: `no-cache, no-store, must-revalidate`
  - Always fetched from server
  - Ensures users get latest version

## Troubleshooting

### Build Fails
Check that:
- `package.json` has a `build` script
- All dependencies are installed
- Build produces output in expected directory

### Deployment Fails
Common issues:
1. **Missing secrets**: Verify all required secrets are set
2. **Invalid AWS credentials**: Check access key and secret
3. **S3 permissions**: Ensure IAM policy allows S3 operations
4. **Wrong bucket name**: Verify `S3_BUCKET_NAME` is correct

### CloudFront Invalidation Issues
- Ensure `CLOUDFRONT_DISTRIBUTION_ID` is correct
- Verify IAM permissions include CloudFront invalidation
- Note: Invalidations can take 10-15 minutes to complete

## Maintenance

### Updating Cursor Pack
If a new cursor pack is released:
```bash
# Backup current setup
mv .cursor .cursor.old
mv agentos agentos.old

# Extract new pack
unzip yemenactr_cursor_pack_v2.zip -d /workspace/

# Review and merge changes
# Remove old backups when satisfied
```

### Updating Deployment Configuration
Edit `.github/workflows/deploy.yml` to:
- Change build directory detection
- Modify cache headers
- Adjust AWS regions
- Enable/disable CloudFront waiting

## Files Added/Modified

### New Files
- `.cursor/` (entire directory)
- `agentos/` (replaced, old version at `agentos.bak`)
- `docs/CURSOR_MASTER_EXECUTION_CONTRACT_YEMENACTR.md`
- `docs/GAP_TICKETS.md`
- `docs/DECISIONS.md`
- `docs/ROUTE_INVENTORY.md`
- `docs/RELEASE_GATES.md`
- `docs/NEXT_ACTIONS.md`
- `docs/CURSOR_DEPLOYMENT_SETUP.md` (this file)
- `data/source_registry/` (new directory)
- `.github/workflows/deploy.yml`
- `scripts/install-cursor-pack.mjs`

### Backed Up
- `agentos/` → `agentos.bak` (old AgentOS version)

## Next Steps

1. **Configure AWS secrets** in GitHub repository settings
2. **Set up S3 bucket** with static website hosting
3. **Create CloudFront distribution** (optional but recommended)
4. **Test deployment** by pushing to main or triggering manually
5. **Review backed up files** and remove `*.bak` directories if not needed

## Support

For issues with:
- **Cursor setup**: Review `.cursor/rules/` and `.cursor/commands/`
- **AWS deployment**: Check workflow logs in GitHub Actions
- **Build process**: Review `package.json` scripts and build configuration

## Related Documentation

- [AWS Deployment Guide](./AWS_DEPLOYMENT_GUIDE.md) - Original AWS setup documentation
- [Release Gates](./RELEASE_GATES.md) - Release criteria and gates
- [Master Execution Contract](./CURSOR_MASTER_EXECUTION_CONTRACT_YEMENACTR.md) - Cursor execution contract
- [Route Inventory](./ROUTE_INVENTORY.md) - Application route inventory
