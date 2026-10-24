# BahiBar (बहीबार)

> **Modern digital gym register and member fee ledger for independent fitness clubs.**  
> Free, open-source, mobile-first, and designed specifically for neighborhood gym owners.

[![Tests](https://img.shields.io/badge/tests-136%20passed-emerald)](https://github.com/bahibar/bahibar)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase%20RLS-336791)](https://supabase.com)

---

## 🏋️ Why BahiBar?

Most neighborhood and independent fitness centers in India still manage hundreds of members using physical paper notebooks (*bahi-khata*) or messy spreadsheets:
- **Notebooks get worn, torn, and misplaced**: Searching for a member's payment history during a rush wastes precious time.
- **Expiry calculation mistakes**: Manually counting 30, 60, or 90 days causes disputes over leap years and month ends.
- **Uncollected fee dues**: Without instant renewal and overdue lists, gyms quietly bleed thousands of rupees every month.
- **Complicated SaaS software**: Most commercial software is bloated, expensive, demands credit card trials, or holds your member data hostage.

**BahiBar solves this with a lightweight, respectful, digital ledger.** No payment gateway needed to run it. No lockouts.

---

## ✨ Key Features

- **📱 Mobile-First Reception Workflow**: Designed for fast, one-handed touch operation on smartphones and desk tablets.
- **🗓️ Precise Calendar-Month Arithmetic**:
  - Handles month-end clamping (e.g. Jan 31 + 1 month = Feb 28, or Feb 29 in leap years).
  - Seamless renewals: Extends directly from the day after the current active end-date.
- **💰 Fees & Ledger Management**:
  - Track full and partial payments.
  - Instant balance computation and overdue alerts.
  - Supports Cash, UPI, Card, and Bank transfers.
- **🧾 Instant Receipts & Vouchers**:
  - Clean, standalone printable PDF receipts.
  - Counter voucher format for thermal receipt printers.
  - One-tap WhatsApp payment confirmation slips.
- **🛡️ Strict Multi-Tenant Isolation**:
  - Powered by PostgreSQL Row-Level Security (RLS) on Supabase.
  - Every query is scoped to `auth.uid() = gym_staff.user_id`. No cross-tenant data leaks.
- **📦 100% Data Portability (No Hostage Data)**:
  - Export full member directories and payment records to Excel-ready CSV (with UTF-8 BOM and ₹ symbols preserved).
  - Formula-injection sanitization (`=`, `@`, `+`, `-`).
  - Complete JSON database backup export.
- **🌐 Bilingual Support**: Instant toggle between English and Hindi (हिन्दी).
- **🔒 Privacy-Conscious**: Zero telemetry on self-hosted instances. Zero customer PII shared.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   BahiBar Client (Web)                 │
│      Next.js 16 (App Router) + React 19 + Tailwind     │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       (Server Actions)         (Direct RLS Queries)
                │                        │
┌───────────────▼────────────────────────▼───────────────┐
│                    Supabase Backend                    │
│   ┌────────────────────────────────────────────────┐   │
│   │             Supabase GoTrue (Auth)             │   │
│   ├────────────────────────────────────────────────┤   │
│   │         PostgreSQL Database with RLS           │   │
│   │  • gyms                 • gym_staff            │   │
│   │  • profiles             • membership_plans     │   │
│   │  • members              • member_memberships   │   │
│   │  • payments             • software_subs        │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart & Self-Hosting

You can run BahiBar in **two different modes**:

### Mode A: Zero-Config Local Development (60 Seconds)

BahiBar includes a built-in JSON local storage fallback engine (`.local-db.json`). You can test the application offline on your laptop without setting up any cloud accounts!

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bahibar/bahibar.git
   cd bahibar
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the app**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser. You can immediately register a gym owner account and start testing!

---

### Mode B: Production Self-Hosting (Supabase Cloud + Vercel / Docker)

For production multi-tenant deployments with full PostgreSQL Row-Level Security:

#### 1. Create a Supabase Project
- Head to [database.new](https://database.new) and create a free Supabase project.
- In Supabase Dashboard, go to **SQL Editor** > **New Query**.
- Paste and run the entire contents of [`supabase/complete_setup.sql`](supabase/complete_setup.sql). This configures all 8 tables, indexes, triggers, and RLS policies.
- In Supabase Dashboard, go to **Authentication** > **Providers** > **Email**:
  - Ensure Email provider is **Enabled**.
  - For quick onboarding, you may toggle off *Confirm email* if you do not want mandatory verification links.

#### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

#### 3. Build & Run
```bash
npm run build
npm start
```

---

## 🧪 Testing

BahiBar has a unit and integration test suite covering authentication, renewal arithmetic, currency formatting, CSV formula sanitization, and security policies:

```bash
# Run the complete test suite
npm test
```

Current test results:
```text
Test Files  16 passed (16)
     Tests  136 passed (136)
```

---

## 🗺️ Project Roadmap

| Feature Area | Status | Details |
| :--- | :--- | :--- |
| **Authentication & Gym Onboarding** | ✅ Implemented | Multi-tenant owner signup, password reset flow |
| **Member Management** | ✅ Implemented | Full CRUD, phone validation, active/expired statuses |
| **Calendar-Month Arithmetic** | ✅ Implemented | Month-end clamping, leap year handling, renewal extensions |
| **Payments & Due Balances** | ✅ Implemented | Cash, UPI, Card logging, partial payments, due tracking |
| **Receipt Generation** | ✅ Implemented | PDF downloads, thermal counter slips, WhatsApp text slips |
| **Data Export & Backups** | ✅ Implemented | UTF-8 BOM CSV exports, formula sanitization, JSON snapshots |
| **Bilingual Localization** | ✅ Implemented | English & Hindi (हिन्दी) dynamic switching |
| **Open Source Pilot Mode** | ✅ Implemented | Zero paywalls, zero payment gateway requirements |
| **Batch CSV Member Import** | 🔄 In Progress | Import existing member lists from Excel spreadsheets |
| **Staff & Trainer Roles** | ⏳ Planned | Granular permissions (Receptionist vs. Trainer vs. Owner) |
| **Automated WhatsApp Reminders** | ⏳ Planned | Opt-in webhook/API integration for automated renewal alerts |

---

## 🔒 Security & Responsible Disclosure

Security vulnerabilities should be reported privately to `security@bahibar.com` or via [GitHub Security Advisories](https://github.com/bahibar/bahibar/security/advisories/new).  
Please read our [Security Policy](SECURITY.md) for details.

---

## 🤝 Contributing

We welcome pull requests and issues! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting code.

---

## 📄 License

BahiBar is open source software licensed under the [MIT License](LICENSE).  
*(See our discussion on MIT vs. AGPLv3 in the project documentation).*
