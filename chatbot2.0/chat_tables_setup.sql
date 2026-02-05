-- Create a table for chat conversations
-- Each user can have multiple conversations
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create a table for chat messages
-- Each message belongs to a conversation
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default now() not null
);

-- Set up Row Level Security (RLS) for conversations
alter table public.conversations enable row level security;

-- Policies for secure access to conversations
create policy "Users can view their own conversations."
  on public.conversations for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own conversations."
  on public.conversations for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own conversations."
  on public.conversations for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own conversations."
  on public.conversations for delete
  using ( auth.uid() = user_id );

-- Set up Row Level Security (RLS) for messages
alter table public.messages enable row level security;

-- Policies for secure access to messages
create policy "Users can view messages from their own conversations."
  on public.messages for select
  using ( exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
    and conversations.user_id = auth.uid()
  ) );

create policy "Users can insert messages to their own conversations."
  on public.messages for insert
  with check ( exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
    and conversations.user_id = auth.uid()
  ) );

create policy "Users can update messages from their own conversations."
  on public.messages for update
  using ( exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
    and conversations.user_id = auth.uid()
  ) );

create policy "Users can delete messages from their own conversations."
  on public.messages for delete
  using ( exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
    and conversations.user_id = auth.uid()
  ) );

-- Function to update the updated_at column automatically for conversations
create or replace function public.handle_conversation_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql
security definer
set search_path = public;

-- Trigger to automatically update the updated_at column for conversations
drop trigger if exists handle_conversation_updated_at on public.conversations;
create trigger handle_conversation_updated_at
  before update on public.conversations
  for each row
  execute function public.handle_conversation_updated_at();

-- Indexes for better performance
create index if not exists idx_conversations_user_id on public.conversations (user_id);
create index if not exists idx_conversations_updated_at on public.conversations (updated_at);
create index if not exists idx_messages_conversation_id on public.messages (conversation_id);
create index if not exists idx_messages_created_at on public.messages (created_at);

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated;
grant all privileges on table public.conversations to postgres, anon, authenticated;
grant all privileges on table public.messages to postgres, anon, authenticated;
grant all privileges on schema public to postgres;