# YETO Platform Inventory

**Generated:** January 14, 2026  
**Version:** 3c362846  
**Purpose:** Complete inventory of existing routes, pages, tools, components, DB tables, and jobs

---

## 1. Frontend Routes (75 total)

### Public Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Landing page with hero, KPIs, sector cards |
| `/about` | About | About YETO and team information |
| `/contact` | Contact | Contact form and information |
| `/glossary` | Glossary | Bilingual economic glossary |
| `/methodology` | Methodology | Data methodology and QA rules |
| `/pricing` | Pricing | Subscription tiers |
| `/legal` | Legal | Privacy, terms, data license |
| `/changelog` | Changelog | Public changelog |

### Dashboard & Data
| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | Dashboard | Main economic dashboard |
| `/data-repository` | DataRepository | Searchable data repository |
| `/timeline` | Timeline | Economic events timeline 2010-2026 |
| `/indicators` | IndicatorCatalog | All economic indicators |
| `/coverage` | CoverageScorecard | Data coverage scorecard |

### Sector Pages (15 sectors)
| Route | Component | Description |
|-------|-----------|-------------|
| `/sectors/banking` | Banking | Banking & Finance sector |
| `/sectors/trade` | Trade | Trade & Commerce sector |
| `/sectors/poverty` | Poverty | Poverty & Social Protection |
| `/sectors/macroeconomy` | Macroeconomy | GDP, growth, macro indicators |
| `/sectors/prices` | Prices | Prices & Cost of Living |
| `/sectors/currency` | Currency | Currency & Exchange Rates |
| `/sectors/public-finance` | PublicFinance | Public Finance & Governance |
| `/sectors/energy` | Energy | Energy & Fuel sector |
| `/sectors/food-security` | FoodSecurity | Food Security & Markets |
| `/sectors/aid-flows` | AidFlows | Aid Flows & Accountability |
| `/sectors/labor-market` | LaborMarket | Labor Market & Wages |
| `/sectors/conflict-economy` | ConflictEconomy | Conflict Economy & Political Economy |
| `/sectors/infrastructure` | Infrastructure | Infrastructure & Services |
| `/sectors/agriculture` | Agriculture | Agriculture & Rural Development |
| `/sectors/investment` | Investment | Investment & Private Sector |

### Research & Publications
| Route | Component | Description |
|-------|-----------|-------------|
| `/research` | Research | Research library (353 publications) |
| `/research-portal` | ResearchPortal | Research portal interface |
| `/research-explorer` | ResearchExplorer | Advanced research explorer |
| `/research-analytics` | ResearchVisualization | Research visualization |
| `/research-assistant` | ResearchAssistant | AI research assistant |
| `/research-library` | ResearchLibrary | Full research library |
| `/research-audit` | ResearchAudit | Research completeness audit |
| `/publications` | Publications | Publications listing |

### Tools & Analysis
| Route | Component | Description |
|-------|-----------|-------------|
| `/ai-assistant` | AIAssistant | One Brain AI Economic Assistant |
| `/scenario-simulator` | ScenarioSimulator | What-If scenario simulator |
| `/comparison` | ComparisonTool | Comparative analysis tool |
| `/report-builder` | ReportBuilder | Custom report builder |
| `/policy-impact` | PolicyImpact | Policy impact analysis |

### Specialized Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/entities` | Entities | Economic actors/entities |
| `/entities/:id` | EntityDetail | Entity detail page |
| `/sanctions` | Sanctions | Sanctions monitoring |
| `/corporate-registry` | CorporateRegistry | Corporate registry |
| `/remittances` | Remittances | Remittance flows |
| `/public-debt` | PublicDebt | Public debt analysis |
| `/humanitarian-funding` | HumanitarianFunding | Humanitarian funding tracker |
| `/regional-zones` | RegionalZones | Regional economic zones |
| `/economic-actors` | EconomicActors | Economic actors directory |
| `/compliance` | Compliance | Compliance dashboard |
| `/corrections` | Corrections | Data corrections log |

### Executive Dashboards
| Route | Component | Description |
|-------|-----------|-------------|
| `/executive/governor` | GovernorDashboard | CBY Governor dashboard |
| `/executive/deputy-governor` | DeputyGovernorDashboard | Deputy Governor dashboard |

### User & Partner Portals
| Route | Component | Description |
|-------|-----------|-------------|
| `/my-dashboard` | UserDashboard | User workspace |
| `/partner` | PartnerPortal | Partner contribution portal |
| `/api-keys` | APIKeys | API key management |
| `/notifications` | NotificationSettings | Notification settings |

### Admin Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | AdminPortal | Admin operations console |
| `/admin/monitoring` | AdminMonitoring | System monitoring |
| `/admin/scheduler` | SchedulerDashboard | Scheduler management |
| `/admin/alerts` | AlertsDashboard | Alerts dashboard |
| `/admin/api-health` | ApiHealthDashboard | API health monitoring |
| `/admin/alert-history` | AlertHistory | Alert history |
| `/admin/webhooks` | WebhookSettings | Webhook configuration |
| `/admin/connector-thresholds` | ConnectorThresholds | Connector thresholds |
| `/admin-hub` | AdminHub | Admin navigation hub |

### API & Developer
| Route | Component | Description |
|-------|-----------|-------------|
| `/api-docs` | ApiDocs | API documentation |
| `/data-exchange` | DataExchangeHub | Data exchange hub |
| `/data-freshness` | DataFreshness | Data freshness monitor |
| `/accuracy` | AccuracyDashboard | Accuracy dashboard |

---

## 2. Components (92 total)

### Core Components
| Component | File | Purpose |
|-----------|------|---------|
| Header | Header.tsx | Navigation header with language switcher |
| Footer | Footer.tsx | Site footer |
| DashboardLayout | DashboardLayout.tsx | Dashboard layout wrapper |
| ErrorBoundary | ErrorBoundary.tsx | Error boundary wrapper |
| ScrollToTop | ScrollToTop.tsx | Scroll to top on navigation |
| YetoLogo | YetoLogo.tsx | YETO logo component |

### Data Display Components
| Component | File | Purpose |
|-----------|------|---------|
| ProvenanceBadge | ProvenanceBadge.tsx | Source attribution badge (A-E confidence) |
| ConfidenceRating | ConfidenceRating.tsx | Confidence rating display |
| DataCard | DataCard.tsx | Data display card |
| DataQualityBadge | DataQualityBadge.tsx | Data quality indicator |
| DataQualityMonitor | DataQualityMonitor.tsx | Quality monitoring |
| DynamicSectorCard | DynamicSectorCard.tsx | Dynamic sector card |
| KpiCardSkeleton | KpiCardSkeleton.tsx | Loading skeleton for KPIs |

### Provenance & Evidence
| Component | File | Purpose |
|-----------|------|---------|
| ProvenanceViewer | ProvenanceViewer.tsx | Full provenance viewer |
| EvidencePack | EvidencePack.tsx | Evidence pack display |
| EvidencePackButton | EvidencePackButton.tsx | Evidence pack trigger |
| ContradictionView | ContradictionView.tsx | Data contradiction display |

### Charts & Visualization
| Component | File | Purpose |
|-----------|------|---------|
| KPICard | charts/KPICard.tsx | KPI card with sparkline |
| TimeSeriesChart | charts/TimeSeriesChart.tsx | Time series visualization |
| ComparisonChart | charts/ComparisonChart.tsx | Comparison visualization |
| EnhancedVisualizations | charts/EnhancedVisualizations.tsx | Advanced charts |

### AI & Reports
| Component | File | Purpose |
|-----------|------|---------|
| AIChatBox | AIChatBox.tsx | AI chat interface |
| OneBrainAvatar | OneBrainAvatar.tsx | AI assistant avatar |
| ReportGenerator | ReportGenerator.tsx | Report generation UI |

### Timeline & History
| Component | File | Purpose |
|-----------|------|---------|
| TimelineNavigation | TimelineNavigation.tsx | Timeline navigation |
| TimeTravel | TimeTravel.tsx | Time travel feature |
| TimeTravelView | TimeTravelView.tsx | Time travel view |
| VintageTimeline | VintageTimeline.tsx | Data vintage timeline |
| PublicChangelog | PublicChangelog.tsx | Public changelog display |

### UI Components (shadcn/ui - 45 components)
Located in `client/src/components/ui/`:
accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, button-group, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, empty, field, form, hover-card, input, input-group, input-otp, item, kbd, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toggle, toggle-group, tooltip

---

## 3. Database Tables (56 total)

### Core Data Tables
| Table | Purpose |
|-------|---------|
| users | User accounts and authentication |
| sources | Data source registry |
| datasets | Dataset metadata |
| indicators | Economic indicator definitions |
| time_series | Time series data points |
| geospatial_data | Geographic data |
| economic_events | Economic events timeline |
| documents | Document storage |
| images | Image storage |

### Provenance & Quality
| Table | Purpose |
|-------|---------|
| provenance_log | Data provenance tracking |
| provenance_ledger_full | Full provenance ledger |
| confidence_ratings | Confidence ratings (A-E) |
| data_contradictions | Conflicting data records |
| data_vintages | Data version history |
| public_changelog | Public change log |

### Research & Publications
| Table | Purpose |
|-------|---------|
| research_publications | 353 research publications |
| research_organizations | 47 research organizations |
| research_authors | Publication authors |
| publication_authors | Author-publication links |
| research_completeness_audit | Research audit records |
| research_ingestion_sources | Ingestion source tracking |

### Tickets & Corrections
| Table | Purpose |
|-------|---------|
| data_gap_tickets | Data gap tracking |
| corrections | Data corrections |

### Glossary & Reference
| Table | Purpose |
|-------|---------|
| glossary_terms | Bilingual glossary (51 terms) |
| stakeholders | Stakeholder registry |

### User Features
| Table | Purpose |
|-------|---------|
| subscriptions | User subscriptions |
| notification_preferences | Notification settings |
| email_subscriptions | Email subscriptions |
| user_watchlist | User watchlists |
| saved_searches | Saved searches |
| saved_reports | Saved reports |
| user_reading_lists | Reading lists |
| reading_list_items | Reading list items |
| user_bookmarks | User bookmarks |
| topic_alerts | Topic alerts |

### Partner & Submissions
| Table | Purpose |
|-------|---------|
| partner_submissions | Partner data submissions |
| partner_organizations | Partner organizations |
| partner_contributions | Partner contributions |

### API & Logging
| Table | Purpose |
|-------|---------|
| api_access_logs | API access logs |
| ai_query_logs | AI query logs |

### Scheduler & Jobs
| Table | Purpose |
|-------|---------|
| scheduler_jobs | Scheduled jobs (28 jobs) |
| scheduler_run_history | Job run history |

### Alerts & Notifications
| Table | Purpose |
|-------|---------|
| alerts | System alerts |
| webhooks | Webhook configurations |
| webhook_event_types | Webhook event types |
| webhook_delivery_logs | Webhook delivery logs |
| email_notification_queue | Email queue |

### Banking & Finance
| Table | Purpose |
|-------|---------|
| commercial_banks | 17 Yemen commercial banks |
| cby_directives | 14 CBY directives |
| banking_sector_metrics | Banking sector metrics |

### Executive Features
| Table | Purpose |
|-------|---------|
| executive_profiles | Executive profiles |
| executive_dashboard_widgets | Dashboard widgets |

### Connectors & Thresholds
| Table | Purpose |
|-------|---------|
| connector_thresholds | 12 connector thresholds |

### Publications & Drafts
| Table | Purpose |
|-------|---------|
| publication_drafts | Publication drafts |
| sent_emails | Sent email records |
| event_indicator_links | Event-indicator relationships |

---

## 4. Data Connectors (20 total)

| Connector | File | Data Source |
|-----------|------|-------------|
| WorldBankConnector | worldBankConnector.ts | World Bank WDI |
| IMFConnector | imfConnector.ts | IMF SDMX |
| OCHAFTSConnector | ochaFtsConnector.ts | OCHA FTS humanitarian funding |
| HDXCkanConnector | hdxCkanConnector.ts | HDX CKAN datasets |
| ReliefWebConnector | reliefWebConnector.ts | ReliefWeb reports |
| UNHCRConnector | unhcrConnector.ts | UNHCR refugee data |
| WHOConnector | whoConnector.ts | WHO health indicators |
| UNICEFConnector | unicefConnector.ts | UNICEF child welfare |
| WFPConnector | wfpConnector.ts | WFP food security |
| UNDPConnector | undpConnector.ts | UNDP human development |
| IATIConnector | iatiConnector.ts | IATI aid transparency |
| CBYConnector | cbyConnector.ts | Central Bank of Yemen |
| SanctionsConnector | sanctionsConnector.ts | OFAC/EU/UK sanctions |
| ACLEDConnector | acledConnector.ts | ACLED conflict data |
| FEWSNETConnector | fewsNetConnector.ts | FEWS NET IPC |
| FAOConnector | faoConnector.ts | FAO agriculture |
| IOMDTMConnector | iomDtmConnector.ts | IOM displacement |
| ResearchConnectors | researchConnectors.ts | Research publication sources |

---

## 5. Server Services (10 total)

| Service | File | Purpose |
|---------|------|---------|
| accuracyChecker | accuracyChecker.ts | Platform accuracy checks |
| alertSystem | alertSystem.ts | Alert generation |
| autoPublicationEngine | autoPublicationEngine.ts | Auto-publication |
| connectorHealthAlerts | connectorHealthAlerts.ts | Connector health monitoring |
| dailyScheduler | dailyScheduler.ts | Daily job scheduler |
| emailNotificationService | emailNotificationService.ts | Email notifications |
| externalDataConnectors | externalDataConnectors.ts | External data integration |
| reportGenerator | reportGenerator.ts | Report generation |
| signalDetector | signalDetector.ts | Anomaly detection |
| yemenDataConnectors | yemenDataConnectors.ts | Yemen-specific connectors |

---

## 6. Scheduled Jobs (28 total)

Jobs are stored in `scheduler_jobs` table and managed by `dailyScheduler.ts`:

| Job Type | Schedule | Description |
|----------|----------|-------------|
| world_bank_ingestion | Daily 6:00 AM | World Bank data refresh |
| ocha_fts_ingestion | Daily 6:15 AM | OCHA FTS funding data |
| unhcr_ingestion | Daily 6:30 AM | UNHCR refugee data |
| wfp_ingestion | Daily 6:45 AM | WFP food security |
| signal_detection | Every 4 hours | Anomaly detection |
| daily_snapshot | Daily 7:00 AM | Daily data snapshot |
| weekly_digest | Weekly Monday | Weekly digest generation |
| monthly_report | Monthly 1st | Monthly report generation |

---

## 7. Test Coverage

**Test Files:** 9  
**Total Tests:** 173 passing  
**Test Suites:**
- auth.logout.test.ts (1 test)
- ai.chat.test.ts (6 tests)
- analytics-engine.test.ts (21 tests)
- connectors.test.ts (29 tests)
- connectorHealthAlerts.test.ts (8 tests)
- governance.test.ts (varies)
- hardening.test.ts (varies)
- integration.test.ts (varies)
- yeto.test.ts (21 tests)

---

## 8. Known Gaps

1. **TypeScript Errors:** Banking.tsx has 4 TypeScript errors related to tRPC type generation lag (runtime works correctly)
2. **CBY PDF Links:** 114 PDFs exist but not mapped to database entries
3. **Microfinance Page:** Not yet implemented
4. **Some hardcoded fallback values** in Home.tsx, RegionalZones.tsx, Entities.tsx (used as fallbacks when API data unavailable)

---

## 9. How to Run

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Database migrations
pnpm db:push

# Build for production
pnpm build
```

---

*This inventory was generated as part of the Truth Layer implementation (D1: Discovery Pack)*
