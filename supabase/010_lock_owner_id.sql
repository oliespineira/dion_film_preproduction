create or replace function public.prevent_owner_id_change()
returns trigger
language plpgsql as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'No se puede reasignar el propietario del proyecto';
  end if;
  return new;
end;
$$;

drop trigger if exists lock_owner_id on projects;
create trigger lock_owner_id
  before update on projects
  for each row execute function public.prevent_owner_id_change();