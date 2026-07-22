-- ============================================================
-- SEED DATA — Municipality of Dingras, Ilocos Norte
-- Single-run seed: 31 barangays + 1 super admin + 1 barangay
-- official account per barangay. Safe to re-run.
-- ============================================================

-- ============================================
-- Clean up (safe to re-run this seed file)
-- ============================================
delete from public.profiles where email like '%@onelgu.gov.ph';
delete from auth.users where email like '%@onelgu.gov.ph';
delete from public.barangays where municipality = 'Dingras';

-- ============================================
-- Barangays — Dingras, Ilocos Norte (31 barangays)
-- ============================================
insert into barangays (name, code, municipality, province, is_active)
values
  ('Albano', '0102809001', 'Dingras', 'Ilocos Norte', true),
  ('Bacsil', '0102809002', 'Dingras', 'Ilocos Norte', true),
  ('Bagut', '0102809003', 'Dingras', 'Ilocos Norte', true),
  ('Parado', '0102809004', 'Dingras', 'Ilocos Norte', true),
  ('Baresbes', '0102809005', 'Dingras', 'Ilocos Norte', true),
  ('Barong', '0102809006', 'Dingras', 'Ilocos Norte', true),
  ('Bungcag', '0102809007', 'Dingras', 'Ilocos Norte', true),
  ('Cali', '0102809009', 'Dingras', 'Ilocos Norte', true),
  ('Capasan', '0102809010', 'Dingras', 'Ilocos Norte', true),
  ('Dancel', '0102809011', 'Dingras', 'Ilocos Norte', true),
  ('Foz', '0102809012', 'Dingras', 'Ilocos Norte', true),
  ('Guerrero', '0102809013', 'Dingras', 'Ilocos Norte', true),
  ('Lanas', '0102809014', 'Dingras', 'Ilocos Norte', true),
  ('Lumbad', '0102809015', 'Dingras', 'Ilocos Norte', true),
  ('Madamba', '0102809016', 'Dingras', 'Ilocos Norte', true),
  ('Mandaloque', '0102809017', 'Dingras', 'Ilocos Norte', true),
  ('Medina', '0102809018', 'Dingras', 'Ilocos Norte', true),
  ('Ver', '0102809019', 'Dingras', 'Ilocos Norte', true),
  ('San Marcelino', '0102809020', 'Dingras', 'Ilocos Norte', true),
  ('Puruganan', '0102809021', 'Dingras', 'Ilocos Norte', true),
  ('Peralta', '0102809022', 'Dingras', 'Ilocos Norte', true),
  ('Root', '0102809023', 'Dingras', 'Ilocos Norte', true),
  ('Sagpatan', '0102809024', 'Dingras', 'Ilocos Norte', true),
  ('Saludares', '0102809025', 'Dingras', 'Ilocos Norte', true),
  ('San Esteban', '0102809026', 'Dingras', 'Ilocos Norte', true),
  ('Espiritu', '0102809027', 'Dingras', 'Ilocos Norte', true),
  ('Sulquiano', '0102809028', 'Dingras', 'Ilocos Norte', true),
  ('San Francisco', '0102809029', 'Dingras', 'Ilocos Norte', true),
  ('Suyo', '0102809030', 'Dingras', 'Ilocos Norte', true),
  ('San Marcos', '0102809031', 'Dingras', 'Ilocos Norte', true),
  ('Elizabeth', '0102809032', 'Dingras', 'Ilocos Norte', true);

-- ============================================
-- Super Admin (LGU / Municipal level, no barangay)
-- Login: superadmin@onelgu.gov.ph / Password123!
-- ============================================
do $$
declare
  new_user_id uuid := gen_random_uuid();
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'superadmin@onelgu.gov.ph',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"], "role": "super_admin"}',
    '{"full_name": "LGU Super Admin", "role": "super_admin"}',
    now(),
    now(),
    '', '', '', '', '', '', '', ''
  );

  insert into auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    new_user_id, new_user_id, new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', 'superadmin@onelgu.gov.ph'),
    'email', now(), now(), now()
  );

  -- The on_auth_user_created trigger already auto-created a 'resident'
  -- profile row for this id — upsert it into the intended super_admin role.
  insert into public.profiles (id, barangay_id, role, full_name, email, is_active)
  values (new_user_id, null, 'super_admin', 'LGU Super Admin', 'superadmin@onelgu.gov.ph', true)
  on conflict (id) do update set
    barangay_id = excluded.barangay_id,
    role = excluded.role,
    full_name = excluded.full_name,
    email = excluded.email,
    is_active = excluded.is_active;
end $$;

-- ============================================
-- One Barangay Official account per Dingras barangay
-- Login pattern: official.<barangayslug>@onelgu.gov.ph / Password123!
-- (e.g. official.albano@onelgu.gov.ph, official.sanmarcelino@onelgu.gov.ph)
-- ============================================
do $$
declare
  b record;
  new_user_id uuid;
  new_email text;
  slug text;
begin
  for b in select id, name from public.barangays where municipality = 'Dingras' order by code loop
    slug := lower(regexp_replace(b.name, '[^a-zA-Z0-9]', '', 'g'));
    new_email := 'official.' || slug || '@onelgu.gov.ph';
    new_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      new_email,
      extensions.crypt('Password123!', extensions.gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"], "role": "barangay_official"}',
      jsonb_build_object('full_name', 'Barangay Official - ' || b.name, 'role', 'barangay_official'),
      now(),
      now(),
      '', '', '', '', '', '', '', ''
    );

    insert into auth.identities (
      id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      new_user_id, new_user_id, new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', new_email),
      'email', now(), now(), now()
    );

    -- The on_auth_user_created trigger already auto-created a 'resident'
    -- profile row for this id — upsert it into the intended official role.
    insert into public.profiles (id, barangay_id, role, full_name, email, is_active)
    values (new_user_id, b.id, 'barangay_official', 'Barangay Official - ' || b.name, new_email, true)
    on conflict (id) do update set
      barangay_id = excluded.barangay_id,
      role = excluded.role,
      full_name = excluded.full_name,
      email = excluded.email,
      is_active = excluded.is_active;
  end loop;
end $$;

-- ============================================
-- Starter Civic Bulletin announcements (published)
-- Authored by the Super Admin, shown on the public landing page.
-- ============================================
delete from public.announcements where slug like 'seed-%';

do $$
declare
  admin_id uuid;
begin
  select id into admin_id from public.profiles where email = 'superadmin@onelgu.gov.ph';

  insert into public.announcements (author_id, category, title, slug, excerpt, tag, body, status, published_at)
  values
    (
      admin_id, 'certification_guide',
      'How to Request Barangay Clearances Online',
      'seed-how-to-request-barangay-clearances-online',
      'Follow the simple step-by-step procedure in the citizen desk portal to submit documents and track captain signatures.',
      'Civic Handbook',
      E'Requesting a Barangay Clearance through OneLGU takes just a few minutes. Log in to the Resident Citizen Portal using your registered account, then navigate to the Certifications section from your dashboard.\n\nClick "New Request" and select "Barangay Clearance" from the list of available document types. Fill in the required details — purpose of the clearance, valid ID information, and contact details — then upload a clear photo or scan of a valid government ID.\n\nOnce submitted, your request is routed to your barangay''s clerk for verification. You can track the status in real-time from your dashboard: Submitted → Verified → Approved → Ready for Pickup or Released.\n\nMost clearances are processed within 15–30 minutes during office hours. You will receive an in-app and email notification once your document is ready for digital download or physical pickup at the Barangay Hall.',
      'published', now()
    ),
    (
      admin_id, 'dispute_mediation',
      'Katarungang Pambarangay Hearing Rules',
      'seed-katarungang-pambarangay-hearing-rules',
      'Learn about local Lupon Tagapamayapa procedures, summoning schedules, and filing community grievances or disputes.',
      'Resolutions',
      E'The Katarungang Pambarangay system requires most disputes between residents of the same city or municipality to first go through barangay-level mediation before they can be filed in court.\n\nTo file a complaint, submit an Incident Grievance report through the Resident Portal. Your case is assigned to a Lupon Tagapamayapa member — typically a Kagawad — who will act as the mediator.\n\nBoth parties are formally summoned to a mediation hearing scheduled through the platform. If the parties reach an agreement, it is documented as a Kasunduang Pag-aayos (settlement agreement), which carries the force of a final court judgment if not repudiated within the reglementary period.\n\nIf mediation fails, the Lupon issues a Certificate to File Action, which allows the complainant to escalate the matter to the appropriate court.',
      'published', now()
    ),
    (
      admin_id, 'livelihood_programs',
      'Free Livelihood Seminars & Skills Training',
      'seed-free-livelihood-seminars-and-skills-training',
      'Register at your local Barangay Hall for upcoming municipal skills workshops to improve family income and enterprise.',
      'Upcoming Events',
      E'The Municipality of Dingras regularly partners with TESDA, DTI, and DOLE to bring free livelihood and skills training programs directly to barangay residents.\n\nPast and upcoming sessions include food processing and preservation, basic dressmaking and tailoring, small enterprise bookkeeping, and digital literacy for micro-entrepreneurs.\n\nSlots are limited per batch and prioritized for household heads and out-of-school youth. Interested residents should coordinate with their Barangay Hall or SK office for the schedule of the next intake.\n\nCompletion certificates are issued for programs run in partnership with TESDA, which can support future job applications or small business registration.',
      'published', now()
    ),
    (
      admin_id, 'clean_and_green',
      'Barangay Waste Management & Clean Schedules',
      'seed-barangay-waste-management-and-clean-schedules',
      'Participate in weekly community sanitation drives, local segregation campaigns, and environmental sanitation initiatives.',
      'Announcements',
      E'Under the Ecological Solid Waste Management Act (RA 9003), every barangay in Dingras observes a weekly collection and segregation schedule for biodegradable, recyclable, and residual waste.\n\nResidents are encouraged to segregate waste at the household level before scheduled collection days. Barangays also organize monthly "Linis Bayan" clean-up drives covering waterways, drainage canals, and public spaces.\n\nMaterials recovery facilities (MRFs) at the barangay level accept recyclables and compostable waste, helping reduce what ends up in the municipal landfill.\n\nCheck with your Barangay Hall for your specific collection days and the location of your nearest MRF drop-off point.',
      'published', now()
    );
end $$;
