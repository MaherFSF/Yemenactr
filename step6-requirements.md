# YETO Step 6: Self-Production Report Engine - Requirements Summary

## Mission
Build an autonomous publishing system that transforms YETO from a static dashboard into a living economic observatory. The system will automatically generate, store, and distribute professional-quality economic reports on a quarterly and annual schedule, while also supporting on-demand generation.

## Non-Negotiable Rules
- R0: DO NOT ask questions. If information is missing, create a GAP ticket in GAP_TICKETS.md
- R1: Every file must be created with EXACT content specified. No placeholders
- R2: Every import statement must be included
- R3: Every TypeScript type must be fully defined
- R4: Every error state must be handled
- R5: All code must compile without errors

## Database Schema (FILE 1: /src/db/schema/reports.ts)

### Enums:
1. **reportStatusEnum**: pending, generating, success, failed
2. **reportFrequencyEnum**: quarterly, annual, on_demand
3. **subscriberTierEnum**: public, premium, vip

### Tables:
1. **report_templates** - Stores metadata about each report type
   - id, slug, nameEn, nameAr, descriptionEn, descriptionAr
   - frequency, templateComponentPath, isActive, createdAt, updatedAt

2. **report_subscribers** - Stores email addresses of users who subscribe to reports
   - id, email, nameEn, nameAr, organization, tier, isActive
   - subscribedAt, unsubscribedAt

3. **generated_reports** - Stores metadata about each generated report instance
   - id, templateId, status, periodStart, periodEnd
   - s3Key, s3Url, fileSizeBytes, pageCount
   - generationDurationMs, errorMessage, generatedAt, createdAt

4. **report_distribution_log** - Audit trail for every email sent
   - id, reportId, subscriberId, sentAt
   - emailStatus, sesMessageId, errorMessage

### Relations:
- reportTemplates -> generatedReports (one-to-many)
- reportSubscribers -> distributionLogs (one-to-many)
- generatedReports -> distributionLogs (one-to-many)

## FILE 2: /src/server/lib/aws-s3.ts
AWS S3 helper for uploading generated PDF reports

## FILE 3: /src/server/lib/aws-ses.ts
AWS SES helper for sending report emails

## FILE 4: /src/server/services/report-generator.ts
Core report generation service with:
- generateReport(templateSlug, periodStart, periodEnd)
- generateQuarterlyReport(year, quarter)
- generateAnnualReport(year)

## FILE 5: /src/server/services/report-distributor.ts
Email distribution service with:
- distributeReport(reportId)
- sendReportEmail(report, subscriber)

## FILE 6: /src/server/routers/reports.ts
tRPC router with endpoints:
- reports.listTemplates
- reports.getTemplate
- reports.listReports
- reports.getReport
- reports.generateReport (admin only)
- reports.subscribe
- reports.unsubscribe

## FILE 7: /src/client/pages/Reports.tsx
Public reports listing page

## FILE 8: /src/client/pages/admin/ReportAdmin.tsx
Admin dashboard for report management

## FILE 9: /src/server/jobs/scheduled-reports.ts
Cron job scheduler for automatic report generation

## Report Types to Implement:
1. **Quarterly Economic Outlook** - Q1, Q2, Q3, Q4 each year
2. **Annual Economic Review** - January each year
3. **Monthly FX Summary** - Monthly exchange rate report
4. **Food Security Bulletin** - Quarterly food security analysis

## Key Features:
- Automatic PDF generation with charts and data
- Email distribution to subscribers
- Subscriber tier management (public/premium/vip)
- Admin dashboard for manual generation
- Generation status tracking
- Error handling and retry logic
- Bilingual support (Arabic/English)


## Additional Files from PDF (Pages 6-10)

### FILE 2: /src/server/lib/aws-s3.ts
AWS S3 helper with:
- `uploadToS3(key, body, contentType)` - Upload buffer to S3, returns { url, key, size }
- `getPresignedDownloadUrl(key, expiresIn)` - Generate presigned URL for downloads

### FILE 3: /src/server/lib/aws-ses.ts
AWS SES email helper with:
- `sendEmail(params: SendEmailParams)` - Send email via SES
- SendEmailParams: { to, subject, htmlBody, textBody }
- SendEmailResult: { success, messageId?, error? }

### FILE 4: /src/server/lib/queue.ts
BullMQ queue setup with Redis:
- `reportQueue` - Queue for report generation jobs
- Uses IORedis for connection

### FILE 5: /src/server/jobs/report-worker.ts
Worker for processing report generation jobs

## Key Integration Points:
1. S3 for PDF storage (reports bucket)
2. SES for email distribution
3. BullMQ + Redis for job queue
4. Drizzle ORM for database

## Environment Variables Needed:
- AWS_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- S3_BUCKET_NAME
- EMAIL_FROM
- REDIS_HOST
- REDIS_PORT
