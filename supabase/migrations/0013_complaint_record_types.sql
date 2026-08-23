-- ============================================================
-- Split "complaints" into two record types: Community/Service Reports
-- (streetlight, garbage, road damage, etc — administrative workflow, no
-- mediation) vs Formal Complaints/Disputes (neighbor disputes etc — may go
-- through notice, mediation, Pangkat conciliation). Previously every row
-- shared one status ladder including mediation/scheduled, which let a
-- streetlight report "enter mediation" — exactly the anti-pattern this
-- migration exists to make structurally impossible.
-- ============================================================
create type complaint_record_type as enum ('service_report', 'formal_complaint');

alter table complaints add column record_type complaint_record_type not null default 'service_report';

-- The one existing row has a respondent_name set — a dispute against a
-- named party — so it backfills as a formal complaint.
update complaints set record_type = 'formal_complaint' where respondent_name is not null and respondent_name <> '';

-- Additive only — existing values (road_infrastructure, streetlight_problem,
-- stray_aggressive_animals, garbage_illegal_dumping, noise_complaint, other)
-- are kept and reused, nothing is removed or renamed.
alter type complaint_type add value if not exists 'drainage_problem';
alter type complaint_type add value if not exists 'public_facility_damage';
alter type complaint_type add value if not exists 'dirty_public_area';
alter type complaint_type add value if not exists 'hazardous_area';
alter type complaint_type add value if not exists 'dangerous_tree';
alter type complaint_type add value if not exists 'public_disturbance';
alter type complaint_type add value if not exists 'illegal_dumping';
alter type complaint_type add value if not exists 'environmental_concern';
alter type complaint_type add value if not exists 'garbage_uncollected';
alter type complaint_type add value if not exists 'neighbor_dispute';
alter type complaint_type add value if not exists 'property_dispute';
alter type complaint_type add value if not exists 'personal_dispute';
alter type complaint_type add value if not exists 'obligation_dispute';
alter type complaint_type add value if not exists 'other_dispute';

alter type complaint_status add value if not exists 'assigned';
alter type complaint_status add value if not exists 'in_progress';
alter type complaint_status add value if not exists 'rejected';
alter type complaint_status add value if not exists 'notice_summons';
alter type complaint_status add value if not exists 'pangkat_conciliation';
alter type complaint_status add value if not exists 'settled';
alter type complaint_status add value if not exists 'not_settled';

alter table complaints add column priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent'));
alter table complaints add column location text;
alter table complaints add column incident_at timestamptz;
alter table complaints add column assigned_to_label text;
alter table complaints add column notice_issued_at timestamptz;
alter table complaints add column notice_details text;
alter table complaints add column pangkat_members text;
alter table complaints add column pangkat_notes text;
alter table complaints add column rejected_reason text;
alter table complaints add column is_anonymous boolean not null default false;

notify pgrst, 'reload schema';
