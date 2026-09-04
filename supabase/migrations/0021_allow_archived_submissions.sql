-- Allow 'archived' status for document_submissions
alter table document_submissions drop constraint if exists chk_submission_status;
alter table document_submissions add constraint chk_submission_status
  check (status in ('pending', 'pending_captain_approval', 'submitted', 'under_review', 'approved', 'returned', 'resubmission_required', 'resubmitted', 'archived'));

-- Allow 'archived' status in submission_reviews if recorded
alter table submission_reviews drop constraint if exists chk_review_status;
alter table submission_reviews add constraint chk_review_status
  check (status in ('approved', 'returned', 'resubmission_required', 'archived'));

-- Also allow 'returned' directly on report_status enum if needed
alter type report_status add value if not exists 'returned';
