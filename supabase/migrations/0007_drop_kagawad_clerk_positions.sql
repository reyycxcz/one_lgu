-- ============================================================
-- Narrow barangay_position to the roles actually used in the barangay
-- portal: Captain, Secretary, Treasurer. Kagawad/Clerk were never assigned
-- to any account (see profiles.position distribution at migration time),
-- so this is a safe rename-swap rather than a data-migrating one.
-- ============================================================
alter type barangay_position rename to barangay_position_old;

create type barangay_position as enum ('captain', 'secretary', 'treasurer');

alter table profiles alter column position type barangay_position using (
  case when position::text in ('captain', 'secretary', 'treasurer')
    then position::text::barangay_position
    else null
  end
);

drop type barangay_position_old;

notify pgrst, 'reload schema';
