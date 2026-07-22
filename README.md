# OneLGU

Unified digital governance platform for the **Municipality of Dingras, Ilocos Norte** — connecting the LGU municipal office, barangay halls, and residents through a single system for certifications, complaints, reports, and compliance monitoring.

Built with Next.js (App Router), Supabase (Postgres + Auth + Storage), and Tailwind CSS.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase project credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 3. Set up the database (fresh Supabase project)

The full schema lives in a single migration file, and a one-run seed script populates Dingras' 31 barangays plus a full set of test accounts.

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push          # applies supabase/migrations/0001_init.sql
```

Then run the contents of `supabase/seed.sql` once via the Supabase SQL Editor (or `psql`). It is safe to re-run on a fresh project — it clears anything matching its own seed data first.

**Seeded accounts** (all use password `Password123!`):
| Role | Email pattern |
|---|---|
| LGU Super Admin | `superadmin@onelgu.gov.ph` |
| Barangay Official | `official.<barangayname>@onelgu.gov.ph` (one per barangay, e.g. `official.albano@onelgu.gov.ph`) |

Residents self-register through `/register` — there is no seeded resident account.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Roles & Portals

| Role | Portal | Scope |
|---|---|---|
| `resident` | `/resident/*` | Own certifications, complaints, notifications, profile |
| `barangay_official` | `/barangay/*` | Everything scoped to their own barangay |
| `lgu_reviewer` | `/lgu/*` | Same access as super admin (read/verify focus) |
| `super_admin` | `/lgu/*` | Full municipal-wide access, barangay management, settings |

Each portal layout enforces role-based access — visiting the wrong portal redirects to a not-found page.

---

## ✅ Feature Checklist — What's Done

### 🌐 Public Landing Page
- [x] Marketing landing page (hero, modules, civic bulletin cards, portals, benefits, FAQ)
- [x] Scroll-in animations (Framer Motion)
- [x] Installable PWA (manifest, icons, service worker)
- [x] SEO: dynamic OG image, sitemap.xml, robots.txt, structured data (JSON-LD), Google Search Console verified & indexed

### 👤 Resident Portal
- [x] Dashboard (quick stats, shortcuts, recent activity)
- [x] Certification requests — new request, list, detail view
- [x] Complaints — file complaint, list, detail view
- [x] Notifications
- [x] Profile management

### 🏘️ Barangay Official Portal
- [x] Dashboard — real barangay-scoped stats (fixed a bug where it queried by user ID instead of barangay ID)
- [x] Certification requests — list + detail, Verify → Approve/Reject → Release workflow
- [x] Complaint cases — list + detail, Start Review → Resolve/Close workflow
- [x] Reports — submit new report, list of submissions
- [x] LGU Required Documents — compliance checklist by report type (replaced hardcoded mock checklist with real data)
- [x] Compliance Status — real submission/approval stats, missing report types
- [x] Staff Accounts — real barangay-scoped staff list
- [x] Profile management

### 🏛️ LGU Super Admin / Reviewer Portal
- [x] Dashboard Overview — real stat cards + submission trend, complaint/certification breakdown, compliance chart (replaced hardcoded template numbers and mock chart data)
- [x] Barangays — directory (search + pagination), Add/Edit/Deactivate, per-barangay profile stats, officials list, performance monitoring, barangay detail page
- [x] Certification Requests — all/pending/approved/rejected/issued, with filters + Approve/Reject/Release actions
- [x] Complaint Reports — all/pending/investigation/resolved/closed, with filters + workflow actions
- [x] Barangay Reports — pending/approved/returned/archived/categories, with Approve/Return actions, report detail page
- [x] Document Submissions — pending/approved/archived views of uploaded files
- [x] Compliance Monitoring — submission status, late submissions, missing requirements, barangay rankings, compliance history
- [x] Analytics — submissions trend, complaints by category, certifications by type, compliance rate over time, annual summary (all backed by real Supabase queries, no mock data)
- [x] User Management — residents, barangay officials, SK/LGU reviewers, account requests, with Activate/Deactivate
- [x] System Management — certification types, report categories, complaint categories, document types (real usage counts), full barangay management, live system stats
- [x] Audit Logs — user activities, login history (from Supabase Auth), system-triggered events
- [x] Profile management + change password

### 🔒 Security & Data Integrity
- [x] Role-based route guards on all three portals (previously any logged-in user could browse any portal's URLs directly)
- [x] Row Level Security policies on every table, scoped by role and barangay
- [x] Consolidated single-file migration + one-run, idempotent seed script

### 🎨 Design System
- [x] Consistent typography (Lexend throughout, no stray fonts)
- [x] Consistent table style, pagination (10 rows/page), filters, and status badges across all admin list pages
- [x] Skeleton loading states on every LGU page transition
- [x] Phosphor icon set in sidebars, glass/bevel-style profile card and active nav state

---

## 🚧 Future Features / TODO

- [ ] **Civic Bulletin / Announcements CMS** — schema is written (`announcement_status`, `announcement_category`, `announcements` table) but not yet applied to the live database or wired to the landing page's Civic Bulletin cards
- [ ] **Real file upload** — certification/report/complaint attachments currently expect a `file_url`; there's no actual Supabase Storage upload wired to the dropzone UI yet
- [ ] **Notification triggers** — no automatic email/push notification is sent when a status changes (e.g. certificate approved, complaint scheduled)
- [ ] **Account Requests workflow** — currently just lists inactive accounts; no dedicated request/approval flow with reason or document verification
- [ ] **SK Officials** — role exists (`lgu_reviewer`) but has no distinct feature set separate from LGU reviewer
- [ ] **Automated compliance reminders** — no scheduled job to notify barangays of upcoming/missed report deadlines
- [ ] **Barangay-level analytics drill-down** — LGU analytics are municipal-wide; no per-barangay analytics detail view yet
- [ ] **Two-factor authentication** — currently email/password only
- [ ] **Google Business Profile listing** — for local/Maps search visibility (separate from web SEO, which is done)
- [ ] **Audit log retention/export** — no CSV export or archival policy for audit logs yet

---

## Tech Stack

- **Framework:** Next.js (App Router, Server Components, Server Actions)
- **Database/Auth:** Supabase (Postgres, Auth, Storage, Row Level Security)
- **Styling:** Tailwind CSS, shadcn/ui
- **Charts:** Recharts
- **Animation:** Framer Motion
- **Icons:** Phosphor Icons (admin sidebars), Lucide (general UI)
- **Validation:** Zod
