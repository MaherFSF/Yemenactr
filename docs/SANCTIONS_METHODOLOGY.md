# YETO Sanctions & Compliance Module

## Purpose

The YETO Sanctions & Compliance module provides **informational access** to official sanctions data relevant to Yemen's economic context. This module is strictly informational and does not provide legal advice, compliance services, or any guidance that could facilitate sanctions evasion.

## Legal Disclaimer

> **IMPORTANT**: This module is for informational purposes only. It does not constitute legal advice. Users should consult qualified legal counsel for compliance matters. YETO does not provide sanctions screening services, compliance certification, or evasion guidance.

## Data Sources

### Official Lists Ingested

| List | Issuing Authority | Legal Basis |
|------|-------------------|-------------|
| OFAC SDN List | U.S. Treasury | Executive Orders, IEEPA |
| EU Consolidated List | European Council | EU Regulations |
| UK Sanctions List | HM Treasury | Sanctions Act 2018 |
| UN Security Council | United Nations | UNSC Resolutions |

### Ingestion Policy

1. **Only official sources** are ingested
2. **Public data only** - no proprietary databases
3. **Legal review** before adding new lists
4. **Regular updates** following official publication schedules

## Entity Matching

### Matching Algorithm

The entity matching system uses multiple techniques:

| Match Type | Description | Confidence Range |
|------------|-------------|------------------|
| **Exact** | Name matches exactly | 95-100% |
| **Fuzzy** | Name similar (Levenshtein distance) | 70-94% |
| **Alias** | Matches known alias | 80-95% |
| **Identifier** | Matches ID number | 90-100% |

### Explainable Matching

Every match includes a human-readable explanation:

```typescript
interface EntityMatch {
  matchType: "exact" | "fuzzy" | "alias" | "identifier";
  matchConfidence: number; // 0-100
  matchExplanation: string; // Human-readable explanation
  matchExplanationAr?: string;
}
```

Example explanation:
> "Name 'ABC Trading Company' matches alias 'ABC Trading Co.' from OFAC SDN List entry #12345 with 92% confidence based on fuzzy string matching."

### Verification Status

| Status | Meaning |
|--------|---------|
| `unverified` | System-generated match, not reviewed |
| `confirmed_match` | Human-verified as correct match |
| `false_positive` | Human-verified as incorrect match |
| `disputed` | Subject to active dispute |
| `under_review` | Currently being reviewed |

## Neutral Language Policy

### Required Language Standards

All content in this module MUST:

1. **Use neutral, factual language** - no characterizations
2. **Cite official sources** - never speculate
3. **Avoid implications** - state facts only
4. **Include context** - explain designations objectively

### Prohibited Language

| Prohibited | Acceptable |
|------------|------------|
| "Terrorist organization" | "Designated under [specific program]" |
| "Money launderer" | "Subject to financial sanctions" |
| "Criminal entity" | "Listed on [specific list]" |
| "Guilty of..." | "Designated for alleged..." |

### Content Review

All sanctions-related content undergoes:
1. Automated neutral language check
2. Legal review for defamation risk
3. Editorial approval before publication

## Disputes & Corrections

### Dispute Submission

Any party may submit a dispute regarding:
- Match accuracy (false positive claims)
- Data errors (incorrect information)
- Outdated information (delisted entities)
- Defamation concerns (language issues)

### Dispute Workflow

```
Submitted → Under Review → Additional Info Requested → Resolved (Accepted/Rejected)
                                                    ↓
                                                 Escalated
```

### Audit Log

Every dispute maintains a complete audit trail:

```typescript
interface AuditLogEntry {
  timestamp: string;
  action: string;
  userId?: number;
  details: string;
}
```

### Resolution Timeframes

| Dispute Type | Target Resolution |
|--------------|-------------------|
| Data error | 5 business days |
| Match accuracy | 10 business days |
| Defamation concern | 3 business days |
| Outdated info | 5 business days |

## Compliance Dashboard

### Informational Displays

The dashboard shows:
- Total entities with sanctions matches
- Match confidence distribution
- Verification status breakdown
- Recent list updates

### What It Does NOT Show

- Compliance recommendations
- Risk scores for business decisions
- Screening results for transactions
- Evasion strategies or workarounds

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `sanctions.lists.list` | Query | List available sanctions lists |
| `sanctions.entries.search` | Query | Search sanctions entries |
| `sanctions.matches.list` | Query | List entity matches |
| `sanctions.disputes.submit` | Mutation | Submit a dispute |
| `sanctions.disputes.list` | Query | List disputes |

## Security & Access

### Access Control

| Role | Permissions |
|------|-------------|
| Public | View published sanctions data |
| Registered | Search and filter |
| Analyst | View match details |
| Admin | Manage disputes, verify matches |

### Data Protection

- No PII beyond official list data
- Secure storage with encryption
- Access logging for audit
- Regular security reviews

## Testing Requirements

### Automated Tests

1. **Neutral language tests** - Verify no defamatory language
2. **Match accuracy tests** - Verify algorithm correctness
3. **Dispute workflow tests** - Verify complete workflow
4. **Audit log tests** - Verify complete logging

### Manual Review

- Legal review of all content
- Editorial review of explanations
- Accessibility review for compliance

## Best Practices

1. **Always cite official sources**
2. **Use neutral, factual language**
3. **Verify matches before publishing**
4. **Respond promptly to disputes**
5. **Maintain complete audit trails**
6. **Never provide compliance advice**

---

*Last Updated: January 14, 2026*
