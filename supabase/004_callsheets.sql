-- Run this AFTER schema.sql, 002_scenes.sql and 003_shots.sql, in the
-- Supabase SQL editor. Adds the tables for the call-sheet module:
-- shooting days, the daily schedule of scenes, and call times for
-- cast/crew (citaciones).

create table if not exists shoot_days (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,

  day_label text not null default '',
  day_date date,
  general_call_time text default '',
  main_location text default '',
  notes text default '',

  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists shoot_day_scenes (
  id uuid primary key default gen_random_uuid(),
  shoot_day_id uuid not null references shoot_days(id) on delete cascade,
  scene_id uuid references scenes(id) on delete set null,
  project_id uuid not null references projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,

  scheduled_time text default '',
  notes text default '',

  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists call_times (
  id uuid primary key default gen_random_uuid(),
  shoot_day_id uuid not null references shoot_days(id) on delete cascade,
  character_id uuid references characters(id) on delete set null,
  project_id uuid not null references projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,

  person_name text not null default '',
  role_type text not null default 'Actor' check (role_type in ('Actor', 'Equipo técnico', 'Equipo artístico')),
  call_time text default '',
  notes text default '',

  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table shoot_days enable row level security;
alter table shoot_day_scenes enable row level security;
alter table call_times enable row level security;

create policy "Users manage their own shoot days" on shoot_days
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Users manage their own schedule slots" on shoot_day_scenes
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Users manage their own call times" on call_times
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
