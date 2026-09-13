import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { mockApi } from '@/mocks/store'
import { sleeperClient } from './client'
import { SleeperApiError } from './errors'
import { mapMatchups, mapMemberships } from './mapper'

export interface SyncResult {
  membershipsSynced: number
  matchupsSynced: number
  week: number | null
}

/**
 * Pulls league/users/rosters (+ current week matchups) from Sleeper and
 * upserts a snapshot into our tables. Never touches `user_id` on
 * memberships, so a commissioner's manual player associations survive
 * re-syncs — the upsert payload simply omits that column.
 */
export async function syncLeagueWithSleeper(leagueId: string): Promise<SyncResult> {
  if (!isSupabaseConfigured) return mockApi.syncLeagueWithSleeper()

  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .select('id, external_league_id, platform')
    .eq('id', leagueId)
    .single()

  if (leagueError || !league) {
    throw new SleeperApiError('Liga não encontrada na plataforma.', 'not_found')
  }
  if (league.platform !== 'sleeper' || !league.external_league_id) {
    throw new SleeperApiError('Esta liga não está configurada para o Sleeper.', 'invalid_response')
  }

  try {
    const externalId = league.external_league_id

    const [users, rosters, nflState] = await Promise.all([
      sleeperClient.getUsers(externalId),
      sleeperClient.getRosters(externalId),
      sleeperClient.getNflState(),
    ])

    const mappedMemberships = mapMemberships(users, rosters)

    const { data: upsertedMemberships, error: upsertError } = await supabase
      .from('league_memberships')
      .upsert(
        mappedMemberships.map((m) => ({ ...m, league_id: leagueId })),
        { onConflict: 'league_id,external_user_id' },
      )
      .select('id, external_team_id')

    if (upsertError) throw upsertError

    const membershipIdByRosterId = new Map(
      (upsertedMemberships ?? []).map((m) => [Number(m.external_team_id), m.id]),
    )

    let matchupsSynced = 0
    const isInSeason = nflState.season_type === 'regular' || nflState.season_type === 'post'
    if (isInSeason) {
      const rawMatchups = await sleeperClient.getMatchups(externalId, nflState.week)
      const mappedMatchups = mapMatchups(rawMatchups, nflState.week, membershipIdByRosterId)

      if (mappedMatchups.length > 0) {
        const { error: matchupError } = await supabase
          .from('matchups')
          .upsert(
            mappedMatchups.map((m) => ({ ...m, league_id: leagueId })),
            { onConflict: 'league_id,week,external_matchup_id' },
          )
        if (matchupError) throw matchupError
        matchupsSynced = mappedMatchups.length
      }
    }

    await supabase
      .from('leagues')
      .update({ last_synced_at: new Date().toISOString(), last_sync_error: null })
      .eq('id', leagueId)

    return {
      membershipsSynced: mappedMemberships.length,
      matchupsSynced,
      week: isInSeason ? nflState.week : null,
    }
  } catch (err) {
    const message =
      err instanceof SleeperApiError ? err.message : 'Falha ao sincronizar com o Sleeper.'
    await supabase.from('leagues').update({ last_sync_error: message }).eq('id', leagueId)
    throw err instanceof SleeperApiError
      ? err
      : new SleeperApiError(message, 'unavailable')
  }
}

/** Validates a Sleeper league id before it's saved, so the admin gets instant feedback. */
export async function previewSleeperLeague(externalLeagueId: string) {
  const league = await sleeperClient.getLeague(externalLeagueId)
  return {
    name: league.name,
    season: league.season,
    sport: league.sport,
    totalRosters: league.total_rosters,
    status: league.status,
  }
}
