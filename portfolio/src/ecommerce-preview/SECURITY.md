# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **DO NOT** open a public GitHub issue
2. Email security concerns to: [your-email@example.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Resolution**: Depends on severity (critical: 24-72 hours)

## Security Measures in Place

### Authentication
- JWT tokens with short expiration (15 minutes)
- Refresh token rotation with reuse detection
- bcrypt password hashing (12 salt rounds)
- Optional 2FA (TOTP)

### Authorization
- Role-based access control (user, admin)
- Protected routes with middleware checks

### Input Validation
- Zod schema validation on all endpoints
- Mongoose schema validation at database level

### Rate Limiting
- General: 100 requests / 15 minutes
- Auth: 10 requests / 15 minutes
- Strict: 5 requests / 1 hour

### Headers & CORS
- Helmet.js security headers
- Content Security Policy
- CORS restricted to frontend origin

### Data Protection
- Sensitive data never logged
- Secrets validated at startup (fail-fast)
- HttpOnly cookies for tokens
- SameSite cookie policy

### Payments
- Stripe handles all payment data
- Webhook signature verification
- No credit card data stored

## Security Checklist for Contributors

- [ ] No hardcoded secrets
- [ ] All user input validated
- [ ] Sensitive operations logged (without PII)
- [ ] New endpoints have rate limiting
- [ ] Auth middleware applied where needed
- [ ] Error messages don't leak internal details

## Acknowledgments

We appreciate responsible security researchers who help keep this project safe.
