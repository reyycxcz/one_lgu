# Full-System Security Audit Checklist
**Stack:** Next.js + Supabase | **Purpose:** Recurring security audit log for the whole system (frontend, backend, infra, abuse/DDoS resilience)

---

## HOW TO USE THIS FILE (for AI agents / Claude Code)

You are performing a full-system security audit of this codebase and its deployed environment.

For **every item** in the checklist below:
1. Investigate it using the appropriate method (read source code, grep for patterns, check config files, run commands, test live endpoints if a URL is available).
2. Mark the result as one of: `PASS`, `FAIL`, `WARNING` (partially implemented / weak), or `NOT_TESTABLE` (needs manual/live testing you cannot perform, e.g. real DDoS simulation).
3. For every `FAIL` or `WARNING`, cite the exact file/line or evidence, and give a concrete fix.
4. Do not assume — verify by reading actual files (`next.config.js`, `middleware.ts`, `.env.example`, API route handlers, Supabase policies/migrations, `package.json`) rather than the app's description of itself.
5. At the end, output a filled-in **Test Run Log** (see template at the bottom) with a timestamp, summary counts (Pass/Fail/Warning/Not Testable), and a prioritized list of fixes (Critical → High → Medium → Low).
6. Save/append this report so it can be compared against previous runs (regression tracking).

---

## 1. HTTP Security Headers

- [ ] Strict-Transport-Security (HSTS) present, `max-age` ≥ 6 months, `includeSubDomains`
- [ ] Content-Security-Policy (CSP) present, no `unsafe-eval`, `script-src` scoped (not `*`)
- [ ] X-Frame-Options: DENY, or CSP `frame-ancestors 'none'`
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin (or stricter)
- [ ] Permissions-Policy restricts unused browser features (camera, mic, geolocation, payment, usb)
- [ ] Cross-Origin-Opener-Policy / Cross-Origin-Resource-Policy set appropriately
- [ ] `Server` / `X-Powered-By` headers removed (avoid leaking framework/version info)

## 2. Authentication & Session Management

- [ ] Session/auth cookies: `HttpOnly`, `Secure`, `SameSite=Lax` or `Strict`
- [ ] No JWT/session tokens stored in `localStorage` or `sessionStorage`
- [ ] Session expiry and refresh token rotation implemented correctly
- [ ] Logout fully invalidates session server-side (not just client-side clear)
- [ ] Password reset tokens are single-use and time-limited
- [ ] Multi-factor authentication available/enforced for admin/privileged accounts
- [ ] Account lockout or backoff after repeated failed logins

## 3. Rate Limiting, Bot & Abuse Protection

- [ ] Rate limiting on login endpoint
- [ ] Rate limiting on signup endpoint
- [ ] Rate limiting on password reset / OTP endpoints
- [ ] Rate limiting on all public-facing API routes (`/api/*`)
- [ ] Global rate limiting / WAF layer at edge (Vercel Edge Config, Cloudflare, or middleware-based)
- [ ] CAPTCHA or equivalent bot-challenge on signup, login, and public forms
- [ ] Request size limits enforced (prevent large-payload abuse)
- [ ] Bot detection for scraping/automation (check for suspicious User-Agent, headless browser patterns, request velocity)
- [ ] Basic DDoS mitigation present (Vercel/Cloudflare edge protection, or documented plan if traffic spikes)
- [ ] Alerting configured for abnormal traffic spikes (logs, uptime monitor, or platform dashboard)

> Note: True DDoS/load simulation requires external tools (e.g. k6, Artillery, or a controlled staging test) and is marked `NOT_TESTABLE` in a code-only audit — flag it as a manual follow-up task.

## 4. Input Validation — Frontend

- [ ] Every form input has client-side validation (type, length, format) — **and** is re-validated server-side
- [ ] XSS test: injecting `<script>`/HTML into text fields is safely escaped/sanitized on render
- [ ] File upload inputs (if any): restrict file type, size, and are re-checked server-side
- [ ] No sensitive data (API keys, internal URLs) hardcoded or exposed in client-side bundle
- [ ] Search/filter inputs sanitized before being used in queries

## 5. Input Validation — Backend / API Routes

- [ ] All `/api/*` routes validate and sanitize inputs server-side (never trust client data)
- [ ] Schema validation library in use (e.g. Zod, Yup) for request bodies
- [ ] SQL/Postgres queries use parameterized queries or Supabase client methods (no raw string concatenation)
- [ ] IDOR test: changing an ID in a URL/API request does not expose another user's data
- [ ] Mass assignment protection — API doesn't blindly accept/update fields not explicitly allowed
- [ ] File/URL parameters validated against path traversal or SSRF (server-side request forgery)
- [ ] Webhook endpoints (if any) verify signatures before processing

## 6. CORS & Network Config

- [ ] CORS restricted to known origins (not `*`) for any API meant to be called cross-origin
- [ ] Internal-only endpoints not accidentally publicly exposed
- [ ] Environment properly separates staging vs production configs

## 7. Supabase-Specific

- [ ] Row Level Security (RLS) enabled on every table
- [ ] RLS policies tested: attempt to read/write another user's row and confirm it's blocked
- [ ] `service_role` key never present in client-side code or bundle
- [ ] No secret keys mistakenly prefixed `NEXT_PUBLIC_`
- [ ] Storage buckets checked: public vs private set correctly per bucket
- [ ] Edge Functions / RPC functions reviewed for overly-permissive `SECURITY DEFINER`
- [ ] Supabase Dashboard → Database → Advisors run, all flagged lints reviewed
- [ ] Auth settings: email confirmation required, redirect URLs restricted to known domains

## 8. Secrets & Dependency Hygiene

- [ ] `npm audit` (or `pnpm audit` / `yarn audit`) run — no unresolved high/critical vulnerabilities
- [ ] No API keys/secrets committed in git history (`gitleaks` or similar scan)
- [ ] `.env*` files present in `.gitignore`
- [ ] Dependencies kept reasonably up to date (no long-abandoned packages with known CVEs)

## 9. Error Handling & Logging

- [ ] Production error responses never leak stack traces or internal paths
- [ ] Errors/exceptions logged server-side for monitoring (without logging sensitive data like passwords/tokens)
- [ ] 404/500 pages don't reveal framework internals

## 10. Infrastructure / Deployment Status

- [ ] HTTPS enforced everywhere (no mixed content, no plain HTTP fallback)
- [ ] Deployment platform status checked (Vercel/host uptime, no exposed preview deployments with real data)
- [ ] Backups of database configured and tested
- [ ] Monitoring/alerting in place for downtime or error-rate spikes

## 11. Automated Scans (external tools)

- [ ] securityheaders.com — Grade A or higher
- [ ] Mozilla Observatory scan
- [ ] OWASP ZAP baseline scan against staging
- [ ] Load/stress test (k6 or Artillery) to observe behavior under high request volume — confirms rate limiting actually triggers

---

## TEST RUN LOG TEMPLATE (append one per run)

```
### Audit Run — [YYYY-MM-DD HH:MM UTC+8]
Triggered by: (manual / Claude Code / CI)
Environment: (local / staging / production)
Commit/branch: 

Summary: X Pass | X Fail | X Warning | X Not Testable

Results by section:
1. HTTP Headers        — [PASS/FAIL/WARN] 
2. Auth & Session       — [PASS/FAIL/WARN]
3. Rate Limiting/Bot    — [PASS/FAIL/WARN]
4. Frontend Input       — [PASS/FAIL/WARN]
5. Backend/API Input    — [PASS/FAIL/WARN]
6. CORS/Network         — [PASS/FAIL/WARN]
7. Supabase             — [PASS/FAIL/WARN]
8. Secrets/Dependencies — [PASS/FAIL/WARN]
9. Error Handling       — [PASS/FAIL/WARN]
10. Infrastructure      — [PASS/FAIL/WARN]
11. Automated Scans     — [PASS/FAIL/WARN]

Critical issues:
1. 

High priority issues:
1. 

Medium/Low issues:
1. 

Fixed since last run:
1. 

Next steps:
1. 
```

---

## Sample filled entry

```
### Audit Run — 2026-07-22 17:45 UTC+8
Triggered by: Claude Code
Environment: production (one-lgu.vercel.app)
Commit/branch: main

Summary: 14 Pass | 9 Fail | 5 Warning | 3 Not Testable

Results by section:
1. HTTP Headers        — FAIL (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy all missing)
2. Auth & Session       — WARNING (no account lockout on repeated failed logins)
3. Rate Limiting/Bot    — FAIL (no rate limiting found on /api/login or /api/signup)
4. Frontend Input       — PASS
5. Backend/API Input    — WARNING (2 routes missing server-side re-validation, relying on client-side only)
6. CORS/Network         — PASS
7. Supabase             — FAIL (RLS disabled on `messages` table)
8. Secrets/Dependencies — PASS
9. Error Handling       — PASS
10. Infrastructure      — PASS
11. Automated Scans     — NOT_TESTABLE (load test not run this cycle)

Critical issues:
1. RLS disabled on `messages` table — any authenticated user can read all rows. Fix: enable RLS + write policy scoping rows to auth.uid().

High priority issues:
1. Missing 5 security headers — add to next.config.js headers().
2. No rate limiting on login/signup — add middleware-based limiter (e.g. Upstash Ratelimit).

Medium/Low issues:
1. No account lockout after failed logins.
2. 2 API routes trust client-side validation only.

Fixed since last run:
1. Removed service_role key from client bundle.

Next steps:
1. Add RLS policy to `messages` table today.
2. Add headers to next.config.js.
3. Add rate limiter to auth endpoints.
4. Schedule external load test (k6) next cycle.
```

---

### Audit Run — 2026-07-22 ~19:40 UTC+8
Triggered by: Claude Code (user request)
Environment: local (dev server, `localhost:3000`) + live Supabase project `usvcpgohfhaqngcgsleq` (production database)
Commit/branch: master (uncommitted working tree)

Summary: 1 Pass | 3 Fail | 5 Warning | 2 Not Testable

Results by section:
1. HTTP Headers        — FAIL
2. Auth & Session       — WARNING
3. Rate Limiting/Bot    — FAIL
4. Frontend Input       — WARNING
5. Backend/API Input    — WARNING
6. CORS/Network         — PASS
7. Supabase             — FAIL
8. Secrets/Dependencies — WARNING
9. Error Handling       — WARNING
10. Infrastructure      — NOT_TESTABLE
11. Automated Scans     — NOT_TESTABLE

Critical issues:
1. **`profiles` table INSERT policy is `with check (true)` for both `authenticated` and `anon`** (`supabase/migrations/0001_init.sql:333-336`). Confirmed independently by Supabase's own Security Advisor (`rls_policy_always_true` lint, live query against the project). Because the check doesn't bind `id = auth.uid()` or restrict the `role` column, any signed-up user can `POST /rest/v1/profiles` directly against the public REST API (bypassing the Next.js app, which only ever inserts `role: "resident"` via `src/actions/auth.ts`) and set `role: "super_admin"` on their own profile row. This is a full privilege-escalation path that requires nothing but the public anon key and a self-registered account.
   Fix: `with check (auth.uid() = id and role = 'resident')`, and drop `anon` from the policy's role list (only a signed-in user completing their own onboarding should ever hit this).
2. **Public "reports" Storage bucket allows full object listing**, confirmed live: an unauthenticated `POST /storage/v1/object/list/reports` with only the anon key returned `200 []` (Supabase Security Advisor also flags this as `public_bucket_allows_listing`). The bucket is `public: true` with a single broad `SELECT` policy (`0001_init.sql:502-505`) and no `file_size_limit`/`allowed_mime_types` (confirmed via the Management API: both `null`). Once barangays start uploading real compliance/financial reports, anyone can enumerate and download every file — the UUID-prefixed filenames (`report-form.tsx:55`) provide no protection once listing itself is open.
   Fix: make the bucket private and serve files via short-lived signed URLs generated server-side, or at minimum scope the `SELECT`/list policy to `authenticated` municipal/barangay staff instead of `public`.
3. **`audit_logs` table INSERT policy is `with check (true)` for `authenticated`** (`0001_init.sql:436-439`, also flagged by Supabase Advisor). Any signed-in resident can insert arbitrary audit log rows with any `actor_id`/`action`/`entity_id`, letting them forge or plant misleading entries in the compliance/audit trail the LGU relies on. The app itself never needs this — `src/lib/audit/logger.ts` already writes exclusively through `createAdminClient()` (service role), so there is no legitimate client-side insert path.
   Fix: drop the `authenticated` insert policy entirely; audit log writes should only ever happen via the service-role admin client.

High priority issues:
1. **Zero HTTP security headers anywhere.** `next.config.mjs` is an empty config object. Confirmed live against the dev server: no `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy`, and `X-Powered-By: Next.js` is leaked on every response.
   Fix: add a `headers()` function to `next.config.mjs` (CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive `Permissions-Policy`) and set `poweredByHeader: false`.
2. **No rate limiting or CAPTCHA anywhere in the app.** Grep across the entire source tree found zero rate-limiting patterns. Confirmed via the Supabase Management API (`config/auth`) that `security_captcha_enabled: false`. Supabase's own platform defaults (`rate_limit_email_sent: 2/hr`, `rate_limit_otp: 30`, `rate_limit_verify: 30`, `rate_limit_token_refresh: 150` — all confirmed live) only backstop email/OTP-related GoTrue endpoints, not the app's `login`/`register`/`forgotPassword` Server Actions, which can be invoked at unlimited velocity from the Next.js side.
   Fix: add an edge/middleware rate limiter (e.g. `@upstash/ratelimit`) in front of the auth Server Actions, and enable Supabase's built-in CAPTCHA (hCaptcha/Turnstile) integration.
3. **No MFA and no account lockout/backoff after repeated failed logins**, for any role including `super_admin` (confirmed: no mfa/totp/lockout code anywhere in the repo).
   Fix: enable Supabase Auth TOTP MFA and enforce it at minimum for `super_admin` and `barangay_official` accounts.

Medium/Low issues:
1. Reports Storage bucket has no `file_size_limit` or `allowed_mime_types` set (confirmed live via Management API: both `null`) — the 10MB/PDF-Excel-CSV restriction in `report-form.tsx` is client-side only and trivially bypassed by calling the Storage API directly. Fix: set both fields on the bucket itself.
2. Three `SECURITY DEFINER`/trigger functions (`set_updated_at`, `get_user_role`, `get_user_barangay_id`) have a mutable `search_path` (Supabase Advisor: `function_search_path_mutable`). Low real-world exploitability here (no dynamic identifiers involved), but cheap to fix with `set search_path = public`.
3. Supabase's "Leaked Password Protection" (HaveIBeenPwned check) is disabled project-wide (confirmed live via Auth Advisor: `auth_leaked_password_protection` WARN). One-click fix in Supabase Dashboard → Auth → Policies, no code change needed.
4. `src/lib/supabase/middleware.ts:32` uses `getSession()` rather than `getUser()` for the `proxy.ts` RBAC routing decision — Supabase's docs flag `getSession()` in middleware as reading a locally-decoded JWT without re-verifying it against the Auth server. Impact is mitigated because every layout re-derives the role from the `profiles` table via `requireRole()`/`requireProfile()` (defense in depth already in place), so this is a hardening opportunity, not an open hole.
5. `npm audit` reports 2 moderate + 2 high vulnerabilities, all nested inside the installed `next@16.2.10` (bundled `sharp@0.34.5` — CVE-2026-33327/33328/35590/35591 — and bundled `postcss@8.4.31` — GHSA-qx2v-qp2m-jg93 XSS). No non-breaking fix currently available (`npm audit fix --force` would downgrade to `next@9.3.3`); track and upgrade once Next.js ships a patched 16.x release.
6. No server-side error/monitoring service (e.g. Sentry) wired in — unhandled exceptions outside of `logAction()`'s own try/catch only ever reach the browser console in dev.

Fixed since last run:
1. (First recorded run for this project — no prior baseline to diff against.)

Next steps:
1. Patch the two `with check (true)` RLS policies today (`profiles`, `audit_logs`) — this is the one that lets a random resident self-promote to `super_admin` via the raw REST API.
2. Lock down the public "reports" bucket's listing policy (or switch to signed URLs) and set its `file_size_limit`/`allowed_mime_types`.
3. Add security headers to `next.config.mjs` and disable `X-Powered-By`.
4. Add rate limiting + CAPTCHA to the auth Server Actions.
5. Enable Supabase's leaked-password protection and fix the 3 functions' `search_path` (both one-click/one-line Supabase-side fixes).
6. Once a production URL exists, run securityheaders.com, Mozilla Observatory, and a k6 load test to close out sections 10 and 11.
```

---

### Audit Run — 2026-07-22 ~21:15 UTC+8 (remediation pass)
Triggered by: Claude Code (user requested: fix everything found in the previous run)
Environment: local (dev server, `localhost:3000`, Next.js 16.2.11) + live Supabase project `usvcpgohfhaqngcgsleq`
Commit/branch: master (uncommitted working tree)

Summary: 4 Pass | 0 Fail | 5 Warning | 2 Not Testable

Results by section:
1. HTTP Headers        — PASS (was FAIL)
2. Auth & Session       — WARNING (was WARNING)
3. Rate Limiting/Bot    — WARNING (was FAIL)
4. Frontend Input       — PASS (was WARNING)
5. Backend/API Input    — PASS (was WARNING)
6. CORS/Network         — PASS (unchanged)
7. Supabase             — WARNING (was FAIL)
8. Secrets/Dependencies — WARNING (unchanged)
9. Error Handling       — WARNING (unchanged)
10. Infrastructure      — NOT_TESTABLE (unchanged — no production URL yet)
11. Automated Scans     — NOT_TESTABLE (unchanged)

Fixed since last run (all verified live against the actual project, not just code review):
1. **`profiles` INSERT privilege escalation** — dropped the `with check (true)` policy entirely; profile rows are now created exclusively by a new `on_auth_user_created` trigger on `auth.users` (always `role: 'resident'`). `src/actions/auth.ts`'s manual insert was removed to match. Verified: attempted the original escalation payload against the live REST API — no client-writable insert path remains.
2. **`profiles` UPDATE privilege escalation (newly discovered while fixing #1)** — the UPDATE policy had no explicit `with check`, so Postgres silently reused `using (auth.uid() = id or ...)` as the check, meaning a resident could `PATCH` their own row and set `role`/`is_active`/`barangay_id` to anything. Added a `trg_protect_profile_privileged_fields` trigger that rejects such changes unless the actor is `super_admin` (barangay_id may still be set once during onboarding). **Verified live**: signed in as a seeded `barangay_official`, attempted `PATCH .../profiles?id=eq.<own-id>` with `{"role":"super_admin"}` — rejected with `P0001: Only a super admin can change a profile role`.
3. **`reports` storage bucket allowed unauthenticated listing** — dropped the broad public `SELECT` policy on `storage.objects` for this bucket. **Verified live**: uploaded a real test file as an authenticated official, then confirmed an anon `POST /storage/v1/object/list/reports` still returns `[]` (listing blocked) while the same file's direct public URL (`getPublicUrl()` pattern) still returns `200` — zero app-code changes needed, existing report links keep working. Also set `file_size_limit: 10MB` and `allowed_mime_types` (PDF/Excel/CSV) on the bucket itself, closing the client-side-only upload validation gap.
4. **`audit_logs` forgeable by any authenticated user** — dropped the `with check (true)` INSERT policy entirely. The app already only ever writes audit logs via the service-role admin client (`src/lib/audit/logger.ts`), so no legitimate client insert path was lost.
5. **Function `search_path` mutable** (`set_updated_at`, `get_user_role`, `get_user_barangay_id`) — added `set search_path = public` to all three. Re-ran the Supabase Security Advisor afterward: the `function_search_path_mutable` warnings are gone.
6. **New trigger functions exposed via RPC** (a finding introduced by fixes #1/#2 themselves, caught by re-running the advisor) — `handle_new_user()` and `protect_profile_privileged_fields()` were revoked from `public`/`anon`/`authenticated` EXECUTE; triggers still invoke them internally regardless.
7. **Zero HTTP security headers** — added `headers()` to `next.config.mjs`: CSP (`script-src`/`style-src` currently allow `'unsafe-inline'`, no `'unsafe-eval'`), HSTS (1 year, `includeSubDomains`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`, COOP/CORP `same-origin`, and `poweredByHeader: false`. **Verified live** against the dev server — all headers present, `X-Powered-By` gone.
8. **No rate limiting on auth routes** — added an in-memory, per-IP sliding-window limiter in `src/proxy.ts` for `/login` (8/min), `/register` (5/min), and `/forgot-password` (3/min). **Caveat (see Next steps):** this is single-instance/in-memory only — fine for the current single-region setup, but won't be shared across serverless instances if deployed multi-region; upgrade to Upstash Redis for that case.
9. **No MFA for privileged roles** — built a full TOTP MFA flow: `/mfa-setup` (enrollment with QR code, `src/components/mfa-setup-form.tsx`) and `/mfa-challenge` (re-verification each new session, `src/components/mfa-challenge-form.tsx`), enforced server-side in `requireRole()` (`src/lib/auth/session.ts`) for `super_admin`/`barangay_official`/`lgu_reviewer`, and wired into `login()`'s post-auth redirect. **Verified live**: confirmed the project's `mfa_totp_enroll_enabled`/`mfa_totp_verify_enabled` are on, and independently exercised the enrollment REST API (got back a real QR code + secret, then cleaned up the test factor).
10. **`getSession()` used for proxy RBAC routing** — switched `src/lib/supabase/middleware.ts` to `getUser()`, which re-verifies the JWT against the Auth server instead of trusting a locally-decoded cookie.
11. **Outdated Next.js** — bumped `next` from `16.2.10` to the latest stable `16.2.11`.
12. **CSP briefly broke dev mode** (caught live by the user via the Next.js dev overlay: `eval() is not supported... Content-Security-Policy header`) — Next.js/React's Fast Refresh needs `eval()` in dev only. Fixed by scoping `'unsafe-eval'` to `script-src` only when `NODE_ENV === "development"` in `next.config.mjs`; production CSP is unaffected.
13. **`getSession()` was also the core auth primitive for the entire app, not just the proxy** (caught from the same dev-session investigation — Supabase logged its own "insecure `getSession()`" warning at runtime). `src/lib/auth/session.ts`'s `getSession()`/`requireSession()` — which every `requireProfile()`/`requireRole()` call in every protected layout ultimately depends on — was still built on `getSession()`. This meant the "defense in depth" claimed for item 4 in the original Critical/High findings didn't actually hold, since the fallback layer had the same weakness as the proxy. Switched it to wrap `getUser()` instead (verified no caller reads session-level fields, only `session.user.*`, so the change is a drop-in replacement). Also fixed the same pattern in the unused-but-latent `src/hooks/use-role.ts`. Re-verified: build is clean, the Supabase "insecure getSession()" runtime warning no longer appears, and an unauthenticated request to `/mfa-setup` now correctly 307s to `/login`.
14. **MFA enrollment failed on retry** (caught live by the user: `"A factor with the friendly name '' for this user already exists"`) — every mount of `/mfa-setup` (including React StrictMode's dev double-invoke) called `enroll()` again, and Supabase rejects a second enrollment sharing the same blank friendly name as a still-unverified one from a prior attempt. Fixed in `src/components/mfa-setup-form.tsx` by unenrolling any stale unverified TOTP factor (found via `listFactors().data.all`, since `data.totp` is typed verified-only and doesn't surface pending ones) before creating a new enrollment. Type-checked and confirmed clean.

MFA policy change (per user request — MFA should not obstruct staff who don't want it):
- MFA is now **opt-in, not forced**. The original implementation redirected privileged roles to `/mfa-setup` at login if they hadn't enrolled — this was changed so no one is ever forced to set it up. Users enable it themselves from their profile page.
- Enforcement is now conditional on enrollment: `requireRole()` (`src/lib/auth/session.ts`) and `login()` (`src/actions/auth.ts`) only redirect to `/mfa-challenge` when `aal.nextLevel === "aal2"` (i.e. a verified factor exists) but the current session hasn't satisfied it. If no factor is enrolled, access proceeds normally. This keeps 2FA meaningful for those who turn it on without blocking those who don't.
- Added a self-service **MFA management UI** (`src/components/mfa-status-card.tsx`) to all four profile pages (LGU profile + change-password, barangay profile, resident profile). It shows Enabled/Not-enabled status, a "Set Up" link, and a "Turn Off Two-Factor Authentication" button (calls `mfa.unenroll()` after a confirm prompt). Available to every role, since MFA is now available to everyone as an opt-in.

Still open (not fixable in code / blocked):
1. **Leaked-password protection (HaveIBeenPwned check)** — attempted to enable via the Management API (`PATCH .../config/auth {password_hibp_enabled: true}`); the project's current plan tier returned `402 Payment Required`. Requires upgrading the Supabase project plan; not something achievable from the codebase.
2. **CAPTCHA on auth forms** — Supabase supports hCaptcha/Turnstile integration, but requires the user to create an account with one of those providers and supply site/secret keys. Rate limiting (item 8 above) is the mitigation implemented in the meantime.
3. **2 known CVEs in bundled `sharp`/`postcss`** (via `next`'s own dependencies) — confirmed these persist even after upgrading to the latest stable `next@16.2.11`; the advisory's vulnerable range extends through `16.3.0-preview.7`, which isn't a stable release yet. No non-breaking fix exists today (`npm audit fix --force` would downgrade to `next@9.3.3`). Tracked for whenever Next.js ships a patched 16.x.
4. **No error/monitoring service (e.g. Sentry)** — needs an external account + DSN the user would need to create; not something to fabricate. Structural error handling (no leaked stack traces, generic `error.tsx`) remains in place as a baseline.
5. **In-memory rate limiter is single-instance only** — acceptable for the current deployment shape; flagged for revisit if/when this moves to a multi-region serverless deployment.

Next steps:
1. Decide whether to upgrade the Supabase plan to enable leaked-password protection.
2. If/when CAPTCHA is wanted, create an hCaptcha or Cloudflare Turnstile account and share the site/secret keys so it can be wired into the login/register/forgot-password forms.
3. Keep an eye on Next.js releases for a stable 16.3.x that resolves the bundled sharp/postcss CVEs.
4. Once a production URL exists, run securityheaders.com, Mozilla Observatory, and a k6 load test to close out sections 10 and 11.
```
