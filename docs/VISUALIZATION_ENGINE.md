# YETO Visualization Engine

## Overview

The YETO Visualization Engine is a comprehensive system for generating, managing, and exporting advanced data visualizations with full evidence provenance. Every chart includes an evidence pack drawer, transformation log, and confidence rating.

## Architecture

### Database Schema

The visualization engine uses the following tables:

| Table | Purpose |
|-------|---------|
| `visualization_specs` | Stores chart configurations and metadata |
| `visual_suggestions` | AI-generated or deterministic chart recommendations |
| `chart_overlays` | Timeline event overlays on charts |

### Supported Chart Types

| Type | Use Case | Data Requirements |
|------|----------|-------------------|
| **Line** | Time series trends | Date + value pairs |
| **Bar** | Categorical comparisons | Category + value |
| **Scatter** | Correlation analysis | X + Y values |
| **Heatmap** | Geographic/matrix data | Row + column + value |
| **Network** | Entity relationships | Nodes + edges |
| **Sankey** | Flow visualization | Source + target + value |
| **Timeline** | Event sequences | Date + event data |
| **Area** | Cumulative trends | Date + stacked values |
| **Pie/Donut** | Proportions | Category + value |
| **Treemap** | Hierarchical data | Parent + child + value |
| **Choropleth** | Geographic distribution | Region + value |

## Chart Configuration

### Visualization Spec Structure

```typescript
interface VisualizationSpec {
  id: number;
  name: string;
  nameAr?: string;
  chartType: ChartType;
  config: {
    dataSource: {
      type: "indicator" | "timeSeries" | "geospatial" | "custom";
      indicatorCodes?: string[];
      regimeTags?: string[];
      dateRange?: { start: string; end: string };
      aggregation?: "sum" | "avg" | "min" | "max" | "count";
    };
    style: {
      colors?: string[];
      showLegend?: boolean;
      showGrid?: boolean;
      showTooltip?: boolean;
      animation?: boolean;
    };
    axes?: {
      x?: { label?: string; labelAr?: string; format?: string };
      y?: { label?: string; labelAr?: string; format?: string };
    };
  };
  evidencePackRequired: boolean;
  confidenceRating: "A" | "B" | "C" | "D";
  transformationLog: TransformationStep[];
  sourceIds: number[];
}
```

## Evidence Pack Integration

Every chart in YETO includes an evidence pack drawer that displays:

1. **Source Attribution**: Publisher, URL, retrieval date
2. **Data Coverage**: Geographic scope, time range
3. **Confidence Rating**: A-D with explanation
4. **Transformation Log**: All formulas and calculations applied
5. **License Information**: Usage rights and restrictions

### Evidence Pack Drawer Component

```tsx
<EvidencePackDrawer
  sources={chart.sources}
  datasets={chart.datasets}
  confidenceRating={chart.confidenceRating}
  transformationLog={chart.transformationLog}
  timeCoverage={chart.timeCoverage}
  geographicScope={chart.geographicScope}
/>
```

## Visual Suggestion Logic

### Deterministic Suggestions

The engine automatically suggests appropriate chart types based on data characteristics:

| Data Pattern | Suggested Chart |
|--------------|-----------------|
| Single time series | Line chart |
| Multiple time series | Multi-line or area chart |
| Categorical comparison | Bar chart |
| Two numeric variables | Scatter plot |
| Geographic data | Choropleth map |
| Flow/transfer data | Sankey diagram |
| Network relationships | Network graph |
| Proportional data | Pie/donut chart |

### AI Annotations (Grounded)

AI-generated annotations are:
- Always grounded in evidence from the database
- Include source citations
- Marked with confidence scores
- Subject to editorial review before publication

## Export Support

### Supported Formats

| Format | Use Case | Features |
|--------|----------|----------|
| **PNG** | Web/social sharing | High resolution, transparent background |
| **SVG** | Print/editing | Vector format, scalable |
| **PDF** | Reports/documents | Multi-page, includes evidence appendix |
| **PPTX** | Presentations | Editable slides with speaker notes |
| **CSV** | Data analysis | Raw data export |
| **XLSX** | Spreadsheets | Formatted with metadata sheet |
| **JSON** | API/integration | Full spec + data |

### Export API

```typescript
// Export a visualization
const exportResult = await trpc.visualization.export.mutate({
  specId: 123,
  format: "pdf",
  includeEvidence: true,
  language: "ar" // or "en"
});
```

## Timeline Overlays

Charts can display timeline events as overlays:

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
}
```

## Rendering Pipeline

1. **Data Fetch**: Query indicators/time series based on spec
2. **Transform**: Apply aggregations, calculations, normalization
3. **Validate**: Check data completeness, flag gaps
4. **Render**: Generate chart using Chart.js/D3.js
5. **Annotate**: Add evidence pack, confidence badge
6. **Cache**: Store rendered output for performance

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `visualization.list` | Query | List all visualization specs |
| `visualization.get` | Query | Get single spec with data |
| `visualization.create` | Mutation | Create new visualization |
| `visualization.update` | Mutation | Update existing spec |
| `visualization.export` | Mutation | Export to file format |
| `visualization.suggest` | Query | Get AI suggestions |

## Best Practices

1. **Always include evidence packs** for data transparency
2. **Use deterministic suggestions** before AI annotations
3. **Validate data completeness** before rendering
4. **Cache rendered charts** for performance
5. **Support bilingual labels** (Arabic/English)
6. **Apply consistent color schemes** from design tokens

## Testing

Screenshot tests verify:
- Chart renders correctly with sample data
- Evidence pack drawer displays all metadata
- Export produces valid files
- RTL layout works for Arabic
- Responsive design on mobile

---

*Last Updated: January 14, 2026*
