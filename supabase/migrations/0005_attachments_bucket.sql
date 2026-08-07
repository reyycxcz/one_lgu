-- ============================================================
-- Storage bucket for resident-supplied attachments:
--   * certification requirement uploads (valid IDs, proofs)
--   * complaint evidence (photos, documents)
-- Accepts images + PDFs, 5MB cap. Same privacy model as "reports":
-- objects are fetchable by their public URL, but the bucket cannot be
-- listed by anon/authenticated (no broad SELECT policy on storage.objects).
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments', 'attachments', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

create policy "Allow authenticated uploads to attachments bucket"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'attachments');
