# YETO Security Documentation

## Overview

This document outlines the security architecture, threat model, and controls implemented in the Yemen Economic Transparency Observatory (YETO) platform. Security is a foundational requirement given the sensitive nature of economic data in a conflict environment.

---

## Security Principles

YETO adheres to the following security principles:

| Principle | Implementation |
|-----------|----------------|
| **Defense in Depth** | Multiple layers of security controls |
| **Least Privilege** | Users have minimum necessary access |
| **Data Integrity** | All data changes are logged and auditable |
| **Privacy by Design** | No PII collection beyond authentication |
| **Transparency** | Security measures are documented |

---

## Threat Model

### Assets to Protect

| Asset | Sensitivity | Protection Priority |
|-------|-------------|---------------------|
| User credentials | High | P0 |
| Economic data | Medium | P1 |
| Source metadata | Medium | P1 |
| API keys | High | P0 |
| Audit logs | High | P0 |

### Threat Actors

| Actor | Motivation | Capability |
|-------|------------|------------|
| Opportunistic attackers | Data theft, defacement | Low-Medium |
| State actors | Intelligence gathering | High |
| Insider threats | Data manipulation | Medium |
| Competitors | Data scraping | Low |

### Attack Vectors

| Vector | Mitigation |
|--------|------------|
| SQL injection | Parameterized queries via Drizzle ORM |
| XSS | React's built-in escaping, CSP headers |
| CSRF | SameSite cookies, token validation |
| Credential stuffing | Rate limiting, session management |
| API abuse | Rate limiting, authentication |

---

## Authentication & Authorization

### Authentication Flow

YETO uses OAuth 2.0 for authentication:

1. User clicks "Sign In"
2. Redirect to OAuth provider
3. User authenticates
4. Callback with authorization code
5. Exchange code for tokens
6. Create session cookie
7. Redirect to application

### Session Management

| Parameter | Value |
|-----------|-------|
| Session duration | 24 hours |
| Cookie attributes | HttpOnly, Secure, SameSite=Strict |
| Token storage | Server-side (JWT) |
| Session invalidation | Logout, password change |

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| `public` | View public pages only |
| `user` | Access registered features, downloads |
| `admin` | Full admin portal access |

### Protected Procedures

All sensitive operations use `protectedProcedure` which:
1. Validates session token
2. Extracts user from context
3. Checks role permissions
4. Logs access attempt

---

## Data Protection

### Data Classification

| Classification | Examples | Controls |
|----------------|----------|----------|
| Public | Published indicators, research | None required |
| Internal | User emails, session data | Encryption at rest |
| Confidential | API keys, passwords | Encryption + access control |
| Restricted | N/A (no PII collected) | N/A |

### Encryption

| Layer | Method |
|-------|--------|
| Transport | TLS 1.3 |
| Database | TiDB encryption at rest |
| Secrets | Environment variables (not in code) |
| Passwords | N/A (OAuth only) |

### Data Retention

| Data Type | Retention Period |
|-----------|------------------|
| User accounts | Until deletion requested |
| Session logs | 90 days |
| Audit logs | 1 year |
| Economic data | Permanent (versioned) |

---

## API Security

### Rate Limiting

| Endpoint Type | Limit |
|---------------|-------|
| Public endpoints | 100 requests/minute |
| Authenticated endpoints | 500 requests/minute |
| Admin endpoints | 1000 requests/minute |
| AI Assistant | 20 requests/minute |

### Input Validation

All API inputs are validated using Zod schemas:
- Type checking
- Range validation
- Format validation
- Sanitization

### Output Sanitization

All outputs are sanitized to prevent:
- XSS attacks
- Information disclosure
- Data leakage

---

## Infrastructure Security

### Network Security

| Control | Implementation |
|---------|----------------|
| Firewall | Cloud provider firewall rules |
| DDoS protection | Cloud provider protection |
| HTTPS only | Redirect HTTP to HTTPS |
| CORS | Restricted to known origins |

### Server Security

| Control | Implementation |
|---------|----------------|
| OS updates | Automated security patches |
| Dependency updates | Regular npm audit |
| Container isolation | Docker containers |
| Secrets management | Environment variables |

### Database Security

| Control | Implementation |
|---------|----------------|
| Access control | Database user permissions |
| Encryption | TiDB encryption at rest |
| Backups | Daily automated backups |
| Connection | SSL/TLS required |

---

## Content Security

### Do No Harm Policy

YETO enforces strict content policies:

1. **No PII Publication**: User data is never exposed publicly
2. **No Violence Enablement**: Content that could enable targeting is prohibited
3. **No Sanctions Evasion**: No guidance that facilitates sanctions circumvention
4. **Responsible Disclosure**: Panic-sensitive data (bank runs, currency crashes) is communicated responsibly

### AI Safety Controls

The AI Assistant includes safety controls:

| Control | Implementation |
|---------|----------------|
| Grounding | All responses cite evidence |
| Refusal | Harmful queries are refused |
| Confidence | Uncertainty is clearly stated |
| Audit | All queries are logged |

### Content Moderation

User-submitted content (corrections, feedback) is:
1. Queued for admin review
2. Checked for harmful content
3. Approved or rejected with reason
4. Logged for audit

---

## Incident Response

### Severity Classification

| Severity | Description | Response Time |
|----------|-------------|---------------|
| Critical | Data breach, service down | 15 minutes |
| High | Security vulnerability | 1 hour |
| Medium | Suspicious activity | 4 hours |
| Low | Policy violation | 24 hours |

### Response Procedure

1. **Detection**: Alert triggered or report received
2. **Triage**: Assess severity and scope
3. **Containment**: Isolate affected systems
4. **Investigation**: Determine root cause
5. **Remediation**: Fix vulnerability
6. **Recovery**: Restore normal operations
7. **Post-mortem**: Document lessons learned

### Contact Information

Security issues should be reported to: **yeto@causewaygrp.com**

---

## Compliance

### Security Standards

YETO aligns with:
- OWASP Top 10 mitigations
- WCAG 2.1 AA accessibility
- GDPR data protection principles

### Security Checklist

| Control | Status |
|---------|--------|
| HTTPS enforced | ✅ |
| Secure cookies | ✅ |
| Input validation | ✅ |
| Output encoding | ✅ |
| Rate limiting | ✅ |
| Audit logging | ✅ |
| Session management | ✅ |
| Error handling | ✅ |
| Dependency scanning | ✅ |
| Access control | ✅ |

---

## Audit Logging

### Logged Events

| Event Type | Details Logged |
|------------|----------------|
| Authentication | User, timestamp, IP, success/failure |
| Authorization | User, resource, action, result |
| Data access | User, dataset, query, timestamp |
| Admin actions | User, action, target, changes |
| API calls | Endpoint, user, parameters, response |

### Log Retention

Audit logs are retained for 1 year and include:
- Timestamp (UTC)
- User identifier
- Action performed
- Target resource
- Result (success/failure)
- IP address
- User agent

### Log Access

Audit logs are accessible to:
- Admin users via Admin → Audit Logs
- System administrators via database queries
- Compliance officers via exported reports

---

## Security Updates

### Vulnerability Management

1. **Monitoring**: Subscribe to security advisories
2. **Assessment**: Evaluate impact on YETO
3. **Prioritization**: Critical within 24h, High within 7d
4. **Patching**: Apply updates in staging, then production
5. **Verification**: Confirm fix is effective

### Dependency Updates

Regular dependency audits:
```bash
pnpm audit
```

Critical vulnerabilities are patched immediately.

---

## Appendix: Security Headers

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | Configured per environment |

---

*Last Updated: January 2026*
*Version: 1.0*
