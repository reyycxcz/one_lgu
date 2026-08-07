# OneLGU — React Expo Mobile App Integration Guide

A reference for building the **Citizen (Resident)** and **Barangay Official** mobile app in React Native / Expo, backed by the **same Supabase project** as the web app.

---

## 0. Core idea — you don't need the Next.js backend

The web app's server actions (`src/actions/*`) are **web-only**. Your Expo app talks to **Supabase directly** using `@supabase/supabase-js`:

- **Auth** → Supabase Auth (email/password, OTP)
- **Data** → Supabase Postgres via the client (queries run under the logged-in user; **RLS enforces security automatically**)
- **Files** → Supabase Storage
- **Realtime** → Supabase Realtime (notifications)

Because **Row Level Security (RLS)** is comprehensive, the mobile app is safe using only the **anon key** — a resident can only ever read/write their own rows; an official only their barangay's. You never ship the service-role key to the app.

> A few things the web app does via service-role (audit logging, notifying *other* users, broadcasting announcements) the mobile app **cannot** do directly — those stay server-side. For the citizen app you don't need them.

---

## 1. Project setup

```bash
npx create-expo-app onelgu-mobile
cd onelgu-mobile
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill expo-image-picker expo-document-picker
```

**`lib/supabase.ts`**
```ts
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://usvcpgohfhaqngcgsleq.supabase.co";
const SUPABASE_ANON_KEY = "<your NEXT_PUBLIC_SUPABASE_ANON_KEY>"; // safe to ship; RLS protects data

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // important on native
  },
});
```

Put the anon key in an Expo env var (`app.config.js` `extra` or `EXPO_PUBLIC_SUPABASE_ANON_KEY`) rather than hardcoding.

---

## 2. Roles & what each can do

| Role | Mobile app? | Scope |
|---|---|---|
| `resident` | ✅ Citizen app | own certifications, complaints, profile, notifications |
| `barangay_official` | ✅ Barangay app | their barangay's certifications, complaints, reports, staff |
| `lgu_reviewer` | (web) | LGU-wide |
| `super_admin` | (web) | everything |

Read the role after login from the `profiles` table (see §3).

---

## 3. Auth flows

### Register (citizen)
```ts
const { data, error } = await supabase.auth.signUp({
  email,
  password, // min 8 chars
  options: { data: { full_name: fullName, role: "resident" } },
});
// A `profiles` row is auto-created by a DB trigger (role: 'resident').
// Email confirmation is currently OFF, so a session is returned immediately.
```

### Onboarding (set barangay — required before using the app)
A new resident has `barangay_id = null`. Have them pick a barangay:
```ts
// list barangays for the picker
const { data: barangays } = await supabase
  .from("barangays")
  .select("id, name, code")
  .eq("is_active", true)
  .order("name");

// save the choice to their own profile (RLS allows updating own row)
await supabase.from("profiles").update({ barangay_id }).eq("id", user.id);
```

### Login
```ts
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
```

### Get current profile + role
```ts
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from("profiles")
  .select("id, full_name, email, phone, address, role, barangay_id, barangays(name)")
  .eq("id", user.id)
  .single();
```

### Forgot password (OTP / 6-digit code)
The backend is configured for a **code-based** reset (branded email with a 6-digit code):
```ts
// 1. send code
await supabase.auth.resetPasswordForEmail(email);
// 2. verify code -> establishes a session
await supabase.auth.verifyOtp({ email, token: code, type: "recovery" });
// 3. set new password
await supabase.auth.updateUser({ password: newPassword });
```

### Logout
```ts
await supabase.auth.signOut();
```

### MFA (officials)
Privileged roles are prompted for TOTP on the web. On mobile you can support it with `supabase.auth.mfa.enroll/challengeAndVerify`, or skip MFA enforcement for the citizen app (residents aren't MFA-required).

---

## 4. Data model (fields you'll use)

### `barangays`
`id, name, code, municipality, province, is_active`

### `profiles`
`id (=auth uid), barangay_id, role, full_name, email, phone, address, avatar_url, is_active`

### `certification_requests`
```
id, requester_id, barangay_id, type, purpose, status,
requirements (jsonb: [{name, file_url, uploaded_at}]),
verified_by/at, approved_by/at, rejected_reason,
generated_document_url, released_at, released_to, created_at
```
- **type**: `barangay_clearance | certificate_of_residency | certificate_of_indigency | business_clearance | first_time_job_seeker | barangay_certificate | scholarship_certificate`
- **status**: `submitted → verified → approved → generated → ready_for_pickup → released` (or `rejected`)

### `complaints`
```
id, complainant_id, barangay_id, type, respondent_name, subject, description, status,
attachments (jsonb: [{type, file_url, uploaded_at}]),
assigned_to, scheduled_date, mediation_notes, resolution, resolved_at, closed_by/at, created_at
```
- **type**: `noise_complaint | garbage_illegal_dumping | road_infrastructure | streetlight_problem | stray_aggressive_animals | other`
- **status**: `submitted → under_review → scheduled → mediation → resolved → closed`

### `reports` (barangay official only)
```
id, submitted_by, barangay_id, type, title, period_start, period_end, status, file_url, file_name, review_notes
```
- **type**: `monthly | financial | accomplishment | compliance`
- **status**: `submitted → under_review → approved | rejected | archived`

### `notifications`
`id, recipient_id, title, message, type, entity_type, entity_id, is_read, created_at`

---

## 5. RLS cheat-sheet — what queries will work

**Resident** (`resident`):
- ✅ read/insert own `certification_requests` (`requester_id = your uid`)
- ✅ update own cert **only while `status = 'submitted'`**
- ✅ read/insert own `complaints` (`complainant_id = your uid`)
- ✅ read/update own `profiles` row
- ✅ read own `notifications`; update own (mark read)
- ✅ read active `barangays`
- ✅ read **published** `announcements`
- ⛔ cannot read other residents' data, reports, or audit logs
- ⛔ cannot change your own `role`/`is_active`; may change `barangay_id` (residents only)

**Barangay official** (`barangay_official`):
- ✅ read all `certification_requests` / `complaints` **in their barangay**
- ✅ update them (verify/approve/reject/resolve) in their barangay
- ✅ insert/read `reports` for their barangay; update own submissions
- ✅ read `profiles` in their barangay (residents + staff)
- ⛔ cannot touch other barangays or LGU settings

> If a query returns `[]` unexpectedly, it's almost always RLS — check the user's role/barangay_id.

---

## 6. Citizen feature snippets

### Submit a certificate request
```ts
const { data: profile } = await supabase.from("profiles")
  .select("barangay_id").eq("id", user.id).single();

const { data, error } = await supabase.from("certification_requests").insert({
  requester_id: user.id,
  barangay_id: profile.barangay_id,
  type: "barangay_clearance",
  purpose: "Local employment requirement",
  requirements: uploadedFiles, // [{name, file_url, uploaded_at}] — see §7
  status: "submitted",
}).select().single();
```

### List / track my requests
```ts
const { data } = await supabase
  .from("certification_requests")
  .select("id, type, purpose, status, created_at")
  .eq("requester_id", user.id)
  .order("created_at", { ascending: false });
```

### File a complaint
```ts
await supabase.from("complaints").insert({
  complainant_id: user.id,
  barangay_id: profile.barangay_id,
  type: "noise_complaint",
  subject, description,
  respondent_name, // optional
  attachments,     // [{type, file_url, uploaded_at}]
  status: "submitted",
});
```

### Notifications (list + mark read)
```ts
const { data } = await supabase.from("notifications")
  .select("*").eq("recipient_id", user.id)
  .order("created_at", { ascending: false }).limit(30);

await supabase.from("notifications")
  .update({ is_read: true }).eq("recipient_id", user.id).eq("is_read", false);
```

### Update profile
```ts
await supabase.from("profiles").update({
  full_name, phone, address, barangay_id, // residents may change barangay
}).eq("id", user.id);
```

---

## 7. File uploads (Storage)

Two public buckets exist. **`attachments`** = citizen uploads (IDs, complaint evidence: **JPG/PNG/WEBP/PDF, ≤5MB**). **`reports`** = official reports (**PDF/XLS/CSV, ≤10MB**). Listing is disabled; objects are fetched by their public URL.

```ts
import * as ImagePicker from "expo-image-picker";

const file = /* from ImagePicker / DocumentPicker */;
const ext = file.name.split(".").pop();
const path = `${crypto.randomUUID()}-${file.name}`;

// React Native: upload the file as an arraybuffer/blob
const resp = await fetch(file.uri);
const arrayBuffer = await resp.arrayBuffer();

const { error } = await supabase.storage
  .from("attachments")
  .upload(path, arrayBuffer, { contentType: file.mimeType, upsert: false });

const { data } = supabase.storage.from("attachments").getPublicUrl(path);
// store data.publicUrl in requirements/attachments jsonb
```

> The bucket enforces mime-type + 5MB server-side, so a bad file is rejected even if the app's check is bypassed.

---

## 8. Realtime notifications (optional but nice)

```ts
const channel = supabase
  .channel("my-notifications")
  .on("postgres_changes",
    { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${user.id}` },
    (payload) => { /* show a badge / toast */ }
  )
  .subscribe();
// remember: supabase.removeChannel(channel) on unmount
```
Enable Realtime for the `notifications` table in the Supabase dashboard if not already.

---

## 9. Suggested screen map

**Citizen app**
- Auth: Login · Register · Onboarding (pick barangay) · Forgot password (code)
- Home/Dashboard (greeting, quick stats, shortcuts)
- Certifications: list · new request (form + upload) · detail (status timeline)
- Complaints: list · new complaint (form + evidence) · detail
- Notifications
- Profile (edit + change password)
- Civic Bulletin (read published `announcements`) — optional

**Barangay app** (add on top)
- Dashboard (barangay-scoped counts)
- Certification queue → verify/approve/reject/release
- Complaint queue → review/resolve/close
- Reports: submit + list
- Staff (read-only)

---

## 10. Gotchas / rules

- **Never ship the service-role key.** Anon key only.
- Enum values are **exact strings** — mismatches error out. Copy them from §4.
- A resident **must have `barangay_id`** before inserting certs/complaints (enforce onboarding).
- Cert can only be edited by the resident while `status = 'submitted'`.
- Email delivery is **testing-mode** right now (only reaches the Resend account owner) until a domain is verified — password-reset emails to arbitrary residents won't arrive yet.
- Don't try to insert into `audit_logs` or notify other users from the app — RLS blocks it; that's server-only.
- Match your reset-password UI to the **6-digit code** flow (not a magic link).

---

## 11. TypeScript types

`src/types/database.types.ts` in this repo has generated Supabase types you can copy into the Expo project, or regenerate:
```bash
npx supabase gen types typescript --project-id usvcpgohfhaqngcgsleq > types/database.types.ts
```
Then: `createClient<Database>(url, key)` for full type-safety on every query.
```
