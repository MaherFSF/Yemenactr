# YETO Platform Demo Script

This document provides structured demo paths for different audiences.

---

## Demo Path 1: Donor/Partner Presentation (10-15 minutes)

### Objective
Demonstrate YETO's value proposition as an evidence-grounded economic intelligence platform for Yemen.

### Audience
Donors, development partners, international organizations, research institutions.

### Setup
- Open browser to https://yeto.causewaygrp.com (or staging URL)
- Ensure Arabic language is selected (default)
- Have a second tab ready for English comparison

---

### Demo Flow

#### 1. Homepage Introduction (2 minutes)

**Navigate to**: `/` (Homepage)

**Key Points to Highlight**:
- "Welcome to YETO - Yemen Economic Transparency Observatory"
- Show the Insights Ticker with real-time economic updates
- Point out the DEV mode banner (explain this shows sample data in development)
- Highlight platform stats: 850+ users, 45 research reports, 47 data sources, 1.2M data points
- Show CauseWay branding: "Powered by CauseWay Financial & Banking Consultancy"

**Script**:
> "YETO is the first comprehensive economic intelligence platform dedicated to Yemen. It aggregates data from over 47 verified sources, providing evidence-based insights for decision-makers, researchers, and humanitarian organizations."

---

#### 2. Dashboard Overview (3 minutes)

**Navigate to**: `/dashboard`

**Key Points to Highlight**:
- Regime toggle: Show Aden vs Sana'a comparison
- Key indicators: Exchange rate, inflation, food prices
- Evidence Pack button: Click to show data provenance
- Time-travel feature: "View as of date X"

**Script**:
> "Our dashboard provides real-time tracking of key economic indicators across both authorities. Every data point is linked to an Evidence Pack showing exactly where the information comes from, when it was collected, and our confidence rating."

**Demo Action**:
1. Toggle between Aden and Sana'a views
2. Click "Evidence" button on any KPI card
3. Show the source attribution and confidence rating

---

#### 3. Sector Deep Dive (3 minutes)

**Navigate to**: `/sectors/banking`

**Key Points to Highlight**:
- Dual central bank tracking (CBY-Aden vs CBY-Sana'a)
- Sanctions compliance information (descriptive only)
- Related reports and analysis
- Export functionality

**Script**:
> "Each sector page provides comprehensive analysis with regime-specific tracking. For banking, we monitor both central banks, track sanctions compliance, and provide detailed analysis of the parallel financial systems."

**Demo Action**:
1. Show the dual-authority comparison
2. Scroll to sanctions section (emphasize: informational only, no evasion guidance)
3. Click export button to show download options

---

#### 4. AI Assistant ("One Brain") (2 minutes)

**Navigate to**: `/ai-assistant`

**Key Points to Highlight**:
- Evidence-only responses (no hallucination)
- Source citations for every answer
- Suggested questions
- Confidence ratings

**Script**:
> "Our AI assistant, called 'One Brain', answers questions using only verified data from our evidence store. It never fabricates information - if we don't have the data, it will tell you and show you the data gap."

**Demo Action**:
1. Type: "What is the current exchange rate in Aden?"
2. Show the response with source citations
3. Point out the confidence rating and evidence links

---

#### 5. Entity Profiles (2 minutes)

**Navigate to**: `/entities`

**Key Points to Highlight**:
- HSA Group profile with subsidiaries
- Central bank profiles
- Risk factors and indicators
- Source attribution

**Script**:
> "We maintain verified profiles of major economic actors including commercial conglomerates, banks, and institutions. Each profile contains only verifiable facts with full source attribution."

**Demo Action**:
1. Click on HSA Group profile
2. Show subsidiaries list
3. Point out risk factors and timeline

---

#### 6. Data Repository (2 minutes)

**Navigate to**: `/data`

**Key Points to Highlight**:
- Advanced filtering (sector, regime, confidence)
- Dataset cards with metadata
- Download options (CSV, JSON, XLSX)
- Verification badges

**Script**:
> "Researchers and analysts can access our full data repository with advanced filtering. Every dataset is tagged with verification status, confidence rating, and full provenance metadata."

**Demo Action**:
1. Apply a filter (e.g., Banking sector, Aden regime)
2. Click on a dataset card
3. Show the download options

---

#### 7. Closing & Q&A (1 minute)

**Navigate to**: `/methodology`

**Key Points to Highlight**:
- Transparent methodology
- Corrections policy
- Contact: yeto@causewaygrp.com

**Script**:
> "YETO is built on principles of transparency and accountability. Our methodology is fully documented, and we maintain a public corrections log. For partnerships or inquiries, contact us at yeto@causewaygrp.com."

---

## Demo Path 2: Technical Reviewer (5 minutes)

### Objective
Demonstrate technical implementation and evidence integrity.

### Audience
Technical evaluators, data scientists, security reviewers.

---

### Demo Flow

#### 1. Run Local Instance (1 minute)

```bash
# Clone repository
git clone https://github.com/MaherFSF/yeto-platform.git
cd yeto-platform

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

#### 2. Run Validation Suite (1 minute)

```bash
# Run all tests
pnpm test

# Run validation checks
pnpm validate
```

#### 3. Evidence Pack Demonstration (2 minutes)

**Navigate to**: `/dashboard`

**Actions**:
1. Click any Evidence button
2. Show the Evidence Pack dialog with:
   - Source publisher
   - Dataset name
   - Retrieval date
   - Confidence rating
   - Methodology notes

#### 4. Database Schema Review (1 minute)

```bash
# View schema
cat drizzle/schema.ts

# Key tables:
# - provenanceRecords
# - sources
# - contradictions
# - corrections
# - vintages
```

---

## Demo Path 3: Subscriber Onboarding (5 minutes)

### Objective
Guide new subscribers through platform features.

### Audience
New registered users, pro subscribers.

---

### Demo Flow

1. **Login** → Show authentication flow
2. **User Dashboard** → Saved searches, watchlist, activity
3. **Notification Settings** → Email preferences
4. **Report Builder** → Custom report creation
5. **Export Center** → Download data in multiple formats

---

## Key Messages for All Demos

1. **Evidence-First**: Every data point is traceable to its source
2. **Dual Authority Tracking**: Comprehensive coverage of both Aden and Sana'a
3. **No Hallucination**: AI assistant uses only verified data
4. **Transparent Methodology**: Full documentation of data collection and processing
5. **Bilingual**: Complete Arabic and English support
6. **Neutral Tone**: Descriptive analysis without political bias

---

## Troubleshooting During Demo

| Issue | Solution |
|-------|----------|
| Page loads slowly | Refresh, mention this is development environment |
| Data shows DEV label | Explain this indicates sample data in development |
| Evidence Pack empty | Navigate to a different indicator with full data |
| Language not switching | Clear browser cache and refresh |

---

## Contact

For demo support or questions: yeto@causewaygrp.com
