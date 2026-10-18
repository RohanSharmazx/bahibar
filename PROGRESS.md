# GymManager — Project Progress & Status

## Overview
GymManager is a secure, responsive, mobile-first web app designed for local gym owners in India to replace physical paper registers with digital records.

- **Stack**: Next.js (App Router, TypeScript), Tailwind CSS, Supabase (Auth, PostgreSQL, RLS), Zod, React Hook Form, date-fns, Vitest.
- **Safety**: Dual-boot protected, commands run only in `~/Projects/gymmanager-web`.

---

## Phase Status Summary

| Phase | Description | Status |
|---|---|---|
| **Phase 0** | Safety & Environment Assessment | Completed |
| **Phase 1** | Architecture & Database Design | Completed |
| **Phase 2** | Project Scaffold & Core Setup | Completed |
| **Phase 3** | Core Application Development | In Progress |
| **Phase 4** | Data Security & Subscription Model | In Progress |
| **Phase 5** | Automated & Manual Testing | In Progress (23/23 unit tests passing) |
| **Phase 6** | Local Preview (127.0.0.1) | Pending |
| **Phase 7** | PWA & Deployment Preparation | Pending |

---

## Completed Milestones

### Phase 0 & 1
- [x] Environment verified: Node v26, npm v12, Git 2.56 on Arch Linux.
- [x] Comprehensive database schema with 9 tables, snapshots for historical immutability, calculated balance rules, and RLS policies.
- [x] Documented date calculation rules (month-end clamping, leap year handling, renewal start date continuity).

### Phase 2
- [x] Next.js project scaffolded with App Router, TypeScript, and Tailwind CSS.
- [x] Essential packages installed (`@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, `date-fns`, `lucide-react`, `vitest`).
- [x] Environment configuration (`.env.example`, `.env.local` untracked).
- [x] Git repository initialized.
- [x] 7 SQL migration scripts created in `supabase/migrations/`.
- [x] Supabase client libraries (browser client, server client with cookie store, middleware session refresher, auth helpers).
- [x] Utility modules (`currency.ts` for INR formatting, `dates.ts` for calendar math, `csv.ts` with formula injection prevention).
- [x] Zod validation schemas for all domain entities.
- [x] Comprehensive unit test suite (23 tests passing across 4 files).

---

## Phase 3 Work Plan (Core Application)
1. **Layout & UI Components**:
   - `AppShell`, `Sidebar`, `BottomNav`, `TopBar`
   - UI primitives: Button, Card, Badge, Input, Modal, Alert
2. **Server Actions**:
   - `actions/auth.ts`: signup, login, logout, password reset
   - `actions/gym.ts`: createGym, updateGym
   - `actions/plans.ts`: createPlan, updatePlan, togglePlanActive
   - `actions/members.ts`: createMember, updateMember, archiveMember, restoreMember
   - `actions/memberships.ts`: renewMembership
   - `actions/payments.ts`: recordPayment
   - `actions/export.ts`: exportMembers, exportMemberships, exportPayments
3. **App Pages**:
   - Public auth pages: `/login`, `/register`, `/forgot-password`, `/reset-password`
   - Onboarding: `/onboarding` (first-time gym profile creation)
   - Dashboard: `/dashboard` (stats, expiring alerts, dues, recent members)
   - Members: `/members` (search, status filters), `/members/new`, `/members/[id]`, `/members/[id]/edit`
   - Plans: `/plans`, `/plans/new`, `/plans/[id]/edit`
   - Payments: `/payments` (collection totals, payment logs)
   - Export: `/export` (safe CSV downloads)
   - Settings: `/settings` (gym info, subscription status)
