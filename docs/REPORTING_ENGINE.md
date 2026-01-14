# YETO Live Reporting Engine

## Overview

The Live Reporting Engine generates dynamic, evidence-grounded reports from real-time data. It supports recurring publications (monthly, quarterly, annual) with a full editorial workflow ensuring quality control before publication.

## Report Types

### Recurring Reports

| Report | Frequency | Purpose |
|--------|-----------|---------|
| **YETO Pulse** | Monthly | Key economic indicators, trends, and alerts |
| **Outlook & Risk Monitor** | Quarterly | Comprehensive economic outlook with risk assessment |
| **Year-in-Review** | Annual | Full year analysis with historical context |

### Ad-Hoc Reports

| Type | Use Case |
|------|----------|
| **Executive Brief** | Quick summary for decision-makers |
| **Sector Report** | Deep dive into specific sector |
| **Custom Report** | User-defined report builder |

## Architecture

### Database Schema

| Table | Purpose |
|-------|---------|
| `report_templates` | JSON/YAML specifications for report structure |
| `report_instances` | Generated report instances with workflow status |
| `insight_miner_proposals` | AI-proposed storylines (never auto-published) |

### Template Structure

```typescript
interface ReportTemplate {
  id: number;
  name: string;
  nameAr?: string;
  templateType: "monthly_pulse" | "quarterly_outlook" | "annual_review" | "ad_hoc";
  templateSpec: {
    sections: ReportSection[];
    style: ReportStyle;
    evidenceAppendix: boolean;
    confidenceThreshold?: "A" | "B" | "C" | "D";
  };
  schedule: "daily" | "weekly" | "monthly" | "quarterly" | "annual" | "manual";
  cronExpression?: string;
}

interface ReportSection {
  id: string;
  title: string;
  titleAr?: string;
  type: "text" | "chart" | "table" | "kpi" | "timeline" | "map";
  content?: string;
  contentAr?: string;
  visualizationSpecId?: number;
  dataQuery?: DataQuery;
}
```

## Render Pipeline

### HTML to PDF Conversion

The render pipeline produces pixel-perfect PDFs:

1. **Template Loading**: Fetch template spec from database
2. **Data Binding**: Query and inject live data
3. **HTML Generation**: Render bilingual HTML content
4. **Chart Embedding**: Generate and embed visualizations
5. **PDF Conversion**: Convert HTML to PDF using WeasyPrint
6. **Evidence Appendix**: Attach full source citations
7. **Storage**: Upload to S3 and store URLs

### Rendering API

```typescript
// Generate a report instance
const report = await trpc.reporting.generate.mutate({
  templateId: 1,
  reportingPeriod: "January 2026",
  language: "both" // "en" | "ar" | "both"
});
```

## Editorial Workflow

### Workflow States

```
Draft → Under Review → Needs Edit → Pending Approval → Approved → Published
                ↓                         ↓
            Rejected                   Archived
```

### Workflow Roles

| Role | Permissions |
|------|-------------|
| **Drafter** | Create drafts, submit for review |
| **Reviewer** | Review content, request edits |
| **Editor** | Make editorial changes |
| **Super Admin** | Final approval, publish |

### Workflow API

```typescript
// Submit for review
await trpc.reporting.submitForReview.mutate({ reportId: 123 });

// Request edits
await trpc.reporting.requestEdit.mutate({
  reportId: 123,
  notes: "Please update the inflation section with latest data"
});

// Approve and publish
await trpc.reporting.approve.mutate({ reportId: 123 });
await trpc.reporting.publish.mutate({ reportId: 123 });
```

## Insight Miner

### Nightly Analysis

The Insight Miner runs nightly to propose storylines based on:
- Trend detection in time series data
- Anomaly detection (unusual values)
- Correlation discovery between indicators
- Forecast updates based on new data
- Risk signals from multiple sources

### Never Auto-Published

All Insight Miner proposals require human review:

```typescript
interface InsightMinerProposal {
  headline: string;
  headlineAr?: string;
  summary: string;
  summaryAr?: string;
  supportingIndicators: string[];
  supportingEvents: number[];
  supportingSources: number[];
  confidenceScore: number;
  category: "trend_alert" | "anomaly_detection" | "correlation_discovery" | "forecast_update" | "risk_signal";
  status: "pending_review" | "approved" | "rejected" | "incorporated";
}
```

### Review Process

1. Insight Miner generates proposals nightly
2. Proposals appear in Admin editorial queue
3. Editor reviews and approves/rejects
4. Approved insights can be incorporated into reports

## Evidence Appendix

Every published report includes a full evidence appendix:

```typescript
interface EvidenceAppendix {
  sources: {
    id: number;
    publisher: string;
    url?: string;
    retrievalDate: string;
    license?: string;
  }[];
  datasets: {
    id: number;
    name: string;
    confidenceRating: string;
    timeCoverage: string;
    geographicScope: string;
  }[];
  transformations: {
    step: string;
    formula?: string;
    appliedAt: string;
  }[];
}
```

## Admin UI

### Editorial Dashboard

The Admin portal includes:

1. **Report Queue**: View all reports by workflow status
2. **Template Manager**: Create/edit report templates
3. **Insight Review**: Review Insight Miner proposals
4. **Publishing Calendar**: Schedule and track publications
5. **Analytics**: View report engagement metrics

### Report Builder

Interactive wizard for creating custom reports:
- Select sections from library
- Configure data queries
- Preview in real-time
- Set schedule or generate immediately

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `reporting.templates.list` | Query | List all templates |
| `reporting.templates.create` | Mutation | Create new template |
| `reporting.generate` | Mutation | Generate report instance |
| `reporting.submitForReview` | Mutation | Submit draft for review |
| `reporting.requestEdit` | Mutation | Request edits |
| `reporting.approve` | Mutation | Approve report |
| `reporting.publish` | Mutation | Publish report |
| `reporting.insights.list` | Query | List Insight Miner proposals |
| `reporting.insights.review` | Mutation | Review proposal |

## Scheduling

### Cron Expressions

| Report Type | Default Schedule |
|-------------|------------------|
| Monthly Pulse | `0 0 6 1 * *` (1st of month, 6 AM UTC) |
| Quarterly Outlook | `0 0 6 1 1,4,7,10 *` (Q1-Q4 start) |
| Annual Review | `0 0 6 15 1 *` (Jan 15, 6 AM UTC) |

### Scheduler Integration

Reports integrate with the platform scheduler:

```typescript
// Schedule recurring report
await trpc.scheduler.createJob.mutate({
  jobName: "monthly-pulse-generator",
  jobType: "report_generation",
  cronExpression: "0 0 6 1 * *",
  config: { templateId: 1 }
});
```

## Best Practices

1. **Always use templates** for consistency
2. **Review all AI insights** before incorporation
3. **Include evidence appendix** for transparency
4. **Generate both languages** for bilingual audience
5. **Cache generated PDFs** for performance
6. **Archive old reports** but keep accessible

---

*Last Updated: January 14, 2026*
