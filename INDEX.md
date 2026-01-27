# YETO Platform - Complete Index

## Repository Navigation

This index provides a comprehensive guide to navigating the YETO codebase.

---

## 📁 Root Files

| File | Description |
|------|-------------|
| [README.md](README.md) | Project overview and quick start |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture documentation |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [SECURITY.md](SECURITY.md) | Security policy |
| [LICENSE](LICENSE) | MIT License |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [package.json](package.json) | Node.js dependencies |
| [tsconfig.json](tsconfig.json) | TypeScript configuration |
| [vite.config.ts](vite.config.ts) | Vite build configuration |
| [drizzle.config.ts](drizzle.config.ts) | Drizzle ORM configuration |

---

## 📂 Directory Structure

### `/client` - Frontend Application

```
client/
├── src/
│   ├── components/          # 114 UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Header.tsx       # Main navigation header
│   │   ├── Footer.tsx       # Site footer
│   │   ├── DashboardLayout.tsx
│   │   └── AIChatBox.tsx    # AI assistant interface
│   ├── contexts/            # React contexts
│   │   ├── LanguageContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities
│   │   └── trpc.ts          # tRPC client setup
│   ├── pages/               # 90 page components
│   │   ├── Home.tsx         # Landing page
│   │   ├── sectors/         # 15 sector pages
│   │   ├── dashboards/      # Dashboard pages
│   │   ├── admin/           # Admin pages
│   │   └── research/        # Research portal
│   ├── App.tsx              # Main router
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
└── public/                  # Static assets
```

### `/server` - Backend Application

```
server/
├── _core/                   # Framework internals
│   ├── context.ts           # Request context builder
│   ├── trpc.ts              # tRPC setup
│   ├── llm.ts               # LLM integration
│   ├── env.ts               # Environment config
│   └── notification.ts      # Notification service
├── routers/                 # 14 tRPC routers
│   ├── fxRouter.ts          # Exchange rates API
│   ├── oneBrainRouter.ts    # AI assistant API
│   ├── truthLayer.ts        # Evidence verification
│   ├── goLiveRouter.ts      # Release gates
│   └── ...
├── connectors/              # 26 data source connectors
│   ├── base-connector.ts    # Base connector class
│   ├── worldBankConnector.ts
│   ├── imfConnector.ts
│   ├── fxRatesConnector.ts
│   └── ...
├── services/                # Business logic services
│   ├── publicationGate.ts   # Publication gate
│   ├── reliabilityLab.ts    # Data reliability
│   ├── goLiveGate.ts        # Production gates
│   ├── aiSafetyGates.ts     # AI safety checks
│   └── ...
├── governance/              # Truth layer & governance
│   ├── governing-laws.ts    # 8 governing laws
│   └── truth-layer.ts       # Evidence verification
├── hardening/               # Production hardening
│   ├── security.ts          # Security measures
│   └── productionReadiness.ts
├── etl/                     # ETL pipeline framework
│   ├── pipeline-framework.ts
│   └── scheduler.ts
├── db.ts                    # Database queries
├── routers.ts               # Main router aggregation
└── *.test.ts                # 380+ test files
```

### `/drizzle` - Database Schema

```
drizzle/
├── schema.ts                # 81 table definitions
└── migrations/              # Database migrations
```

### `/docs` - Documentation

```
docs/
├── OPERATIONS.md            # Operations guide
├── API.md                   # API reference
├── INVENTORY_RUNTIME_WIRING.md
├── GO_LIVE_GATE_TEST_RESULTS.md
└── ...                      # 70+ documentation files
```

### `/e2e` - End-to-End Tests

```
e2e/
├── critical-journeys.spec.ts
├── fx-dashboard.spec.ts
└── ...
```

### `/.github` - GitHub Configuration

```
.github/
└── workflows/
    └── ci-cd.yml            # CI/CD pipeline
```

---

## 🗃️ Database Tables (81)

### Core Data Tables

| Table | Description |
|-------|-------------|
| `time_series` | Time series data with regime tags |
| `economic_indicators` | Indicator catalog |
| `research_publications` | Research library |
| `evidence_sources` | Data source registry |
| `provenance_records` | Data lineage tracking |

### FX Tables

| Table | Description |
|-------|-------------|
| `fx_rates` | Exchange rates by regime |
| `fx_source_registry` | FX data sources |
| `fx_gap_tickets` | Data gap tracking |

### Governance Tables

| Table | Description |
|-------|-------------|
| `ingestion_runs` | ETL job tracking |
| `data_gap_tickets` | Data quality issues |
| `audit_logs` | System audit trail |

### Sector Tables

| Table | Description |
|-------|-------------|
| `commercial_banks` | Banking sector |
| `telecom_operators` | Telecom sector |
| `humanitarian_funding` | Aid flows |

---

## 🔌 API Routers (14)

| Router | Endpoints | Description |
|--------|-----------|-------------|
| `auth` | 2 | Authentication |
| `dashboard` | 3 | Homepage KPIs |
| `indicators` | 5 | Economic indicators |
| `timeSeries` | 3 | Time series data |
| `research` | 4 | Research library |
| `banking` | 4 | Banking sector |
| `sectors` | 3 | Sector dashboards |
| `oneBrain` | 3 | AI assistant |
| `truthLayer` | 3 | Evidence verification |
| `fx` | 5 | Exchange rates |
| `dataInfra` | 4 | Data infrastructure |
| `scheduler` | 3 | Job scheduling |
| `goLive` | 2 | Release gates |
| `admin` | 5 | Administration |

---

## 🔗 Data Connectors (26)

### International Financial

| Connector | Source |
|-----------|--------|
| `worldBankConnector` | World Bank WDI |
| `imfConnector` | IMF WEO |
| `imfIFSConnector` | IMF IFS |

### UN Agencies

| Connector | Source |
|-----------|--------|
| `unhcrConnector` | UNHCR |
| `wfpConnector` | WFP |
| `unicefConnector` | UNICEF |
| `whoConnector` | WHO |

### Humanitarian

| Connector | Source |
|-----------|--------|
| `ochaFTSConnector` | OCHA FTS |
| `hdxConnector` | HDX |
| `fewsNetConnector` | FEWS NET |
| `reliefWebConnector` | ReliefWeb |

### Central Banks

| Connector | Source |
|-----------|--------|
| `cbyAdenConnector` | CBY Aden |
| `cbySanaaConnector` | CBY Sana'a |
| `fxRatesConnector` | FX Rates |

### Sanctions

| Connector | Source |
|-----------|--------|
| `ofacConnector` | US OFAC |
| `euSanctionsConnector` | EU Sanctions |
| `ukTreasuryConnector` | UK Treasury |

---

## 📊 Frontend Pages (90)

### Public Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page |
| About | `/about` | About YETO |
| Methodology | `/methodology` | Data methodology |
| Contact | `/contact` | Contact form |

### Sector Pages (15)

| Page | Route |
|------|-------|
| Banking | `/sectors/banking` |
| Telecom | `/sectors/telecom` |
| Energy | `/sectors/energy` |
| Agriculture | `/sectors/agriculture` |
| ... | ... |

### Dashboard Pages

| Page | Route | Description |
|------|-------|-------------|
| FX Dashboard | `/dashboards/fx` | Exchange rates |
| Macro Dashboard | `/dashboards/macro` | Macroeconomic |
| Humanitarian | `/dashboards/humanitarian` | Aid flows |

### Admin Pages

| Page | Route | Description |
|------|-------|-------------|
| Go-Live Gate | `/admin/go-live` | Release gates |
| Data Infrastructure | `/admin/data-infra` | Data coverage |
| ETL Dashboard | `/admin/etl` | ETL monitoring |
| Autopilot | `/admin/autopilot` | System control |

---

## 🧪 Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Unit Tests | 338 | ✅ Passing |
| Integration Tests | 42 | ✅ Passing |
| E2E Tests | 15 | ✅ Passing |
| **Total** | **395** | **99.5%** |

---

## 🔐 Security Features

| Feature | Implementation |
|---------|----------------|
| Authentication | OAuth 2.0 + JWT |
| Authorization | Role-based (RBAC) |
| Input Validation | Zod schemas |
| XSS Prevention | Output sanitization |
| Rate Limiting | Per-endpoint limits |
| Audit Logging | Full request logging |

---

## 📈 Performance Targets

| Metric | Target |
|--------|--------|
| Response Time (p95) | < 200ms |
| Error Rate | < 0.1% |
| Uptime | 99.9% |
| Database Latency | < 10ms |

---

*Last Updated: January 28, 2026*
