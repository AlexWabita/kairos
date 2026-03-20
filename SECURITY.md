# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Yes     |

---

## Reporting a Vulnerability

**Do not report security vulnerabilities via GitHub Issues.**

If you discover a security vulnerability, please email:

**kairos.app.official@gmail.com**

Subject line: `[SECURITY] Brief description`

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your suggested fix (if any)

You will receive a response within 48 hours. We ask that you give us reasonable time to address the issue before any public disclosure.

---

## Security Architecture

### Authentication
- Supabase Auth handles all authentication (email/password)
- Sessions stored in httpOnly cookies — not accessible to JavaScript
- PKCE flow used for email auth — prevents authorization code interception
- All protected routes checked in Next.js middleware before page render

### Data Isolation
- Row Level Security (RLS) enabled on all user data tables
- API routes perform server-side auth validation — client-sent user IDs are never trusted
- Profile ID (internal) is separated from auth UUID (Supabase) — auth provider changes are non-breaking
- Service role key used only in API routes, never exposed to the browser

### API Keys
- All API keys stored as server-side environment variables
- `NEXT_PUBLIC_*` prefix used only for genuinely public values (Supabase URL, anon key)
- Anon key has RLS restrictions — it cannot bypass row-level policies
- Service role key has no exposure surface (never in client code)

### Input Handling
- AI guardrail system validates and sanitizes user inputs before LLM submission
- Contact form validates required fields server-side before Resend/Supabase operations
- No user-supplied content is executed as code

### Rate Limiting
- `lib/rateLimit.js` provides per-route request rate limiting
- AI routes are rate-limited to prevent abuse and cost runaway

---

## Known Limitations

- No 2FA/MFA currently (planned for Phase 8)
- Session tokens are not rotated on privilege escalation (standard Supabase behavior)
- Contact form is not CAPTCHA-protected (spam filtering relies on Resend's own protection)