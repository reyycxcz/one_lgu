-- ============================================
-- COMPLAINTS
-- ============================================
create table complaints (
  id uuid primary key default gen_random_uuid(),
  complainant_id uuid not null references profiles(id),
  barangay_id uuid not null references barangays(id),
  respondent_name text,                        -- optional, complaints can be anonymous-ish
  subject text not null,
  description text not null,
  status complaint_status not null default 'submitted',

  attachments jsonb default '[]'::jsonb,       -- array of {type, file_url, uploaded_at}

  -- assignment/mediation
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

create trigger trg_complaints_updated_at before update on complaints
  for each row execute function set_updated_at();
