-- Split out from 0013: Postgres forbids using a freshly-added enum value in
-- the same transaction it was added in, so this constraint (which
-- references the new complaint_status values) has to run as its own
-- migration after 0013 has committed.
alter table complaints add constraint chk_status_matches_record_type check (
  (record_type = 'service_report' and status in ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'))
  or
  (record_type = 'formal_complaint' and status in ('submitted', 'under_review', 'notice_summons', 'scheduled', 'mediation', 'pangkat_conciliation', 'settled', 'not_settled', 'closed'))
);

notify pgrst, 'reload schema';
