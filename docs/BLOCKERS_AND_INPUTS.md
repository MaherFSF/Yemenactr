# YETO Platform - Blockers and Inputs Required

This document tracks items that require operator input, credentials, or external access to proceed. Each item includes why it's needed, how to obtain it, and the temporary fallback in place.

---

## Critical Inputs (Required for Production)

### DNS Configuration
- **Why Needed**: Production domain https://yeto.causewaygrp.com requires DNS records
- **How to Obtain**: 
  1. Access DNS management for causewaygrp.com
  2. Create A record pointing to production server IP
  3. Create CNAME for www subdomain
- **Fallback**: Platform runs on staging URL until DNS configured
- **Status**: Pending operator action

### TLS Certificate
- **Why Needed**: HTTPS required for production
- **How to Obtain**:
  1. Use Let's Encrypt with certbot
  2. Or obtain certificate from CA
  3. Configure in reverse proxy (nginx/caddy)
- **Fallback**: Staging uses self-signed certificate
- **Status**: Pending DNS configuration

### AWS Credentials (Optional)
- **Why Needed**: Production deployment to AWS infrastructure
- **How to Obtain**:
  1. Create IAM user with appropriate permissions
  2. Generate access key and secret
  3. Configure in GitHub Secrets or deployment environment
- **Fallback**: Docker Compose deployment on any cloud/VPS
- **Status**: Optional - cloud-agnostic deployment available

---

## API Keys (Required for Full Functionality)

### ACLED API Key
- **Why Needed**: Conflict event data for Yemen
- **How to Obtain**:
  1. Register at https://acleddata.com/
  2. Apply for API access
  3. Receive API key via email
- **Fallback**: Synthetic conflict data with DEV label
- **Status**: Blocked - requires registration

### IMF Data Access
- **Why Needed**: IFS and WEO data access
- **How to Obtain**:
  1. Check IMF data portal for API access
  2. Some datasets may require institutional subscription
- **Fallback**: World Bank data as alternative source
- **Status**: Blocked - verify access requirements

### LLM Provider API Key
- **Why Needed**: AI Assistant functionality
- **How to Obtain**:
  1. Configure LLM_PROVIDER environment variable
  2. Set appropriate API key (e.g., AWS Bedrock credentials)
- **Fallback**: LLM_PROVIDER=disabled - RAG retrieval still works, AI responses show "AI unavailable"
- **Status**: Using built-in LLM helper

---

## External Services (Optional Enhancements)

### Stripe API Keys
- **Why Needed**: Payment processing for subscriptions
- **How to Obtain**:
  1. Create Stripe account at https://stripe.com
  2. Get publishable and secret keys from dashboard
  3. Configure webhook endpoint
- **Fallback**: Manual invoicing mode - same entitlement model, no automated billing
- **Status**: Planned - manual mode available

### Email Service (SES/SMTP)
- **Why Needed**: Transactional emails (password reset, notifications)
- **How to Obtain**:
  1. AWS SES: Verify domain, request production access
  2. Or configure SMTP credentials for alternative provider
- **Fallback**: Console logging of emails in development
- **Status**: Pending configuration

### Analytics Service
- **Why Needed**: Usage tracking and insights
- **How to Obtain**:
  1. Built-in analytics available via platform
  2. Or configure external service (Plausible, etc.)
- **Fallback**: Basic server-side logging
- **Status**: Using built-in analytics

---

## Data Access (Requires Verification)

### Yemen Institutional Sources
- **Why Needed**: Official government data
- **How to Obtain**:
  1. Verify public availability of CBY, MoF, CSO publications
  2. Establish data sharing agreements if needed
  3. Document licensing terms
- **Fallback**: Partner-submitted data, international sources
- **Status**: Planned - verify access

### Commercial Entity Data
- **Why Needed**: HSA Group and major commercial entity profiles
- **How to Obtain**:
  1. Research public filings, annual reports
  2. Use credible secondary sources
  3. Verify all facts before publishing
- **Fallback**: Profiles marked "Verification pending"
- **Status**: In progress

---

## Infrastructure (Production Deployment)

### Production Server
- **Why Needed**: Host production deployment
- **How to Obtain**:
  1. Provision cloud VM (AWS EC2, DigitalOcean, etc.)
  2. Or use container orchestration (ECS, Kubernetes)
  3. Minimum specs: 4GB RAM, 2 vCPU, 50GB storage
- **Fallback**: Staging environment for demo
- **Status**: Pending operator decision

### Database (Production)
- **Why Needed**: Production database with backups
- **How to Obtain**:
  1. Use managed database service (RDS, PlanetScale, etc.)
  2. Or self-hosted PostgreSQL with backup scripts
- **Fallback**: Development database (not for production data)
- **Status**: Using platform-provided database

### Object Storage (Production)
- **Why Needed**: Document and file storage
- **How to Obtain**:
  1. AWS S3 bucket
  2. Or S3-compatible service (MinIO, Backblaze B2)
- **Fallback**: Local file storage (not recommended for production)
- **Status**: Using platform-provided storage

---

## TODO Items for Operator

1. **[ ] DNS**: Configure DNS records for yeto.causewaygrp.com
2. **[ ] TLS**: Obtain and configure TLS certificate
3. **[ ] ACLED**: Register for ACLED API access
4. **[ ] Stripe**: Set up Stripe account if payment processing needed
5. **[ ] Email**: Configure email service for notifications
6. **[ ] Server**: Provision production server infrastructure
7. **[ ] Verify**: Confirm access to Yemen institutional data sources

---

## Resolution Process

When an item is resolved:
1. Update status in this document
2. Remove from TODO list
3. Update `/STATUS.md` with resolution date
4. Commit changes with reference to blocker ID

---

*Last updated: December 2024*
