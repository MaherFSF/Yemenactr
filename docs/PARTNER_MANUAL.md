# YETO Platform Partner Manual

## Welcome Data Partners

Thank you for contributing to the Yemen Economic Transparency Observatory. This manual guides you through the data submission and collaboration process.

---

## Partner Types

### Data Contributors

Organizations that provide primary data:
- Government agencies (CBY, ministries)
- International organizations (UN, World Bank)
- NGOs and humanitarian agencies
- Research institutions
- Private sector entities

### Research Partners

Organizations that provide analysis:
- Academic institutions
- Think tanks
- Policy research organizations
- Consulting firms

### Technical Partners

Organizations that provide infrastructure:
- Data aggregators
- Technology providers
- Verification services

---

## Getting Started

### Partner Registration

1. Contact partnerships@causewaygrp.com
2. Complete the Partner Application Form
3. Sign the Data Sharing Agreement
4. Receive Partner Portal credentials
5. Complete onboarding training

### Partner Portal Access

Navigate to `/partner-portal` and log in with your partner credentials.

---

## Data Submission Process

### Submission Methods

**Portal Upload**
1. Log into Partner Portal
2. Click "Submit Data"
3. Select data type and format
4. Upload file or enter data
5. Add metadata and source information
6. Submit for review

**API Integration**
For automated submissions:
```
POST /api/partner/submit
Authorization: Bearer {partner_api_key}
Content-Type: application/json

{
  "indicator_id": "fx_rate_aden",
  "value": 1720,
  "date": "2024-12-28",
  "source": "CBY Aden Daily Report",
  "confidence": "A"
}
```

**Email Submission**
Send structured data to: data@causewaygrp.com
Include: Organization, indicator, date, value, source

### Data Formats

**Accepted Formats**
| Format | Use Case |
|--------|----------|
| CSV | Tabular data, time series |
| JSON | Structured data, API |
| Excel | Complex datasets |
| PDF | Reports (for extraction) |

**Required Fields**
- Indicator name/ID
- Value(s)
- Date/period
- Source reference
- Geographic scope (Aden/Sana'a/National)

### Metadata Requirements

Every submission must include:

1. **Source Information**
   - Organization name
   - Publication/report title
   - Publication date
   - URL (if available)

2. **Data Quality**
   - Collection methodology
   - Sample size (if applicable)
   - Known limitations

3. **Access Rights**
   - License type
   - Attribution requirements
   - Redistribution permissions

---

## Quality Standards

### Confidence Level Assignment

Partners should self-assess data confidence:

| Level | Criteria |
|-------|----------|
| **A** | Official government/institutional source, verified methodology |
| **B** | Reputable organization, documented methodology |
| **C** | Single source, reasonable methodology |
| **D** | Estimated, derived, or contested |

### Verification Process

1. **Initial Review**: YETO team checks completeness
2. **Source Verification**: Confirm source authenticity
3. **Cross-Validation**: Compare with other sources
4. **Quality Assessment**: Assign confidence level
5. **Publication**: Data goes live with provenance

### Rejection Reasons

Data may be rejected for:
- Missing required metadata
- Unverifiable source
- Contradicts verified data without explanation
- Format errors
- Outside YETO scope

---

## Partner Dashboard

### Submission Tracking

View status of your submissions:
- **Pending**: Under review
- **Approved**: Published to platform
- **Needs Revision**: Requires additional information
- **Rejected**: Not accepted (with reason)

### Analytics

Track your contribution impact:
- Total submissions
- Acceptance rate
- Data usage statistics
- Citation count

### Notifications

Receive alerts for:
- Submission status changes
- Data quality issues
- Platform updates
- Partnership renewals

---

## Data Corrections

### Reporting Errors

If you discover errors in your submitted data:

1. Log into Partner Portal
2. Navigate to "My Submissions"
3. Find the affected submission
4. Click "Request Correction"
5. Provide correct value and explanation
6. Submit for review

### Correction Process

1. Partner submits correction request
2. YETO team reviews request
3. If approved, data is updated
4. Correction logged in public corrections log
5. All users notified of change

### Version History

All data maintains version history:
- Original value
- Correction date
- Corrected value
- Reason for correction
- Who made the correction

---

## API Access

### Authentication

Partners receive API keys for programmatic access:
```
Authorization: Bearer {partner_api_key}
```

### Endpoints

**Submit Data**
```
POST /api/partner/submit
```

**Check Submission Status**
```
GET /api/partner/submissions/{id}
```

**List My Submissions**
```
GET /api/partner/submissions
```

**Request Correction**
```
POST /api/partner/corrections
```

### Rate Limits

| Tier | Requests/Hour |
|------|---------------|
| Standard Partner | 100 |
| Premium Partner | 1,000 |
| Institutional | Unlimited |

---

## Best Practices

### Data Quality

1. **Document methodology** - Explain how data was collected
2. **Provide context** - Note any unusual circumstances
3. **Flag uncertainties** - Be transparent about limitations
4. **Update regularly** - Keep time series current

### Collaboration

1. **Respond promptly** - Address review questions quickly
2. **Communicate changes** - Notify YETO of methodology changes
3. **Share feedback** - Help improve the platform
4. **Attend training** - Stay updated on best practices

### Security

1. **Protect credentials** - Don't share API keys
2. **Use secure channels** - Submit via HTTPS only
3. **Report incidents** - Notify us of any security concerns

---

## Partnership Tiers

### Standard Partner

- Portal access
- Manual submissions
- Basic analytics
- Email support

### Premium Partner

- API access
- Automated submissions
- Advanced analytics
- Priority support
- Co-branding options

### Institutional Partner

- Unlimited API access
- Custom integrations
- Dedicated account manager
- Joint publications
- Advisory board participation

---

## Legal Framework

### Data Sharing Agreement

All partners sign an agreement covering:
- Data ownership
- Usage rights
- Attribution requirements
- Confidentiality
- Liability limitations

### Attribution

YETO attributes all data to source partners:
- Source name displayed with data
- Link to partner organization
- Methodology documentation

### Intellectual Property

- Partners retain ownership of submitted data
- YETO receives license to publish and distribute
- Users must attribute per license terms

---

## Support

### Partner Support Team

- Email: partners@causewaygrp.com
- Phone: +1 (XXX) XXX-XXXX
- Hours: 9am-5pm GMT, Mon-Fri

### Resources

- Partner Portal Help: `/partner-portal/help`
- API Documentation: `/docs/api`
- Training Videos: `/partner-portal/training`
- FAQ: `/partner-portal/faq`

### Escalation

For urgent issues:
1. Contact partner support
2. If unresolved, email partnerships@causewaygrp.com
3. For critical issues, contact your account manager

---

## Appendix

### Indicator Categories

| Category | Examples |
|----------|----------|
| Macroeconomic | GDP, growth rates |
| Monetary | Exchange rates, money supply |
| Fiscal | Budget, debt, revenues |
| Prices | CPI, commodity prices |
| Trade | Imports, exports, balance |
| Labor | Employment, wages |
| Humanitarian | Food security, displacement |

### Geographic Codes

| Code | Description |
|------|-------------|
| YE | Yemen (National) |
| YE-AD | Aden (IRG) |
| YE-SA | Sana'a (DFA) |
| YE-XX | Specific governorate |

### Date Formats

- Daily: YYYY-MM-DD
- Monthly: YYYY-MM
- Quarterly: YYYY-QN
- Annual: YYYY

---

*Last Updated: December 2024*
*Version: 1.0*
