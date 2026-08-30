-- ============================================
-- Migration 0015: Barangay Service Availability Status
-- ============================================
-- Ensures barangay status tracking for open/closed service hours.
-- Barangay Captains and Secretaries can toggle their barangay's
-- service status directly from their dashboard.

-- If not already present, ensure is_service_open is supported
-- (is_active is used as the active service state)
alter table barangays
  add column if not exists is_service_open boolean not null default true;

-- Policy: Allow barangay officials of that barangay to update service status
create policy "Allow barangay officials to update own barangay service status"
  on barangays for update
  using (
    get_user_role() in ('barangay_official', 'super_admin')
    and (
      get_user_role() = 'super_admin'
      or id = (select barangay_id from profiles where id = auth.uid())
    )
  )
  with check (
    get_user_role() in ('barangay_official', 'super_admin')
    and (
      get_user_role() = 'super_admin'
      or id = (select barangay_id from profiles where id = auth.uid())
    )
  );
