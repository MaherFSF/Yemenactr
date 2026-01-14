# YETO Deployment Guide

## Overview

This guide covers deploying the YETO platform to production environments, including AWS, GitHub, and custom infrastructure.

## Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Storage | 50 GB SSD | 100 GB SSD |
| Node.js | 18.x | 22.x |
| Database | MySQL 8.0 | TiDB Serverless |

### Required Accounts

- AWS Account (for S3, optional EC2)
- GitHub Account (for code repository)
- TiDB Cloud Account (for database)
- Domain registrar (for custom domain)

## Export Platform Bundle

### Generate Export Bundle

The platform can be exported as a complete bundle:

```bash
cd /home/ubuntu/yeto-platform
pnpm run export-bundle
```

### Bundle Contents

```
yeto-platform-bundle/
├── client/                 # Frontend source
├── server/                 # Backend source
├── drizzle/               # Database schema & migrations
├── docs/                  # Documentation
├── shared/                # Shared types
├── storage/               # S3 helpers
├── package.json           # Dependencies
├── .env.template          # Environment template (no secrets)
├── drizzle.config.ts      # Database config
├── vite.config.ts         # Build config
└── README.md              # Setup instructions
```

### What's Excluded

- `.env` files (secrets)
- `node_modules/`
- Build artifacts (`dist/`)
- User data
- API keys

## Environment Configuration

### Environment Template

Create `.env` from template:

```bash
cp .env.template .env
```

### Required Variables

```env
# Database
DATABASE_URL=mysql://user:pass@host:3306/database?ssl={"rejectUnauthorized":true}

# Authentication
JWT_SECRET=your-256-bit-secret
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login

# Storage
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key

# Optional: External APIs
HDX_API_KEY=your-hdx-key
ACLED_API_KEY=your-acled-key
```

## Database Setup

### TiDB Cloud (Recommended)

1. Create TiDB Serverless cluster
2. Get connection string from console
3. Update DATABASE_URL in `.env`
4. Run migrations:

```bash
pnpm db:push
```

### MySQL Self-Hosted

1. Install MySQL 8.0+
2. Create database:

```sql
CREATE DATABASE yeto_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'yeto'@'%' IDENTIFIED BY 'secure-password';
GRANT ALL PRIVILEGES ON yeto_platform.* TO 'yeto'@'%';
FLUSH PRIVILEGES;
```

3. Run migrations:

```bash
pnpm db:push
```

## Build Process

### Production Build

```bash
# Install dependencies
pnpm install

# Build frontend and backend
pnpm build

# Output in dist/ directory
```

### Build Verification

```bash
# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Deployment Options

### Option 1: Manus Hosting (Recommended)

1. Create checkpoint in Manus
2. Click "Publish" button
3. Configure custom domain in Settings → Domains
4. SSL automatically provisioned

### Option 2: AWS EC2

1. Launch EC2 instance (Ubuntu 22.04)
2. Install Node.js 22.x
3. Clone repository
4. Configure environment
5. Build and start:

```bash
pnpm install
pnpm build
pm2 start dist/server/index.js --name yeto-platform
```

### Option 3: Docker

```dockerfile
FROM node:22-alpine

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["node", "dist/server/index.js"]
```

```bash
docker build -t yeto-platform .
docker run -p 3000:3000 --env-file .env yeto-platform
```

### Option 4: GitHub + Vercel/Railway

1. Export to GitHub (Settings → GitHub)
2. Connect to Vercel/Railway
3. Configure environment variables
4. Deploy

## AWS Infrastructure

### S3 Storage Setup

```bash
# Create bucket
aws s3 mb s3://yeto-storage --region us-east-1

# Configure CORS
aws s3api put-bucket-cors --bucket yeto-storage --cors-configuration file://cors.json
```

`cors.json`:
```json
{
  "CORSRules": [{
    "AllowedOrigins": ["https://yeto.org", "https://*.yeto.org"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }]
}
```

### CloudFront CDN (Optional)

1. Create CloudFront distribution
2. Origin: S3 bucket or EC2 instance
3. Configure SSL certificate
4. Update DNS to point to CloudFront

## Domain Configuration

### DNS Setup

| Record | Type | Value |
|--------|------|-------|
| @ | A | Server IP |
| www | CNAME | @ |
| api | CNAME | @ |

### SSL Certificate

**Let's Encrypt (Free)**:
```bash
sudo certbot --nginx -d yeto.org -d www.yeto.org
```

**AWS Certificate Manager**:
1. Request certificate in ACM
2. Validate via DNS
3. Attach to CloudFront/ALB

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name yeto.org www.yeto.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yeto.org www.yeto.org;

    ssl_certificate /etc/letsencrypt/live/yeto.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yeto.org/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Process Management

### PM2 Setup

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/server/index.js --name yeto-platform

# Configure startup
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Systemd Alternative

```ini
[Unit]
Description=YETO Platform
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/yeto-platform
ExecStart=/usr/bin/node dist/server/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

## Health Checks

### Application Health

```bash
curl https://yeto.org/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "storage": "connected",
  "version": "1.0.0"
}
```

### Monitoring Setup

1. Configure uptime monitoring (UptimeRobot, Pingdom)
2. Set up error tracking (Sentry)
3. Configure log aggregation (CloudWatch, Datadog)

## Rollback Procedure

### Quick Rollback

```bash
# List checkpoints
git log --oneline -10

# Rollback to checkpoint
git checkout <checkpoint-hash>
pnpm install
pnpm build
pm2 restart yeto-platform
```

### Database Rollback

```bash
# Restore from backup
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME < backup.sql
```

## Security Checklist

- [ ] SSL certificate configured
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Backup system verified

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check Node.js version, clear cache |
| Database connection | Verify DATABASE_URL, check firewall |
| S3 access denied | Check IAM permissions, bucket policy |
| SSL errors | Renew certificate, check chain |

### Logs

```bash
# Application logs
pm2 logs yeto-platform

# Nginx logs
tail -f /var/log/nginx/error.log

# System logs
journalctl -u yeto-platform -f
```

## Support

For deployment assistance:
- Documentation: `/docs/`
- GitHub Issues: Report bugs
- Email: support@yeto.org

---

*Last Updated: January 14, 2026*
*Version: 1.0*
