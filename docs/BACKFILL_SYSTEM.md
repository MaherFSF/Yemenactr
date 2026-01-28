# Advanced Dynamic Backfill System

## Overview

The YETO Advanced Dynamic Backfill System is an intelligent data ingestion framework that automatically detects the best strategy for each data source and provides step-by-step instructions for every scenario. It handles API keys, web scraping, manual data entry, and partnership negotiations with comprehensive tracking and resumable checkpoints.

## Architecture

### Core Components

1. **BackfillOrchestrator** (`server/services/backfillOrchestrator.ts`)
   - Analyzes data sources and determines optimal strategy
   - Creates backfill plans with effort estimates
   - Manages execution workflow
   - Provides human-readable instructions

2. **Source Adapters** (`server/services/sourceAdapters.ts`)
   - `PublicAPIAdapter` - For public APIs with no auth
   - `AuthenticatedAPIAdapter` - For APIs requiring keys
   - `WebScraperAdapter` - For permitted web scraping
   - `ManualEntryAdapter` - For manual data entry
   - `PartnershipAdapter` - For partnership-based access

3. **Backfill Router** (`server/routers/backfillRouter.ts`)
   - tRPC endpoints for all backfill operations
   - Admin-only access control
   - Real-time progress tracking

4. **Admin Dashboard** (`client/src/pages/admin/BackfillDashboardPage.tsx`)
   - Visual interface for backfill management
   - Source recommendations sorted by readiness
   - Progress tracking with real-time updates
   - Source-specific instructions

### Database Tables

1. **source_credentials** - Secure storage for API keys and OAuth tokens
2. **backfill_checkpoints** - Resumable progress tracking (day-by-day)
3. **backfill_requests** - User-initiated backfill job tracking
4. **partnership_requests** - Partnership negotiation workflow

## Strategy Detection

The system automatically analyzes each data source and determines the best approach:

### API Public (Readiness: 95%)
- **Detection**: Source has `apiEndpoint` and `requiresKey = false`
- **Effort**: Low
- **Timeline**: Can start immediately
- **Instructions**:
  1. Review API documentation
  2. Test endpoints with sample requests
  3. Check rate limits and implement throttling
  4. Run backfill with automatic retries
  5. Monitor for API changes

### API Key Required (Readiness: 60%)
- **Detection**: Source has `apiEndpoint` and `requiresKey = true`
- **Effort**: Medium
- **Timeline**: 1-2 days (after API key obtained)
- **Instructions**:
  1. Visit source website to register for API access
  2. Request API key (may require institutional email)
  3. Store key securely in YETO admin panel
  4. Test connection before running backfill
  5. Monitor rate limits during execution

### Scraping Allowed (Readiness: 40%)
- **Detection**: Source has `scrapingAllowed = true`
- **Effort**: Medium-High
- **Timeline**: 3-5 days (development time)
- **Instructions**:
  1. Review robots.txt
  2. Implement respectful scraping (rate limiting, user agent)
  3. Parse HTML/PDF documents
  4. Validate extracted data
  5. Monitor for website structure changes

### Partnership Required (Readiness: 20%)
- **Detection**: Source has `partnershipRequired = true`
- **Effort**: Very High
- **Timeline**: 2-6 months
- **Instructions**:
  1. Draft partnership proposal highlighting YETO's mission
  2. Email source organization with proposal
  3. Schedule call to discuss data sharing terms
  4. Negotiate data access frequency and format
  5. Sign MOU or data sharing agreement
  6. Establish technical integration
  7. Set up automated data sync pipeline

### Manual Entry (Readiness: 10%)
- **Detection**: No automated access method available
- **Effort**: Very High
- **Timeline**: Depends on dataset size
- **Instructions**:
  1. Download all available reports from source website
  2. Create data entry template matching YETO schema
  3. Extract data points manually with source citations
  4. Double-check all entries for accuracy
  5. Upload via YETO Partner Contribution Portal
  6. Flag any ambiguous or unclear data points

## Usage

### Admin Dashboard

Access the backfill dashboard at `/admin/backfill` (admin role required).

#### Recommendations Tab
- View all sources sorted by readiness score
- See priority, estimated impact, and reasoning
- Click "Details" to view full analysis and instructions

#### Progress Tab
- Monitor active backfill jobs in real-time
- View progress bars, inserted/skipped/error counts
- Expand error logs for debugging

#### Instructions Tab
- General guidance for each strategy type
- Step-by-step workflows
- Effort and timeline estimates

### API Usage

```typescript
// Analyze a single source
const analysis = await trpc.backfill.analyzeSource.query({ sourceId: 'wb_wdi' });

// Get recommendations for all sources
const recommendations = await trpc.backfill.getRecommendations.query();

// Create a backfill plan
const plan = await trpc.backfill.createPlan.mutate({
  sourceId: 'wb_wdi',
  indicatorCodes: ['gdp_current', 'inflation_cpi'],
  startDate: '2010-01-01',
  endDate: '2024-12-31',
  regimeTag: 'mixed',
  priority: 'high',
});

// Execute backfill (only if canProceedAutomatically = true)
const result = await trpc.backfill.executePlan.mutate({
  sourceId: 'wb_wdi',
  indicatorCodes: ['gdp_current'],
  startDate: '2010-01-01',
  endDate: '2024-12-31',
});

// Get all checkpoints
const checkpoints = await trpc.backfill.getCheckpoints.query();
```

## API Key Management

### Storing API Keys

1. Navigate to `/admin/backfill`
2. Find source in recommendations table
3. Click "Details" to view instructions
4. Follow instructions to obtain API key
5. Store key in admin panel (future: dedicated UI)

### Security

- API keys are stored in `source_credentials` table
- Encryption at application level (future: use dedicated secrets manager)
- Keys are validated before backfill execution
- Validation status tracked (`valid`, `invalid`, `expired`, `untested`)

## Resumable Checkpoints

The system uses a day spine from 2010-01-01 to present, with resumable checkpoints:

- **Idempotent inserts**: Duplicate data points are automatically skipped
- **Chunk processing**: Data processed in year/month/day chunks
- **Progress tracking**: Real-time updates to `backfill_checkpoints` table
- **Error handling**: Errors logged but don't stop execution
- **Resume capability**: If job fails, restart from last processed date

## Partnership Workflow

For sources requiring partnerships:

1. **Auto-draft email**: System generates partnership proposal
2. **Track status**: `draft` → `sent` → `in_negotiation` → `approved`
3. **Timeline tracking**: Estimated 2-6 months
4. **Response tracking**: Record responses and next steps
5. **Integration setup**: Once approved, configure technical access

## Error Handling

### Retry Logic
- Exponential backoff for network errors
- Automatic retry for rate limit (429) errors
- Skip and log for data parsing errors

### Error Categories
1. **Network errors**: Retry with backoff
2. **Rate limit errors**: Throttle and retry
3. **Authentication errors**: Stop and notify admin
4. **Data parsing errors**: Log and continue
5. **Database errors**: Stop and notify admin

## Best Practices

### For API Sources
1. Always test API endpoint before full backfill
2. Respect rate limits (use conservative estimates)
3. Monitor API changes and deprecations
4. Keep API keys secure and rotate regularly

### For Scraping Sources
1. Check robots.txt before scraping
2. Use respectful scraping (2+ seconds between requests)
3. Include proper User-Agent header
4. Monitor for HTML structure changes
5. Have legal clearance before proceeding

### For Manual Entry
1. Use standardized data entry templates
2. Double-check all entries for accuracy
3. Include source citations for every data point
4. Flag ambiguous or unclear data
5. Consider hiring temporary staff for large datasets

### For Partnerships
1. Highlight YETO's mission and impact
2. Emphasize data transparency and attribution
3. Offer reciprocal value (visibility, citations)
4. Be patient (2-6 months is normal)
5. Maintain regular communication

## Future Enhancements

- [ ] Dedicated API key management UI
- [ ] Email integration for partnership requests
- [ ] Automated scraper generation
- [ ] ML-based data extraction from PDFs
- [ ] Bulk API key validation
- [ ] Partnership email templates
- [ ] Backfill scheduling (cron-based)
- [ ] Data quality validation during backfill
- [ ] Conflict resolution for duplicate data
- [ ] Multi-source data reconciliation

## Troubleshooting

### "Cannot proceed automatically" Error
**Cause**: Source requires human action (API key, partnership, etc.)
**Solution**: Review `humanActionItems` in backfill plan and complete required actions

### "API key not found" Error
**Cause**: No valid API key in `source_credentials` table
**Solution**: Obtain API key and store in admin panel

### "Validation failed" Error
**Cause**: API key is invalid or expired
**Solution**: Re-validate API key or obtain new one

### High Error Count in Checkpoint
**Cause**: Data parsing issues or API changes
**Solution**: Review error logs, update adapter logic if needed

### Slow Progress
**Cause**: Rate limiting or network issues
**Solution**: Reduce rate limit, check network connectivity

## Support

For questions or issues:
- Email: yeto@causewaygrp.com
- Documentation: `/docs/BACKFILL_SYSTEM.md`
- Admin Dashboard: `/admin/backfill`
