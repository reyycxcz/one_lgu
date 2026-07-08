-- ============================================
-- SEED DATA
-- ============================================

-- Seed Barangays
insert into barangays (id, name, code, municipality, province, is_active)
values 
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Barangay San Jose', 'BGY-001', 'Laoag City', 'Ilocos Norte', true),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Barangay Santa Rita', 'BGY-002', 'Laoag City', 'Ilocos Norte', true),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Barangay San Antonio', 'BGY-003', 'Laoag City', 'Ilocos Norte', true)
on conflict (code) do update 
set 
  name = excluded.name,
  is_active = excluded.is_active;
