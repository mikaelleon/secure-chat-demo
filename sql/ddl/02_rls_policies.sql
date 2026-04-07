-- Row Level Security policies (run after 01_tables.sql)

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
