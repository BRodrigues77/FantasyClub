/**
 * Minimal shapes for the Sleeper public API (https://docs.sleeper.com).
 * Only the fields FantasyClub actually reads are declared — Sleeper's
 * payloads carry many more (roster settings, scoring, etc.) that we don't
 * need yet.
 */

export interface SleeperLeague {
  league_id: string
  name: string
  season: string
  sport: string
  status: string
  total_rosters: number
  avatar: string | null
}

export interface SleeperUser {
  user_id: string
  display_name: string
  avatar: string | null
  metadata: {
    team_name?: string
  } | null
}

export interface SleeperRoster {
  roster_id: number
  owner_id: string | null
  settings: {
    wins: number
    losses: number
    ties: number
    fpts: number
    fpts_decimal?: number
    fpts_against: number
    fpts_against_decimal?: number
    rank?: number
  }
}

export interface SleeperMatchup {
  matchup_id: number | null
  roster_id: number
  points: number
}

export interface SleeperNflState {
  week: number
  season: string
  season_type: 'pre' | 'regular' | 'post' | 'off'
}
