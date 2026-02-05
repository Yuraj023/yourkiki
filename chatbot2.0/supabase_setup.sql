-- Create a table for public profiles
-- This is a secure and robust version with proper constraints and RLS policies
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone default now(),
  name text,
  email text,
  -- Constraint to ensure name is either NULL or at least 2 characters
  constraint username_length check (name is null or char_length(name) >= 2)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table public.profiles
  enable row level security;

-- Policies for secure access
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Users can delete own profile."
  on public.profiles for delete
  using ( auth.uid() = id );

-- Function to update the updated_at column automatically
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql
security definer
set search_path = public;

-- Trigger to automatically update the updated_at column
drop trigger if exists handle_updated_at on public.profiles;
create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Function to automatically create a profile when a user is created
-- This version is more robust with error handling
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert profile with exception handling
  begin
    insert into public.profiles (id, email)
    values (new.id, new.email);
  exception 
    when others then
      -- Log the error but don't fail the user creation
      raise warning 'Failed to create profile for user %: %', new.id, sqlerrm;
  end;
  return new;
end;
$$ language plpgsql
security definer
set search_path = public;

-- Trigger to automatically create a profile when a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row 
  execute function public.handle_new_user();

-- Storage setup for avatars (optional)
-- Only create if it doesn't exist
insert into storage.buckets (id, name, public)
select 'avatars', 'avatars', true
where not exists (
  select 1 from storage.buckets where id = 'avatars'
);

-- Storage policies for avatars
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Users can update their own avatars."
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );

create policy "Users can delete their own avatars."
  on storage.objects for delete
  using ( bucket_id = 'avatars' and auth.uid() = owner );

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated;
grant all privileges on table public.profiles to postgres, anon, authenticated;
grant all privileges on schema public to postgres;