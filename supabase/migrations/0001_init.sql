-- ============================================================
-- ONELGU — FULL DATABASE SCHEMA (single consolidated migration)
-- Municipality of Dingras, Ilocos Norte
-- ============================================================

-- ============================================
-- ENUMS
-- ============================================
create type user_role as enum ('super_admin', 'barangay_official', 'lgu_reviewer', 'resident');

create type certification_type as enum (
  'barangay_clearance',
  'certificate_of_residency',
  'certificate_of_indigency',
  'business_clearance',
  'first_time_job_seeker',
  'barangay_certificate',
  'scholarship_certificate'
);

create type certification_status as enum (
  'submitted',
  'verified',
  'approved',
  'rejected',
  'generated',
  'ready_for_pickup',
  'released'
);

create type complaint_type as enum (
  'noise_complaint',
  'garbage_illegal_dumping',
  'road_infrastructure',
  'streetlight_problem',
  'stray_aggressive_animals',
  'other'
);

create type complaint_status as enum (
  'submitted',
  'under_review',
  'scheduled',
  'mediation',
  'resolved',
  'closed'
);

create type report_type as enum ('monthly', 'financial', 'accomplishment', 'compliance');

create type report_status as enum ('submitted', 'under_review', 'approved', 'rejected', 'archived');

create type announcement_status as enum ('draft', 'published', 'archived');

create type announcement_category as enum (
  'certification_guide',
  'dispute_mediation',
  'livelihood_programs',
  'clean_and_green',
  'general'
);

-- ============================================
-- updated_at trigger (reusable)
-- ============================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

-- ============================================
-- BARANGAYS
-- ============================================
create table barangays (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  municipality text not null default 'Dingras',
  province text not null default 'Ilocos Norte',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_barangays_updated_at before update on barangays
  for each row execute function set_updated_at();

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  barangay_id uuid references barangays(id),   -- null for super_admin
  role user_role not null default 'resident',
  full_name text not null,
  email text not null,
  phone text,
  address text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- ============================================
-- CERTIFICATION REQUESTS
-- ============================================
create table certification_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references profiles(id),
  barangay_id uuid not null references barangays(id),
  type certification_type not null,
  purpose text not null,
  status certification_status not null default 'submitted',

  requirements jsonb default '[]'::jsonb,

  verified_by uuid references profiles(id),
  verified_at timestamptz,
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  rejected_reason text,
  generated_document_url text,
  released_at timestamptz,
  released_to text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_cert_requests_requester on certification_requests(requester_id);
create index idx_cert_requests_barangay on certification_requests(barangay_id);
create index idx_cert_requests_status on certification_requests(status);

create trigger trg_cert_requests_updated_at before update on certification_requests
  for each row execute function set_updated_at();

-- ============================================
-- COMPLAINTS
-- ============================================
create table complaints (
  id uuid primary key default gen_random_uuid(),
  complainant_id uuid not null references profiles(id),
  barangay_id uuid not null references barangays(id),
  type complaint_type not null default 'other',
  respondent_name text,
  subject text not null,
  description text not null,
  status complaint_status not null default 'submitted',

  attachments jsonb default '[]'::jsonb,

  assigned_to uuid references profiles(id),
  assigned_at timestamptz,
  scheduled_date timestamptz,
  mediation_notes text,
  resolution text,
  resolved_at timestamptz,
  closed_by uuid references profiles(id),
  closed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_complaints_complainant on complaints(complainant_id);
create index idx_complaints_barangay on complaints(barangay_id);
create index idx_complaints_status on complaints(status);
create index idx_complaints_assigned on complaints(assigned_to);
create index idx_complaints_type on complaints(type);

create trigger trg_complaints_updated_at before update on complaints
  for each row execute function set_updated_at();

-- ============================================
-- REPORTS
-- ============================================
create table reports (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references profiles(id),
  barangay_id uuid not null references barangays(id),
  type report_type not null,
  title text not null,
  period_start date,
  period_end date,
  status report_status not null default 'submitted',

  file_url text not null,
  file_name text,

  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  review_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_reports_submitted_by on reports(submitted_by);
create index idx_reports_barangay on reports(barangay_id);
create index idx_reports_status on reports(status);
create index idx_reports_type on reports(type);

create trigger trg_reports_updated_at before update on reports
  for each row execute function set_updated_at();

-- ============================================
-- AUDIT LOGS
-- ============================================
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  barangay_id uuid references barangays(id),
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);
create index idx_audit_logs_actor on audit_logs(actor_id);
create index idx_audit_logs_barangay on audit_logs(barangay_id);
create index idx_audit_logs_created on audit_logs(created_at desc);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles(id),
  title text not null,
  message text not null,
  type text not null,
  entity_type text,
  entity_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_recipient on notifications(recipient_id, is_read);

-- ============================================
-- ANNOUNCEMENTS (Civic Bulletin)
-- ============================================
create table announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id),
  category announcement_category not null default 'general',
  title text not null,
  slug text not null unique,
  excerpt text not null,
  body text not null,
  tag text not null,
  status announcement_status not null default 'draft',
  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_announcements_status on announcements(status);
create index idx_announcements_slug on announcements(slug);
create index idx_announcements_published_at on announcements(published_at desc);

create trigger trg_announcements_updated_at before update on announcements
  for each row execute function set_updated_at();

-- =====================================================================
-- RLS HELPER FUNCTIONS (SECURITY DEFINER) to prevent infinite recursion
-- =====================================================================
create or replace function get_user_role()
returns user_role as $$
declare
  r user_role;
begin
  select role into r from profiles where id = auth.uid();
  return coalesce(r, 'resident'::user_role);
exception
  when others then
    return 'resident'::user_role;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function get_user_barangay_id()
returns uuid as $$
declare
  b_id uuid;
begin
  select barangay_id into b_id from profiles where id = auth.uid();
  return b_id;
exception
  when others then
    return null;
end;
$$ language plpgsql security definer set search_path = public;

-- =====================================================================
-- Auto-provision a `profiles` row whenever a new auth.users row is
-- created, instead of allowing clients to INSERT into profiles directly
-- (a client-writable insert policy is a privilege-escalation vector —
-- see SECURITY-AUDIT-CHECKLIST.md). Always resident/unassigned; onboarding
-- assigns the barangay afterwards via the profiles UPDATE policy.
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, barangay_id, role, full_name, email, is_active)
  values (
    new.id,
    null,
    'resident',
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger-only function — should not be callable directly via
-- /rest/v1/rpc/handle_new_user by anon/authenticated. Triggers invoke it
-- internally regardless of this revoke.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- =====================================================================
-- Block self-escalation of privileged profile columns through the
-- "update own profile" policy, which only restricts *which rows* can be
-- updated, not *which columns*.
--   * role / is_active         -> super_admin only
--   * barangay_id for RESIDENT -> allowed (they moved; grants no extra access)
--   * barangay_id for OFFICIAL/REVIEWER -> super_admin only, since for those
--     roles barangay_id IS their data-access scope (get_user_barangay_id()
--     drives their RLS policies).
-- =====================================================================
create or replace function public.protect_profile_privileged_fields()
returns trigger as $$
begin
  if get_user_role() <> 'super_admin' then
    if new.role is distinct from old.role then
      raise exception 'Only a super admin can change a profile role';
    end if;

    if new.is_active is distinct from old.is_active then
      raise exception 'Only a super admin can change a profile active status';
    end if;

    if new.barangay_id is distinct from old.barangay_id
       and old.barangay_id is not null
       and old.role <> 'resident' then
      raise exception 'Only a super admin can reassign an existing barangay';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_protect_profile_privileged_fields
  before update on profiles
  for each row execute function public.protect_profile_privileged_fields();

revoke execute on function public.protect_profile_privileged_fields() from public, anon, authenticated;

-- =====================================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================================
alter table barangays enable row level security;
alter table profiles enable row level security;
alter table certification_requests enable row level security;
alter table complaints enable row level security;
alter table reports enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;
alter table announcements enable row level security;

-- =====================================================================
-- BARANGAYS POLICIES
-- =====================================================================
create policy "Allow read access to barangays for everyone"
  on barangays for select
  to authenticated
  using (is_active = true);

create policy "Allow write access to barangays for super admins only"
  on barangays for all
  to authenticated
  using (get_user_role() = 'super_admin');

-- =====================================================================
-- PROFILES POLICIES
-- =====================================================================
-- NOTE: intentionally no client-writable INSERT policy — profile rows are
-- created exclusively by the on_auth_user_created trigger above.

create policy "Allow profile read access based on role scope"
  on profiles for select
  to authenticated
  using (
    auth.uid() = id or
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    (get_user_role() = 'lgu_reviewer' and barangay_id = get_user_barangay_id())
  );

create policy "Allow profile update access for own profile or super admin"
  on profiles for update
  to authenticated
  using (auth.uid() = id or get_user_role() = 'super_admin');

-- =====================================================================
-- CERTIFICATION REQUESTS POLICIES
-- =====================================================================
create policy "Allow residents to insert their own certification requests"
  on certification_requests for insert
  to authenticated
  with check (requester_id = auth.uid());

create policy "Allow certification read access based on scope"
  on certification_requests for select
  to authenticated
  using (
    requester_id = auth.uid() or
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    (get_user_role() = 'lgu_reviewer' and barangay_id = get_user_barangay_id())
  );

create policy "Allow certification update based on role and status"
  on certification_requests for update
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    (requester_id = auth.uid() and status = 'submitted')
  );

-- =====================================================================
-- COMPLAINTS POLICIES
-- =====================================================================
create policy "Allow residents to file complaints"
  on complaints for insert
  to authenticated
  with check (complainant_id = auth.uid());

create policy "Allow complaints read access based on scope"
  on complaints for select
  to authenticated
  using (
    complainant_id = auth.uid() or
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id())
  );

create policy "Allow complaints updates for official handling"
  on complaints for update
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id())
  );

-- =====================================================================
-- REPORTS POLICIES
-- =====================================================================
create policy "Allow report submission for barangay officials"
  on reports for insert
  to authenticated
  with check (
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    (get_user_role() = 'lgu_reviewer' and barangay_id = get_user_barangay_id())
  );

create policy "Allow reports read access for officials and super admins"
  on reports for select
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    (get_user_role() = 'lgu_reviewer' and barangay_id = get_user_barangay_id())
  );

create policy "Allow reports updates for super admin reviews"
  on reports for update
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id() and submitted_by = auth.uid())
  );

-- =====================================================================
-- AUDIT LOGS POLICIES
-- =====================================================================
-- NOTE: intentionally no client-writable INSERT policy — audit log rows
-- are written exclusively via the service-role admin client
-- (src/lib/audit/logger.ts), which bypasses RLS entirely. A client-writable
-- insert policy here would let any authenticated user forge log entries.

create policy "Allow audit logs reading for LGU admins and scoped officials"
  on audit_logs for select
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id())
  );

-- =====================================================================
-- NOTIFICATIONS POLICIES
-- =====================================================================
create policy "Allow reading own notifications"
  on notifications for select
  to authenticated
  using (recipient_id = auth.uid());

create policy "Allow updating own notifications"
  on notifications for update
  to authenticated
  using (recipient_id = auth.uid());

-- =====================================================================
-- ANNOUNCEMENTS POLICIES
-- =====================================================================
create policy "Allow public read access to published announcements"
  on announcements for select
  to authenticated, anon
  using (status = 'published');

create policy "Allow LGU admins full read access to announcements"
  on announcements for select
  to authenticated
  using (get_user_role() = 'super_admin');

create policy "Allow LGU admins to create announcements"
  on announcements for insert
  to authenticated
  with check (get_user_role() = 'super_admin' and author_id = auth.uid());

create policy "Allow LGU admins to update announcements"
  on announcements for update
  to authenticated
  using (get_user_role() = 'super_admin');

create policy "Allow LGU admins to delete announcements"
  on announcements for delete
  to authenticated
  using (get_user_role() = 'super_admin');

-- =====================================================================
-- STORAGE — "reports" bucket for barangay report file uploads
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reports', 'reports', true, 10485760,
  array[
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
)
on conflict (id) do nothing;

create policy "Allow authenticated uploads to reports bucket"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'reports');

-- NOTE: intentionally no public/authenticated SELECT policy on
-- storage.objects for this bucket. Since the bucket's `public` flag is
-- true, individual objects remain fetchable via the
-- /storage/v1/object/public/... URL (what getPublicUrl() constructs)
-- without any RLS policy — but a SELECT policy here would also enable
-- unauthenticated bucket *listing* of every uploaded report, which was
-- the actual vulnerability (see SECURITY-AUDIT-CHECKLIST.md).
