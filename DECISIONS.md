# YETO Platform - Architecture Decision Records

This document captures key architectural decisions made during the development of the Yemen Economic Transparency Observatory (YETO) platform.

## ADR-001: Dual Authority Data Model

**Status:** Accepted  
**Date:** December 2024

### Context
Yemen operates under two competing authorities since 2014:
- **IRG (Internationally Recognized Government)** based in Aden
- **DFA (De Facto Authority/Ansar Allah)** based in Sana'a

Each authority has its own central bank, fiscal policies, currency policies, and economic indicators. This creates a unique challenge for economic data tracking.

### Decision
Implement a `regimeTag` field across all data tables with values:
- `aden_irg` - Data from IRG-controlled areas
- `sanaa_defacto` - Data from DFA-controlled areas
- `mixed` - Data covering both areas or unclear attribution
- `unknown` - Data with uncertain regime attribution

### Consequences
- All time series data, events, and geospatial data must specify regime attribution
- Dashboards and visualizations support side-by-side regime comparison
- Users can filter data by regime to focus on specific areas
- Increases data complexity but provides essential context for Yemen's fragmented economy

---

## ADR-002: Bilingual Support (Arabic/English)

**Status:** Accepted  
**Date:** December 2024

### Context
YETO serves both Arabic-speaking Yemeni users and international researchers/organizations. Arabic is the primary language for local stakeholders, while English is essential for international engagement.

### Decision
- All content fields have dual columns: `nameEn`/`nameAr`, `titleEn`/`titleAr`, etc.
- Frontend uses `LanguageContext` for dynamic language switching
- RTL (Right-to-Left) layout support for Arabic
- UI components adapt direction based on selected language

### Consequences
- Database schema includes duplicate text columns for each language
- Frontend components must handle both LTR and RTL layouts
- Content management requires maintaining both language versions
- Improved accessibility for all user groups

---

## ADR-003: Confidence Rating System

**Status:** Accepted  
**Date:** December 2024

### Context
Economic data from conflict zones varies significantly in reliability. Users need to understand data quality to make informed decisions.

### Decision
Implement a four-tier confidence rating system:
- **A (Verified Official)** - Data from official government sources, verified by multiple parties
- **B (Credible Estimate)** - Data from reputable international organizations or research institutions
- **C (Proxy/Modeled)** - Estimated or modeled data based on indirect indicators
- **D (Unverified)** - Unverified reports or single-source data

### Consequences
- All data points must have a confidence rating
- UI displays confidence badges for transparency
- AI Assistant includes confidence context in responses
- Users can filter by confidence level

---

## ADR-004: tRPC for API Layer

**Status:** Accepted  
**Date:** December 2024

### Context
Need a type-safe API layer that supports both public and protected endpoints with minimal boilerplate.

### Decision
Use tRPC with the following structure:
- `publicProcedure` for unauthenticated endpoints (data viewing)
- `protectedProcedure` for authenticated endpoints (AI assistant, submissions)
- Superjson for automatic Date/BigInt serialization
- React Query integration for client-side caching

### Consequences
- End-to-end type safety from database to frontend
- Automatic API documentation through TypeScript
- Simplified authentication handling
- Efficient data fetching with built-in caching

---

## ADR-005: Sector-Based Data Organization

**Status:** Accepted  
**Date:** December 2024

### Context
Yemen's economy spans multiple interconnected sectors. Users need to navigate data by sector while understanding cross-sector relationships.

### Decision
Organize data into 15 primary sectors:
1. Macroeconomy & Growth
2. Prices & Cost of Living
3. Currency & Exchange Rates
4. Banking & Finance
5. Trade & Commerce
6. Public Finance & Governance
7. Energy & Fuel
8. Food Security & Markets
9. Aid Flows & Accountability
10. Labor Market & Wages
11. Conflict Economy & Political Economy
12. Infrastructure & Services
13. Agriculture & Rural Development
14. Investment & Private Sector
15. Poverty & Development

### Consequences
- Each sector has a dedicated page with relevant indicators
- Indicators can belong to multiple sectors via tags
- Navigation organized around sector taxonomy
- Reports and analysis grouped by sector

---

## ADR-006: Source Attribution and Provenance

**Status:** Accepted  
**Date:** December 2024

### Context
Data credibility depends on source transparency. Users need to trace data back to original sources.

### Decision
Implement comprehensive source tracking:
- `sources` table with metadata (name, type, URL, reliability score)
- `sourceId` foreign key on all data tables
- Source display on all data visualizations
- License information for data reuse

### Consequences
- Every data point is traceable to its source
- Users can assess source reliability
- Proper attribution for data reuse
- Supports academic citation requirements

---

## ADR-007: AI Assistant with Yemen-Specific Context

**Status:** Accepted  
**Date:** December 2024

### Context
Users need intelligent assistance to navigate complex economic data. Generic AI lacks Yemen-specific knowledge.

### Decision
Implement "One Brain" AI Assistant with:
- Yemen-specific system prompt covering dual authority context
- Sector and regime context in queries
- Source citation in responses
- Confidence rating for AI outputs

### Consequences
- AI responses are contextually relevant to Yemen
- Users get accurate regime-specific information
- Responses include data source references
- Clear indication of AI confidence levels

---

## ADR-008: Responsive Design with Mobile-First Approach

**Status:** Accepted  
**Date:** December 2024

### Context
Users access the platform from various devices, including mobile phones in areas with limited connectivity.

### Decision
- Mobile-first CSS with Tailwind responsive utilities
- Progressive enhancement for complex visualizations
- Lazy loading for charts and heavy components
- Offline-capable data caching (future enhancement)

### Consequences
- Platform accessible on all device sizes
- Reduced initial load time
- Better experience in low-bandwidth areas
- Consistent design across breakpoints

---

## ADR-009: Database Schema Design

**Status:** Accepted  
**Date:** December 2024

### Context
Need a flexible schema that supports time series data, events, documents, and user-generated content.

### Decision
Core tables:
- `indicators` - Metadata for economic indicators
- `time_series` - Time series data points
- `geospatial_data` - Location-based data
- `economic_events` - Timeline events
- `sources` - Data source registry
- `documents` - Research library
- `glossary_terms` - Bilingual terminology

### Consequences
- Normalized schema reduces data duplication
- Flexible indicator system supports new metrics
- Event timeline enables historical analysis
- Document management supports research library

---

## ADR-010: CauseWay Branding Integration

**Status:** Accepted  
**Date:** December 2024

### Context
YETO is a CauseWay Group initiative. Branding should reflect this relationship while maintaining platform identity.

### Decision
- Primary brand: YETO with distinctive logo
- Secondary brand: "A CauseWay Group Initiative"
- Color palette: Navy (#103050), Green (#107040), Gold (#C0A030)
- Professional, data-focused aesthetic

### Consequences
- Clear brand identity for the platform
- Consistent visual language across pages
- Professional appearance for institutional users
- Recognizable CauseWay association

---

## Future Considerations

### Planned Enhancements
1. **RAG Integration** - Connect AI to database for real-time data retrieval
2. **Real-time Data Feeds** - WebSocket connections for live market data
3. **Offline Support** - Service worker for offline data access
4. **API Access Tiers** - Rate-limited API for external developers
5. **Data Visualization Library** - Interactive charts with D3.js

### Technical Debt
1. Consolidate duplicate export interfaces
2. Add comprehensive test coverage for all routers
3. Implement proper error boundaries for all pages
4. Add performance monitoring and analytics
