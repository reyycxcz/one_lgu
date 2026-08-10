import type { Metadata } from "next";
import {
  Layers, Database, ShieldCheck, Palette, Code2, Cloud, Bell, QrCode,
  FileText, Scale, ClipboardList, BarChart3, Megaphone, Users, KeyRound,
  Lock, Bug, Sparkles, GitCommit, CalendarDays, Boxes, Smartphone, Mail,
  Gauge, Eye,
} from "lucide-react";

// Not indexed/crawled — deliberately unauthenticated (single-person internal
// reference, no external links to it), so keep it out of search results as
// a light courtesy without adding a login gate the owner didn't want.
export const metadata: Metadata = {
  title: "System Overview — OneLGU",
  robots: { index: false, follow: false },
};

function BentoCard({
  title,
  icon: Icon,
  children,
  span = "",
  accent = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  span?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-5 flex flex-col gap-3 ${span} ${
        accent
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-white border-border"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 shrink-0 ${accent ? "text-primary-foreground" : "text-primary"}`} />
        <h3 className={`text-sm font-bold font-sans ${accent ? "text-primary-foreground" : "text-foreground"}`}>
          {title}
        </h3>
      </div>
      <div className={`text-xs leading-relaxed font-sans ${accent ? "text-primary-foreground/85" : "text-foreground/70"}`}>
        {children}
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-[11px] font-semibold text-foreground/70 font-sans">
      {children}
    </span>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] font-bold tracking-widest uppercase text-primary font-sans">{eyebrow}</p>
      <h2 className="text-xl font-bold text-foreground font-sans mt-0.5">{title}</h2>
    </div>
  );
}

export default function SystemInfoPage() {
  return (
    <div className="min-h-screen bg-[#FAFDFB]">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-14 space-y-16">
        {/* ─── Hero ─── */}
        <div className="space-y-4">
          <p className="text-[11px] font-bold tracking-widest uppercase text-primary font-sans">Internal reference — not linked anywhere</p>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground">System Overview</h1>
          <p className="text-sm md:text-base text-foreground/60 max-w-2xl font-sans leading-relaxed">
            A running record of what OneLGU is, how it&apos;s built, and everything that&apos;s been added, fixed, or
            hardened since the first commit — the digital services portal for the Municipality of Dingras, Ilocos Norte.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Chip>Started July 2026</Chip>
            <Chip>28 commits</Chip>
            <Chip>388 tracked files</Chip>
            <Chip>4 user roles</Chip>
            <Chip>Next.js 16 · Supabase</Chip>
          </div>
        </div>

        {/* ─── Tech Stack ─── */}
        <section>
          <SectionHeading eyebrow="Foundation" title="Tech Stack" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <BentoCard title="Framework" icon={Layers} span="lg:col-span-2">
              Next.js 16 (App Router, Turbopack, Server Actions) · React 18 · TypeScript · deployed on Vercel with
              automatic GitHub-integration deploys on push to <code>master</code>.
            </BentoCard>
            <BentoCard title="Database & Backend" icon={Database} span="lg:col-span-2">
              Supabase (Postgres + Auth + Storage) — Row Level Security on every table, service-role admin client kept
              server-only, trigger-based profile auto-provisioning, SQL migrations in <code>supabase/migrations/</code>.
            </BentoCard>
            <BentoCard title="UI & Styling" icon={Palette}>
              Tailwind CSS, Radix UI primitives, shadcn-style component layer, Framer Motion for animation, Lucide +
              Phosphor + Untitled UI icon sets, Lenis for smooth scroll.
            </BentoCard>
            <BentoCard title="Validation" icon={Code2}>
              Zod schemas for every form and server action — shared rules (e.g. <code>strongPasswordSchema</code>)
              reused across register/reset/change-password so policy can&apos;t drift out of sync.
            </BentoCard>
            <BentoCard title="Data & Charts" icon={BarChart3}>
              TanStack Table for large sortable/filterable lists, Recharts for analytics dashboards, dnd-kit for
              drag-and-drop interactions.
            </BentoCard>
            <BentoCard title="Email" icon={Mail}>
              Resend — branded transactional email for OTP-based password recovery.
            </BentoCard>
            <BentoCard title="Security Services" icon={ShieldCheck} span="lg:col-span-2">
              Cloudflare Turnstile (CAPTCHA on login/register/forgot-password), Upstash Redis (durable, cross-instance
              rate limiting), Sentry (error monitoring, server + edge + browser) — all three wired to degrade to
              today&apos;s exact behavior when unconfigured, so nothing breaks while the free-tier accounts get set up.
            </BentoCard>
            <BentoCard title="Other" icon={Boxes}>
              PWA (service worker + manifest), QR code generation for certificate verification, Vercel Analytics +
              Speed Insights, cron-driven compliance reminders.
            </BentoCard>
          </div>
        </section>

        {/* ─── Portals & Roles ─── */}
        <section>
          <SectionHeading eyebrow="Who uses it" title="Portals &amp; Roles" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <BentoCard title="Resident" icon={Users} accent>
              Request certifications (barangay clearance, residency, indigency, business clearance, first-time
              job-seeker, scholarship), file complaints, track status, receive notifications, verify issued
              certificates via QR, manage profile + MFA, export/delete their own data.
            </BentoCard>
            <BentoCard title="Barangay Official" icon={Scale}>
              Review and act on certification requests + complaints for their own barangay only, submit monthly/
              financial/accomplishment/compliance reports, upload documents, manage barangay staff accounts, track
              their compliance status.
            </BentoCard>
            <BentoCard title="LGU Reviewer" icon={ClipboardList}>
              Municipal-level oversight across all barangays: review submissions, monitor compliance, view analytics
              and audit logs — read access without the account/settings management that&apos;s reserved for super admin.
            </BentoCard>
            <BentoCard title="Super Admin" icon={KeyRound}>
              Everything a Reviewer can do, plus: user &amp; account-request management, barangay CRUD, system settings
              (document/report/certification/complaint categories), and audit log export.
            </BentoCard>
          </div>
        </section>

        {/* ─── Core Features ─── */}
        <section>
          <SectionHeading eyebrow="What it does" title="Core Features" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <BentoCard title="Certification Lifecycle" icon={FileText}>
              submitted → verified → approved → generated → ready for pickup → released, with a public, no-login
              <code> /verify/[id]</code> page so anyone can confirm a released certificate is genuine.
            </BentoCard>
            <BentoCard title="Complaint &amp; Mediation" icon={Scale}>
              Residents file complaints against a subject/respondent; barangay assigns, schedules mediation
              (Lupon Tagapamayapa references), and resolves or closes the case.
            </BentoCard>
            <BentoCard title="Compliance Monitoring" icon={Gauge}>
              Barangay-level submission status, late-submission and missing-requirement tracking, cross-barangay
              rankings, historical trend view.
            </BentoCard>
            <BentoCard title="Analytics" icon={BarChart3}>
              Submissions, complaints, certifications, and compliance dashboards with per-barangay drill-down.
            </BentoCard>
            <BentoCard title="Announcements / Civic Bulletin" icon={Megaphone}>
              LGU-authored posts published to a public civic feed (certification guides, mediation info, livelihood
              programs, general notices).
            </BentoCard>
            <BentoCard title="Notifications" icon={Bell}>
              In-app bell with unread state, auto-fired on every status change so residents and staff don&apos;t have
              to poll for updates.
            </BentoCard>
            <BentoCard title="QR Verification" icon={QrCode}>
              Every released certificate gets a QR code + shareable link that resolves to a public authenticity check
              — type, barangay, and release date, no login required.
            </BentoCard>
            <BentoCard title="Data-Subject Rights" icon={Eye}>
              Export-my-data (JSON download of everything tied to the account) and delete-my-account, which anonymizes
              PII and bans the login rather than hard-deleting — government records-retention rules require keeping
              the underlying submission history.
            </BentoCard>
            <BentoCard title="PWA" icon={Smartphone}>
              Installable on mobile, service worker + manifest, offline-friendly shell.
            </BentoCard>
          </div>
        </section>

        {/* ─── Security & Hardening ─── */}
        <section>
          <SectionHeading eyebrow="Trust & safety" title="Security &amp; Hardening" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <BentoCard title="Access Control" icon={Lock} span="lg:col-span-2">
              3 independent layers — edge middleware (route-prefix check), page layout (<code>requireRole</code> /
              <code>requireSuperAdmin</code>), and Postgres RLS policies on every table — so a bug in any one layer
              doesn&apos;t expose data on its own. <code>lgu_reviewer</code> vs <code>super_admin</code> permissions
              were split so settings/user-management/audit-export are gated to super admin specifically.
            </BentoCard>
            <BentoCard title="Authentication" icon={KeyRound}>
              MFA (TOTP) for privileged roles, unified strong-password policy (min 8 + letter + number) across
              register/reset/change-password, CAPTCHA on all public auth entry points.
            </BentoCard>
            <BentoCard title="Content Security Policy" icon={ShieldCheck}>
              Per-request nonce + <code>strict-dynamic</code> instead of <code>unsafe-inline</code> for scripts, full
              security header set (HSTS, X-Frame-Options, Permissions-Policy, COOP/CORP).
            </BentoCard>
            <BentoCard title="Audit Trail" icon={ClipboardList}>
              Every sensitive action logged with actor, IP address, user agent, and before/after values — exportable
              as CSV by super admin.
            </BentoCard>
            <BentoCard title="Rate Limiting" icon={Gauge}>
              Per-IP limits on auth endpoints and select API routes, backed by Upstash Redis when configured
              (survives redeploys/multi-instance) with an in-memory fallback otherwise.
            </BentoCard>
            <BentoCard title="Fixed: silent account bypass" icon={Bug} span="lg:col-span-3">
              Found and fixed a real gap where the admin &quot;deactivate account&quot; toggle set
              <code> profiles.is_active = false</code> in the database, but nothing actually checked that flag —
              a deactivated (or newly deleted/anonymized) account&apos;s existing session, and any fresh login,
              kept working anyway. Now enforced centrally in <code>requireProfile()</code>.
            </BentoCard>
          </div>
        </section>

        {/* ─── Bug Fixes & Polish ─── */}
        <section>
          <SectionHeading eyebrow="Along the way" title="Notable Fixes &amp; Polish" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <BentoCard title="Sidebar redesign" icon={Sparkles}>
              Rebuilt the admin/staff sidebar around a collapsible-groups pattern, matching internal design language
              while keeping the brand green palette.
            </BentoCard>
            <BentoCard title="Avatar reliability" icon={Bug}>
              Removed a Dicebear (external API) avatar dependency everywhere it appeared — replaced with a local,
              zero-network initials avatar that can never fail to load.
            </BentoCard>
            <BentoCard title="Chart readability" icon={BarChart3}>
              The Daily Submissions chart was a stacked area chart with all three series in near-identical shades of
              green and no legend — switched to a grouped bar chart with distinct colors and a legend.
            </BentoCard>
            <BentoCard title="OTP entry UX" icon={Sparkles}>
              Every 6-digit code field (forgot-password, MFA setup, MFA challenge) now uses the same segmented
              &quot;123 - 456&quot; box input, and clears + refocuses automatically after a failed attempt.
            </BentoCard>
            <BentoCard title="Unbounded queries" icon={Bug}>
              LGU list pages (complaints, certifications, reports, documents, users, announcements) fetched every row
              with no limit — capped at 500–1,000 rows to bound worst-case load as data grows.
            </BentoCard>
            <BentoCard title="Marketing copy audit" icon={Eye}>
              Removed fabricated claims (an undefined &quot;L6 data protection&quot; label, a &quot;thousands of
              residents&quot; line with no real user base yet) in favor of accurate copy and a real Privacy Policy page.
            </BentoCard>
          </div>
        </section>

        {/* ─── Timeline ─── */}
        <section>
          <SectionHeading eyebrow="History" title="Build Timeline" />
          <div className="rounded-lg border border-border bg-white p-6 space-y-5">
            {[
              { date: "Jul 8, 2026", label: "Initial commit", detail: "Full-stack scaffold — Next.js App Router, Supabase schema, RBAC middleware, core auth/certification/complaint/report server actions." },
              { date: "Jul 19–21, 2026", label: "Portal build-out", detail: "Resident dashboard optimization, PWA support, SEO/structured data, Civic Bulletin." },
              { date: "Jul 22, 2026", label: "Analytics & polish", detail: "Vercel Web Analytics, live clock, LGU header components, loading skeletons across all portals." },
              { date: "Aug 7, 2026", label: "Security & a11y hardening pass", detail: "RBAC role split, enriched audit trail, QR certificate verification, nonce-based CSP, focus-trap modals, OTP consistency." },
              { date: "Aug 10, 2026", label: "Hardening pass 2", detail: "Data-subject rights (export/delete account), CAPTCHA, durable Upstash rate limiting, Sentry, is_active enforcement bug fix, this page." },
            ].map((item) => (
              <div key={item.label} className="flex gap-4">
                <div className="flex flex-col items-center pt-1">
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  <div className="w-px flex-1 bg-border mt-1" />
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <CalendarDays className="h-3 w-3 text-primary/70" />
                    <span className="text-[11px] font-bold text-primary/80 font-sans">{item.date}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground font-sans">{item.label}</p>
                  <p className="text-xs text-foreground/60 font-sans leading-relaxed mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="pt-6 border-t border-border flex items-center gap-2 text-[11px] text-foreground/40 font-sans">
          <GitCommit className="h-3 w-3" />
          <span>Latest tracked change reflected here — update this page as the system evolves.</span>
        </footer>
      </div>
    </div>
  );
}
