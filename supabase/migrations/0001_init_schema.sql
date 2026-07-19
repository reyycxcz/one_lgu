-- ============================================
-- ENUMS
-- ============================================
create type user_role as enum ('super_admin', 'barangay_official', 'lgu_reviewer', 'resident');

create type certification_type as enum (
  'barangay_clearance',
  'certificate_of_residency',
  'certificate_of_indigency',
  'business_clearance',
  'first_time_job_seeker'
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

-- ============================================
-- updated_at trigger (reusable)
-- ============================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================
-- BARANGAYS
-- ============================================
create table barangays (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,               -- e.g. "BGY-001"
  municipality text not null default 'Laoag City',
  province text not null default 'Ilocos Norte',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_barangays_updated_at before update on barangays
  for each row execute function set_updated_at();

-- ============================================
-- USERS (extends auth.users)
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
