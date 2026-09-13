import { SleeperApiError } from './errors'
import type {
  SleeperLeague,
  SleeperMatchup,
  SleeperNflState,
  SleeperRoster,
  SleeperUser,
} from './types'

const BASE_URL = 'https://api.sleeper.app/v1'

async function request<T>(path: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`)
  } catch {
    throw new SleeperApiError('Não foi possível conectar ao Sleeper.', 'unavailable')
  }

  if (response.status === 404) {
    throw new SleeperApiError('Liga não encontrada no Sleeper.', 'not_found')
  }
  if (!response.ok) {
    throw new SleeperApiError('O Sleeper está indisponível no momento.', 'unavailable')
  }

  const data = (await response.json().catch(() => null)) as T | null
  if (data === null) {
    throw new SleeperApiError('Resposta inesperada do Sleeper.', 'invalid_response')
  }
  return data
}

export const sleeperClient = {
  getLeague: (leagueId: string) => request<SleeperLeague>(`/league/${leagueId}`),
  getUsers: (leagueId: string) => request<SleeperUser[]>(`/league/${leagueId}/users`),
  getRosters: (leagueId: string) => request<SleeperRoster[]>(`/league/${leagueId}/rosters`),
  getMatchups: (leagueId: string, week: number) =>
    request<SleeperMatchup[]>(`/league/${leagueId}/matchups/${week}`),
  getNflState: () => request<SleeperNflState>('/state/nfl'),
}
