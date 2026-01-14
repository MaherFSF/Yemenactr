# YETO Subscriber Guide

## Welcome to YETO

The Yemen Economic Transparency Observatory (YETO) provides comprehensive economic intelligence on Yemen, combining data from over 20 credible international and local sources. This guide explains the features available to registered subscribers.

---

## Subscription Tiers

YETO offers four subscription levels, each designed to meet different user needs:

| Tier | Monthly Price | Annual Price | Best For |
|------|---------------|--------------|----------|
| **Public** | Free | Free | General public, casual researchers |
| **Registered** | Free | Free | Researchers, journalists, students |
| **Pro** | $49/month | $490/year | Analysts, consultants, NGOs |
| **Institutional** | Custom | Custom | Organizations, governments, large NGOs |

---

## Feature Comparison

| Feature | Public | Registered | Pro | Institutional |
|---------|--------|------------|-----|---------------|
| Dashboard access | ✅ | ✅ | ✅ | ✅ |
| 17 sector pages | ✅ | ✅ | ✅ | ✅ |
| Research library | ✅ | ✅ | ✅ | ✅ |
| Timeline view | ✅ | ✅ | ✅ | ✅ |
| Bilingual glossary | ✅ | ✅ | ✅ | ✅ |
| AI Assistant | ❌ | ✅ | ✅ | ✅ |
| Data downloads (CSV) | ❌ | ✅ | ✅ | ✅ |
| Saved searches | ❌ | ✅ | ✅ | ✅ |
| Custom reports | ❌ | ❌ | ✅ | ✅ |
| API access | ❌ | ❌ | ✅ | ✅ |
| Priority support | ❌ | ❌ | ✅ | ✅ |
| White-label reports | ❌ | ❌ | ❌ | ✅ |
| Bulk data exports | ❌ | ❌ | ❌ | ✅ |
| Dedicated support | ❌ | ❌ | ❌ | ✅ |

---

## Getting Started

### Creating an Account

To access registered features, create a free account:

1. Navigate to the YETO homepage
2. Click "Sign In" in the navigation bar
3. Complete the registration process
4. Verify your email address
5. Log in to access registered features

### Navigating the Platform

The platform is organized into several main sections accessible from the navigation menu:

| Section | Description | Path |
|---------|-------------|------|
| Dashboard | Real-time economic indicators | `/dashboard` |
| Sectors | 17 specialized sector pages | `/sectors/*` |
| Research | 350+ publications library | `/research` |
| Timeline | 100 economic events | `/timeline` |
| Data Repository | Downloadable datasets | `/data-repository` |
| AI Assistant | Evidence-backed Q&A | `/ai-assistant` |
| Glossary | Bilingual economic terms | `/glossary` |

---

## Key Features

### Dashboard

The dashboard provides a comprehensive overview of Yemen's economy with real-time data:

| Widget | Description | Update Frequency |
|--------|-------------|------------------|
| Exchange Rate Ticker | YER/USD rates for Aden and Sana'a | Every 4 hours |
| GDP Growth | Quarterly GDP growth rate | Quarterly |
| Inflation Rate | Annual inflation rate | Monthly |
| Foreign Reserves | Central bank reserves estimate | Monthly |
| IDP Count | Internally displaced persons | Monthly |

The exchange rate chart allows you to view historical trends with multiple timeframes (1W, 1M, 3M, 1Y, 5Y, ALL) and toggle between showing events and the Aden-Sana'a spread.

### Sector Pages

YETO covers 17 economic sectors, each with dedicated analysis:

| Sector | Key Indicators |
|--------|----------------|
| Banking & Finance | Bank assets, deposits, loans, CBY policies |
| Currency & Exchange | Exchange rates, currency stability, remittances |
| Trade & Business | Imports, exports, trade balance, business activity |
| Food Security | Food prices, availability, WFP assistance |
| Energy & Fuel | Fuel prices, electricity, energy imports |
| Humanitarian Aid | Aid flows, donor contributions, project tracking |
| Public Finance | Budget, revenue, expenditure, debt |
| Macroeconomy | GDP, inflation, economic growth |
| Labor Market | Employment, wages, labor force |
| Poverty & Development | Poverty rates, development indicators |
| Infrastructure | Transport, communications, reconstruction |
| Investment | FDI, investment climate, business environment |
| Prices & Cost of Living | Consumer prices, cost of living index |
| Agriculture & Rural | Agricultural production, rural economy |
| Conflict Economy | War economy, sanctions, economic impact |
| Local Economy | Governorate-level economic data |
| Microfinance | MFI performance, financial inclusion |

### AI Assistant

The AI Assistant provides evidence-backed answers to your economic questions:

**How to Use:**
1. Navigate to `/ai-assistant`
2. Type your question in Arabic or English
3. Receive an answer with source citations
4. Review the evidence pack with confidence ratings

**Example Questions:**
- "What is the current exchange rate in Aden?"
- "How has inflation changed since 2020?"
- "What are the main sources of humanitarian aid to Yemen?"
- "ما هو سعر الصرف الحالي في عدن؟"

**Response Format:**
Each response includes:
- Direct answer to your question
- Source citations with links
- Confidence rating (A-D)
- Related indicators and research

### Research Library

Access 350+ publications from credible sources:

**Filtering Options:**
- By source organization
- By publication type (report, brief, article)
- By topic/sector
- By date range
- By language

**Available Actions:**
- View publication details
- Download PDF (when available)
- Save to reading list
- Export citation

### Data Repository

Download datasets in multiple formats:

| Dataset | Records | Formats | Update Frequency |
|---------|---------|---------|------------------|
| Commercial Banks | 1,000+ | CSV, JSON | Monthly |
| Exchange Rates | 5,000+ | CSV, JSON | Daily |
| Economic Events | 100 | CSV, JSON | Weekly |
| Food Prices | 2,000+ | CSV, JSON | Weekly |
| Aid Flows | 500+ | CSV, JSON | Monthly |
| Research Publications | 350+ | CSV, JSON | Weekly |

---

## Pro Features

### Custom Reports

Pro subscribers can generate custom reports:

1. Navigate to Report Builder
2. Select indicators and date range
3. Choose visualization options
4. Add custom commentary
5. Export as PDF or share link

### API Access

Pro subscribers receive API access for programmatic data retrieval:

**Endpoints:**
- `/api/v1/indicators` - List all indicators
- `/api/v1/series/{id}` - Get time series data
- `/api/v1/publications` - Search publications
- `/api/v1/events` - Get economic events

**Authentication:**
Include your API key in the request header:
```
Authorization: Bearer YOUR_API_KEY
```

**Rate Limits:**
- 1,000 requests per day
- 100 requests per minute

---

## Bilingual Support

YETO is fully bilingual with Arabic as the primary language:

**Language Toggle:**
Click the language button in the navigation bar to switch between Arabic and English.

**RTL Support:**
The Arabic interface uses proper right-to-left layout with Arabic typography.

**Bilingual Glossary:**
Access 51 controlled economic terms with consistent translations at `/glossary`.

---

## Data Quality Indicators

All data on YETO includes quality indicators:

### Confidence Ratings

| Rating | Meaning | Visual |
|--------|---------|--------|
| A | High confidence - Official, verified source | Green badge |
| B | Medium-high - Credible, cross-validated | Blue badge |
| C | Medium - Single source, plausible | Yellow badge |
| D | Low - Estimated or contested | Red badge |

### Source Attribution

Every data point shows:
- Source organization
- Publication date
- Retrieval date
- Geographic scope
- Regime tag (Aden/Sana'a/National)

---

## Getting Help

### Contact Support

For questions or issues, contact: **yeto@causewaygrp.com**

### Reporting Data Issues

If you find incorrect or outdated data:
1. Click the "Report Issue" button on any data point
2. Describe the issue
3. Provide correct information if available
4. Submit for review

### Frequently Asked Questions

**Q: How often is data updated?**
A: Most data sources are updated daily at 6:00 AM UTC. Some sources update weekly or monthly depending on their publication schedule.

**Q: Can I cite YETO data in my research?**
A: Yes, please cite as: "Yemen Economic Transparency Observatory (YETO), [indicator name], accessed [date], [URL]"

**Q: How do I upgrade my subscription?**
A: Navigate to `/pricing` and select your desired tier. Payment is processed securely.

**Q: Is my data private?**
A: Yes, we do not share personal information. See our privacy policy for details.

---

## Appendix: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` or `⌘+K` | Open global search |
| `L` | Toggle language |
| `D` | Go to dashboard |
| `R` | Go to research |
| `T` | Go to timeline |
| `?` | Show help |

---

*Last Updated: January 2026*
*Version: 1.0*
