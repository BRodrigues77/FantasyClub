import type { SleeperMatchup, SleeperRoster, SleeperUser } from './types'

function round2(value: number) {
  return Math.round(value * 100) / 100
}

export interface MappedMembership {
  external_user_id: string
  external_team_id: string
  external_display_name: string | null
  team_name: string | null
  wins: number
  losses: number
  ties: number
  points_for: number
  points_against: number
  rank: number
}

/** Maps Sleeper users + rosters into membership snapshot rows, ranked by wins then points. */
export function mapMemberships(users: SleeperUser[], rosters: SleeperRoster[]): MappedMembership[] {
  const userById = new Map(users.map((u) => [u.user_id, u]))

  const base = rosters.map((roster) => {
    const user = roster.owner_id ? userById.get(roster.owner_id) : undefined
    const pointsFor = (roster.settings.fpts ?? 0) + (roster.settings.fpts_decimal ?? 0) / 100
    const pointsAgainst =
      (roster.settings.fpts_against ?? 0) + (roster.settings.fpts_against_decimal ?? 0) / 100

    return {
      external_user_id: roster.owner_id ?? `roster-${roster.roster_id}`,
      external_team_id: String(roster.roster_id),
      external_display_name: user?.display_name ?? null,
      team_name: user?.metadata?.team_name || user?.display_name || `Time ${roster.roster_id}`,
      wins: roster.settings.wins ?? 0,
      losses: roster.settings.losses ?? 0,
      ties: roster.settings.ties ?? 0,
      points_for: round2(pointsFor),
      points_against: round2(pointsAgainst),
    }
  })

  const ranked = [...base].sort((a, b) => b.wins - a.wins || b.points_for - a.points_for)
  const rankByExternalUserId = new Map(ranked.map((m, index) => [m.external_user_id, index + 1]))

  return base.map((m) => ({ ...m, rank: rankByExternalUserId.get(m.external_user_id)! }))
}

export interface MappedMatchup {
  week: number
  external_matchup_id: string
  home_membership_id: string
  away_membership_id: string | null
  home_score: number | null
  away_score: number | null
  status: 'upcoming' | 'in_progress'
}

/**
 * Pairs Sleeper's flat per-roster matchup rows (grouped by `matchup_id`)
 * into a single row per matchup, matching our `matchups` table shape.
 * A roster with no partner (matchup_id null) is a bye week.
 */
export function mapMatchups(
  matchups: SleeperMatchup[],
  week: number,
  membershipIdByRosterId: Map<number, string>,
): MappedMatchup[] {
  const groups = new Map<string, SleeperMatchup[]>()
  for (const m of matchups) {
    const key = m.matchup_id !== null ? `m-${m.matchup_id}` : `bye-${m.roster_id}`
    const list = groups.get(key) ?? []
    list.push(m)
    groups.set(key, list)
  }

  const rows: MappedMatchup[] = []
  for (const [key, group] of groups) {
    const [home, away] = group
    const homeMembershipId = membershipIdByRosterId.get(home.roster_id)
    if (!homeMembershipId) continue

    const awayMembershipId = away ? (membershipIdByRosterId.get(away.roster_id) ?? null) : null
    const hasStarted = home.points > 0 || (away?.points ?? 0) > 0

    rows.push({
      week,
      external_matchup_id: key,
      home_membership_id: homeMembershipId,
      away_membership_id: awayMembershipId,
      home_score: round2(home.points),
      away_score: away ? round2(away.points) : null,
      status: hasStarted ? 'in_progress' : 'upcoming',
    })
  }

  return rows
}
