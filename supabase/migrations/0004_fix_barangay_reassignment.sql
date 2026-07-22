-- ============================================================
-- FIX: the privileged-field guard from 0002 was too strict.
--
-- It blocked ANY barangay_id change on a profile that already had one,
-- which broke a legitimate resident action: updating their own address /
-- barangay from the Resident Profile Settings page ("Only a super admin
-- can reassign an existing barangay").
--
-- Correct rule:
--   * role / is_active        -> super_admin only (real privilege escalation)
--   * barangay_id for a RESIDENT -> allowed (they moved; all barangays are
--     the same privilege level for a resident, so this grants no extra access)
--   * barangay_id for an OFFICIAL / REVIEWER -> super_admin only, since for
--     those roles barangay_id IS the data-access scope (get_user_barangay_id()
--     drives their RLS policies) and self-reassignment would let them read
--     another barangay's records.
-- ============================================================
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

    -- Only privileged roles are scope-bound by barangay_id.
    if new.barangay_id is distinct from old.barangay_id
       and old.barangay_id is not null
       and old.role <> 'resident' then
      raise exception 'Only a super admin can reassign an existing barangay';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;
