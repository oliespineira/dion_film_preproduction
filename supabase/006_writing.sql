-- Run this AFTER the previous migrations, in the Supabase SQL editor.
-- Adds versioned storage for the writing phase: every save creates a new
-- draft row instead of overwriting, so nothing is ever lost.

create table if not exists synopsis_drafts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,

  label text default '',
  content text default '',

  created_at timestamptz not null default now()
);

create table if not exists screenplay_drafts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,

  label text default '',
  -- Array of { id, type, text } elements. type is one of:
  -- scene_heading | action | character | parenthetical | dialogue | transition
  elements jsonb not null default '[]',

  created_at timestamptz not null default now()
);

alter table synopsis_drafts enable row level security;
alter table screenplay_drafts enable row level security;

create policy "Users manage their own synopsis drafts" on synopsis_drafts
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Users manage their own screenplay drafts" on screenplay_drafts
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
