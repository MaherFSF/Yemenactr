# YETO Partner Engine

## Overview

The Partner Engine is YETO's system for managing data contributions from partner organizations and public contributors. It implements a dual-lane publishing model with full provenance tracking and editorial governance.

## Architecture

### Core Components

1. **Data Contracts** - Templates defining data submission requirements
2. **Partner Submissions** - Incoming data from partner organizations
3. **Validation Service** - Automated data quality checks
4. **Moderation Queue** - Human review workflow
5. **Dual-Lane Publishing** - Restricted vs Public data paths

### Database Tables

| Table | Purpose |
|-------|---------|
| `data_contracts` | Data submission templates with schema definitions |
| `partner_submissions` | Submitted data awaiting processing |
| `submission_validations` | Validation results and scores |
| `moderation_queue` | Items pending human review |
| `admin_audit_log` | Complete audit trail of all actions |
| `admin_incidents` | System incidents and resolutions |
| `governance_policies` | Configurable system policies |

## Dual-Lane Publishing Model

### Lane A: Public Aggregate
- Data passes full validation (≥90% score)
- QA signoff required
- Published to public-facing APIs
- Included in aggregate statistics

### Lane B: Restricted
- Data passes basic validation
- Reviewer approval only
- Available to authorized users only
- Not included in public aggregates

### Quarantine
- Data fails validation or flagged for review
- Held for manual investigation
- May be released, corrected, or rejected

## Validation Pipeline

```
Submission → Schema Check → Contradiction Check → Vintage Check → Score Calculation
```

### Validation Checks

1. **Schema Compliance** - Required fields, data types, formats
2. **Range Validation** - Values within expected bounds
3. **Contradiction Detection** - Cross-reference with existing data
4. **Vintage Check** - Data freshness requirements
5. **Source Verification** - Metadata completeness

### Scoring

| Score Range | Result |
|-------------|--------|
| ≥90% | Lane A (Public) eligible |
| 70-89% | Lane B (Restricted) eligible |
| <70% | Quarantine for review |

## Moderation Workflow

```
Pending Review → Reviewer Decision → QA Signoff (Lane A only) → Publish
```

### Review Decisions

- **Approve (Restricted)** - Move to Lane B
- **Approve (Public)** - Move to Lane A (requires QA signoff)
- **Reject** - Remove from pipeline with reason
- **Quarantine** - Hold for investigation

### QA Signoff

Required for Lane A publishing:
- Secondary reviewer verification
- Evidence pack review
- Final quality check

## API Endpoints

### Contracts
- `GET /partnerEngine.getContracts` - List all data contracts
- `GET /partnerEngine.getContract` - Get contract details
- `POST /partnerEngine.createContract` - Create new contract (admin)

### Submissions
- `POST /partnerEngine.submitData` - Submit new data
- `GET /partnerEngine.getMySubmissions` - Get user's submissions
- `GET /partnerEngine.getSubmission` - Get submission details

### Moderation
- `GET /partnerEngine.getModerationQueue` - Get items pending review
- `POST /partnerEngine.reviewSubmission` - Submit review decision
- `POST /partnerEngine.qaSignoff` - QA signoff for Lane A
- `POST /partnerEngine.publishSubmission` - Publish approved data

### Governance
- `GET /partnerEngine.getIncidents` - Get system incidents
- `POST /partnerEngine.createIncident` - Log new incident
- `GET /partnerEngine.getPolicies` - Get governance policies
- `POST /partnerEngine.updatePolicy` - Update policy value

## Data Contracts

### Contract Schema

```typescript
{
  contractId: string,        // Unique identifier
  nameEn: string,            // English name
  nameAr: string,            // Arabic name
  datasetFamily: string,     // Category (fx_rates, trade, etc.)
  frequency: string,         // daily, weekly, monthly, etc.
  geoLevel: string,          // national, governorate, district
  privacyClassification: string, // public, restricted, confidential
  requiredFields: Array<{
    name: string,
    type: string,
    description: string,
    required: boolean
  }>,
  requiredMetadata: {
    sourceStatement: boolean,
    methodDescription: boolean,
    coverageWindow: boolean,
    license: boolean,
    contactInfo: boolean
  }
}
```

### Pre-configured Contracts

| Contract ID | Name | Frequency | Privacy |
|-------------|------|-----------|---------|
| fx_daily | FX Rates Daily | Daily | Public |
| trade_monthly | Trade Statistics | Monthly | Public |
| aid_quarterly | Aid Disbursements | Quarterly | Restricted |
| prices_weekly | Price Monitoring | Weekly | Public |
| banking_monthly | Banking Sector | Monthly | Restricted |
| fiscal_quarterly | Fiscal Data | Quarterly | Restricted |
| labor_quarterly | Labor Statistics | Quarterly | Public |
| humanitarian_monthly | Humanitarian Data | Monthly | Public |

## Governance Policies

### Configurable Thresholds

| Policy Key | Description | Default |
|------------|-------------|---------|
| min_validation_score | Minimum score for any publishing | 70 |
| public_lane_threshold | Minimum score for Lane A | 90 |
| staleness_days | Max days before data is stale | 30 |
| contradiction_tolerance | Max allowed contradictions | 2 |
| auto_publish_enabled | Enable auto-publishing | false |

## Incident Management

### Incident Categories

- `pipeline_outage` - Data pipeline failures
- `data_anomaly` - Unexpected data patterns
- `security` - Security-related issues
- `performance` - System performance issues
- `integration` - External system issues

### Incident Lifecycle

```
Open → Investigating → Mitigating → Resolved → Closed
```

## Audit Trail

All actions are logged with:
- User ID and name
- Action type and category
- Target type and ID
- Timestamp
- IP address
- Changes made (before/after)

## Security

### Access Control

| Role | Permissions |
|------|-------------|
| Partner | Submit data, view own submissions |
| Reviewer | Review queue, approve/reject |
| QA | QA signoff, publish |
| Admin | Full access, policy management |

### Data Protection

- All submissions encrypted at rest
- Restricted data access controlled by role
- Full audit trail for compliance
- Provenance tracking for all data

## Integration Points

### Internal Systems
- Evidence Engine - Citation verification
- Publication Factory - Report generation
- VIP Cockpits - Decision support

### External Systems
- Partner APIs - Data submission
- Notification service - Alerts
- Storage service - File uploads

## Best Practices

### For Partners
1. Use appropriate data contracts
2. Include complete metadata
3. Verify data before submission
4. Respond promptly to revision requests

### For Reviewers
1. Check validation results first
2. Verify source documentation
3. Document rejection reasons
4. Escalate anomalies

### For Administrators
1. Monitor incident dashboard
2. Review audit logs regularly
3. Update policies as needed
4. Maintain contract templates
