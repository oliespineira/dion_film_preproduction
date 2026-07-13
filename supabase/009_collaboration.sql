-- Run this AFTER all previous migrations, in the Supabase SQL editor.
-- This is a big one: it turns every project from "owned by one user" into
-- "shared by a team", with three roles (owner / editor / viewer), email
-- invitations that work even for people who don't have an account yet,
-- and it enables Realtime so everyone sees changes live.

-- =====================================================================
-- 1. New tables: membership and invitations
-- =====================================================================

create table if not exists project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  role text not null default 'editor' check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create table if not exists project_invites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  email text not null,
  role text not null default 'editor' check (role in ('editor', 'viewer')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  unique (project_id, email)
);

alter table project_members enable row level security;
alter table project_invites enable row level security;

-- =====================================================================
-- 2. Helper functions used inside policies (security definer so they can
--    read project_members regardless of the calling role's own RLS view)
-- =====================================================================

create or replace function public.is_project_member(p_project_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;

create or replace function public.project_role(p_project_id uuid)
returns text
language sql security definer stable set search_path = public as $$
  select role from project_members
  where project_id = p_project_id and user_id = auth.uid()
  limit 1;
$$;

create or replace function public.can_edit_project(p_project_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from project_members
    where project_id = p_project_id and user_id = auth.uid() and role in ('owner', 'editor')
  );
$$;

grant execute on function public.is_project_member(uuid) to authenticated;
grant execute on function public.project_role(uuid) to authenticated;
grant execute on function public.can_edit_project(uuid) to authenticated;

-- =====================================================================
-- 3. Auto-membership triggers
--    - creating a project makes you its owner member
--    - signing up with an invited email activates your pending invites
-- =====================================================================

create or replace function public.handle_new_project()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into project_members (project_id, user_id, role, email)
  values (new.id, new.owner_id, 'owner', (select email from auth.users where id = new.owner_id))
  on conflict (project_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_project_created on projects;
create trigger on_project_created
  after insert on projects
  for each row execute function public.handle_new_project();

create or replace function public.handle_new_user_invites()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into project_members (project_id, user_id, role, email)
  select project_id, new.id, role, new.email
  from project_invites
  where lower(email) = lower(new.email) and status = 'pending'
  on conflict (project_id, user_id) do nothing;

  update project_invites
  set status = 'accepted'
  where lower(email) = lower(new.email) and status = 'pending';

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_invites on auth.users;
create trigger on_auth_user_created_invites
  after insert on auth.users
  for each row execute function public.handle_new_user_invites();

-- =====================================================================
-- 4. Invite-by-email RPC: works whether or not the person already has
--    an account. Only the project owner can call it.
-- =====================================================================

create or replace function public.invite_to_project(p_project_id uuid, p_email text, p_role text default 'editor')
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_caller_role text;
  v_user_id uuid;
  v_email text := lower(trim(p_email));
begin
  select role into v_caller_role from project_members where project_id = p_project_id and user_id = auth.uid();
  if v_caller_role is distinct from 'owner' then
    raise exception 'Solo el propietario del proyecto puede invitar miembros';
  end if;

  if p_role not in ('editor', 'viewer') then
    raise exception 'Rol no válido';
  end if;

  select id into v_user_id from auth.users where lower(email) = v_email limit 1;

  if v_user_id is not null then
    insert into project_members (project_id, user_id, role, email)
    values (p_project_id, v_user_id, p_role, v_email)
    on conflict (project_id, user_id) do update set role = excluded.role;

    insert into project_invites (project_id, email, role, invited_by, status)
    values (p_project_id, v_email, p_role, auth.uid(), 'accepted')
    on conflict (project_id, email) do update set status = 'accepted', role = excluded.role;

    return json_build_object('status', 'added', 'email', v_email);
  else
    insert into project_invites (project_id, email, role, invited_by, status)
    values (p_project_id, v_email, p_role, auth.uid(), 'pending')
    on conflict (project_id, email) do update set role = excluded.role, status = 'pending';

    return json_build_object('status', 'pending', 'email', v_email);
  end if;
end;
$$;

grant execute on function public.invite_to_project(uuid, text, text) to authenticated;

create or replace function public.update_member_role(p_project_id uuid, p_user_id uuid, p_role text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if (select role from project_members where project_id = p_project_id and user_id = auth.uid()) is distinct from 'owner' then
    raise exception 'Solo el propietario puede cambiar roles';
  end if;
  if p_role not in ('editor', 'viewer') then
    raise exception 'Rol no válido';
  end if;
  update project_members set role = p_role where project_id = p_project_id and user_id = p_user_id;
end;
$$;

grant execute on function public.update_member_role(uuid, uuid, text) to authenticated;

-- =====================================================================
-- 5. One-time backfill: every existing project gets its current owner
--    as an 'owner' member, so nobody loses access when this ships.
-- =====================================================================

insert into project_members (project_id, user_id, role, email)
select p.id, p.owner_id, 'owner', u.email
from projects p
join auth.users u on u.id = p.owner_id
on conflict (project_id, user_id) do nothing;

-- =====================================================================
-- 6. RLS policies for project_members / project_invites
-- =====================================================================

drop policy if exists "Members can view membership" on project_members;
drop policy if exists "Owners can add members" on project_members;
drop policy if exists "Owners can update member roles" on project_members;
drop policy if exists "Owners can remove members" on project_members;
drop policy if exists "Members can remove themselves" on project_members;

create policy "Members can view membership" on project_members
  for select using (is_project_member(project_id));
create policy "Owners can add members" on project_members
  for insert with check (project_role(project_id) = 'owner');
create policy "Owners can update member roles" on project_members
  for update using (project_role(project_id) = 'owner');
create policy "Owners can remove members" on project_members
  for delete using (project_role(project_id) = 'owner');
create policy "Members can remove themselves" on project_members
  for delete using (user_id = auth.uid());

drop policy if exists "Members can view invites" on project_invites;
drop policy if exists "Owners can create invites" on project_invites;
drop policy if exists "Owners can update invites" on project_invites;
drop policy if exists "Owners can delete invites" on project_invites;

create policy "Members can view invites" on project_invites
  for select using (is_project_member(project_id));
create policy "Owners can create invites" on project_invites
  for insert with check (project_role(project_id) = 'owner');
create policy "Owners can update invites" on project_invites
  for update using (project_role(project_id) = 'owner');
create policy "Owners can delete invites" on project_invites
  for delete using (project_role(project_id) = 'owner');

-- =====================================================================
-- 7. Rewrite RLS on every existing table: from "owner_id = me" to
--    "I'm a member of this row's project" (view = any member,
--    write = owner or editor).
-- =====================================================================

drop policy if exists "Users manage their own projects" on projects;
create policy "Members can view their projects" on projects
  for select using (is_project_member(id));
create policy "Anyone can create a project" on projects
  for insert with check (auth.uid() = owner_id);
create policy "Owners and editors can update project" on projects
  for update using (can_edit_project(id)) with check (can_edit_project(id));
create policy "Only owners can delete project" on projects
  for delete using (project_role(id) = 'owner');

-- Reusable pattern for every child table (all of them already have project_id)
drop policy if exists "Users manage their own characters" on characters;
create policy "Members view characters" on characters for select using (is_project_member(project_id));
create policy "Editors insert characters" on characters for insert with check (can_edit_project(project_id));
create policy "Editors update characters" on characters for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy "Editors delete characters" on characters for delete using (can_edit_project(project_id));

drop policy if exists "Users manage their own locations" on locations;
create policy "Members view locations" on locations for select using (is_project_member(project_id));
create policy "Editors insert locations" on locations for insert with check (can_edit_project(project_id));
create policy "Editors update locations" on locations for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy "Editors delete locations" on locations for delete using (can_edit_project(project_id));

drop policy if exists "Users manage their own scenes" on scenes;
create policy "Members view scenes" on scenes for select using (is_project_member(project_id));
create policy "Editors insert scenes" on scenes for insert with check (can_edit_project(project_id));
create policy "Editors update scenes" on scenes for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy "Editors delete scenes" on scenes for delete using (can_edit_project(project_id));

drop policy if exists "Users manage their own shots" on shots;
create policy "Members view shots" on shots for select using (is_project_member(project_id));
create policy "Editors insert shots" on shots for insert with check (can_edit_project(project_id));
create policy "Editors update shots" on shots for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy "Editors delete shots" on shots for delete using (can_edit_project(project_id));

drop policy if exists "Users manage their own shoot days" on shoot_days;
create policy "Members view shoot days" on shoot_days for select using (is_project_member(project_id));
create policy "Editors insert shoot days" on shoot_days for insert with check (can_edit_project(project_id));
create policy "Editors update shoot days" on shoot_days for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy "Editors delete shoot days" on shoot_days for delete using (can_edit_project(project_id));

drop policy if exists "Users manage their own schedule slots" on shoot_day_scenes;
create policy "Members view schedule slots" on shoot_day_scenes for select using (is_project_member(project_id));
create policy "Editors insert schedule slots" on shoot_day_scenes for insert with check (can_edit_project(project_id));
create policy "Editors update schedule slots" on shoot_day_scenes for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy "Editors delete schedule slots" on shoot_day_scenes for delete using (can_edit_project(project_id));

drop policy if exists "Users manage their own call times" on call_times;
create policy "Members view call times" on call_times for select using (is_project_member(project_id));
create policy "Editors insert call times" on call_times for insert with check (can_edit_project(project_id));
create policy "Editors update call times" on call_times for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy "Editors delete call times" on call_times for delete using (can_edit_project(project_id));

drop policy if exists "Users manage their own reference photos" on reference_photos;
create policy "Members view reference photos" on reference_photos for select using (is_project_member(project_id));
create policy "Editors insert reference photos" on reference_photos for insert with check (can_edit_project(project_id));
create policy "Editors update reference photos" on reference_photos for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy "Editors delete reference photos" on reference_photos for delete using (can_edit_project(project_id));

drop policy if exists "Users manage their own synopsis drafts" on synopsis_drafts;
create policy "Members view synopsis drafts" on synopsis_drafts for select using (is_project_member(project_id));
create policy "Editors insert synopsis drafts" on synopsis_drafts for insert with check (can_edit_project(project_id));
create policy "Editors delete synopsis drafts" on synopsis_drafts for delete using (can_edit_project(project_id));

drop policy if exists "Users manage their own screenplay drafts" on screenplay_drafts;
create policy "Members view screenplay drafts" on screenplay_drafts for select using (is_project_member(project_id));
create policy "Editors insert screenplay drafts" on screenplay_drafts for insert with check (can_edit_project(project_id));
create policy "Editors delete screenplay drafts" on screenplay_drafts for delete using (can_edit_project(project_id));

drop policy if exists "Users manage their own storyboard frames" on storyboard_frames;
create policy "Members view storyboard frames" on storyboard_frames for select using (is_project_member(project_id));
create policy "Editors insert storyboard frames" on storyboard_frames for insert with check (can_edit_project(project_id));
create policy "Editors update storyboard frames" on storyboard_frames for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy "Editors delete storyboard frames" on storyboard_frames for delete using (can_edit_project(project_id));

drop policy if exists "Users manage their own lighting plans" on lighting_plans;
create policy "Members view lighting plans" on lighting_plans for select using (is_project_member(project_id));
create policy "Editors insert lighting plans" on lighting_plans for insert with check (can_edit_project(project_id));
create policy "Editors update lighting plans" on lighting_plans for update using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy "Editors delete lighting plans" on lighting_plans for delete using (can_edit_project(project_id));

-- =====================================================================
-- 8. Storage: let any project editor manage files under that project's
--    folder (not just the original uploader), keyed off path segment 2
--    (paths are "{uploader_user_id}/{project_id}/...").
-- =====================================================================

drop policy if exists "Users upload to their own folder" on storage.objects;
drop policy if exists "Users delete their own files" on storage.objects;
drop policy if exists "Users view their own files via API" on storage.objects;

create policy "Project editors can upload" on storage.objects
  for insert with check (
    bucket_id = 'reference-photos' and can_edit_project(((storage.foldername(name))[2])::uuid)
  );
create policy "Project editors can delete" on storage.objects
  for delete using (
    bucket_id = 'reference-photos' and can_edit_project(((storage.foldername(name))[2])::uuid)
  );
create policy "Project members can view via API" on storage.objects
  for select using (
    bucket_id = 'reference-photos' and is_project_member(((storage.foldername(name))[2])::uuid)
  );

-- =====================================================================
-- 9. Realtime: broadcast changes on every collaborative table.
-- =====================================================================

alter publication supabase_realtime add table
  projects, project_members, project_invites,
  characters, locations, scenes, shots,
  shoot_days, shoot_day_scenes, call_times,
  reference_photos, synopsis_drafts, screenplay_drafts,
  storyboard_frames, lighting_plans;
