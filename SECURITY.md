# Security Policy

## Responsible Disclosure

The security and privacy of gym member records, phone numbers, and payment ledgers is paramount. If you believe you have found a security vulnerability in BahiBar, please report it privately rather than opening a public issue on GitHub.

### How to Report

Please submit your vulnerability report privately by:
- Creating a [GitHub Private Security Advisory](https://github.com/RohanSharmazx/bahibar/security/advisories/new) (preferred), OR
- Emailing: `security@bahibar.com`

Please include:
- A clear description of the vulnerability.
- Steps to reproduce or proof-of-concept script.
- Affected components or API endpoints.
- Potential impact on tenant isolation or sensitive gym records.

We will acknowledge receipt within 48 hours and work with you on a timely resolution.

## Scope & Supported Versions

| Version | Supported | Notes |
| :--- | :--- | :--- |
| `main` (Latest) | ✅ Yes | Current development branch |
| `< 1.0.0` | ⚠️ Best effort | Pre-release pilot code |

## Security Architecture Principles

- **Tenant Isolation**: Every database table is guarded by PostgreSQL Row-Level Security (RLS) linked to `auth.uid() = gym_staff.user_id`. No gym workspace can ever read or write records belonging to another gym.
- **No Hardcoded Secrets**: Cloud API keys and service tokens must never be committed to source code or baked into client bundles.
- **Client-Side Data Sanitization**: Formulas in CSV exports are sanitized against spreadsheet injection (`=`, `@`, `+`, `-`).
- **Privacy & Telemetry**: Independent self-hosted installations run with telemetry disabled by default (`NEXT_PUBLIC_ENABLE_ANALYTICS=false`). Zero Personally Identifiable Information (PII) is collected.
