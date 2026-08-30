-- The "Document Type" dropdown on the Create Document Request form has
-- never actually persisted anywhere — document_requests had no type column,
-- so the selection was silently discarded on submit. This adds real
-- storage for it. Free-text (not an enum) to match the existing pattern
-- used for requesting_department_id: the taxonomy of possible document
-- types is owned by the app layer (src/lib/documents/request-types.ts),
-- not hard-locked into the schema.
alter table document_requests add column if not exists document_type text;
