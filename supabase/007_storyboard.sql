-- Run this AFTER the previous migrations, in the Supabase SQL editor.
-- Adds storyboard frames: one or more images per shot (uploaded or drawn
-- in-app). Reuses the "reference-photos" storage bucket and its policies
-- created in 005_departments.sql — no new bucket needed.

create table if not exists storyboard_frames (
  id uuid primary key default gen_random_uuid(),
  shot_id uuid not null references shots(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,

  storage_path text not null,
  caption text default '',

  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table storyboard_frames enable row level security;

create policy "Users manage their own storyboard frames" on storyboard_frames
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
