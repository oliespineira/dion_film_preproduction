-- Run this AFTER the previous migrations, in the Supabase SQL editor.
-- Adds lighting plans per scene. Two kinds, both stored in one table:
--  - 'image'   -> an uploaded photo or a freehand drawing (storage_path)
--  - 'diagram' -> a structured floor-plan diagram with placeable, rotatable
--                 fixture icons (diagram_data), optionally over an uploaded
--                 backdrop image of the real location (background_path).
-- Reuses the existing "reference-photos" storage bucket — no new bucket.

create table if not exists lighting_plans (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references scenes(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,

  kind text not null default 'image' check (kind in ('image', 'diagram')),
  storage_path text default '',
  background_path text default '',
  diagram_data jsonb not null default '[]',
  caption text default '',

  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table lighting_plans enable row level security;

create policy "Users manage their own lighting plans" on lighting_plans
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
