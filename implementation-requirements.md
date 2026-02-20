# YETO Implementation Requirements - Comprehensive Analysis

## Step 5: Time-Travel What-If System

### Goal
Implement a "Time-Travel" slider on the main dashboard that allows any user (public and authenticated) to view the complete state of the platform's data and key events as they were at any point in time from Jan 2010 to the present.

### Key Components

1. **Backend API Endpoint** (`/src/server/api/routers/historical.ts`)
   - getStateAtTimestamp procedure
   - Returns observations, key_events, articles, and summary statistics for given timestamp

2. **Frontend Component** (`TimeTravelSlider.tsx`)
   - Slider from 2010 to current year
   - Debounced API calls (500ms)
   - Zustand store for global historical state

3. **Dashboard Integration**
   - All charts read from historicalStore instead of live data
   - Reactive updates when slider changes

### Database Tables Needed
- `key_events` - Historical events with impact_level, regime_tag, source_citation
- `ai_projections` - Cached AI projections for what-if scenarios

---

## Step 6: Self-Production Report Engine

### Goal
Implement an automated system to generate and distribute quarterly and annual economic reports.

### Key Components

1. **Report Generation Job** (`/src/server/jobs/report-generator.ts`)
   - Scheduled job for quarterly/annual reports
   - Template-based PDF generation
   - Multi-language support (AR/EN)

2. **Report Types**
   - Quarterly: Economic Overview, Banking Sector, Trade Analysis, Currency Monitor
   - Annual: Yemen Economic Outlook, Banking Sector Annual, Trade & Investment Annual

3. **Distribution System**
   - Auto-upload to Research Library
   - Email distribution to subscribers
   - API endpoint for programmatic access

---

## Methodology Enhancements Needed

### Missing Data Sources to Add
- CBY-Sana'a (Central Bank of Yemen - Sana'a)
- OCHA (UN Office for Coordination of Humanitarian Affairs)
- FAO (Food and Agriculture Organization)
- ILO (International Labour Organization)
- UNCTAD (UN Conference on Trade and Development)

### Missing Documentation
- Calculation formulas for key indicators
- Seasonal adjustment methods
- Data revision policy
- Indicator Calculation Manual

### Dashboard Fixes
- Remove development mode banner
- Fix November 31 date bug (should be Nov 30)
- Standardize language (no mixing AR/EN in same view)
- Add data source citations to charts
- Add last-updated timestamps

---

## Priority Implementation Order

1. **Immediate (This Session)**
   - Time-Travel slider with historical state
   - Key events database and seeding
   - Dashboard integration

2. **Next Session**
   - Report generation engine
   - Methodology page enhancements
   - Dashboard visualization fixes
