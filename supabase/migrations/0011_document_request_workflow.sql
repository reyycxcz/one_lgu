-- ============================================================
-- DEPARTMENT-ISOLATED DOCUMENT REQUEST & SUBMISSION WORKFLOW
-- ============================================================

-- RLS Helper to resolve logged-in user's department
create or replace function get_user_department()
returns text as $$
declare
  dept text;
begin
  select department into dept from profiles where id = auth.uid();
  return dept;
end;
$$ language plpgsql security definer set search_path = public;

-- Helper to check if request is sent to a specific barangay (Security Definer to avoid RLS recursion)
create or replace function check_barangay_recipient(request_uuid uuid, barangay_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from request_recipients 
    where request_id = request_uuid 
    and barangay_id = barangay_uuid
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Helper to check department ownership of a request (Security Definer to avoid RLS recursion)
create or replace function check_request_department(request_uuid uuid, dept text)
returns boolean as $$
begin
  return exists (
    select 1 from document_requests 
    where id = request_uuid 
    and requesting_department_id = dept
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Helper to check department ownership of a submission (Security Definer to avoid RLS recursion)
create or replace function check_submission_department(submission_uuid uuid, dept text)
returns boolean as $$
begin
  return exists (
    select 1 from document_submissions ds
    join document_requests dr on dr.id = ds.request_id
    where ds.id = submission_uuid
    and dr.requesting_department_id = dept
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Helper to check barangay ownership of a submission (Security Definer to avoid RLS recursion)
create or replace function check_submission_barangay(submission_uuid uuid, brgy_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from document_submissions
    where id = submission_uuid
    and barangay_id = brgy_uuid
  );
end;
$$ language plpgsql security definer set search_path = public;

-- 1. Document Requests
create table if not exists document_requests (
  id uuid primary key default gen_random_uuid(),
  requesting_department_id text not null,
  title text not null,
  description text,
  deadline timestamptz not null,
  status text not null default 'active',
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_request_status check (status in ('draft', 'published', 'active', 'deadline_passed', 'completed', 'archived'))
);

create index if not exists idx_document_requests_dept on document_requests(requesting_department_id);
create index if not exists idx_document_requests_created on document_requests(created_at desc);

-- Drop trigger if exists and recreate
drop trigger if exists trg_document_requests_updated_at on document_requests;
create trigger trg_document_requests_updated_at before update on document_requests
  for each row execute function set_updated_at();

-- 2. Request Recipients (Selected Barangays)
create table if not exists request_recipients (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references document_requests(id) on delete cascade,
  barangay_id uuid not null references barangays(id),
  created_at timestamptz not null default now(),
  constraint uq_request_recipient unique (request_id, barangay_id)
);

create index if not exists idx_request_recipients_request on request_recipients(request_id);
create index if not exists idx_request_recipients_barangay on request_recipients(barangay_id);

-- 3. Document Submissions
create table if not exists document_submissions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references document_requests(id) on delete cascade,
  barangay_id uuid not null references barangays(id),
  file_name text not null,
  file_url text not null,
  status text not null default 'submitted',
  submitted_by uuid not null references profiles(id),
  submitted_at timestamptz not null default now(),
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_submission_status check (status in ('pending', 'submitted', 'under_review', 'approved', 'returned', 'resubmission_required', 'resubmitted')),
  constraint uq_request_barangay_submission unique (request_id, barangay_id)
);

create index if not exists idx_document_submissions_request on document_submissions(request_id);
create index if not exists idx_document_submissions_barangay on document_submissions(barangay_id);
create index if not exists idx_document_submissions_created on document_submissions(created_at desc);

drop trigger if exists trg_document_submissions_updated_at on document_submissions;
create trigger trg_document_submissions_updated_at before update on document_submissions
  for each row execute function set_updated_at();

-- 4. Submission Reviews (History of actions/remarks per submission)
create table if not exists submission_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references document_submissions(id) on delete cascade,
  reviewed_by uuid not null references profiles(id),
  status text not null,
  review_notes text,
  created_at timestamptz not null default now(),
  constraint chk_review_status check (status in ('approved', 'returned', 'resubmission_required'))
);

create index if not exists idx_submission_reviews_submission on submission_reviews(submission_id);
create index if not exists idx_submission_reviews_created on submission_reviews(created_at desc);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

alter table document_requests enable row level security;
alter table request_recipients enable row level security;
alter table document_submissions enable row level security;
alter table submission_reviews enable row level security;

-- Drop existing policies to prevent conflicts on rerun
drop policy if exists "Read requests: super_admin, department reviewers, and recipients" on document_requests;
drop policy if exists "Write requests: super_admin and LGU reviewers" on document_requests;
drop policy if exists "Read recipients: super_admin, department reviewers, and scoped barangay" on request_recipients;
drop policy if exists "Write recipients: super_admin and LGU reviewers" on request_recipients;
drop policy if exists "Read submissions: super_admin, department reviewers, and owner barangay" on document_submissions;
drop policy if exists "Write submissions: super_admin, department reviewers (to update status), and owner barangay" on document_submissions;
drop policy if exists "Read reviews: super_admin, department reviewers, and recipient barangay" on submission_reviews;
drop policy if exists "Write reviews: super_admin and LGU reviewers" on submission_reviews;

-- --- document_requests Policies ---
create policy "Read requests: super_admin, department reviewers, and recipients"
  on document_requests for select
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'lgu_reviewer' and requesting_department_id = get_user_department()) or
    (get_user_role() = 'barangay_official' and check_barangay_recipient(id, get_user_barangay_id()))
  );

create policy "Write requests: super_admin and LGU reviewers"
  on document_requests for all
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'lgu_reviewer' and requesting_department_id = get_user_department())
  )
  with check (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'lgu_reviewer' and requesting_department_id = get_user_department())
  );

-- --- request_recipients Policies ---
create policy "Read recipients: super_admin, department reviewers, and scoped barangay"
  on request_recipients for select
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'lgu_reviewer' and check_request_department(request_id, get_user_department())) or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id())
  );

create policy "Write recipients: super_admin and LGU reviewers"
  on request_recipients for all
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'lgu_reviewer' and check_request_department(request_id, get_user_department()))
  )
  with check (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'lgu_reviewer' and check_request_department(request_id, get_user_department()))
  );

-- --- document_submissions Policies ---
create policy "Read submissions: super_admin, department reviewers, and owner barangay"
  on document_submissions for select
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'lgu_reviewer' and check_request_department(request_id, get_user_department())) or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id())
  );

create policy "Write submissions: super_admin, department reviewers (to update status), and owner barangay"
  on document_submissions for all
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'lgu_reviewer' and check_request_department(request_id, get_user_department())) or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id())
  )
  with check (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'lgu_reviewer' and check_request_department(request_id, get_user_department())) or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id())
  );

-- --- submission_reviews Policies ---
create policy "Read reviews: super_admin, department reviewers, and recipient barangay"
  on submission_reviews for select
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'lgu_reviewer' and check_submission_department(submission_id, get_user_department())) or
    (get_user_role() = 'barangay_official' and check_submission_barangay(submission_id, get_user_barangay_id()))
  );

create policy "Write reviews: super_admin and LGU reviewers"
  on submission_reviews for all
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'lgu_reviewer' and check_submission_department(submission_id, get_user_department()))
  )
  with check (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'lgu_reviewer' and check_submission_department(submission_id, get_user_department()))
  );
