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
