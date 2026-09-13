import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { listUserAchievements } from '@/services/achievements/api'
import { MOCK_LEAGUE_ID, mockApi } from '@/mocks/store'
import type { UserAchievement } from '@/types/domain'

export interface SportBreakdown {
  sportSlug: string
  sportName: string
  seasons: number
  leagues: number
}

export interface PassportSummary {
  seasonsPlayed: number
  leaguesPlayed: number
  titles: number
  podiums: number
  achievements: UserAchievement[]
  bySport: SportBreakdown[]
}

interface MembershipForPassportRow {
  league: {
    id: string
    season: { id: string; sport: { slug: string; name: string } | null } | null
  } | null
}

export async function getPassportSummary(userId: string): Promise<PassportSummary> {
  if (!isSupabaseConfigured) {
    const [memberships, achievements] = await Promise.all([
      mockApi.listLeagueMemberships(),
      mockApi.listUserAchievements(userId),
    ])
    const league = await mockApi.getLeagueById(MOCK_LEAGUE_ID)
    const playsInLeague = memberships.some((m) => m.userId === userId)
    const titles = achievements.filter((a) => a.achievement.slug === 'champion').length
    const podiums = achievements.filter((a) =>
      ['champion', 'runner_up'].includes(a.achievement.slug),
    ).length
    return {
      seasonsPlayed: playsInLeague ? 1 : 0,
      leaguesPlayed: playsInLeague ? 1 : 0,
      titles,
      podiums,
      achievements,
      bySport:
        playsInLeague && league
          ? [{ sportSlug: league.sportSlug, sportName: league.sportName, seasons: 1, leagues: 1 }]
          : [],
    }
  }

  const [{ data: membershipRows, error }, achievements] = await Promise.all([
    supabase
      .from('league_memberships')
      .select('league:leagues ( id, season:seasons ( id, sport:sports ( slug, name ) ) )')
      .eq('user_id', userId),
    listUserAchievements(userId),
  ])

  if (error) throw error

  const rows = (membershipRows ?? []) as unknown as MembershipForPassportRow[]
  const leagueIds = new Set<string>()
  const seasonIds = new Set<string>()
  const sportMap = new Map<string, SportBreakdown>()

  for (const row of rows) {
    const league = row.league
    if (!league) continue
    leagueIds.add(league.id)

    const season = league.season
    if (!season) continue
    seasonIds.add(season.id)

    const sport = season.sport
    if (!sport) continue
    const entry = sportMap.get(sport.slug) ?? {
      sportSlug: sport.slug,
      sportName: sport.name,
      seasons: 0,
      leagues: 0,
    }
    entry.leagues += 1
    sportMap.set(sport.slug, entry)
  }

  // seasons-per-sport requires a second pass since a sport's season set is distinct
  const seasonsBySport = new Map<string, Set<string>>()
  for (const row of rows) {
    const sport = row.league?.season?.sport
    const seasonId = row.league?.season?.id
    if (!sport || !seasonId) continue
    const set = seasonsBySport.get(sport.slug) ?? new Set<string>()
    set.add(seasonId)
    seasonsBySport.set(sport.slug, set)
  }
  for (const [slug, entry] of sportMap) {
    entry.seasons = seasonsBySport.get(slug)?.size ?? 0
  }

  const titles = achievements.filter((a) => a.achievement.slug === 'champion').length
  const podiums = achievements.filter((a) =>
    ['champion', 'runner_up'].includes(a.achievement.slug),
  ).length

  return {
    seasonsPlayed: seasonIds.size,
    leaguesPlayed: leagueIds.size,
    titles,
    podiums,
    achievements,
    bySport: [...sportMap.values()],
  }
}
