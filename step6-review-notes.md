# Step 6 Requirements Review - January 29, 2026

## Mission
Build an autonomous publishing system that transforms YETO from a static dashboard into a living economic observatory. The system will automatically generate, store, and distribute professional-quality economic reports on a quarterly and annual schedule, while also supporting on-demand generation.

## Required Database Schema (FILE 1)
- report_templates: id, slug, nameEn, nameAr, descriptionEn, descriptionAr, frequency, templateComponentPath, isActive, createdAt, updatedAt
- report_subscribers: id, email, nameEn, nameAr, organization, tier (public/premium/vip), isActive, subscribedAt, unsubscribedAt
- generated_reports: id, templateId, status (pending/generating/success/failed), periodStart, periodEnd, s3Key, s3Url, fileSizeBytes, pageCount, generationDurationMs, errorMessage, generatedAt, createdAt
- report_distribution_log: id, reportId, subscriberId, sentAt, emailStatus, sesMessageId, errorMessage

## Required Files to Create
1. /src/db/schema/reports.ts - Database schema
2. /src/server/lib/aws-s3.ts - S3 storage helpers
3. /src/server/lib/aws-ses.ts - Email sending via SES
4. /src/server/services/report-generator.ts - PDF generation service
5. /src/server/services/report-distributor.ts - Email distribution service
6. /src/server/api/routers/reports.ts - tRPC router
7. /src/pages/reports/index.tsx - Public reports listing page
8. /src/pages/admin/reports.tsx - Admin dashboard

## Key Features Required
- Quarterly and Annual report generation
- PDF generation with charts and data
- Bilingual support (Arabic/English)
- Subscriber tier management (public/premium/vip)
- Email distribution with SES
- S3 storage for generated PDFs
- Admin dashboard for report management
- Public reports listing page

## Verification Checklist
- [ ] Database schema matches specification
- [ ] Report generator creates professional PDFs
- [ ] Distribution service sends emails correctly
- [ ] Admin dashboard has all management features
- [ ] Public page displays reports correctly
- [ ] Mobile view is optimized
- [ ] Site menu includes Reports link
- [ ] All pages are accessible from navigation
