# OneLGU — Fixes Checklist

Derived from [AUDIT-REPORT.md](AUDIT-REPORT.md) (2026-07-26). Check items off as they're done.

**Legend:** [CODE] = fixable in-code now · [OWNER] = needs you (external account / decision / dashboard) · [BOTH] = both

---

## Critical — before ANY public exposure

- [ ] [OWNER] Verify a real email **sending domain** in Resend, then re-enable email confirmation (`mailer_autoconfirm=false`) — currently testing-mode, only sends to account owner
- [x] [CODE] Add **privacy notice + consent checkbox** at registration (RA 10173) — required checkbox on `/register` (opens the policy as an in-page modal, doesn't navigate away and lose the form), enforced server-side too (`register()` rejects if `consent !== "on"`), consent timestamp logged to `audit_logs` metadata as evidence
- [ ] [OWNER] Confirm **Vercel production env** points to the new Supabase project (`usvcpgohfhaqngcgsleq`) and rotate any keys shared during setup
- [x] [CODE] Add a **Privacy Policy page** — `/privacy-policy`, real RA 10173 content (what's collected, why, who sees it, retention, your rights), linked from the homepage footer and the register-page consent checkbox (as a modal)

---

## High

- [x] [CODE] Add **CAPTCHA** (Cloudflare Turnstile) to login, register, forgot-password — widget + token wiring done (`TurnstileWidget`, forwards `captchaToken` to the relevant `supabase.auth.*` calls). **[OWNER] step still needed:** create a free Turnstile site at Cloudflare, put the site key in `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, and paste the secret key into Supabase Dashboard → Authentication → Settings → Attack Protection (Supabase verifies the token, not our code). Until then the widget just doesn't render — nothing else changes.
- [x] [CODE] Move **rate limiting to a durable store** (Upstash Redis) — `lib/rate-limit.ts` uses Upstash's sliding-window limiter when `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are set, falls back to the original in-memory limiter otherwise; now also covers `/api/account/export`. **[OWNER] step still needed:** free Upstash Redis database, paste the two env vars.
- [x] [CODE] Separate **`lgu_reviewer` vs `super_admin`** permissions — gated `/lgu/settings/*`, `/lgu/users/*`, barangay CRUD, audit export to super_admin only via `requireSuperAdmin()`; sidebar hides those nav groups for lgu_reviewer
- [ ] [OWNER] Track & patch **dependency CVEs** (12 high, in Next's bundled `sharp`/`postcss`) — upgrade when Next.js ships a fixed 16.x
- [x] [CODE] Enrich **audit trail** — `logAction()` now auto-captures `ip_address` (own column) and `user_agent` from the request via `next/headers`, and accepts `oldValue`/`newValue` (stored in the existing `metadata` jsonb, no migration needed) — wired into certification/complaint/report status-change actions

---

## Medium

- [x] [CODE] Unify **password rules** — register/reset/change-password now share `strongPasswordSchema` (min 8 + letter + number); login intentionally stays "non-empty only" so existing accounts created under the old rule aren't locked out
- [x] [CODE] Add **caps on unbounded LGU list queries** — `complaint-list`, `certification-list`, `report-list`, `document-list`, `user-list`, `announcement-list` now hard-cap at 500–1000 rows instead of fetching all rows unbounded. (True server-driven `range()` pagination with server-side search/filter is a larger UX rework — not done, flagged for later if needed)
- [x] [CODE] Add **data-subject rights** — "export my data" (`/api/account/export`, JSON download of profile + certifications + complaints + reports + notifications, RLS-scoped) and "delete my account" (Profile page → anonymizes name/email/phone/address, deactivates the account, bans the auth user, all via `deleteMyAccount()`). Anonymize-and-keep rather than hard-delete or `deleted_at` soft-delete: `certification_requests`/`complaints`/`reports`/`audit_logs` all reference `profiles(id)` with the default `ON DELETE NO ACTION`, so a hard delete fails outright for anyone with submission history — and government records-retention rules require keeping the transactional record anyway. Super admins are excluded from self-deletion (would lock the municipality out of settings/user management).
- [x] [CODE] Wire **error monitoring** (Sentry) — `src/instrumentation.ts` (server/edge) + `src/instrumentation-client.ts` (browser), `next.config.mjs` wrapped with `withSentryConfig`. **[OWNER] step still needed:** free Sentry project, paste `NEXT_PUBLIC_SENTRY_DSN`. Source-mapped stack traces need `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` too, but error monitoring itself works without them. Until the DSN is set, `Sentry.init()` never runs.
- [x] [CODE] Add **QR verification** for released certificates — public `/verify/[id]` page (no login required) confirms a certificate's type/barangay/release date against the DB; resident's certificate detail page shows the QR + shareable link once released
- [x] [CODE] Server-side **phone number** validation (PH mobile regex) in `profile.schema.ts`
- [x] [CODE] Add **length caps** on search/filter inputs (`maxLength={100}` across all search boxes)
- [x] [CODE] Add **rate limits + Cache-Control** on `/api/barangays` (60/min, public-cacheable), `/api/notifications` (30/min, private/no-store), `/api/audit-logs/export` (5/min, private/no-store, also restricted to super_admin only)

---

## Low / Polish

- [x] [CODE] **Dark mode** — removed `next-themes` (it had no `<ThemeProvider>` and no toggle anywhere — completely dead code); app is intentionally light-mode only
- [x] [CODE] Prune large unused images from `public/` — removed `dingras-munihall.png` (2.7MB duplicate of `dingras-hall.png`), `latest_logo.png` (835KB), `icons/image.png` (402KB), all confirmed unreferenced
- [x] [CODE] **Accessibility pass** — added real focus-trap + focus-restore to `ConfirmDialog` and `MfaSetupModal` (Tab no longer escapes the modal); `role="alert"/"status"` + `aria-live` on all 14 inline success/error banners and the notification bell's unread state; fixed a very-low-contrast timestamp (`text-foreground/35` → `/55`) in the notification dropdown; audited for duplicate `<h1>`s — none found, all multi-match files were mutually-exclusive loading/success/error branches
- [x] [CODE] Nonce-based **CSP** — `script-src` now uses a per-request `'nonce-<random>' 'strict-dynamic'` generated in `proxy.ts` instead of `'unsafe-inline'`; the one inline `<script>` (JSON-LD) reads the nonce via `headers()`. `style-src` keeps `'unsafe-inline'` (too many inline styles across the codebase to nonce in this pass)
- [ ] [OWNER] Document **backup cadence** + run a restore drill (Supabase platform backups)
- [ ] [OWNER] Run **k6 load test** before launch
- [ ] [OWNER] Run **Lighthouse / axe** a11y + perf pass on the deployed URL
- [x] [CODE] Re-scan for any leftover fake marketing copy — removed "encrypted under L6 data protection policies" (undefined/fabricated claim, replaced with a real RA 10173 reference) and "Join thousands of residents" (false — no real user base yet)

---

## Also fixed this pass (not on the original list)

- [x] [CODE] Sidebar redesigned to match the pdn Electron app's collapsible-groups pattern (kept the green palette); removed the collapse/expand toggle per request — sidebar is now fixed-width
- [x] [CODE] Dicebear avatar dependency removed everywhere (sidebar, header dropdown, barangay header/profile, resident dashboard, barangay directory) — replaced with a local `InitialsAvatar` component (colored initials, zero network dependency, can't fail to load)
- [x] [CODE] Daily Submissions chart — was a stacked area chart with all 3 series in near-identical shades of green and no legend; switched to a grouped bar chart with distinct colors (green/blue/amber) + legend + Y-axis
- [x] [CODE] Forgot-password OTP field replaced with a proper 6-box segmented input (`OtpInput` component) — auto-advance, backspace-to-previous, arrow-key navigation, paste-to-fill; then applied the same component to `MfaSetupModal`, `MfaSetupForm`, and `MfaChallengeForm` too so every 6-digit code field in the app matches, grouped as "123 - 456", and clears + refocuses automatically after a failed attempt
- [x] [CODE] **Fixed `is_active` not actually being enforced** — the admin "deactivate account" toggle and the new delete-account flow both set `profiles.is_active = false`, but `requireProfile()` never checked it, so a deactivated/deleted user's existing session (and any fresh login) kept working. Now enforced in `requireProfile()`: false → signed out, redirected to login.

---

## Already Done (for reference — no action needed)

- [x] RLS on all 8 tables + storage (22 policies)
- [x] 3-layer RBAC (proxy + layout + RLS) — verified live
- [x] MFA (TOTP) for privileged roles
- [x] Security headers (CSP/HSTS/X-Frame/etc.) + `poweredByHeader:false`
- [x] IDOR fixed (notifications derive identity server-side)
- [x] Privilege-escalation fixed (profiles INSERT/UPDATE) — verified live
- [x] Public bucket listing closed (reports + attachments)
- [x] Forgeable audit_logs policy removed
- [x] `getUser()` (verified JWT) everywhere, incl. core session helper
- [x] Server-side file upload validation (mime/size/random names)
- [x] Centralized audit logging (service-role)
- [x] Auto-notifications on status change (in-app)
- [x] Forgot-password OTP flow + branded Resend email
- [x] Account Requests approval workflow
- [x] Per-barangay analytics drill-down
- [x] Audit log CSV export
- [x] Automated compliance reminders (cron)
- [x] 62 loading skeletons across all portals
- [x] Secrets not in git; service-role server-only; anon-key RLS-protected

---

**Remaining [CODE] items:** none. Everything left is [OWNER]-only — either genuinely can't be done without your access (Resend domain, Vercel env, CVE tracking, backup drill, load test), or is code that's already written and inert until you paste in a free-tier key:

| Feature | Code status | What you still need to do |
|---|---|---|
| CAPTCHA (Turnstile) | ✅ wired | Create free Turnstile site → `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in env, secret key into Supabase Dashboard → Auth → Attack Protection |
| Durable rate limiting (Upstash) | ✅ wired | Create free Upstash Redis DB → `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` in env |
| Error monitoring (Sentry) | ✅ wired | Create free Sentry project → `NEXT_PUBLIC_SENTRY_DSN` in env |

None of these three break or change behavior while unconfigured — each one is a no-op until its env var(s) are set.
