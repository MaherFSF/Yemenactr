# YETO Platform Route Inventory

**Generated:** January 15, 2026
**Total Routes:** 60+
**Status:** Production Ready

## Public Routes (No Authentication Required)

| Route | Page Name | Purpose | Data Dependencies | Evidence Pack | RTL Status |
|-------|-----------|---------|-------------------|---------------|------------|
| `/` | Home | Landing page with key metrics, latest updates, platform overview | time_series, economic_events, research_publications | Yes | ✅ |
| `/about` | About | Platform mission, team, methodology overview | Static content | No | ✅ |
| `/contact` | Contact | Contact form and information | Static content | No | ✅ |
| `/methodology` | Methodology | Data quality rules, sourcing standards | Static content | No | ✅ |
| `/transparency` | Transparency | Accountability, corrections policy | corrections, public_changelog | Yes | ✅ |
| `/glossary` | Glossary | Bilingual economic terms dictionary | glossary_terms | Yes | ✅ |
| `/timeline` | Timeline | Economic events 2010→present | economic_events | Yes | ✅ |
| `/research` | Research Library | Publications, reports, documents | research_publications | Yes | ✅ |
| `/data-repository` | Data Repository | Downloadable datasets | datasets, time_series | Yes | ✅ |
| `/pricing` | Pricing | Subscription tiers and features | Static content | No | ✅ |
| `/privacy` | Privacy Policy | Data privacy information | Static content | No | ✅ |
| `/terms` | Terms of Service | Legal terms | Static content | No | ✅ |
| `/accessibility` | Accessibility | WCAG compliance statement | Static content | No | ✅ |
| `/data-license` | Data License | Reuse and attribution rules | Static content | No | ✅ |

## Sector Dashboard Routes

| Route | Page Name | Purpose | Data Dependencies | Evidence Pack | RTL Status |
|-------|-----------|---------|-------------------|---------------|------------|
| `/dashboard` | Main Dashboard | Overview of all economic indicators | time_series, economic_events | Yes | ✅ |
| `/sectors/banking` | Banking Sector | Commercial banks, CBY, MFIs | commercial_banks, banking_metrics | Yes | ✅ |
| `/sectors/trade` | Trade & Ports | Import/export, port activity | time_series (trade indicators) | Yes | ✅ |
| `/sectors/macroeconomy` | Macroeconomy | GDP, growth, economic structure | time_series (GDP, growth) | Yes | ✅ |
| `/sectors/prices` | Prices & Cost of Living | Inflation, CPI, commodity prices | time_series (inflation, prices) | Yes | ✅ |
| `/sectors/currency` | Currency & Exchange | FX rates, currency dynamics | time_series (exchange rates) | Yes | ✅ |
| `/sectors/public-finance` | Public Finance | Government revenue, expenditure | time_series (fiscal) | Yes | ✅ |
| `/sectors/energy` | Energy & Fuel | Oil, gas, electricity | time_series (energy) | Yes | ✅ |
| `/sectors/labor` | Labor Market | Employment, wages, workforce | time_series (labor) | Yes | ✅ |
| `/sectors/food-security` | Food Security | IPC, food prices, nutrition | time_series (food security) | Yes | ✅ |
| `/sectors/aid` | Aid Flows | Humanitarian funding, donors | time_series (aid), OCHA FTS | Yes | ✅ |
| `/sectors/conflict` | Conflict Economy | War economy, political economy | time_series, economic_events | Yes | ✅ |
| `/sectors/infrastructure` | Infrastructure | Roads, ports, utilities | time_series (infrastructure) | Yes | ✅ |
| `/sectors/agriculture` | Agriculture | Farming, rural development | time_series (agriculture) | Yes | ✅ |
| `/sectors/investment` | Investment | Private sector, FDI | time_series (investment) | Yes | ✅ |
| `/sectors/poverty` | Poverty & Welfare | Poverty rates, social indicators | time_series (poverty) | Yes | ✅ |
| `/sectors/humanitarian` | Humanitarian | Needs, displacement, response | UNHCR, WFP, OCHA data | Yes | ✅ |

## Interactive Tools Routes

| Route | Page Name | Purpose | Data Dependencies | Evidence Pack | RTL Status |
|-------|-----------|---------|-------------------|---------------|------------|
| `/ai-assistant` | AI Economic Assistant | RAG-based Q&A with evidence | All data tables | Yes | ✅ |
| `/scenario-simulator` | Scenario Simulator | What-if economic modeling | time_series, ml_models | Yes | ✅ |
| `/report-builder` | Custom Report Builder | Generate custom reports | time_series, visualizations | Yes | ✅ |
| `/advanced-search` | Advanced Search | Cross-platform search | All searchable tables | Yes | ✅ |
| `/compare` | Comparative Analysis | Compare indicators/regions | time_series | Yes | ✅ |
| `/entities` | Entity Profiles | Major organizations/companies | stakeholders, entities | Yes | ✅ |
| `/sanctions` | Sanctions Monitor | Compliance information | sanctions_entries | Yes | ✅ |

## Admin Routes (Authentication Required)

| Route | Page Name | Purpose | Access Level | Known Issues |
|-------|-----------|---------|--------------|--------------|
| `/admin` | Admin Hub | Central admin dashboard | Admin | None |
| `/admin/api-health` | API Health | Connector status monitoring | Admin | None |
| `/admin/banking` | Banking Admin | Bank data management | Admin | None |
| `/admin/reports` | Report Workflow | Editorial workflow for reports | Admin | None |
| `/admin/visualizations` | Visualization Builder | Chart configuration | Admin | None |
| `/admin/insights` | Insight Miner | AI-detected trends review | Admin | None |
| `/admin/export` | Export Bundle | Platform export for deployment | Admin | None |
| `/admin/users` | User Management | User and subscription management | Super Admin | None |
| `/admin/sources` | Source Registry | Data source management | Admin | None |
| `/admin/corrections` | Corrections Queue | Dispute and correction handling | Admin | None |

## Partner Portal Routes

| Route | Page Name | Purpose | Access Level | Known Issues |
|-------|-----------|---------|--------------|--------------|
| `/partner` | Partner Portal | Data contribution interface | Partner | None |
| `/partner/submit` | Submit Data | Data upload wizard | Partner | None |
| `/partner/status` | Submission Status | Track submission progress | Partner | None |

## Executive Dashboard Routes (Premium)

| Route | Page Name | Purpose | Access Level | Known Issues |
|-------|-----------|---------|--------------|--------------|
| `/executive/governor` | Governor Dashboard | CBY Governor briefings | Premium | None |
| `/executive/deputy` | Deputy Governor | Bank supervision dashboard | Premium | None |

## API Routes

| Endpoint | Purpose | Authentication | Rate Limit |
|----------|---------|----------------|------------|
| `/api/trpc/*` | tRPC API endpoints | JWT/Session | 100/min |
| `/api/oauth/callback` | OAuth authentication | None | N/A |
| `/api/health` | Health check | None | N/A |

## Route Coverage Summary

| Category | Count | Status |
|----------|-------|--------|
| Public Pages | 14 | ✅ Complete |
| Sector Dashboards | 17 | ✅ Complete |
| Interactive Tools | 7 | ✅ Complete |
| Admin Pages | 10 | ✅ Complete |
| Partner Portal | 3 | ✅ Complete |
| Executive Dashboards | 2 | ✅ Complete |
| **Total** | **53** | **Production Ready** |

## Navigation Accessibility

All routes are accessible via:
1. **Main Navigation Menu** - Header with sector dropdown
2. **Footer Links** - Legal pages, contact
3. **Contextual CTAs** - Related pages linked from content
4. **Search** - All pages indexed in advanced search
5. **Sitemap** - XML sitemap for SEO

## RTL (Arabic) Support

All pages support RTL layout with:
- Proper text direction
- Mirrored navigation
- Arabic typography (Cairo font)
- Bilingual content switching
