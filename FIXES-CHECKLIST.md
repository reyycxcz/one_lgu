# OneLGU — Fixes Checklist

Derived from [AUDIT-REPORT.md](AUDIT-REPORT.md) (2026-07-26). Check items off as they're done.

**Legend:** [CODE] = fixable in-code now · [OWNER] = needs you (external account / decision / dashboard) · [BOTH] = both

---

## Critical — before ANY public exposure

- [ ] [OWNER] Verify a real email **sending domain** in Resend, then re-enable email confirmation (`mailer_autoconfirm=false`) — currently testing-mode, only sends to account owner
- [ ] [BOTH] Add **privacy notice + consent checkbox** at registration (RA 10173) — I build the UI/validation; you provide the privacy policy text
- [ ] [OWNER] Confirm **Vercel production env** points to the new Supabase project (`usvcpgohfhaqngcgsleq`) and rotate any keys shared during setup
- [ ] [OWNER] Add a **Privacy Policy page** (footer link currently `#`)

---

## High

- [ ] [BOTH] Add **CAPTCHA** (hCaptcha / Cloudflare Turnstile) to login, register, forgot-password — you create the account + keys; I wire it
- [ ] [BOTH] Move **rate limiting to a durable store** (Upstash Redis) and extend to `/api/*`, uploads, exports — you make the Upstash account; I implement
- [x] [CODE] Separate **`lgu_reviewer` vs `super_admin`** permissions — gated `/lgu/settings/*`, `/lgu/users/*`, barangay CRUD, audit export to super_admin only via `requireSuperAdmin()`; sidebar hides those nav groups for lgu_reviewer
- [ ] [OWNER] Track & patch **dependency CVEs** (12 high, in Next's bundled `sharp`/`postcss`) — upgrade when Next.js ships a fixed 16.x
- [x] [CODE] Enrich **audit trail** — `logAction()` now auto-captures `ip_address` (own column) and `user_agent` from the request via `next/headers`, and accepts `oldValue`/`newValue` (stored in the existing `metadata` jsonb, no migration needed) — wired into certification/complaint/report status-change actions

---

## Medium

- [ ] [OWNER] Enable **leaked-password protection** (HaveIBeenPwned) — needs Supabase plan upgrade (was 402)
- [x] [CODE] Unify **password rules** — register/reset/change-password now share `strongPasswordSchema` (min 8 + letter + number); login intentionally stays "non-empty only" so existing accounts created under the old rule aren't locked out
- [x] [CODE] Add **caps on unbounded LGU list queries** — `complaint-list`, `certification-list`, `report-list`, `document-list`, `user-list`, `announcement-list` now hard-cap at 500–1000 rows instead of fetching all rows unbounded. (True server-driven `range()` pagination with server-side search/filter is a larger UX rework — not done, flagged for later if needed)
- [ ] [CODE] Add **`deleted_at` soft-delete** to core records + RLS exclusion (RA 10173 retention) — **N/A for now**: there is no delete functionality anywhere in the app yet (no `.delete()` call exists), so there's nothing to soft-delete. Add this when an actual delete feature is built.
- [ ] [BOTH] Add **data-subject rights** — "export my data" / "delete my account" (DSAR)
- [ ] [BOTH] Wire **error monitoring** (Sentry) + uptime/alerting — you make the Sentry account; I integrate
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
- [x] [CODE] Forgot-password OTP field replaced with a proper 6-box segmented input (`OtpInput` component) — auto-advance, backspace-to-previous, arrow-key navigation, paste-to-fill

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

**Remaining [CODE] items:** none outstanding from the original list. Everything left requires an external account, a policy decision, or infrastructure you control (see [OWNER]/[BOTH] items above).
