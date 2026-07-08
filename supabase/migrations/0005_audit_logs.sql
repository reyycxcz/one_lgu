-- ============================================
-- AUDIT LOGS
-- ============================================
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,                        -- e.g. "certification.approved"
  entity_type text not null,                   -- "certification_request" | "complaint" | "report"
  entity_id uuid not null,
  barangay_id uuid references barangays(id),
  metadata jsonb default '{}'::jsonb,           -- before/after snapshot, reason, etc.
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
  type text not null,                          -- "certification_update" | "complaint_update" | "report_reminder"
  entity_type text,
  entity_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_recipient on notifications(recipient_id, is_read);
