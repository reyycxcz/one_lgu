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

  -- requirements/attachments
  requirements jsonb default '[]'::jsonb,      -- array of {name, file_url, uploaded_at}

  -- processing
  verified_by uuid references profiles(id),
  verified_at timestamptz,
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  rejected_reason text,
  generated_document_url text,
  released_at timestamptz,
  released_to text,                            -- name of claimant if not requester

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_cert_requests_requester on certification_requests(requester_id);
create index idx_cert_requests_barangay on certification_requests(barangay_id);
create index idx_cert_requests_status on certification_requests(status);

create trigger trg_cert_requests_updated_at before update on certification_requests
  for each row execute function set_updated_at();
