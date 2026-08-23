-- ============================================================
-- LGU receiving departments
--
-- lgu_reviewer has always been one flat role for the whole municipal
-- office. This adds an optional `department`, mirroring how `position`
-- scopes barangay_official accounts: an lgu_reviewer assigned a department
-- gets a dedicated, filtered "incoming documents" view (Document
-- Submissions scoped to the report type(s) their office actually handles)
-- instead of the full municipality-wide LGU console. Unassigned lgu_reviewer
-- accounts (department is null) and super_admin keep full access.
-- ============================================================
create type lgu_department as enum ('treasurer_office', 'planning_office', 'administrator_office', 'mayor_office');

alter table profiles add column department lgu_department;

-- Same self-service protection as position: only super_admin can change it.
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

    if new.department is distinct from old.department then
      raise exception 'Only a super admin can change a staff department';
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

notify pgrst, 'reload schema';
