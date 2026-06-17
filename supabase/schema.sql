-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
-- It creates the three tables the app needs and locks each row to its owner,
-- so every user only ever sees their own projects, characters and locations.

create extension if not exists "pgcrypto";

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  one_liner text default '',
  physical text default '',
  psychological text default '',
  background text default '',
  traits text[] default '{}',
  created_at timestamptz not null default now()
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  physical text default '',
  history text default '',
  atmosphere text default '',
  created_at timestamptz not null default now()
);

alter table projects enable row level security;
alter table characters enable row level security;
alter table locations enable row level security;

create policy "Users manage their own projects" on projects
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Users manage their own characters" on characters
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Users manage their own locations" on locations
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
