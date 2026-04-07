-- Enable Realtime for chat tables (run once; re-run may error if already added)

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
