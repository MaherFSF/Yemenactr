# API Status & Dynamic Data Injection Architecture

## 📡 API Endpoint Status

### Core API Endpoints

| Endpoint | Status | Description | Notes |
|----------|--------|-------------|-------|
| `/api/trpc/dashboard.getHeroKPIs` | ✅ Working | Hero KPI cards with real-time data | Returns GDP growth, inflation, exchange rates with confidence scores |
| `/api/trpc/platform.getStats` | ✅ Working | Platform statistics | Source count, time series, evidence packs, publications |
| `/api/trpc/events.list` | ✅ Working | Latest economic events | Returns timestamped events with sector classification |
| `/api/trpc/auth.me` | ✅ Working | Current user session | OAuth-based authentication |
| `/api/trpc/auth.logout` | ✅ Working | User logout | Clears session cookie |
| `/api/trpc/sources.list` | ✅ Working | Source registry | 292 sources, 234 active |
| `/api/trpc/timeSeries.query` | ✅ Working | Time series data | Dual-regime support (Aden/Sana'a) |
| `/api/trpc/research.publications` | ✅ Working | Research publications | 370+ publications with provenance |

### Data Connector Status

| Connector | Status | Last Update | Issues |
|-----------|--------|-------------|--------|
| **World Bank API** | ✅ Active | 2026-02-20 | None |
| **IMF Data API** | ✅ Active | 2026-02-20 | None |
| **OCHA HDX** | ✅ Active | 2026-02-20 | None |
| **ACLED** | ✅ Active | 2026-02-20 | None |
| **CBY Aden** | ⚠️ Manual | 2026-02-15 | No public API - manual scraping |
| **CBY Sana'a** | ⚠️ Manual | 2026-02-15 | No public API - manual scraping |
| **ReliefWeb** | ❌ Failing | 2026-02-10 | 403 Forbidden - needs API key refresh |
| **FEWS NET** | ✅ Active | 2026-02-19 | None |
| **WFP VAM** | ✅ Active | 2026-02-19 | None |
| **FAO GIEWS** | ✅ Active | 2026-02-18 | None |
| **UN OCHA FTS** | ✅ Active | 2026-02-20 | None |
| **IOM DTM** | ✅ Active | 2026-02-19 | None |
| **UNHCR** | ✅ Active | 2026-02-19 | None |
| **Yemen Data Project** | ⚠️ Manual | 2026-02-12 | Irregular updates |
| **Sana'a Center** | ⚠️ Manual | 2026-02-10 | Research publications only |

### Known Issues & Fixes Needed

#### 1. ReliefWeb Connector (Priority: HIGH)
**Issue**: 403 Forbidden errors when accessing ReliefWeb API

**Impact**: Missing humanitarian updates and situation reports

**Fix Required**:
```typescript
// server/connectors/reliefweb.ts
// Need to refresh API key or implement rate limiting
const RELIEFWEB_API_KEY = process.env.RELIEFWEB_API_KEY;
```

**Action**: Contact ReliefWeb to obtain new API credentials

#### 2. Missing v2.5 Schema Columns (Priority: MEDIUM)
**Issue**: Some legacy columns from v2.5 are not present in current schema

**Impact**: Historical data migration incomplete

**Fix Required**:
```sql
-- Add missing columns to time_series table
ALTER TABLE time_series ADD COLUMN legacy_source_id VARCHAR(255);
ALTER TABLE time_series ADD COLUMN migration_batch VARCHAR(100);
```

#### 3. S3 Credentials for Production (Priority: HIGH)
**Issue**: S3 bucket credentials are Manus-specific

**Impact**: Cannot deploy to independent hosting without reconfiguring storage

**Fix Required**:
```bash
# Update .env with production S3 credentials
AWS_ACCESS_KEY_ID=your_production_key
AWS_SECRET_ACCESS_KEY=your_production_secret
S3_BUCKET=your_production_bucket
AWS_REGION=your_region
```

**Action**: Set up independent S3 bucket and update environment variables

---

## 🔄 Dynamic Data Injection Architecture

### Overview

YETO implements a **continuous data injection architecture** that maintains historical data from 2010 to present while continuously updating with new data points.

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DYNAMIC DATA INJECTION PIPELINE                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│   │  External   │───▶│  Connector  │───▶│  Ingestion  │                │
│   │  Data APIs  │    │   Layer     │    │   Engine    │                │
│   └─────────────┘    └─────────────┘    └─────────────┘                │
│         │                                       │                        │
│         │                                       ▼                        │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│   │  Scheduler  │───▶│  ETL Jobs   │───▶│  Transform  │                │
│   │  (Cron)     │    │  (26 active)│    │   & Validate│                │
│   └─────────────┘    └─────────────┘    └─────────────┘                │
│                                                 │                        │
│                                                 ▼                        │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                    DATABASE (TiDB/MySQL)                     │      │
│   │   • time_series (6,708 series)                               │      │
│   │   • economic_indicators (2010-present)                       │      │
│   │   • fx_rates (daily updates)                                 │      │
│   │   • research_publications (370+ docs)                        │      │
│   │   • provenance_records (full lineage)                        │      │
│   └─────────────────────────────────────────────────────────────┘      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Update Frequencies

| Data Type | Update Frequency | Retention | Source Count |
|-----------|------------------|-----------|--------------|
| **Exchange Rates** | Daily | 2016-present | 4 sources |
| **Macroeconomic Indicators** | Monthly | 2010-present | 12 sources |
| **Humanitarian Data** | Weekly | 2015-present | 8 sources |
| **Research Publications** | Daily | 2010-present | 23 sources |
| **Conflict Events** | Daily | 2015-present | 3 sources |
| **Trade Data** | Quarterly | 2010-present | 6 sources |
| **Banking Statistics** | Monthly | 2016-present | 2 sources |

### Ingestion Pipeline Components

#### 1. Scheduler System (`server/services/scheduler.ts`)
- **Purpose**: Orchestrates all automated data collection jobs
- **Technology**: Cron-based job scheduler with database persistence
- **Jobs**: 26 active connectors running on different schedules
- **Monitoring**: Dashboard at `/admin/scheduler-status`

#### 2. ETL Framework (`server/etl/`)
- **Extract**: Connector-specific API clients for each data source
- **Transform**: Standardization to YETO schema with regime tagging
- **Load**: Upsert operations with conflict resolution

#### 3. Provenance Tracking (`server/governance/provenance.ts`)
- **Purpose**: Record full lineage for every data point
- **Schema**: `provenance_records` table with source_id, timestamp, method
- **Verification**: Every number in UI links back to source

#### 4. Confidence Scoring (`server/governance/confidence.ts`)
- **Purpose**: Rate reliability of each data point
- **Tiers**: T0 (Central Banks) → T1 (UN/World Bank) → T2 (NGOs) → T3 (Media) → T4 (Unverified)
- **Impact**: Displayed as badges in UI, used in AI safety layer

### Historical Data Backfill

YETO maintains a complete historical dataset from 2010 to present:

```typescript
// Example: GDP data backfill
const historicalGDP = [
  { year: 2010, value: 31.3, source: 'World Bank', regime: null },
  { year: 2011, value: 33.8, source: 'World Bank', regime: null },
  // ... continuous through 2026
  { year: 2024, value: 25.1, source: 'IMF', regime: 'IRG' },
  { year: 2024, value: 18.3, source: 'Estimated', regime: 'DFA' },
];
```

**Backfill Status**:
- ✅ GDP: 2010-2026 (complete)
- ✅ Inflation: 2010-2026 (complete)
- ✅ Exchange Rates: 2016-2026 (complete, split regime from Aug 2016)
- ⚠️ Trade Data: 2010-2022 (2023-2026 incomplete due to source gaps)
- ⚠️ Banking Stats: 2016-2026 (Sana'a data sparse after 2019)

### Continuous Update Mechanism

#### Real-Time Data Flow
```typescript
// server/services/scheduler.ts
// Daily job: Update exchange rates
schedulerService.addJob({
  name: 'fx-rates-daily',
  cronExpression: '0 6 * * *', // 6 AM daily
  handler: async () => {
    const rates = await fxConnector.fetchLatestRates();
    await db.insert(fx_rates).values(rates);
    await updateProvenance(rates, 'fx-rates-daily');
  }
});
```

#### Data Freshness Monitoring
- **Dashboard**: `/admin/data-freshness`
- **Alerts**: Automated notifications when data is >7 days stale
- **SLA**: 95% of time series updated within configured frequency

### Data Source Connectors

Each connector implements the standard interface:

```typescript
interface DataConnector {
  name: string;
  tier: 'T0' | 'T1' | 'T2' | 'T3' | 'T4';
  updateFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  
  fetch(): Promise<RawData>;
  transform(raw: RawData): TimeSeriesPoint[];
  validate(points: TimeSeriesPoint[]): ValidationResult;
  load(points: TimeSeriesPoint[]): Promise<void>;
}
```

**Active Connectors** (26 total):
- World Bank API (`server/connectors/worldbank.ts`)
- IMF Data API (`server/connectors/imf.ts`)
- OCHA HDX (`server/connectors/hdx.ts`)
- ACLED (`server/connectors/acled.ts`)
- FEWS NET (`server/connectors/fewsnet.ts`)
- WFP VAM (`server/connectors/wfp.ts`)
- FAO GIEWS (`server/connectors/fao.ts`)
- UN OCHA FTS (`server/connectors/fts.ts`)
- IOM DTM (`server/connectors/iom.ts`)
- UNHCR (`server/connectors/unhcr.ts`)
- ... 16 more

### Deployment Considerations

When deploying YETO to independent hosting:

1. **Scheduler Service**: Ensure cron jobs run in production environment
2. **API Keys**: All connector API keys must be configured in `.env`
3. **Database**: TiDB or MySQL 8+ with sufficient storage for time series
4. **S3 Storage**: Independent S3 bucket for research publications and exports
5. **Monitoring**: Set up alerts for connector failures and data staleness

### Data Quality Gates

Before any data enters the platform:

```typescript
// server/governance/gates.ts
const qualityGates = [
  validateSchema,      // Matches expected structure
  validateRange,       // Values within reasonable bounds
  validateProvenance,  // Source is registered and active
  validateTier,        // Tier classification is valid
  validateRegime,      // Regime tag is correct (Aden/Sana'a/null)
];
```

**Rejection Rate**: ~2% of incoming data points fail quality gates

---

## 🚀 Deployment Guide for Independent Hosting

### Prerequisites

1. **Infrastructure**:
   - Linux server (Ubuntu 22.04+ recommended)
   - Node.js 22+
   - MySQL 8+ or TiDB Cloud account
   - S3-compatible storage (AWS S3, DigitalOcean Spaces, etc.)
   - Domain name with DNS access

2. **API Keys** (obtain before deployment):
   - World Bank API (free, no key required)
   - IMF Data API (free, no key required)
   - OCHA HDX API key
   - ACLED API key
   - ReliefWeb API key
   - (Optional) OpenAI API key for AI Assistant

### Step-by-Step Deployment

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2 for process management
npm install -g pm2
```

#### 2. Clone and Configure
```bash
# Clone repository
git clone https://github.com/MaherFSF/Yemenactr.git
cd Yemenactr

# Install dependencies
pnpm install

# Create production .env
cp .env.example .env.production
nano .env.production
```

#### 3. Environment Variables
```bash
# .env.production
DATABASE_URL=mysql://user:password@host:3306/yeto_production
JWT_SECRET=your_secure_random_string_here
VITE_APP_ID=yeto_production

# S3 Storage (replace with your credentials)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=yeto-production-storage
AWS_REGION=us-east-1

# API Keys for connectors
RELIEFWEB_API_KEY=your_reliefweb_key
HDX_API_KEY=your_hdx_key
ACLED_API_KEY=your_acled_key

# Optional: AI Assistant
BUILT_IN_FORGE_API_KEY=your_openai_key
BUILT_IN_FORGE_API_URL=https://api.openai.com/v1
```

#### 4. Database Setup
```bash
# Push schema to production database
pnpm db:push

# Seed initial data (sources registry, sector codebook)
pnpm db:seed

# Run backfill for historical data (2010-present)
node scripts/backfill-historical-data.mjs
```

#### 5. Build and Start
```bash
# Build for production
pnpm build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 6. Nginx Configuration
```nginx
server {
    listen 80;
    server_name yeto.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 7. SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yeto.yourdomain.com
```

#### 8. Monitoring Setup
```bash
# Monitor logs
pm2 logs yeto-platform

# Monitor scheduler jobs
curl http://localhost:3000/api/trpc/scheduler.status

# Set up health check endpoint
curl http://localhost:3000/api/health
```

### Post-Deployment Checklist

- [ ] All 740+ unit tests passing
- [ ] Release gate passing (8/8 gates)
- [ ] Scheduler jobs running (check `/admin/scheduler-status`)
- [ ] Data connectors active (check `/admin/ingestion`)
- [ ] S3 uploads working (test file upload)
- [ ] SSL certificate valid
- [ ] Domain DNS configured
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured
- [ ] API keys secured and rotated

### Maintenance

```bash
# Update application
cd /path/to/yeto
git pull origin main
pnpm install
pnpm build
pm2 restart yeto-platform

# Database migrations
pnpm db:push

# Check scheduler health
pm2 logs yeto-platform | grep Scheduler

# Monitor disk usage (time series data grows over time)
df -h
```

### Troubleshooting

**Issue**: Scheduler jobs not running
```bash
# Check scheduler service
pm2 logs yeto-platform | grep Scheduler

# Restart scheduler
pm2 restart yeto-platform
```

**Issue**: Database connection errors
```bash
# Test database connection
mysql -h host -u user -p database_name

# Check DATABASE_URL in .env
cat .env.production | grep DATABASE_URL
```

**Issue**: S3 upload failures
```bash
# Test S3 credentials
aws s3 ls s3://your-bucket --profile production

# Verify environment variables
env | grep AWS
```

---

## 📊 Platform Statistics (as of Feb 2026)

| Metric | Value |
|--------|-------|
| **Total Data Sources** | 292 (234 active) |
| **Time Series** | 6,708 |
| **Data Points** | 5,500+ |
| **Research Publications** | 370+ |
| **Evidence Packs** | 898 |
| **Database Tables** | 243 |
| **API Endpoints** | 60+ |
| **Unit Tests** | 740+ (all passing) |
| **Code Coverage** | 78% |

---

## 🔐 Security Considerations

1. **API Keys**: Never commit API keys to repository - use environment variables
2. **Database**: Use strong passwords and restrict network access
3. **S3 Bucket**: Configure proper IAM policies and bucket policies
4. **SSL/TLS**: Always use HTTPS in production
5. **Rate Limiting**: Implement rate limiting on public API endpoints
6. **Authentication**: OAuth-based authentication with JWT sessions
7. **Data Privacy**: No personally identifiable information (PII) stored

---

## 📞 Support

For deployment assistance or technical questions:
- **GitHub Issues**: https://github.com/MaherFSF/Yemenactr/issues
- **Email**: technical@yeto-yemen.org
- **Documentation**: See `/docs` folder for detailed guides

---

**Last Updated**: February 20, 2026
**Version**: v3.0
**Maintainer**: YETO Development Team
