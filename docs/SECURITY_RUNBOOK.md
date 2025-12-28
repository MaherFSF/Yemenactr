# YETO Platform - Security Runbook

## دليل الأمان | Security Guide

This document provides comprehensive security procedures, policies, and incident response guidelines for the YETO platform.

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [Network Security](#network-security)
5. [Application Security](#application-security)
6. [Infrastructure Security](#infrastructure-security)
7. [Security Monitoring](#security-monitoring)
8. [Incident Response](#incident-response)
9. [Compliance](#compliance)
10. [Security Checklist](#security-checklist)

---

## Security Overview

### Security Principles

YETO follows these core security principles:

| Principle | Implementation |
|-----------|----------------|
| **Defense in Depth** | Multiple security layers at network, application, and data levels |
| **Least Privilege** | Users and services have minimum required permissions |
| **Zero Trust** | Verify every request, assume breach |
| **Security by Design** | Security built into architecture, not bolted on |
| **Transparency** | Clear audit trails and logging |

### Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  WAF / DDoS Protection (Cloudflare/AWS Shield)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  TLS Termination (Traefik) - HTTPS Only                         │
│  - HSTS enabled                                                  │
│  - TLS 1.2+ only                                                 │
│  - Strong cipher suites                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Application Layer                                               │
│  - Input validation                                              │
│  - CSRF protection                                               │
│  - Rate limiting                                                 │
│  - Security headers                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Data Layer                                                      │
│  - Encrypted at rest                                             │
│  - Encrypted in transit                                          │
│  - Access controls                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication & Authorization

### Authentication Flow

YETO uses OAuth 2.0 via Manus authentication:

1. User clicks "Login"
2. Redirect to Manus OAuth portal
3. User authenticates with Manus
4. Callback with authorization code
5. Server exchanges code for tokens
6. JWT session cookie set (HttpOnly, Secure, SameSite)

### Session Security

| Setting | Value | Purpose |
|---------|-------|---------|
| Cookie HttpOnly | `true` | Prevent XSS access |
| Cookie Secure | `true` | HTTPS only |
| Cookie SameSite | `Strict` | CSRF protection |
| Session Duration | 24 hours | Limit exposure |
| JWT Algorithm | HS256 | Symmetric signing |

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| `public` | View public data, search |
| `user` | + Save preferences, create alerts |
| `pro` | + Advanced analytics, exports |
| `partner` | + Data upload, submissions |
| `admin` | Full system access |

### Authorization Checks

```typescript
// Server-side authorization
const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { user: ctx.user } });
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});
```

---

## Data Protection

### Data Classification

| Classification | Examples | Protection |
|----------------|----------|------------|
| **Public** | Published indicators, reports | None required |
| **Internal** | Draft reports, admin logs | Access control |
| **Confidential** | User data, API keys | Encryption + access control |
| **Restricted** | Credentials, secrets | Encryption + audit + MFA |

### Encryption Standards

| Data State | Method | Standard |
|------------|--------|----------|
| At Rest | AES-256 | Database encryption |
| In Transit | TLS 1.3 | All connections |
| Secrets | Environment variables | Never in code |

### PII Handling

YETO follows strict PII guidelines:

1. **No PII Collection**: Platform does not collect personal information beyond authentication
2. **No PII Display**: No names, addresses, or personal details shown
3. **Aggregated Data Only**: All displayed data is aggregated/anonymized
4. **Right to Deletion**: Users can request account deletion

### Data Retention

| Data Type | Retention | Deletion |
|-----------|-----------|----------|
| User accounts | Until deletion request | 30 days after request |
| Audit logs | 2 years | Automatic purge |
| Session data | 24 hours | Automatic expiry |
| Backups | 30 days | Automatic rotation |

---

## Network Security

### Firewall Rules

```bash
# Production server firewall (ufw)
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH (restrict to admin IPs)
ufw allow 80/tcp    # HTTP (redirect to HTTPS)
ufw allow 443/tcp   # HTTPS
ufw enable
```

### Port Configuration

| Port | Service | Access |
|------|---------|--------|
| 22 | SSH | Admin IPs only |
| 80 | HTTP | Public (redirect) |
| 443 | HTTPS | Public |
| 3000 | Application | Internal only |
| 3306 | MySQL | Internal only |
| 6379 | Redis | Internal only |

### TLS Configuration

```yaml
# Traefik TLS settings
tls:
  options:
    default:
      minVersion: VersionTLS12
      cipherSuites:
        - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
        - TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
        - TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305
```

---

## Application Security

### Security Headers

YETO implements comprehensive security headers:

```typescript
// Security headers middleware
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.manus.im"
};
```

### Input Validation

All inputs are validated using Zod schemas:

```typescript
// Example input validation
const createIndicatorSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().regex(/^[A-Z0-9_]+$/),
  value: z.number().finite(),
  date: z.date(),
  sourceId: z.string().uuid()
});
```

### SQL Injection Prevention

- All database queries use parameterized statements via Drizzle ORM
- No raw SQL string concatenation
- Input sanitization for search queries

### XSS Prevention

- React's automatic escaping for rendered content
- CSP headers restricting inline scripts
- HTML sanitization for user-generated content

### CSRF Protection

- SameSite cookie attribute
- Origin header validation
- CSRF tokens for state-changing operations

### Rate Limiting

```typescript
// Rate limiting configuration
const rateLimits = {
  global: { windowMs: 60000, max: 100 },      // 100 req/min
  auth: { windowMs: 900000, max: 5 },          // 5 attempts/15min
  api: { windowMs: 60000, max: 60 },           // 60 req/min
  search: { windowMs: 60000, max: 30 }         // 30 req/min
};
```

---

## Infrastructure Security

### Container Security

```dockerfile
# Security best practices in Dockerfile
FROM node:22-alpine AS runner

# Run as non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 yeto
USER yeto

# Read-only filesystem where possible
# No unnecessary packages
```

### Secret Management

| Secret Type | Storage | Access |
|-------------|---------|--------|
| Database credentials | Environment variables | Application only |
| API keys | Environment variables | Application only |
| JWT secret | Environment variables | Application only |
| TLS certificates | Mounted volume | Traefik only |

### Backup Security

- Backups encrypted at rest
- Stored in separate location from primary data
- Access restricted to admin role
- Retention policy enforced automatically

---

## Security Monitoring

### Audit Logging

All security-relevant events are logged:

```typescript
// Audit log structure
interface AuditLog {
  timestamp: Date;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details: Record<string, unknown>;
}
```

### Monitored Events

| Event | Severity | Alert |
|-------|----------|-------|
| Failed login (5+ attempts) | High | Immediate |
| Admin action | Medium | Daily digest |
| Data export | Medium | Daily digest |
| Permission change | High | Immediate |
| Configuration change | High | Immediate |
| Unusual traffic pattern | Medium | Immediate |

### Security Alerts

```bash
# Example alert configuration
alerts:
  - name: brute_force_attempt
    condition: failed_logins > 5 in 15 minutes
    action: block_ip, notify_admin
    
  - name: unusual_data_access
    condition: data_exports > 100 in 1 hour
    action: notify_admin, require_verification
```

---

## Incident Response

### Incident Classification

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical** | Data breach, system compromise | Immediate |
| **High** | Service disruption, vulnerability exploit | 1 hour |
| **Medium** | Suspicious activity, minor vulnerability | 4 hours |
| **Low** | Policy violation, minor issue | 24 hours |

### Incident Response Procedure

#### 1. Detection & Triage

```bash
# Check for active incidents
docker compose logs --tail=1000 | grep -i "error\|warn\|attack"

# Check failed login attempts
SELECT * FROM audit_logs 
WHERE action = 'login_failed' 
AND created_at > NOW() - INTERVAL 1 HOUR;
```

#### 2. Containment

```bash
# Block suspicious IP
iptables -A INPUT -s <IP> -j DROP

# Disable compromised account
UPDATE users SET status = 'suspended' WHERE id = '<user_id>';

# Rotate compromised credentials
./scripts/rotate_secrets.sh
```

#### 3. Investigation

- Collect logs from all relevant services
- Identify scope of incident
- Determine root cause
- Document timeline

#### 4. Eradication

- Remove malicious access
- Patch vulnerabilities
- Update security controls

#### 5. Recovery

- Restore from clean backup if needed
- Verify system integrity
- Resume normal operations

#### 6. Post-Incident

- Document lessons learned
- Update security procedures
- Implement preventive measures

### Emergency Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| Security Lead | security@causewaygrp.com | Immediate |
| Platform Admin | yeto@causewaygrp.com | 1 hour |
| Infrastructure | ops@causewaygrp.com | 2 hours |

---

## Compliance

### Data Protection Compliance

YETO is designed to comply with:

- **GDPR** (General Data Protection Regulation)
- **Data minimization** principles
- **Right to access** and **deletion**

### Security Standards

| Standard | Status | Notes |
|----------|--------|-------|
| OWASP Top 10 | Addressed | All categories covered |
| CIS Controls | Partial | Key controls implemented |
| SOC 2 | Designed for | Not certified |

### Regular Assessments

| Assessment | Frequency | Responsibility |
|------------|-----------|----------------|
| Dependency audit | Weekly | Automated |
| Penetration test | Annually | External |
| Code review | Per PR | Development team |
| Access review | Quarterly | Admin |

---

## Security Checklist

### Pre-Deployment

- [ ] All dependencies updated
- [ ] Security audit passed (`pnpm audit`)
- [ ] No secrets in code
- [ ] Environment variables configured
- [ ] TLS certificates valid
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] Security headers configured

### Post-Deployment

- [ ] Health checks passing
- [ ] Audit logging working
- [ ] Monitoring alerts configured
- [ ] Backup system verified
- [ ] SSL/TLS grade A or higher
- [ ] No exposed debug endpoints

### Periodic Review

- [ ] Review access logs (weekly)
- [ ] Check for new vulnerabilities (weekly)
- [ ] Rotate secrets (quarterly)
- [ ] Review user permissions (quarterly)
- [ ] Update security documentation (as needed)
- [ ] Conduct security training (annually)

---

## Appendix

### Security Tools

```bash
# Check for vulnerabilities
pnpm audit

# Check SSL configuration
curl -s "https://api.ssllabs.com/api/v3/analyze?host=yeto.causewaygrp.com"

# Check security headers
curl -I https://yeto.causewaygrp.com | grep -i "security\|strict\|x-"

# Scan for open ports
nmap -sV yeto.causewaygrp.com
```

### Useful Resources

- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

*Last updated: December 28, 2024*
*Security contact: security@causewaygrp.com*
