-- Create a table for moments (idempotent)
create table if not exists moments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  recorded_at timestamptz not null,
  note text,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table moments enable row level security;

-- Create policies (drop first to ensure updates)
drop policy if exists "Users can insert their own moments" on moments;
create policy "Users can insert their own moments"
  on moments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can view their own moments" on moments;
create policy "Users can view their own moments"
  on moments for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own moments" on moments;
create policy "Users can update their own moments"
  on moments for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own moments" on moments;
create policy "Users can delete their own moments"
  on moments for delete
  using (auth.uid() = user_id);
