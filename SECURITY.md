# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.6.x   | :white_check_mark: |
| < 1.6   | :x:                |

## Reporting a Vulnerability

We take security seriously at YETO. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Email security concerns to: security@causeway-banking.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Assessment**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: Next release

### Security Measures

YETO implements the following security measures:

1. **Authentication**: OAuth 2.0 with JWT tokens
2. **Authorization**: Role-based access control (RBAC)
3. **Data Protection**: TLS 1.3 for all communications
4. **Input Validation**: Zod schema validation on all inputs
5. **Output Sanitization**: XSS prevention
6. **Rate Limiting**: Per-endpoint rate limits
7. **Audit Logging**: Full request/response logging
8. **Dependency Scanning**: Regular security audits

### Responsible Disclosure

We appreciate responsible disclosure and will:

- Acknowledge your report within 48 hours
- Keep you informed of our progress
- Credit you in our security advisories (if desired)
- Not take legal action against good-faith reporters

Thank you for helping keep YETO secure.
