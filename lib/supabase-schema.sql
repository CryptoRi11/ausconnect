-- AUS Connect Database Schema
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/opmykhrqtbhzyblpttcg/sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (maps to Supabase Auth users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null check (role in ('player', 'coach')),
  subscription_status text default 'free',
  created_at timestamptz default now() not null
);

alter table public.users enable row level security;

create policy "Users can view their own record"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own record"
  on public.users for update
  using (auth.uid() = id);

-- Player profiles
create table if not exists public.player_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  full_name text,
  location_city text,
  location_state text,
  current_team text,
  position text,
  profile_picture_url text,
  height_cm numeric,
  height_ft integer,
  height_in integer,
  weight_kg numeric,
  weight_lbs numeric,
  age integer,
  contact_email text,
  contact_phone text,
  instagram text,
  twitter text,
  goals text,
  video_link_1 text,
  video_link_2 text,
  video_link_3 text,
  is_visible boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.player_profiles enable row level security;

create policy "Players can manage their own profile"
  on public.player_profiles for all
  using (auth.uid() = user_id);

create policy "Coaches can view visible player profiles"
  on public.player_profiles for select
  using (
    is_visible = true
    and exists (
      select 1 from public.users where id = auth.uid() and role = 'coach'
    )
  );

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger player_profiles_updated_at
  before update on public.player_profiles
  for each row execute function update_updated_at();

-- Coach profiles
create table if not exists public.coach_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  full_name text,
  university text,
  position_title text,
  contact_email text,
  subscription_status text default 'free',
  created_at timestamptz default now() not null
);

alter table public.coach_profiles enable row level security;

create policy "Coaches can manage their own profile"
  on public.coach_profiles for all
  using (auth.uid() = user_id);

create policy "Coaches can view other coach profiles"
  on public.coach_profiles for select
  using (
    exists (
      select 1 from public.users where id = auth.uid() and role = 'coach'
    )
  );

-- Evaluations
create table if not exists public.evaluations (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references public.player_profiles(id) on delete cascade,
  offensive_ability numeric check (offensive_ability between 0 and 10),
  defensive_skills numeric check (defensive_skills between 0 and 10),
  overall_iq numeric check (overall_iq between 0 and 10),
  physical_ability numeric check (physical_ability between 0 and 10),
  culture_rating numeric check (culture_rating between 0 and 10),
  composite_score numeric generated always as (
    (coalesce(offensive_ability, 0) + coalesce(defensive_skills, 0) + coalesce(overall_iq, 0) + coalesce(physical_ability, 0) + coalesce(culture_rating, 0)) / 5
  ) stored,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.evaluations enable row level security;

create policy "Coaches can manage evaluations"
  on public.evaluations for all
  using (
    exists (
      select 1 from public.users where id = auth.uid() and role = 'coach'
    )
  );

create policy "Players can view their own evaluations"
  on public.evaluations for select
  using (
    exists (
      select 1 from public.player_profiles where id = player_id and user_id = auth.uid()
    )
  );

create trigger evaluations_updated_at
  before update on public.evaluations
  for each row execute function update_updated_at();

-- Function to auto-create user record on sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'player')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
