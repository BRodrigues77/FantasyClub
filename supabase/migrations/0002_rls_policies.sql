-- Row Level Security
--
-- Authorization model: a league has exactly one commissioner
-- (leagues.commissioner_id). Any authenticated user can create a league and
-- becomes its commissioner, so the platform already supports many
-- independent commissioners, not a single global admin. "Admin area" access
-- in the app is simply: does this user commission at least one league.

-- ---------------------------------------------------------------------------
-- Helper functions (security definer to avoid RLS recursion across tables)
-- ---------------------------------------------------------------------------

create function is_league_commissioner(target_league_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from leagues
    where id = target_league_id
      and commissioner_id = auth.uid()
  );
$$;

create function is_league_member(target_league_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from league_memberships
    where league_id = target_league_id
      and user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;

create policy "profiles are readable by any authenticated user"
  on profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- sports / seasons / achievements (reference data, read-only from the client)
-- ---------------------------------------------------------------------------

alter table sports enable row level security;
alter table seasons enable row level security;
alter table achievements enable row level security;

create policy "sports are readable by any authenticated user"
  on sports for select to authenticated using (true);

create policy "seasons are readable by any authenticated user"
  on seasons for select to authenticated using (true);

create policy "achievements are readable by any authenticated user"
  on achievements for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- leagues
-- ---------------------------------------------------------------------------

alter table leagues enable row level security;

create policy "members and commissioners can view a league"
  on leagues for select
  to authenticated
  using (
    commissioner_id = auth.uid()
    or is_league_member(id)
  );

create policy "any authenticated user can create a league they commission"
  on leagues for insert
  to authenticated
  with check (commissioner_id = auth.uid());

create policy "commissioners can update their own league"
  on leagues for update
  to authenticated
  using (commissioner_id = auth.uid())
  with check (commissioner_id = auth.uid());

create policy "commissioners can delete their own league"
  on leagues for delete
  to authenticated
  using (commissioner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- league_memberships
-- ---------------------------------------------------------------------------

alter table league_memberships enable row level security;

create policy "members can view their own membership, commissioners view all"
  on league_memberships for select
  to authenticated
  using (
    user_id = auth.uid()
    or is_league_commissioner(league_id)
  );

create policy "commissioners manage memberships in their league"
  on league_memberships for all
  to authenticated
  using (is_league_commissioner(league_id))
  with check (is_league_commissioner(league_id));

-- ---------------------------------------------------------------------------
-- matchups
-- ---------------------------------------------------------------------------

alter table matchups enable row level security;

create policy "members and commissioners can view matchups"
  on matchups for select
  to authenticated
  using (
    is_league_member(league_id)
    or is_league_commissioner(league_id)
  );

create policy "commissioners manage matchups in their league"
  on matchups for all
  to authenticated
  using (is_league_commissioner(league_id))
  with check (is_league_commissioner(league_id));

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------

alter table payments enable row level security;

create policy "players view their own payment, commissioners view all"
  on payments for select
  to authenticated
  using (
    is_league_commissioner(league_id)
    or exists (
      select 1 from league_memberships m
      where m.id = payments.membership_id
        and m.user_id = auth.uid()
    )
  );

create policy "commissioners manage payments in their league"
  on payments for all
  to authenticated
  using (is_league_commissioner(league_id))
  with check (is_league_commissioner(league_id));

-- ---------------------------------------------------------------------------
-- prize_structures
-- ---------------------------------------------------------------------------

alter table prize_structures enable row level security;

create policy "members and commissioners can view prize structure"
  on prize_structures for select
  to authenticated
  using (
    is_league_member(league_id)
    or is_league_commissioner(league_id)
  );

create policy "commissioners manage prize structure in their league"
  on prize_structures for all
  to authenticated
  using (is_league_commissioner(league_id))
  with check (is_league_commissioner(league_id));

-- ---------------------------------------------------------------------------
-- user_achievements
-- ---------------------------------------------------------------------------

alter table user_achievements enable row level security;

create policy "user achievements are readable by any authenticated user"
  on user_achievements for select
  to authenticated
  using (true);

-- No "league_id is null" escape hatch here: every achievement must be tied
-- to a league the writer commissions, otherwise any authenticated user could
-- insert a league_id-less row and self-award (e.g. "Campeão") on their own
-- passport.
create policy "commissioners award achievements for their league"
  on user_achievements for all
  to authenticated
  using (is_league_commissioner(league_id))
  with check (is_league_commissioner(league_id));
