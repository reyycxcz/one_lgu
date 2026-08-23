-- ============================================================
-- Expand lgu_department to the full standard set of Philippine municipal
-- offices, not just the 4 that already map to a report type. The extras
-- (Assessor's, Budget, Health, Social Welfare, etc.) exist for org-chart
-- accuracy and future use (e.g. barangay beneficiary requests) — they don't
-- have an automatic Document Submissions feed yet, only the original 4
-- (Treasurer's -> financial, Planning -> compliance, Administrator's ->
-- monthly, Mayor's -> accomplishment) do. That mapping stays app-side in
-- src/lib/auth/departments.ts, not enforced in the DB.
-- ============================================================
alter type lgu_department add value if not exists 'vice_mayor_office';
alter type lgu_department add value if not exists 'assessor_office';
alter type lgu_department add value if not exists 'budget_office';
alter type lgu_department add value if not exists 'accounting_office';
alter type lgu_department add value if not exists 'civil_registrar_office';
alter type lgu_department add value if not exists 'health_office';
alter type lgu_department add value if not exists 'social_welfare_office';
alter type lgu_department add value if not exists 'agriculture_office';
alter type lgu_department add value if not exists 'engineering_office';
alter type lgu_department add value if not exists 'drrm_office';
alter type lgu_department add value if not exists 'business_permits_office';
alter type lgu_department add value if not exists 'hr_office';
alter type lgu_department add value if not exists 'general_services_office';

notify pgrst, 'reload schema';
