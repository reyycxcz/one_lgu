-- ============================================
-- ADD: Complaint category/type
-- ============================================
create type complaint_type as enum (
  'noise_complaint',
  'garbage_illegal_dumping',
  'road_infrastructure',
  'streetlight_problem',
  'stray_aggressive_animals',
  'other'
);

alter table complaints
  add column type complaint_type not null default 'other';

create index idx_complaints_type on complaints(type);
