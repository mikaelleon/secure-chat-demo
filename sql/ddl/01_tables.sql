-- CryptoChat — schema (run first on a new Supabase project)
-- Requires: Supabase Postgres (auth.users exists).

create table public.profiles (
  id uuid references auth.users (id) on delete cascade primary key,
  display_name text not null,
  email text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  participant_one uuid references public.profiles (id) on delete cascade not null,
  participant_two uuid references public.profiles (id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (participant_one, participant_two)
);

alter table public.conversations enable row level security;

-- Ciphertext only at rest (no plaintext columns). Plaintext is derived client-side with mode + shift_key.
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations (id) on delete cascade not null,
  sender_id uuid references public.profiles (id) on delete cascade not null,
  mode text check (mode in ('symmetric', 'asymmetric')) not null,
  shift_key integer,
  encrypted_text text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;
