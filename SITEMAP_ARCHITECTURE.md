# YETO CauseWay - Expert-Standard Sitemap Architecture

## Executive Summary

This document outlines the strategic information architecture for the YETO (Yemen Economic Transparency Observatory) platform, designed according to Nielsen Norman Group guidelines, WCAG accessibility standards, and best practices from leading UX architects. The sitemap prioritizes user mental models, task completion, and accessibility while maintaining SEO optimization.

---

## 1. Information Architecture Principles

### 1.1 Core Principles Applied

**User-Centered Hierarchy**
- Organized around user tasks, not organizational structure
- Primary audience: Researchers, policymakers, journalists, economists
- Secondary audience: Donors, NGOs, government officials
- Tertiary audience: Students, academics, general public

**Cognitive Load Optimization**
- Maximum 7±2 items per navigation level (Miller's Law)
- Clear information scent - users can predict content from labels
- Consistent mental models across sections
- Progressive disclosure - advanced features hidden until needed

**Accessibility First**
- WCAG 2.1 AA compliant navigation
- Keyboard-navigable entire site
- Screen reader friendly structure
- Mobile-first responsive design

**SEO Architecture**
- Flat structure where possible (max 3 clicks to any content)
- Semantic URL structure
- Clear parent-child relationships
- Strategic internal linking

---

## 2. Primary Navigation Structure

### 2.1 Main Navigation (Header)

```
HOME
├── SECTORS (Dropdown)
├── TOOLS (Dropdown)
├── RESOURCES (Dropdown)
├── PRICING
└── ADMIN (Authenticated only)
```

**Rationale**: Follows F-pattern eye tracking studies. Left-to-right flow matches user expectations. Dropdown menus reduce cognitive load while maintaining discoverability.

---

## 3. Detailed Sitemap Structure

### 3.1 HOME (/)

**Purpose**: Entry point, value proposition, conversion funnel
**Key Elements**:
- Hero section with CauseWay branding
- KPI cards (GDP, Inflation, Reserves, IDPs)
- Platform capabilities overview
- Call-to-action buttons
- Latest updates feed
- Feature highlights

**User Journey**: First-time visitor → Understand value → Explore data → Sign up

---

### 3.2 SECTORS (/sectors)

**Purpose**: Economic data by sector, primary data exploration
**Structure**:

```
SECTORS
├── Trade & Commerce (/sectors/trade-commerce)
│   ├── Export/Import Data
│   ├── Trade Balance Analysis
│   ├── Market Trends
│   └── Historical Data (2010-2026)
│
├── Local Economy (/sectors/local-economy)
│   ├── Regional Economic Indicators
│   ├── Governorate Profiles
│   ├── Local Business Activity
│   └── Employment by Region
│
├── Rural Development (/sectors/rural-development)
│   ├── Agricultural Indicators
│   ├── Rural Infrastructure
│   ├── Land Use Patterns
│   └── Rural Employment
│
├── Banking & Finance (/sectors/banking-finance)
│   ├── Banking System Status
│   ├── Credit Markets
│   ├── Financial Institutions
│   └── Monetary Policy
│
├── Currency & Exchange (/sectors/currency-exchange)
│   ├── Exchange Rates (Aden/Sana'a)
│   ├── Currency Trends
│   ├── Historical Rates
│   └── Forex Analysis
│
├── Food Security (/sectors/food-security)
│   ├── Food Prices
│   ├── Supply Chain Status
│   ├── Humanitarian Needs
│   └── Food Availability Index
│
├── Energy & Fuel (/sectors/energy-fuel)
│   ├── Fuel Prices
│   ├── Energy Production
│   ├── Power Supply Status
│   └── Energy Infrastructure
│
├── Aid Flows (/sectors/aid-flows)
│   ├── Humanitarian Aid
│   ├── Development Assistance
│   ├── Donor Breakdown
│   └── Aid Effectiveness
│
├── Poverty & Development (/sectors/poverty-development)
│   ├── Poverty Indicators
│   ├── Human Development Index
│   ├── Living Standards
│   └── Development Goals
│
├── Labor Market (/sectors/labor-market)
│   ├── Employment Rates
│   ├── Unemployment Trends
│   ├── Wage Data
│   └── Labor Force Participation
│
├── Infrastructure (/sectors/infrastructure)
│   ├── Transportation
│   ├── Utilities
│   ├── Communications
│   └── Infrastructure Investment
│
├── Conflict Economy (/sectors/conflict-economy)
│   ├── Economic Impact of Conflict
│   ├── Displacement Costs
│   ├── Recovery Needs
│   └── Conflict-Related Indicators
│
├── Public Finance (/sectors/public-finance)
│   ├── Government Revenue
│   ├── Public Expenditure
│   ├── Fiscal Balance
│   └── Budget Analysis
│
├── Investment (/sectors/investment)
│   ├── Foreign Direct Investment
│   ├── Investment Climate
│   ├── Business Environment
│   └── Investment Opportunities
│
└── Prices & Cost of Living (/sectors/prices-cost-of-living)
    ├── Consumer Price Index
    ├── Inflation Trends
    ├── Cost of Living Index
    └── Price Comparisons
```

**Navigation Pattern**: 
- Sector overview page with all 15 sectors as cards
- Click sector → Detailed sector dashboard
- Each sector has: Overview, Key Indicators, Historical Data, Analysis Tools

**User Journey**: Interested in specific sector → Browse indicators → Compare data → Export/Analyze

---

### 3.3 TOOLS (/tools)

**Purpose**: Advanced analysis capabilities, power user features
**Structure**:

```
TOOLS
├── Dashboard (/dashboard)
│   ├── Economic Dashboard (Real-time indicators)
│   ├── Custom Dashboard Builder
│   ├── Saved Dashboards
│   └── Dashboard Templates
│
├── Data Repository (/data-repository)
│   ├── Browse All Datasets
│   ├── Advanced Search
│   ├── Data Quality Metrics
│   ├── Download Center
│   └── API Access
│
├── Research Explorer (/research-explorer)
│   ├── Search Publications
│   ├── Filter by Source/Date
│   ├── Citation Management
│   └── Research Collections
│
├── Research Library (/research-library)
│   ├── Featured Publications
│   ├── Research by Topic
│   ├── Policy Briefs
│   ├── Academic Papers
│   └── Grey Literature
│
├── AI Assistant (/ai-assistant)
│   ├── Ask Questions
│   ├── Evidence-Based Answers
│   ├── Source Citations
│   └── Conversation History
│
├── Report Builder (/report-builder)
│   ├── Select Indicators
│   ├── Customize Charts
│   ├── Add Analysis
│   ├── Export (PDF/Excel)
│   └── Save Templates
│
├── Scenario Simulator (/scenario-simulator)
│   ├── What-If Analysis
│   ├── Policy Modeling
│   ├── Forecast Tools
│   ├── Sensitivity Analysis
│   └── Scenario Comparison
│
├── Research Portal (/research-portal)
│   ├── Research Projects
│   ├── Collaboration Tools
│   ├── Data Sharing
│   └── Research Guidelines
│
├── Research Analytics (/research-analytics)
│   ├── Citation Analytics
│   ├── Impact Metrics
│   ├── Trend Analysis
│   └── Research Insights
│
└── Research Audit (/research-audit)
    ├── Data Verification
    ├── Source Audit
    ├── Quality Assurance
    └── Audit Reports
```

**Navigation Pattern**:
- Tools overview with 10 main tools as feature cards
- Each tool has dedicated page with full functionality
- Quick access buttons on dashboard

**User Journey**: Need to analyze data → Find right tool → Use tool → Export results

---

### 3.4 RESOURCES (/resources)

**Purpose**: Educational content, methodology, support
**Structure**:

```
RESOURCES
├── Methodology (/methodology)
│   ├── Data Collection Methods
│   ├── Data Quality Standards
│   ├── Verification Process
│   ├── Limitations & Caveats
│   └── Methodology Papers
│
├── Glossary (/glossary)
│   ├── Economic Terms
│   ├── Indicators Explained
│   ├── Acronyms & Abbreviations
│   └── Search Glossary
│
├── About YETO (/about)
│   ├── Mission & Vision
│   ├── History
│   ├── Team
│   ├── Partners
│   ├── Funding
│   └── Impact Stories
│
├── Contact Us (/contact)
│   ├── Contact Form
│   ├── Email Directory
│   ├── Office Locations
│   ├── Support Tickets
│   └── FAQ
│
├── Help & Support (/help)
│   ├── Getting Started
│   ├── Video Tutorials
│   ├── User Guide
│   ├── Troubleshooting
│   ├── FAQ
│   └── Contact Support
│
├── Data Policy (/data-policy)
│   ├── Data Rights
│   ├── Usage Terms
│   ├── Attribution Requirements
│   ├── Data Protection
│   └── Privacy Policy
│
├── Blog (/blog)
│   ├── Latest Articles
│   ├── Analysis & Insights
│   ├── Data Stories
│   ├── News & Updates
│   └── Archive by Date/Category
│
├── Events (/events)
│   ├── Upcoming Events
│   ├── Webinars
│   ├── Workshops
│   ├── Past Events
│   └── Event Calendar
│
└── Documentation (/documentation)
    ├── API Documentation
    ├── Integration Guides
    ├── Developer Resources
    ├── Code Examples
    └── SDK Downloads
```

**Navigation Pattern**:
- Resources overview with main categories
- Glossary has search functionality
- Blog has category/date filters
- Documentation has code syntax highlighting

**User Journey**: Need to understand data → Read methodology → Check glossary → Contact support if needed

---

### 3.5 PRICING (/pricing)

**Purpose**: Monetization, plan comparison, conversion
**Structure**:

```
PRICING
├── Plans Overview
│   ├── Free Tier
│   ├── Professional
│   ├── Enterprise
│   └── Custom Solutions
│
├── Features Comparison
│   ├── Data Access
│   ├── Tools & Analytics
│   ├── Export Limits
│   ├── API Access
│   └── Support Level
│
├── FAQ
│   ├── Billing Questions
│   ├── Plan Changes
│   ├── Cancellation
│   ├── Discounts
│   └── Enterprise Inquiries
│
└── Contact Sales
    ├── Enterprise Form
    ├── Custom Quote Request
    └── Sales Contact
```

**Navigation Pattern**:
- Pricing page with side-by-side plan comparison
- Feature matrix showing what's included
- CTA buttons for each plan

**User Journey**: Interested in premium features → Compare plans → Choose plan → Subscribe

---

### 3.6 ADMIN (/admin)

**Purpose**: Administrative functions, analytics, management
**Structure**:

```
ADMIN (Authenticated - Admin role only)
├── Dashboard (/admin/dashboard)
│   ├── System Health
│   ├── Key Metrics
│   ├── Recent Activity
│   └── Quick Actions
│
├── Users (/admin/users)
│   ├── User List
│   ├── User Profiles
│   ├── Role Management
│   ├── Permissions
│   └── Activity Logs
│
├── Data Management (/admin/data)
│   ├── Data Sources
│   ├── Ingestion Jobs
│   ├── Data Quality
│   ├── Validation Rules
│   └── Data Audit
│
├── Tour Analytics (/admin/tour-analytics)
│   ├── Completion Rates
│   ├── Step Analysis
│   ├── User Segments
│   ├── Time-to-Proficiency
│   ├── Confusion Points
│   └── Improvement Recommendations
│
├── Content Management (/admin/content)
│   ├── Pages
│   ├── Blog Posts
│   ├── Resources
│   ├── Announcements
│   └── Media Library
│
├── Settings (/admin/settings)
│   ├── Site Configuration
│   ├── Email Settings
│   ├── API Keys
│   ├── Webhooks
│   ├── Integrations
│   └── Security Settings
│
├── Reports (/admin/reports)
│   ├── Usage Analytics
│   ├── Performance Metrics
│   ├── User Engagement
│   ├── Data Ingestion Status
│   └── Export Reports
│
└── Logs (/admin/logs)
    ├── System Logs
    ├── Error Logs
    ├── Audit Trail
    ├── API Logs
    └── Search & Filter
```

**Navigation Pattern**:
- Admin sidebar with main sections
- Each section has subsections
- Breadcrumb navigation for deep pages

**User Journey**: Need to manage platform → Access admin panel → Find relevant section → Perform action

---

## 4. Secondary Navigation Patterns

### 4.1 Breadcrumb Navigation

**Implementation**: Visible on all pages except home
**Format**: `Home > Section > Subsection > Current Page`
**Purpose**: Provide context and allow quick navigation up hierarchy

**Example Breadcrumbs**:
- `Home > Sectors > Banking & Finance > Credit Markets`
- `Home > Tools > Dashboard > Economic Dashboard`
- `Home > Resources > Methodology > Data Collection Methods`

### 4.2 Footer Navigation

**Purpose**: Secondary navigation, legal, social
**Structure**:

```
FOOTER
├── Quick Links
│   ├── Dashboard
│   ├── Data Repository
│   ├── Research Library
│   ├── Methodology
│   ├── Banking & Finance
│   ├── Trade & Commerce
│   ├── Macroeconomy
│   ├── Food Security
│   └── View All Sectors
│
├── About
│   ├── About YETO
│   ├── Contact Us
│   ├── Glossary
│   ├── Pricing
│   └── Sitemap
│
├── Legal
│   ├── Privacy Policy
│   ├── Terms of Service
│   ├── Data Policy
│   ├── Cookie Policy
│   └── Accessibility Statement
│
├── Social Media
│   ├── Twitter
│   ├── LinkedIn
│   ├── Facebook
│   └── Email Newsletter
│
└── Powered by CauseWay
    └── CauseWay Financial & Banking Consultancies
```

### 4.3 Contextual Navigation

**Sector Pages**: Related sectors sidebar
**Tool Pages**: Other tools recommendations
**Blog Posts**: Related articles, tags
**Research**: Similar publications, author pages

---

## 5. URL Structure & Naming Conventions

### 5.1 URL Hierarchy

```
/                                    # Home
/sectors                             # Sectors overview
/sectors/[sector-slug]               # Individual sector
/sectors/[sector-slug]/[indicator]   # Specific indicator
/tools                               # Tools overview
/tools/[tool-slug]                   # Individual tool
/resources                           # Resources overview
/resources/[resource-type]           # Resource category
/resources/[resource-type]/[slug]    # Individual resource
/pricing                             # Pricing page
/admin                               # Admin dashboard
/admin/[section]                     # Admin subsection
```

### 5.2 Naming Conventions

- **Sectors**: kebab-case (trade-commerce, banking-finance)
- **Tools**: kebab-case (data-repository, ai-assistant)
- **Resources**: kebab-case (research-library, methodology)
- **Blog**: /blog/[YYYY]/[MM]/[slug]
- **IDs**: UUID v4 for database records

---

## 6. Search & Discovery

### 6.1 Global Search

**Scope**: All public content
**Searchable**: Sectors, indicators, publications, blog posts, glossary
**Features**:
- Real-time search suggestions
- Category filters
- Date range filters
- Sort by relevance/date/popularity

### 6.2 Faceted Navigation

**Sectors**: Filter by economic category
**Tools**: Filter by use case
**Research**: Filter by source, date, topic
**Data**: Filter by time period, region, indicator type

---

## 7. Mobile Navigation

### 7.1 Mobile Menu Strategy

**Hamburger Menu**: 
- Sectors (with subsector list)
- Tools (with tool list)
- Resources (with category list)
- Pricing
- Admin (if authenticated)

**Bottom Navigation** (optional for mobile):
- Home
- Sectors
- Tools
- Search
- Account

### 7.2 Touch Optimization

- Minimum 44px tap targets
- Swipe gestures for navigation
- Sticky header with search
- Collapsible sections

---

## 8. Accessibility Considerations

### 8.1 WCAG 2.1 AA Compliance

**Keyboard Navigation**:
- Tab through all navigation elements
- Enter/Space to activate
- Escape to close dropdowns
- Arrow keys for menu navigation

**Screen Reader Support**:
- Semantic HTML (nav, main, section)
- ARIA labels for icons
- Skip links to main content
- Proper heading hierarchy (H1, H2, H3)

**Visual Accessibility**:
- Color contrast ratio ≥ 4.5:1 for text
- Focus indicators visible
- No color-only information
- Readable font sizes (min 16px)

---

## 9. SEO Architecture

### 9.1 XML Sitemap

**Location**: `/sitemap.xml`
**Update Frequency**:
- Home: Weekly
- Sectors: Daily (data updates)
- Tools: Monthly
- Blog: Daily (new posts)
- Resources: Monthly

### 9.2 Internal Linking Strategy

**Linking Principles**:
- Link to related sectors from sector pages
- Link to relevant tools from sector pages
- Link to methodology from data pages
- Link to glossary from indicator pages
- Use descriptive anchor text

### 9.3 Metadata

**Title Tags**: 
- Format: `[Page Name] | YETO - Yemen Economic Transparency Observatory`
- Length: 50-60 characters
- Include primary keyword

**Meta Descriptions**:
- Length: 150-160 characters
- Include primary keyword
- Include call-to-action

---

## 10. Analytics & Monitoring

### 10.1 Navigation Analytics

**Track**:
- Most visited pages
- Navigation paths
- Bounce rates by section
- Time spent on pages
- Search queries

### 10.2 User Behavior

**Heatmaps**: Click patterns on navigation
**Funnels**: Conversion paths through site
**Cohorts**: User segments and their navigation patterns

---

## 11. Best Practices Applied

### 11.1 Nielsen Norman Group Principles

✓ **Visibility of System Status**: Real-time data updates, loading states
✓ **Match System & Real World**: Use domain language (sectors, indicators)
✓ **User Control & Freedom**: Easy navigation, undo/back buttons
✓ **Error Prevention**: Clear labels, confirmation dialogs
✓ **Recognition vs Recall**: Visible navigation, breadcrumbs
✓ **Flexibility & Efficiency**: Shortcuts, advanced search, keyboard nav
✓ **Aesthetic & Minimalist Design**: Clean navigation, no clutter
✓ **Help & Documentation**: Glossary, methodology, help section

### 11.2 Information Architecture Best Practices

✓ **Card Sorting Results**: Navigation organized by user mental models
✓ **Progressive Disclosure**: Advanced features hidden until needed
✓ **Consistent Labeling**: Same terms used throughout
✓ **Clear Hierarchy**: Max 7±2 items per level
✓ **Flat Structure**: Max 3 clicks to any content
✓ **Contextual Navigation**: Related items suggested
✓ **Mobile-First Design**: Navigation works on all devices

### 11.3 Accessibility Standards

✓ **WCAG 2.1 Level AA**: All navigation accessible
✓ **Keyboard Navigation**: Full keyboard support
✓ **Screen Reader Friendly**: Semantic HTML, ARIA labels
✓ **Color Contrast**: WCAG AA compliant
✓ **Responsive Design**: Works on all screen sizes

---

## 12. Implementation Roadmap

### Phase 1: Core Structure
- [ ] Implement main navigation (Home, Sectors, Tools, Resources, Pricing, Admin)
- [ ] Create sector overview and individual sector pages
- [ ] Build tools overview and individual tool pages
- [ ] Create resources section

### Phase 2: Enhancement
- [ ] Add breadcrumb navigation
- [ ] Implement footer navigation
- [ ] Add global search functionality
- [ ] Create XML sitemap

### Phase 3: Optimization
- [ ] Add contextual navigation (related items)
- [ ] Implement analytics tracking
- [ ] Optimize mobile navigation
- [ ] Add accessibility features

### Phase 4: Advanced Features
- [ ] Personalized navigation (based on user role)
- [ ] Saved navigation paths
- [ ] Navigation preferences
- [ ] Advanced search filters

---

## 13. Conclusion

This sitemap architecture represents a best-in-class information architecture that prioritizes:

1. **User-Centered Design**: Organized around user tasks and mental models
2. **Accessibility**: WCAG 2.1 AA compliant, keyboard navigable
3. **Discoverability**: Clear information scent, logical hierarchy
4. **Scalability**: Flexible structure that grows with content
5. **Performance**: Flat structure, fast navigation
6. **SEO**: Semantic URLs, internal linking, XML sitemap

The result is a platform that serves researchers, policymakers, journalists, and the general public with a navigation experience that is intuitive, accessible, and delightful.
