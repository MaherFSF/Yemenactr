# YETO Platform - Mockup Analysis

This document captures key design elements from the mockups that need to be reflected in the implementation.

---

## Homepage (01_causeway_yeto_homepage.png)

### Key Elements
- **Header**: CauseWay | YETO logo on left, navigation (Dashboard, Data & Analytics, Research, Sectors, About, Contact), language toggle (EN | العربية), search icon
- **Hero Section**: 
  - Background: Yemen cityscape (Sana'a old city)
  - Title: "Yemen Economic Transparency Observatory" (green "Transparency")
  - Subtitle: "Evidence-Based Intelligence for Yemen's Economic Future"
  - Sub-subtitle: "A flagship product of CauseWay Financial & Banking Consultancies"
  - CTAs: "Explore Dashboard" (green), "View Latest Research" (outline)
  - Dashboard preview image on right
- **Stats Cards** (4 cards below hero):
  - Yemeni Rial Exchange Rate: 1,345 YER/USD with trend and sparkline
  - Daily Oil Production: 52,000 Barrels with trend
  - Trade Balance: -$1.2 Billion
  - Key Commodity Prices with trend
- **Footer**: "Powered by CauseWay" with logo

### Arabic Version (01_landing_hero_arabic.png)
- RTL layout
- Navigation: الرئيسية, لوحة البيانات, القطاعات, الأبحاث, البيانات, من نحن, تواصل معنا
- Title: "الشفافية الاقتصادية لليمن"
- Subtitle: "منصة الذكاء الاقتصادي الرائدة للبيانات والتحليل والمساءلة"
- Stats: 45 تقرير بحثي, 850+ مستخدم, 1.2M نقطة بيانات, 47 مصدر بيانات
- "مدعوم من CauseWay"

---

## Dashboard (02_main_dashboard_arabic.png)

### Key Elements
- **Header**: Same as homepage with user profile
- **Title**: "لوحة المؤشرات الاقتصادية" (Economic Indicators Dashboard)
- **Subtitle**: "بيانات موثقة ومحدثة عن الاقتصاد اليمني"
- **Filters Row**:
  - Indicator selector dropdown
  - Time period (date range picker)
  - Regime toggle: كلاهما | صنعاء | عدن (Both | Sana'a | Aden)
  - Granularity: سنوي | ربع سنوي | شهري (Annual | Quarterly | Monthly)
  - Export button
- **Left Sidebar**:
  - Quick Stats (إحصائيات سريعة): 3 mini KPI cards with sparklines
  - Alerts (التنبيهات): Warning cards for important updates
  - Watchlist (قائمة المتابعة): User's tracked indicators
  - Data Source info
- **Main Chart**:
  - Title: "الناتج المحلي الإجمالي 2010-2024"
  - Dual regime lines: نظام عدن (Aden) solid, نظام صنعاء (Sana'a) dashed
  - Confidence band (95%)
  - Interactive tooltips with year, regime, value, growth rate
- **Data Table**: Year, Value, Regime, Source, Data Quality columns

---

## AI Assistant (10_ai_one_brain_assistant.png)

### Key Elements
- **Title**: "YETO Economic Intelligence Assistant"
- **Subtitle**: "Evidence-based AI powered by Yemen's economic data"
- **Layout**: 3-column
  - Left: Conversation History (past queries with timestamps)
  - Center: Chat area with structured response
  - Right: Agent Mode selector + actions
- **Agent Modes** (radio buttons):
  - Citizen Explainer (Arabic-first)
  - Policymaker Brief
  - Donor Analyst
  - Bank Compliance
  - Research Librarian (selected)
  - Data Steward
  - Scenario Modeler
- **Response Structure** (numbered sections):
  1. Answer (main response with citations [1], [2])
  2. Key Takeaways (bullet points with icons)
  3. Evidence (mini charts with source attribution)
  4. What Changed (timeline chart)
  5. Why It Matters
  6. Drivers (numbered list with sources and probability)
  7. Options (3 policy options with tradeoffs)
  8. Uncertainty & Limitations (caution box)
  9. Next Questions (suggested follow-ups)
- **Actions**: "Show Evidence Pack" (green), "Export Analysis" (outline)
- **Language Toggle**: EN / AR

---

## Data Repository (09_data_repository_page.png)

### Key Elements
- **Title**: "Data & Analytics Repository"
- **Subtitle**: "Access comprehensive economic datasets with advanced search and visualization tools"
- **Search**: Full-width with autocomplete suggestions
- **Left Filters Panel**:
  - Data Category: checkboxes (Economic Growth, Inflation, Employment, etc.)
  - Time Period: From/To date pickers with Apply button
  - Geographic Scope: National, Regional, Local, International
  - Data Type: Time Series, Cross-sectional, Survey Data, etc.
  - Quality Level: Verified, Provisional, Experimental
- **Sort Dropdown**: Relevance, Newest, Oldest, Most Downloaded, Alphabetical
- **Dataset Cards**:
  - Title with date range
  - Description
  - Badges: Verified (green), Updated Today, Survey Data, External Source
  - Download count
  - Last updated date
  - Preview button (green), Add to Favorites (star)

---

## Scenario Simulator (11_scenario_simulator_interface.png)

### Key Elements
- **Title**: "Economic Scenario Simulator"
- **Subtitle**: "Model economic shocks and policy interventions with evidence-based assumptions"
- **Layout**: 3-column
- **Left Panel - Scenario Configuration**:
  - Base Scenario dropdown
  - Shock Parameters with sliders:
    - Oil Price Change (-30% to +50%)
    - Exchange Rate Shock
    - Aid Inflow Change (-40% to +40%)
    - Remittances Change
    - Fuel Subsidy Policy dropdown
  - Time Horizon: 6 months, 1 year, 2 years
  - Run Scenario (green), Reset buttons
- **Center Panel - Results**:
  - Title: "Scenario Results: Oil Price +20%, Aid -25%"
  - Impact KPIs: GDP Impact, Inflation, Exchange Rate, Poverty Rate with confidence bands
  - Main projection chart with baseline vs scenario lines
  - Transmission Pathway diagram (External Shocks → Intermediate Effects → Final Outcomes)
- **Right Panel - Assumptions & Evidence**:
  - Collapsible sections for each parameter
  - Source citations and confidence levels
  - Sensitivity Analysis link
  - Compare Scenarios button
  - Export Results (PDF, Excel, JSON)
  - Evidence Note with model limitations

---

## Banking Sector (21_sector_banking_finance.png)

### Key Elements
- **Hero Banner**: Bank interior photo with title overlay
- **Breadcrumb**: Home > Sectors > Banking & Finance
- **Layout**: Main content + right sidebar
- **Sector Overview**: Paragraph description
- **Key Indicators** (4 cards):
  - Total Assets: YER 8.5 Trillion (+2.5% YoY)
  - Number of Banks: 21 Commercial Banks (Stable)
  - Deposit Growth: 15% Annually (-3.1% YoY)
  - Loan Portfolio: YER 1.2 Trillion (+1.8% YoY)
- **Central Bank Split Analysis**:
  - Timeline visualization showing 2016 split
  - Pre-2015 Unified Operations
  - Post-2015 Dual Operations with Aden vs Sana'a branches
- **Main Chart**: Deposits vs Loans (2014-2024) with dual Y-axis
- **Right Sidebar**:
  - Quick Stats box
  - Related Research links
  - Download Data button
  - Key Institutions list

---

## Design Tokens Observed

### Colors
- **Navy/Dark Blue**: #103050 (headers, titles)
- **Green**: #107040 (CTAs, positive indicators, "Transparency" text)
- **Gold/Amber**: #C0A030 (accents, warnings)
- **Red**: For negative indicators, alerts
- **Light Gray**: #F5F5F5 (backgrounds)
- **White**: Cards, content areas

### Typography
- **Headings**: Bold, likely Inter or similar sans-serif
- **Body**: Regular weight, good readability
- **Arabic**: Proper RTL font (likely Noto Sans Arabic or similar)

### Components
- **Cards**: White background, subtle shadow, rounded corners
- **Buttons**: Rounded, solid green for primary, outline for secondary
- **Charts**: Clean lines, dual-color for regime comparison, confidence bands
- **Badges**: Small rounded pills (Verified, Updated, etc.)
- **Filters**: Checkbox groups, date pickers, dropdowns

---

## Implementation Priority

1. **Homepage** - Match hero layout, stats cards, navigation exactly
2. **Dashboard** - Implement regime toggle, filter panel, dual-line charts
3. **AI Assistant** - Add agent modes, structured response template
4. **Data Repository** - Match filter panel layout, dataset cards
5. **Scenario Simulator** - Add sliders, transmission pathway diagram
6. **Sector Pages** - Add hero banners, key indicator cards, split analysis

---

*Last updated: December 2024*
