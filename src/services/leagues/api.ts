import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { mockApi } from '@/mocks/store'
import type { LeagueStatus } from '@/types/database'
import type { League, LeagueMembership, Matchup } from '@/types/domain'

interface LeagueRow {
  id: string
  season_id: string
  commissioner_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  platform: League['platform']
  external_league_id: string | null
  max_participants: number | null
  entry_fee: number
  prize_pool: number
  currency: string
  status: LeagueStatus
  last_synced_at: string | null
  last_sync_error: string | null
  season: { name: string; year: number; sport: { name: string; slug: string } | null } | null
}

const LEAGUE_SELECT = `
  id, season_id, commissioner_id, name, slug, description, logo_url, platform,
  external_league_id, max_participants, entry_fee, prize_pool, currency, status,
  last_synced_at, last_sync_error,
  season:seasons ( name, year, sport:sports ( name, slug ) )
`

function toLeague(row: LeagueRow): League {
  return {
    id: row.id,
    seasonId: row.season_id,
    commissionerId: row.commissioner_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    logoUrl: row.logo_url,
    platform: row.platform,
    externalLeagueId: row.external_league_id,
    maxParticipants: row.max_participants,
    entryFee: Number(row.entry_fee),
    prizePool: Number(row.prize_pool),
    currency: row.currency,
    status: row.status,
    lastSyncedAt: row.last_synced_at,
    lastSyncError: row.last_sync_error,
    sportName: row.season?.sport?.name ?? '—',
    sportSlug: row.season?.sport?.slug ?? '',
    seasonName: row.season?.name ?? '—',
    seasonYear: row.season?.year ?? 0,
  }
}

export async function listCommissionedLeagues(userId: string): Promise<League[]> {
  if (!isSupabaseConfigured) return mockApi.listCommissionedLeagues()

  const { data, error } = await supabase
    .from('leagues')
    .select(LEAGUE_SELECT)
    .eq('commissioner_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as unknown as LeagueRow[]).map(toLeague)
}

export async function listMemberLeagues(userId: string): Promise<League[]> {
  if (!isSupabaseConfigured) return mockApi.listMemberLeagues()

  const { data, error } = await supabase
    .from('league_memberships')
    .select(`league:leagues ( ${LEAGUE_SELECT} )`)
    .eq('user_id', userId)

  if (error) throw error
  const rows = data as unknown as { league: LeagueRow | null }[]
  return rows.filter((r) => r.league !== null).map((r) => toLeague(r.league!))
}

export async function getLeagueById(leagueId: string): Promise<League | null> {
  if (!isSupabaseConfigured) return mockApi.getLeagueById(leagueId)

  const { data, error } = await supabase
    .from('leagues')
    .select(LEAGUE_SELECT)
    .eq('id', leagueId)
    .maybeSingle()

  if (error) throw error
  return data ? toLeague(data as unknown as LeagueRow) : null
}

export interface CreateLeagueInput {
  seasonId: string
  commissionerId: string
  name: string
  slug: string
  description?: string
  platform: League['platform']
  externalLeagueId?: string
  maxParticipants?: number
  entryFee?: number
  currency?: string
}

export async function createLeague(input: CreateLeagueInput): Promise<League> {
  if (!isSupabaseConfigured) return mockApi.createLeague(input)

  const { data, error } = await supabase
    .from('leagues')
    .insert({
      season_id: input.seasonId,
      commissioner_id: input.commissionerId,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      platform: input.platform,
      external_league_id: input.externalLeagueId ?? null,
      max_participants: input.maxParticipants ?? null,
      entry_fee: input.entryFee ?? 0,
      currency: input.currency ?? 'BRL',
      status: 'active',
    })
    .select(LEAGUE_SELECT)
    .single()

  if (error) throw error
  return toLeague(data as unknown as LeagueRow)
}

export interface UpdateLeagueInput {
  name?: string
  description?: string | null
  externalLeagueId?: string | null
  entryFee?: number
  maxParticipants?: number | null
  status?: LeagueStatus
}

export async function updateLeague(leagueId: string, input: UpdateLeagueInput): Promise<void> {
  if (!isSupabaseConfigured) return mockApi.updateLeague(leagueId, input)

  const { error } = await supabase
    .from('leagues')
    .update({
      name: input.name,
      description: input.description,
      external_league_id: input.externalLeagueId,
      entry_fee: input.entryFee,
      max_participants: input.maxParticipants,
      status: input.status,
    })
    .eq('id', leagueId)

  if (error) throw error
}

interface MembershipRow {
  id: string
  league_id: string
  user_id: string | null
  external_user_id: string | null
  external_team_id: string | null
  external_display_name: string | null
  team_name: string | null
  status: LeagueMembership['status']
  wins: number
  losses: number
  ties: number
  points_for: number
  points_against: number
  rank: number | null
  profile: { id: string; display_name: string; username: string | null; avatar_url: string | null } | null
}

function toMembership(row: MembershipRow): LeagueMembership {
  return {
    id: row.id,
    leagueId: row.league_id,
    userId: row.user_id,
    externalUserId: row.external_user_id,
    externalTeamId: row.external_team_id,
    externalDisplayName: row.external_display_name,
    teamName: row.team_name,
    status: row.status,
    wins: row.wins,
    losses: row.losses,
    ties: row.ties,
    pointsFor: Number(row.points_for),
    pointsAgainst: Number(row.points_against),
    rank: row.rank,
    profile: row.profile
      ? {
          id: row.profile.id,
          displayName: row.profile.display_name,
          username: row.profile.username,
          avatarUrl: row.profile.avatar_url,
        }
      : null,
  }
}

export async function listLeagueMemberships(leagueId: string): Promise<LeagueMembership[]> {
  if (!isSupabaseConfigured) return mockApi.listLeagueMemberships()

  const { data, error } = await supabase
    .from('league_memberships')
    .select(
      'id, league_id, user_id, external_user_id, external_team_id, external_display_name, team_name, status, wins, losses, ties, points_for, points_against, rank, profile:profiles ( id, display_name, username, avatar_url )',
    )
    .eq('league_id', leagueId)
    .order('rank', { ascending: true, nullsFirst: false })

  if (error) throw error
  return (data as unknown as MembershipRow[]).map(toMembership)
}

export async function getMembershipForUser(
  leagueId: string,
  userId: string,
): Promise<LeagueMembership | null> {
  if (!isSupabaseConfigured) return mockApi.getMembershipForUser(leagueId, userId)

  const { data, error } = await supabase
    .from('league_memberships')
    .select(
      'id, league_id, user_id, external_user_id, external_team_id, external_display_name, team_name, status, wins, losses, ties, points_for, points_against, rank, profile:profiles ( id, display_name, username, avatar_url )',
    )
    .eq('league_id', leagueId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data ? toMembership(data as unknown as MembershipRow) : null
}

export async function associateMembershipToUser(
  membershipId: string,
  userId: string | null,
): Promise<void> {
  if (!isSupabaseConfigured) return mockApi.associateMembershipToUser(membershipId, userId)

  const { error } = await supabase
    .from('league_memberships')
    .update({ user_id: userId })
    .eq('id', membershipId)

  if (error) throw error
}

interface MatchupRow {
  id: string
  league_id: string
  week: number
  status: Matchup['status']
  home_membership_id: string | null
  away_membership_id: string | null
  home_score: number | null
  away_score: number | null
  home: { id: string; team_name: string | null } | null
  away: { id: string; team_name: string | null } | null
}

export async function listLatestMatchups(leagueId: string): Promise<Matchup[]> {
  if (!isSupabaseConfigured) return mockApi.listLatestMatchups()

  const { data: latestWeekRow } = await supabase
    .from('matchups')
    .select('week')
    .eq('league_id', leagueId)
    .order('week', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!latestWeekRow) return []

  const { data, error } = await supabase
    .from('matchups')
    .select(
      'id, league_id, week, status, home_membership_id, away_membership_id, home_score, away_score, home:league_memberships!home_membership_id ( id, team_name ), away:league_memberships!away_membership_id ( id, team_name )',
    )
    .eq('league_id', leagueId)
    .eq('week', latestWeekRow.week)

  if (error) throw error

  return (data as unknown as MatchupRow[]).map((row) => ({
    id: row.id,
    leagueId: row.league_id,
    week: row.week,
    status: row.status,
    home: row.home
      ? { membershipId: row.home.id, teamName: row.home.team_name ?? 'Time', score: row.home_score }
      : null,
    away: row.away
      ? { membershipId: row.away.id, teamName: row.away.team_name ?? 'Time', score: row.away_score }
      : null,
  }))
}
