-- Run this AFTER schema.sql and 002_scenes.sql, in the Supabase SQL editor.
-- Adds the "shots" table: each scene breaks down into a list of shots
-- (encuadre, angulación, movimiento de cámara, objetivo/lente).

create table if not exists shots (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references scenes(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,

  shot_number text not null default '',
  framing text default '',
  angle text default '',
  movement text default '',
  lens text default '',
  description text default '',
  duration_seconds numeric,
  notes text default '',

  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table shots enable row level security;

create policy "Users manage their own shots" on shots
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
