-- ============================================
-- NOTIFICATIONS
-- ============================================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'general',
  is_read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications(user_id);
create index if not exists idx_notifications_read on notifications(is_read);
create index if not exists idx_notifications_created on notifications(created_at desc);
