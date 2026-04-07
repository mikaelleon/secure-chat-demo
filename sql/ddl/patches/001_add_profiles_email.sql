-- Patch: add profiles.email + refresh trigger (for DBs created before email existed)
-- Run this before dml/backfill_profile_emails.sql if email column is missing.

alter table public.profiles add column if not exists email text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    ),
    new.email
  );
  return new;
end;
$$;
