# YETO Timeline Schema & Standards

## Overview

The YETO Timeline provides a comprehensive chronological record of economic events affecting Yemen from 2010 to present, with deep coverage from 2014/2015 (conflict escalation). Every event includes evidence packs and can be overlaid on data visualizations.

## Timeline Coverage

### Time Periods

| Period | Coverage Depth | Focus |
|--------|----------------|-------|
| 2010-2013 | Standard | Pre-conflict baseline |
| 2014-2015 | Deep | Conflict escalation, institutional split |
| 2016-2020 | Deep | Economic crisis, humanitarian response |
| 2021-Present | Deep | Ongoing developments |

### Event Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `monetary` | Central bank, currency | CBY split, exchange rate changes |
| `fiscal` | Government finance | Budget announcements, salary payments |
| `conflict` | Conflict-related | Military operations, ceasefires |
| `humanitarian` | Aid and crisis | WFP operations, famine warnings |
| `trade` | Trade and ports | Port closures, import restrictions |
| `energy` | Oil and fuel | Oil exports, fuel shortages |
| `infrastructure` | Physical infrastructure | Port damage, reconstruction |
| `international` | International relations | Sanctions, agreements |

## Event Schema

### Database Structure

```typescript
interface EconomicEvent {
  id: number;
  date: Date;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  category: EventCategory;
  subcategory?: string;
  impact: "high" | "medium" | "low";
  regimeTag?: "aden" | "sanaa" | "both" | "international";
  sourceId?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Required Fields

| Field | Required | Description |
|-------|----------|-------------|
| `date` | Yes | Event date |
| `title` | Yes | English title |
| `titleAr` | Recommended | Arabic title |
| `description` | Yes | English description |
| `descriptionAr` | Recommended | Arabic description |
| `category` | Yes | Event category |
| `impact` | Yes | Impact level |

## Evidence Packs

### Structure

Every timeline event can have an evidence pack:

```typescript
interface TimelineEvidencePack {
  eventId: number;
  sourceIds: number[]; // References to sources table
  documentIds?: number[]; // References to documents table
  beforeAfterData?: BeforeAfterDataPoint[];
  confidenceRating: "A" | "B" | "C" | "D";
  notes?: string;
  notesAr?: string;
}

interface BeforeAfterDataPoint {
  indicatorCode: string;
  indicatorName: string;
  indicatorNameAr?: string;
  beforeValue: number;
  beforeDate: string;
  afterValue: number;
  afterDate: string;
  percentChange: number;
}
```

### Before/After Data

Evidence packs can show data impact:

```json
{
  "indicatorCode": "FX_ADEN",
  "indicatorName": "Exchange Rate (Aden)",
  "beforeValue": 1200,
  "beforeDate": "2024-01-01",
  "afterValue": 1600,
  "afterDate": "2024-06-01",
  "percentChange": 33.3
}
```

## Chart Overlays

### Integration with Visualizations

Timeline events can be overlaid on charts:

```typescript
interface ChartOverlay {
  visualizationSpecId: number;
  eventId: number;
  overlayType: "vertical_line" | "shaded_region" | "annotation";
  config: {
    color?: string;
    opacity?: number;
    label?: string;
    labelAr?: string;
    showInLegend?: boolean;
  };
  isEnabled: boolean;
}
```

### Overlay Types

| Type | Use Case | Display |
|------|----------|---------|
| `vertical_line` | Point events | Vertical line at date |
| `shaded_region` | Period events | Shaded area between dates |
| `annotation` | Key moments | Text annotation on chart |

## Scenario Simulator Integration

### Premium Feature

The timeline integrates with the Scenario Simulator (premium gated):

1. **Historical Scenarios**: "What if CBY hadn't split in 2016?"
2. **Counterfactual Analysis**: Compare actual vs. hypothetical
3. **Impact Modeling**: Project alternative outcomes

### Access Control

| Feature | Free | Analyst | Enterprise |
|---------|------|---------|------------|
| View timeline | ✓ | ✓ | ✓ |
| Evidence packs | ✓ | ✓ | ✓ |
| Chart overlays | - | ✓ | ✓ |
| Scenario simulator | - | - | ✓ |

## Key Historical Events

### 2014-2015 (Conflict Escalation)

| Date | Event | Impact |
|------|-------|--------|
| Sep 2014 | Ansar Allah enters Sana'a | High |
| Jan 2015 | President Hadi resigns | High |
| Mar 2015 | Saudi-led coalition intervention begins | High |
| Sep 2015 | IRG relocates to Aden | High |

### 2016-2020 (Economic Crisis)

| Date | Event | Impact |
|------|-------|--------|
| Sep 2016 | CBY headquarters moved to Aden | High |
| Jan 2017 | Dual currency system emerges | High |
| Dec 2018 | Stockholm Agreement | Medium |
| Mar 2020 | COVID-19 impacts | Medium |

### 2021-Present

| Date | Event | Impact |
|------|-------|--------|
| Apr 2022 | UN-brokered truce | High |
| Oct 2022 | Truce expires | Medium |
| 2023-2024 | Ongoing negotiations | Medium |

## Data Quality

### Source Requirements

Every event must have:
1. **Primary source**: Official announcement, news report
2. **Date verification**: Confirmed event date
3. **Impact assessment**: Documented economic impact

### Confidence Ratings

| Rating | Criteria |
|--------|----------|
| A | Multiple verified sources, official records |
| B | Single verified source, reliable media |
| C | Limited sources, some uncertainty |
| D | Unverified, requires additional confirmation |

## Bilingual Support

### Arabic Content

All events should have Arabic versions:
- Title in Arabic
- Description in Arabic
- Evidence pack notes in Arabic

### RTL Display

Timeline UI supports RTL:
- Arabic text right-aligned
- Timeline direction adjustable
- Date formats localized

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `timeline.events.list` | Query | List events with filters |
| `timeline.events.get` | Query | Get single event |
| `timeline.evidencePack.get` | Query | Get evidence pack |
| `timeline.overlays.list` | Query | List chart overlays |
| `timeline.overlays.create` | Mutation | Create overlay |

## Filtering & Search

### Available Filters

| Filter | Options |
|--------|---------|
| Date range | Start/end dates |
| Category | Any category |
| Impact | High/medium/low |
| Regime | Aden/Sana'a/both |
| Search | Full-text search |

### Query Example

```typescript
const events = await trpc.timeline.events.list.query({
  dateRange: { start: "2020-01-01", end: "2024-12-31" },
  category: "monetary",
  impact: "high",
  search: "exchange rate"
});
```

## Best Practices

1. **Always include evidence packs** for high-impact events
2. **Use neutral language** in descriptions
3. **Verify dates** from multiple sources
4. **Include Arabic translations** for all content
5. **Link to related indicators** where applicable
6. **Update regularly** as new events occur

---

*Last Updated: January 14, 2026*
