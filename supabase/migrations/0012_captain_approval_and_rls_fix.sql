-- ============================================================
-- 1. Captain approval gate for document_submissions
--
-- The workflow was Secretary uploads -> straight to department review,
-- skipping the Barangay Captain sign-off the requested flow requires.
-- Adds a 'pending_captain_approval' status (Secretary sent it up, awaiting
-- Captain) between the Secretary's upload and it actually reaching the
-- requesting department as 'submitted'. Captain rejection reuses the
-- existing 'returned' status (same as a department-level rejection) since
-- either way the very next step is identical: Secretary revises and sends
-- to Captain again — the two are told apart in the UI by whether a
-- submission_reviews row exists (department acted) or not (Captain-only).
-- ============================================================
alter table document_submissions drop constraint chk_submission_status;
alter table document_submissions add constraint chk_submission_status
  check (status in ('pending', 'pending_captain_approval', 'submitted', 'under_review', 'approved', 'returned', 'resubmission_required', 'resubmitted'));

alter table document_submissions add column captain_approved_by uuid references profiles(id);
alter table document_submissions add column captain_approved_at timestamptz;
alter table document_submissions add column captain_notes text;

-- ============================================================
-- 2. Fix lgu_reviewer RLS gaps (pre-existing bug, unrelated to the workflow
-- tables above which already had their own correct RLS via
-- get_user_department()).
--
-- profiles/certification_requests/complaints/reports all gated the
-- lgu_reviewer branch on `barangay_id = get_user_barangay_id()`, but
-- get_user_barangay_id() is always NULL for LGU staff (they don't belong to
-- a barangay) — NULL = NULL is never true in SQL, so that branch could
-- never actually grant access. Only super_admin could ever read/act on
-- these tables; lgu_reviewer (SK Officials / department accounts) silently
-- got nothing. lgu_reviewer was always meant to be municipality-wide here,
-- not barangay-scoped, matching how every LGU nav page already assumes.
-- ============================================================
drop policy "Allow profile read access based on role scope" on profiles;
create policy "Allow profile read access based on role scope"
  on profiles for select
  to authenticated
  using (
    auth.uid() = id or
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    get_user_role() = 'lgu_reviewer'
  );

drop policy "Allow certification read access based on scope" on certification_requests;
create policy "Allow certification read access based on scope"
  on certification_requests for select
  to authenticated
  using (
    requester_id = auth.uid() or
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    get_user_role() = 'lgu_reviewer'
  );

drop policy "Allow certification update based on role and status" on certification_requests;
create policy "Allow certification update based on role and status"
  on certification_requests for update
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    get_user_role() = 'lgu_reviewer' or
    (requester_id = auth.uid() and status = 'submitted')
  );

drop policy "Allow complaints read access based on scope" on complaints;
create policy "Allow complaints read access based on scope"
  on complaints for select
  to authenticated
  using (
    complainant_id = auth.uid() or
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    get_user_role() = 'lgu_reviewer'
  );

drop policy "Allow complaints updates for official handling" on complaints;
create policy "Allow complaints updates for official handling"
  on complaints for update
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    get_user_role() = 'lgu_reviewer'
  );

drop policy "Allow reports read access for officials and super admins" on reports;
create policy "Allow reports read access for officials and super admins"
  on reports for select
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    get_user_role() = 'lgu_reviewer'
  );

-- Also widen the barangay_official branch from "only the original
-- submitter" to "anyone in the same barangay" — needed so the Captain
-- (a different person than the Secretary who submitted) can act on a
-- report at all, and consistent with the SELECT policy already allowing
-- any barangay_official in the same barangay to see it.
drop policy "Allow reports updates for super admin reviews" on reports;
create policy "Allow reports updates for super admin reviews"
  on reports for update
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    get_user_role() = 'lgu_reviewer'
  );

notify pgrst, 'reload schema';
