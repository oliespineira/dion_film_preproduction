-- Run this AFTER schema.sql, 002_scenes.sql, 003_shots.sql and 004_callsheets.sql,
-- in the Supabase SQL editor. Adds support for the department dossiers module:
-- new per-scene notes for Sonido/Producción/Dirección, a reference_photos
-- table, and a storage bucket + policies for uploading reference images.

-- New per-scene department fields (Arte, Vestuario and Maquillaje already
-- have columns: set_design, props, wardrobe, makeup_hair).
alter table scenes add column if not exists sound_notes text default '';
alter table scenes add column if not exists production_notes text default '';
alter table scenes add column if not exists director_notes text default '';

-- Reference photos, optionally tied to a specific scene, tagged by department.
create table if not exists reference_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  scene_id uuid references scenes(id) on delete set null,

  department text not null check (
    department in ('Arte', 'Vestuario', 'Maquillaje', 'Fotografía', 'Sonido', 'Producción', 'Dirección')
  ),
  storage_path text not null,
  caption text default '',

  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table reference_photos enable row level security;

create policy "Users manage their own reference photos" on reference_photos
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Storage bucket for the actual image files. Public so <img> tags can load
-- the photos directly via their URL; uploads/deletes are still restricted
-- to each user's own folder via the policies below.
insert into storage.buckets (id, name, public)
values ('reference-photos', 'reference-photos', true)
on conflict (id) do nothing;

create policy "Users upload to their own folder"
on storage.objects for insert
with check (bucket_id = 'reference-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete their own files"
on storage.objects for delete
using (bucket_id = 'reference-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users view their own files via API"
on storage.objects for select
using (bucket_id = 'reference-photos' and (storage.foldername(name))[1] = auth.uid()::text);
