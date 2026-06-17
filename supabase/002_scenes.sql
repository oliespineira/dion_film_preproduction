-- Run this AFTER schema.sql, in the Supabase SQL editor.
-- Adds the "scenes" table used by the script breakdown module
-- (one row per scene, one column per department).

create table if not exists scenes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,

  scene_number text not null default '',
  int_ext text not null default 'INT' check (int_ext in ('INT', 'EXT')),
  day_night text not null default 'DÍA' check (day_night in ('DÍA', 'NOCHE')),

  location_id uuid references locations(id) on delete set null,
  location_name text default '',

  description text default '',
  page_range text default '',
  eighths numeric default 0,

  character_ids uuid[] default '{}',
  has_extras boolean not null default false,
  extras_notes text default '',

  wardrobe text default '',
  makeup_hair text default '',
  set_design text default '',
  props text default '',
  vehicles text default '',
  animals_children text default '',

  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table scenes enable row level security;

create policy "Users manage their own scenes" on scenes
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
