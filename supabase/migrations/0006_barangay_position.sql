-- ============================================================
-- Barangay staff positions (Secretary, Treasurer, etc.)
--
-- barangay_official has always been one flat role covering every staff
-- member in a barangay hall. This adds an optional `position` so the
-- barangay portal can scope Secretary/Treasurer accounts to their actual
-- duties (Secretary: certifications + reports, Treasurer: reports only)
-- while Captain/Kagawad/Clerk/unset keep the existing full access.
-- ============================================================
create type barangay_position as enum ('captain', 'secretary', 'treasurer', 'kagawad', 'clerk');

alter table profiles add column position barangay_position;

-- Purely a UI-scoping field, not a data-access boundary (RLS below still
-- keys off `role`/`barangay_id` only) — but it's treated like `role` for
-- self-service updates so a Secretary can't quietly promote themself to
-- Treasurer-or-back through the "update own profile" policy.
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

    if new.position is distinct from old.position then
      raise exception 'Only a super admin can change a staff position';
    end if;

    if new.barangay_id is distinct from old.barangay_id
       and old.barangay_id is not null
       and old.role <> 'resident' then
      raise exception 'Only a super admin can reassign an existing barangay';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;
