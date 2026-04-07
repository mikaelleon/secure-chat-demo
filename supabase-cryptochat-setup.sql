-- Run blocks in Supabase SQL Editor in order (cryptochat / secure-chat prep).
-- Fixes vs raw guide: messages table enables RLS on public.messages (not conversations);
-- trigger uses EXECUTE FUNCTION (Postgres 15+ / Supabase).

-- --- Block 1: Profiles ---
create table public.profiles (
  id uuid references auth.users (id) on delete cascade primary key,
  display_name text not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- --- Block 2: Conversations ---
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  participant_one uuid references public.profiles (id) on delete cascade not null,
  participant_two uuid references public.profiles (id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (participant_one, participant_two)
);

alter table public.conversations enable row level security;

-- --- Block 3: Messages ---
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations (id) on delete cascade not null,
  sender_id uuid references public.profiles (id) on delete cascade not null,
  mode text check (mode in ('symmetric', 'asymmetric')) not null,
  shift_key integer,
  original_text text not null,
  encrypted_text text not null,
  decrypted_text text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

-- --- Profiles policies ---
create policy "Profiles are viewable by authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

-- --- Conversations policies ---
create policy "Users can view their own conversations"
on public.conversations for select
to authenticated
using (
  auth.uid() = participant_one
  or auth.uid() = participant_two
);

create policy "Users can create conversations"
on public.conversations for insert
to authenticated
with check (
  auth.uid() = participant_one
  or auth.uid() = participant_two
);

-- --- Messages policies ---
create policy "Users can read messages in their conversations"
on public.messages for select
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
  )
);

create policy "Users can insert their own messages"
on public.messages for insert
to authenticated
with check (auth.uid() = sender_id);

-- --- Auto-create profile on signup ---
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- --- Realtime ---
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
