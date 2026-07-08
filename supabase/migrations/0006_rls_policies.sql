-- =====================================================================
-- RLS HELPER FUNCTIONS (SECURITY DEFINER) to prevent infinite recursion
-- =====================================================================
create or replace function get_user_role()
returns user_role as $$
declare
  r user_role;
begin
  select role into r from profiles where id = auth.uid();
  return coalesce(r, 'resident'::user_role);
exception
  when others then
    return 'resident'::user_role;
end;
$$ language plpgsql security definer;

create or replace function get_user_barangay_id()
returns uuid as $$
declare
  b_id uuid;
begin
  select barangay_id into b_id from profiles where id = auth.uid();
  return b_id;
exception
  when others then
    return null;
end;
$$ language plpgsql security definer;

-- =====================================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================================
alter table barangays enable row level security;
alter table profiles enable row level security;
alter table certification_requests enable row level security;
alter table complaints enable row level security;
alter table reports enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;

-- =====================================================================
-- BARANGAYS POLICIES
-- =====================================================================
create policy "Allow read access to barangays for everyone"
  on barangays for select
  to authenticated
  using (is_active = true);

create policy "Allow write access to barangays for super admins only"
  on barangays for all
  to authenticated
  using (get_user_role() = 'super_admin');

-- =====================================================================
-- PROFILES POLICIES
-- =====================================================================
create policy "Allow profile insertion during registration"
  on profiles for insert
  to authenticated, anon
  with check (true);

create policy "Allow profile read access based on role scope"
  on profiles for select
  to authenticated
  using (
    auth.uid() = id or 
    get_user_role() = 'super_admin' or 
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    (get_user_role() = 'sk_official' and barangay_id = get_user_barangay_id())
  );

create policy "Allow profile update access for own profile or super admin"
  on profiles for update
  to authenticated
  using (auth.uid() = id or get_user_role() = 'super_admin');

-- =====================================================================
-- CERTIFICATION REQUESTS POLICIES
-- =====================================================================
create policy "Allow residents to insert their own certification requests"
  on certification_requests for insert
  to authenticated
  with check (requester_id = auth.uid());

create policy "Allow certification read access based on scope"
  on certification_requests for select
  to authenticated
  using (
    requester_id = auth.uid() or
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    (get_user_role() = 'sk_official' and barangay_id = get_user_barangay_id())
  );

create policy "Allow certification update based on role and status"
  on certification_requests for update
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    (requester_id = auth.uid() and status = 'submitted')
  );

-- =====================================================================
-- COMPLAINTS POLICIES
-- =====================================================================
create policy "Allow residents to file complaints"
  on complaints for insert
  to authenticated
  with check (complainant_id = auth.uid());

create policy "Allow complaints read access based on scope"
  on complaints for select
  to authenticated
  using (
    complainant_id = auth.uid() or
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id())
  );

create policy "Allow complaints updates for official handling"
  on complaints for update
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id())
  );

-- =====================================================================
-- REPORTS POLICIES
-- =====================================================================
create policy "Allow report submission for barangay officials"
  on reports for insert
  to authenticated
  with check (
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    (get_user_role() = 'sk_official' and barangay_id = get_user_barangay_id())
  );

create policy "Allow reports read access for officials and super admins"
  on reports for select
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id()) or
    (get_user_role() = 'sk_official' and barangay_id = get_user_barangay_id())
  );

create policy "Allow reports updates for super admin reviews"
  on reports for update
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id() and submitted_by = auth.uid())
  );

-- =====================================================================
-- AUDIT LOGS POLICIES
-- =====================================================================
create policy "Allow writing audit logs for all authenticated sessions"
  on audit_logs for insert
  to authenticated
  with check (true);

create policy "Allow audit logs reading for LGU admins and scoped officials"
  on audit_logs for select
  to authenticated
  using (
    get_user_role() = 'super_admin' or
    (get_user_role() = 'barangay_official' and barangay_id = get_user_barangay_id())
  );

-- =====================================================================
-- NOTIFICATIONS POLICIES
-- =====================================================================
create policy "Allow reading own notifications"
  on notifications for select
  to authenticated
  using (recipient_id = auth.uid());

create policy "Allow updating own notifications"
  on notifications for update
  to authenticated
  using (recipient_id = auth.uid());
