create extension if not exists pgcrypto;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('visit', 'download')),
  path text not null default '/',
  platform text,
  version text,
  country char(2),
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_event_type_created_at_idx
  on public.analytics_events (event_type, created_at desc);

create index if not exists analytics_events_version_idx
  on public.analytics_events (version)
  where event_type = 'download';

alter table public.analytics_events enable row level security;

drop policy if exists "No public analytics reads" on public.analytics_events;
drop policy if exists "No public analytics writes" on public.analytics_events;

create policy "No public analytics reads"
  on public.analytics_events
  for select
  using (false);

create policy "No public analytics writes"
  on public.analytics_events
  for insert
  with check (false);
