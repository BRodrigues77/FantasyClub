-- FantasyClub core schema
--
-- Modeling decision: League standings/records (wins, losses, points) are
-- treated as a synced snapshot from the external platform (Sleeper first),
-- stored directly on `league_memberships`, rather than mirrored into a
-- separate "standings" table. Sleeper remains the source of truth for
-- fantasy data; we cache just enough to render our own UI without hammering
-- the external API. `matchups` gets the same treatment for weekly results.
-- A full sync simply overwrites these columns/rows for the league.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type season_status as enum ('upcoming', 'active', 'completed');
create type league_platform as enum ('sleeper', 'yahoo', 'manual');
create type league_status as enum ('draft', 'active', 'completed', 'archived');
create type membership_status as enum ('active', 'invited', 'inactive');
create type payment_status as enum ('pending', 'paid', 'partial', 'waived');
create type matchup_status as enum ('upcoming', 'in_progress', 'final');

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- sports / seasons
-- ---------------------------------------------------------------------------

create table sports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table seasons (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid not null references sports (id) on delete cascade,
  name text not null,
  year int not null,
  starts_at date,
  ends_at date,
  status season_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  unique (sport_id, year)
);

-- ---------------------------------------------------------------------------
-- leagues
-- ---------------------------------------------------------------------------

create table leagues (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons (id) on delete restrict,
  commissioner_id uuid not null references profiles (id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  platform league_platform not null default 'sleeper',
  external_league_id text,
  max_participants int,
  entry_fee numeric(10, 2) not null default 0,
  prize_pool numeric(10, 2) not null default 0,
  currency text not null default 'BRL',
  status league_status not null default 'draft',
  last_synced_at timestamptz,
  last_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leagues_commissioner_id_idx on leagues (commissioner_id);
create index leagues_season_id_idx on leagues (season_id);

-- ---------------------------------------------------------------------------
-- league_memberships
-- ---------------------------------------------------------------------------

create table league_memberships (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references leagues (id) on delete cascade,
  user_id uuid references profiles (id) on delete set null,
  external_user_id text,
  external_team_id text,
  external_display_name text,
  team_name text,
  status membership_status not null default 'active',
  wins int not null default 0,
  losses int not null default 0,
  ties int not null default 0,
  points_for numeric(10, 2) not null default 0,
  points_against numeric(10, 2) not null default 0,
  rank int,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (league_id, external_user_id)
);

create index league_memberships_league_id_idx on league_memberships (league_id);
create index league_memberships_user_id_idx on league_memberships (user_id);

-- ---------------------------------------------------------------------------
-- matchups (weekly snapshot)
-- ---------------------------------------------------------------------------

create table matchups (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references leagues (id) on delete cascade,
  week int not null,
  home_membership_id uuid references league_memberships (id) on delete cascade,
  away_membership_id uuid references league_memberships (id) on delete cascade,
  home_score numeric(10, 2),
  away_score numeric(10, 2),
  status matchup_status not null default 'upcoming',
  external_matchup_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (league_id, week, external_matchup_id)
);

create index matchups_league_week_idx on matchups (league_id, week);

-- ---------------------------------------------------------------------------
-- payments (manual control only, no money movement)
-- ---------------------------------------------------------------------------

create table payments (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references leagues (id) on delete cascade,
  membership_id uuid not null references league_memberships (id) on delete cascade,
  expected_amount numeric(10, 2) not null default 0,
  paid_amount numeric(10, 2) not null default 0,
  status payment_status not null default 'pending',
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (membership_id)
);

create index payments_league_id_idx on payments (league_id);

-- ---------------------------------------------------------------------------
-- prize_structures
-- ---------------------------------------------------------------------------

create table prize_structures (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references leagues (id) on delete cascade,
  position int not null,
  label text not null,
  amount numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  unique (league_id, position)
);

-- ---------------------------------------------------------------------------
-- achievements / user_achievements
-- ---------------------------------------------------------------------------

create table achievements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

create table user_achievements (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references achievements (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  league_id uuid references leagues (id) on delete cascade,
  season_id uuid references seasons (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  notes text
);

create index user_achievements_user_id_idx on user_achievements (user_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger leagues_set_updated_at before update on leagues
  for each row execute function set_updated_at();
create trigger league_memberships_set_updated_at before update on league_memberships
  for each row execute function set_updated_at();
create trigger matchups_set_updated_at before update on matchups
  for each row execute function set_updated_at();
create trigger payments_set_updated_at before update on payments
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- auto-create a profile row when a new auth user signs up
-- ---------------------------------------------------------------------------

create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'username', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
