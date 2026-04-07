-- DML: copy emails from auth.users into public.profiles (one-time maintenance)
-- Run in Supabase SQL Editor after ddl/patches/001_add_profiles_email.sql if profiles lack email.
-- Requires permission to read auth.users (dashboard SQL editor typically has this).

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and (p.email is null or p.email = '');
