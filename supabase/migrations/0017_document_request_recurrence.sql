-- Lets an LGU department mark a document request as a recurring obligation
-- (monthly/quarterly/annual) instead of only a one-off ask, and groups every
-- cycle of the same recurring request together so history/duplication is
-- possible. recurrence is a CHECK constraint on text (not a real enum
-- type) specifically so it can be added, backfilled, and enforced in one
-- migration — Postgres enum types require the value-add and any
-- constraint referencing it to be in separate transactions, which text +
-- check does not.
alter table document_requests
  add column if not exists recurrence text,
  add column if not exists recurrence_group_id uuid;

update document_requests set recurrence = 'one_time' where recurrence is null;
update document_requests set recurrence_group_id = id where recurrence_group_id is null;

alter table document_requests
  alter column recurrence set not null,
  alter column recurrence set default 'one_time',
  alter column recurrence_group_id set not null,
  alter column recurrence_group_id set default gen_random_uuid();

alter table document_requests
  add constraint chk_document_requests_recurrence
    check (recurrence in ('one_time', 'monthly', 'quarterly', 'annual'));
