# YETO Banking Sector Data Dictionary

## قاموس بيانات القطاع المصرفي

---

## Database Tables | جداول قاعدة البيانات

### 1. commercial_banks

Primary table containing all commercial bank profiles.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | INT | Auto-increment primary key | 1 |
| `name` | VARCHAR(255) | Official English name | "Tadhamon International Islamic Bank" |
| `nameAr` | VARCHAR(255) | Official Arabic name | "بنك التضامن الإسلامي الدولي" |
| `abbreviation` | VARCHAR(20) | Common abbreviation | "TIIB" |
| `swiftCode` | VARCHAR(11) | SWIFT/BIC code | "TIBBYESA" |
| `licenseNumber` | VARCHAR(50) | CBY license number | "CBY-001-2010" |
| `foundedYear` | INT | Year of establishment | 1996 |
| `headquarters` | VARCHAR(100) | City of headquarters | "Sana'a" |
| `jurisdiction` | ENUM | Regulatory jurisdiction | "aden", "sanaa", "both" |
| `bankType` | ENUM | Type of bank | "commercial", "islamic", "specialized" |
| `ownershipType` | ENUM | Ownership structure | "private", "state", "mixed", "foreign" |
| `totalAssets` | DECIMAL(15,2) | Total assets in USD millions | 2800.00 |
| `capitalAdequacyRatio` | DECIMAL(5,2) | CAR percentage | 18.50 |
| `nonPerformingLoans` | DECIMAL(5,2) | NPL percentage | 15.20 |
| `returnOnAssets` | DECIMAL(5,2) | ROA percentage | 1.20 |
| `returnOnEquity` | DECIMAL(5,2) | ROE percentage | 8.50 |
| `liquidityRatio` | DECIMAL(5,2) | Liquidity ratio percentage | 45.00 |
| `branchCount` | INT | Number of branches | 85 |
| `employeeCount` | INT | Total employees | 1200 |
| `operationalStatus` | ENUM | Current status | "active", "limited", "suspended" |
| `sanctionsStatus` | ENUM | Sanctions status | "none", "under_review", "sanctioned" |
| `website` | VARCHAR(255) | Official website URL | "https://tiib.com.ye" |
| `email` | VARCHAR(255) | Contact email | "info@tiib.com.ye" |
| `phone` | VARCHAR(50) | Contact phone | "+967-1-123456" |
| `createdAt` | TIMESTAMP | Record creation date | 2025-01-14 |
| `updatedAt` | TIMESTAMP | Last update date | 2025-01-14 |

---

### 2. bank_historical_metrics

Time series data for bank financial metrics.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | INT | Auto-increment primary key | 1 |
| `bankId` | INT | Foreign key to commercial_banks | 1 |
| `year` | INT | Reporting year | 2024 |
| `totalAssets` | DECIMAL(15,2) | Total assets in USD millions | 2800.00 |
| `totalDeposits` | DECIMAL(15,2) | Total deposits in USD millions | 2100.00 |
| `totalLoans` | DECIMAL(15,2) | Total loans in USD millions | 1500.00 |
| `netIncome` | DECIMAL(15,2) | Net income in USD millions | 35.00 |
| `capitalAdequacyRatio` | DECIMAL(5,2) | CAR percentage | 18.50 |
| `nonPerformingLoans` | DECIMAL(5,2) | NPL percentage | 15.20 |
| `returnOnAssets` | DECIMAL(5,2) | ROA percentage | 1.20 |
| `returnOnEquity` | DECIMAL(5,2) | ROE percentage | 8.50 |
| `liquidityRatio` | DECIMAL(5,2) | Liquidity ratio percentage | 45.00 |
| `branchCount` | INT | Number of branches | 85 |
| `employeeCount` | INT | Total employees | 1200 |
| `dataSource` | VARCHAR(255) | Source of data | "CBY-Aden Annual Report 2024" |
| `confidenceScore` | DECIMAL(3,2) | Data confidence (0-1) | 0.95 |
| `createdAt` | TIMESTAMP | Record creation date | 2025-01-14 |

---

### 3. sanctions_designations

Sanctions tracking for banks and individuals.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | INT | Auto-increment primary key | 1 |
| `entityType` | ENUM | Type of sanctioned entity | "bank", "individual", "company" |
| `entityId` | INT | Foreign key to entity table | 5 |
| `entityName` | VARCHAR(255) | Name of sanctioned entity | "International Bank of Yemen" |
| `authority` | ENUM | Sanctioning authority | "ofac", "un", "eu", "uk" |
| `designationDate` | DATE | Date of designation | 2025-04-17 |
| `legalBasis` | VARCHAR(255) | Legal authority | "Executive Order 13224" |
| `programCode` | VARCHAR(50) | Sanctions program code | "SDGT" |
| `reasons` | TEXT | Reasons for designation | "Support for Houthi forces..." |
| `generalLicenses` | TEXT | Applicable licenses | "GL-2025-01: Wind-down..." |
| `windDownDeadline` | DATE | Compliance deadline | 2025-07-17 |
| `status` | ENUM | Current status | "active", "removed", "modified" |
| `sourceUrl` | VARCHAR(500) | Source document URL | "https://ofac.treasury.gov/..." |
| `createdAt` | TIMESTAMP | Record creation date | 2025-01-14 |
| `updatedAt` | TIMESTAMP | Last update date | 2025-01-14 |

---

### 4. evidence_sources

Trusted data sources for the Truth Layer.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | INT | Auto-increment primary key | 1 |
| `name` | VARCHAR(255) | Source name | "Central Bank of Yemen - Aden" |
| `nameAr` | VARCHAR(255) | Arabic name | "البنك المركزي اليمني - عدن" |
| `type` | ENUM | Source type | "regulator", "ifi", "academic" |
| `reliabilityGrade` | CHAR(1) | Reliability grade (A-F) | "A" |
| `website` | VARCHAR(255) | Official website | "https://cby-ye.com" |
| `description` | TEXT | Source description | "Official central bank..." |
| `isActive` | BOOLEAN | Currently active | true |
| `createdAt` | TIMESTAMP | Record creation date | 2025-01-14 |

---

### 5. claims

Atomic truth objects in the Claim Ledger.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | VARCHAR(36) | UUID primary key | "550e8400-e29b..." |
| `claimType` | ENUM | Type of claim | "metric", "event", "status" |
| `subject` | VARCHAR(255) | Claim subject | "banking_sector" |
| `predicate` | VARCHAR(255) | Claim predicate | "total_assets" |
| `value` | TEXT | Claim value | "18670000000" |
| `unit` | VARCHAR(50) | Value unit | "USD" |
| `asOfDate` | DATE | Date claim is valid for | 2025-01-01 |
| `sourceId` | INT | Foreign key to evidence_sources | 1 |
| `confidenceScore` | DECIMAL(3,2) | Confidence (0-1) | 0.95 |
| `status` | ENUM | Claim status | "verified", "pending", "disputed" |
| `createdAt` | TIMESTAMP | Record creation date | 2025-01-14 |
| `verifiedAt` | TIMESTAMP | Verification date | 2025-01-14 |

---

## Enum Values | قيم التعداد

### jurisdiction
- `aden` - Licensed by CBY-Aden only
- `sanaa` - Operating under CBY-Sana'a only
- `both` - Operating in both jurisdictions

### bankType
- `commercial` - Traditional commercial bank
- `islamic` - Islamic/Sharia-compliant bank
- `specialized` - Specialized bank (development, agriculture, etc.)
- `microfinance` - Microfinance institution

### ownershipType
- `private` - Privately owned
- `state` - State/government owned
- `mixed` - Mixed ownership
- `foreign` - Foreign owned

### operationalStatus
- `active` - Fully operational
- `limited` - Limited operations
- `suspended` - Operations suspended
- `liquidation` - Under liquidation

### sanctionsStatus
- `none` - No sanctions
- `under_review` - Under review
- `sanctioned` - Active sanctions

### authority (sanctions)
- `ofac` - US Treasury OFAC
- `un` - UN Security Council
- `eu` - European Union
- `uk` - UK OFSI

---

## API Endpoints | نقاط الوصول

### Banking Router (`trpc.banking.*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getBanks` | Query | Get all banks with optional filters |
| `getBankById` | Query | Get single bank by ID |
| `getSectorStats` | Query | Get sector-wide statistics |
| `getSectorTimeSeries` | Query | Get historical time series |
| `getHistoricalMetrics` | Query | Get bank-specific history |
| `getBanksUnderWatch` | Query | Get sanctioned/at-risk banks |

### Example Queries

```typescript
// Get all banks
const banks = await trpc.banking.getBanks.query();

// Get sector statistics
const stats = await trpc.banking.getSectorStats.query();

// Get time series (2010-2025)
const timeSeries = await trpc.banking.getSectorTimeSeries.query({
  startYear: 2010,
  endYear: 2025
});

// Get banks under watch
const watchList = await trpc.banking.getBanksUnderWatch.query();
```

---

## Data Relationships | علاقات البيانات

```
commercial_banks (1) ──────< bank_historical_metrics (N)
       │
       │
       └──────< sanctions_designations (N)

evidence_sources (1) ──────< claims (N)
```

---

*Last Updated: January 14, 2026*
*Version: 1.0*
