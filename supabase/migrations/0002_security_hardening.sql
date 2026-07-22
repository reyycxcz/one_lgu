-- ============================================================
-- SECURITY HARDENING — fixes for findings from the 2026-07-22 audit
-- (see SECURITY-AUDIT-CHECKLIST.md)
-- ============================================================

-- =====================================================================
-- 1. Fix mutable search_path on existing SECURITY DEFINER / trigger functions
-- =====================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

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
$$ language plpgsql security definer set search_path = public;

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
$$ language plpgsql security definer set search_path = public;

-- =====================================================================
-- 2. profiles: replace the open `with check (true)` INSERT policy with
--    an auth.users trigger that auto-provisions the resident profile row.
--    No client (authenticated or anon) should ever be able to INSERT into
--    profiles directly — that was the privilege-escalation hole.
-- =====================================================================
drop policy if exists "Allow profile insertion during registration" on profiles;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, barangay_id, role, full_name, email, is_active)
  values (
    new.id,
    null,
    'resident',
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- 3. profiles: the UPDATE policy had no explicit `with check`, so Postgres
--    reused the `using` clause (auth.uid() = id) as the check — meaning a
--    resident could PATCH their own row and set role/barangay_id/is_active
--    to anything, since the check never re-validated those columns. Add a
--    trigger that blocks privileged-column changes unless the actor is a
--    super_admin (barangay_id may still be set once during onboarding).
-- =====================================================================
create or replace function public.protect_profile_privileged_fields()
returns trigger as $$
begin
  if get_user_role() <> 'super_admin' then
    if new.role is distinct from old.role then
      raise exception 'Only a super admin can change a profile role';
    end if;
    if new.is_active is distinct from old.is_active then
      raise exception 'Only a super admin can change a profile active status';
    end if;
    if new.barangay_id is distinct from old.barangay_id and old.barangay_id is not null then
      raise exception 'Only a super admin can reassign an existing barangay';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_protect_profile_privileged_fields on profiles;
create trigger trg_protect_profile_privileged_fields
  before update on profiles
  for each row execute function public.protect_profile_privileged_fields();

-- =====================================================================
-- 4. audit_logs: drop the client-writable `with check (true)` INSERT
--    policy. The app only ever writes audit logs via the service-role
--    admin client (src/lib/audit/logger.ts), which bypasses RLS entirely
--    — so no authenticated-role insert policy should exist at all.
-- =====================================================================
drop policy if exists "Allow writing audit logs for all authenticated sessions" on audit_logs;

-- =====================================================================
-- 5. Storage: "reports" bucket — drop the broad public SELECT policy on
--    storage.objects. Public buckets serve objects via the
--    /storage/v1/object/public/... route without consulting RLS at all,
--    so getPublicUrl() links keep working; this policy only ever enabled
--    unauthenticated bucket *listing*, which is the actual hole.
--    Also set a file size cap and allowed mime types at the bucket level
--    so upload restrictions can't be bypassed by calling the Storage API
--    directly instead of going through the app's client-side checks.
-- =====================================================================
drop policy if exists "Allow public read access to reports bucket files" on storage.objects;

update storage.buckets
set file_size_limit = 10485760, -- 10MB
    allowed_mime_types = array[
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ]
where id = 'reports';
