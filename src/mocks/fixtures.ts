/**
 * Realistic fixture data for one ~12-team NFL league, used only when
 * Supabase isn't configured (`isSupabaseConfigured === false`). This is the
 * one place mock data lives — see `src/mocks/store.ts` for how it's served,
 * and `src/lib/supabase.ts` for the flag that switches it on. Names are
 * fictional.
 */
import type { Achievement, League, LeagueMembership, Matchup, Payment, PrizeStructure, Profile, UserAchievement } from '@/types/domain'

export const MOCK_USER_ID = 'mock-user-beto'

export const mockProfiles: Profile[] = [
  { id: MOCK_USER_ID, displayName: 'Beto Rodrigues', username: 'beto', avatarUrl: null },
  { id: 'mock-user-joao', displayName: 'João Pedro', username: 'joaopedro', avatarUrl: null },
  { id: 'mock-user-carla', displayName: 'Carla Mendes', username: 'carlamendes', avatarUrl: null },
]

export const MOCK_LEAGUE_ID = 'mock-league-gold'

export const mockLeague: League = {
  id: MOCK_LEAGUE_ID,
  seasonId: 'mock-season-nfl-2026',
  commissionerId: MOCK_USER_ID,
  name: 'Liga Gold',
  slug: 'liga-gold',
  description: 'Liga tradicional entre amigos, disputada desde 2019.',
  logoUrl: null,
  platform: 'sleeper',
  externalLeagueId: '1124834889196843008',
  maxParticipants: 12,
  entryFee: 100,
  prizePool: 1100,
  currency: 'BRL',
  status: 'active',
  lastSyncedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  lastSyncError: null,
  sportName: 'NFL',
  sportSlug: 'nfl',
  seasonName: 'NFL 2026',
  seasonYear: 2026,
}

interface MemberSeed {
  id: string
  userId: string | null
  team: string
  owner: string
  wins: number
  losses: number
  pf: number
  pa: number
}

const memberSeeds: MemberSeed[] = [
  { id: 'm1', userId: MOCK_USER_ID, team: 'Trovão de Minas', owner: 'Beto Rodrigues', wins: 3, losses: 0, pf: 412.6, pa: 340.2 },
  { id: 'm2', userId: 'mock-user-joao', team: 'Guerreiros do Vale', owner: 'João Pedro', wins: 2, losses: 1, pf: 398.4, pa: 355.1 },
  { id: 'm3', userId: 'mock-user-carla', team: 'Fúria Azul', owner: 'Carla Mendes', wins: 2, losses: 1, pf: 387.9, pa: 360.0 },
  { id: 'm4', userId: null, team: 'Império Dourado', owner: 'Rafael Souza', wins: 2, losses: 1, pf: 375.2, pa: 348.7 },
  { id: 'm5', userId: null, team: 'As Panteras', owner: 'Marina Costa', wins: 2, losses: 1, pf: 366.8, pa: 351.4 },
  { id: 'm6', userId: null, team: 'Touros do Norte', owner: 'Lucas Almeida', wins: 1, losses: 2, pf: 349.5, pa: 358.9 },
  { id: 'm7', userId: null, team: 'Anjos Negros', owner: 'Fernanda Lima', wins: 1, losses: 2, pf: 344.1, pa: 362.0 },
  { id: 'm8', userId: null, team: 'Lobos da Serra', owner: 'Diego Martins', wins: 1, losses: 2, pf: 338.7, pa: 370.5 },
  { id: 'm9', userId: null, team: 'Reis do Ar', owner: 'Patrícia Rocha', wins: 1, losses: 2, pf: 330.2, pa: 365.8 },
  { id: 'm10', userId: null, team: 'Máquina de Pontos', owner: 'Bruno Cardoso', wins: 1, losses: 2, pf: 328.9, pa: 372.1 },
  { id: 'm11', userId: null, team: 'Aço Roxo', owner: 'Juliana Freitas', wins: 0, losses: 3, pf: 310.4, pa: 390.6 },
  { id: 'm12', userId: null, team: 'Comando Real', owner: 'Thiago Barros', wins: 0, losses: 3, pf: 298.1, pa: 385.3 },
]

const ranked = [...memberSeeds].sort((a, b) => b.wins - a.wins || b.pf - a.pf)
const rankById = new Map(ranked.map((m, i) => [m.id, i + 1]))

export const mockMemberships: LeagueMembership[] = memberSeeds.map((m) => ({
  id: m.id,
  leagueId: MOCK_LEAGUE_ID,
  userId: m.userId,
  externalUserId: `sleeper-${m.id}`,
  externalTeamId: m.id.replace('m', ''),
  externalDisplayName: m.owner,
  teamName: m.team,
  status: 'active',
  wins: m.wins,
  losses: m.losses,
  ties: 0,
  pointsFor: m.pf,
  pointsAgainst: m.pa,
  rank: rankById.get(m.id) ?? null,
  profile: mockProfiles.find((p) => p.id === m.userId) ?? null,
}))

export const mockMatchups: Matchup[] = [
  { id: 'mu1', leagueId: MOCK_LEAGUE_ID, week: 3, status: 'final', home: { membershipId: 'm1', teamName: 'Trovão de Minas', score: 142.6 }, away: { membershipId: 'm7', teamName: 'Anjos Negros', score: 118.2 } },
  { id: 'mu2', leagueId: MOCK_LEAGUE_ID, week: 3, status: 'final', home: { membershipId: 'm2', teamName: 'Guerreiros do Vale', score: 130.1 }, away: { membershipId: 'm11', teamName: 'Aço Roxo', score: 96.4 } },
  { id: 'mu3', leagueId: MOCK_LEAGUE_ID, week: 3, status: 'in_progress', home: { membershipId: 'm3', teamName: 'Fúria Azul', score: 88.9 }, away: { membershipId: 'm9', teamName: 'Reis do Ar', score: 91.3 } },
  { id: 'mu4', leagueId: MOCK_LEAGUE_ID, week: 3, status: 'in_progress', home: { membershipId: 'm4', teamName: 'Império Dourado', score: 76.2 }, away: { membershipId: 'm8', teamName: 'Lobos da Serra', score: 80.5 } },
  { id: 'mu5', leagueId: MOCK_LEAGUE_ID, week: 3, status: 'upcoming', home: { membershipId: 'm5', teamName: 'As Panteras', score: null }, away: { membershipId: 'm10', teamName: 'Máquina de Pontos', score: null } },
  { id: 'mu6', leagueId: MOCK_LEAGUE_ID, week: 3, status: 'upcoming', home: { membershipId: 'm6', teamName: 'Touros do Norte', score: null }, away: { membershipId: 'm12', teamName: 'Comando Real', score: null } },
]

const paymentStatus: Payment['status'][] = ['paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'pending', 'pending', 'partial', 'waived']

export const mockPayments: Payment[] = memberSeeds.map((m, i) => {
  const status = paymentStatus[i]
  const paidAmount = status === 'paid' ? 100 : status === 'partial' ? 50 : 0
  return {
    id: `pay-${m.id}`,
    leagueId: MOCK_LEAGUE_ID,
    membershipId: m.id,
    expectedAmount: 100,
    paidAmount,
    status,
    paidAt: status === 'paid' ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() : null,
    notes: status === 'waived' ? 'Isento — organizador da liga anterior' : null,
  }
})

export const mockPrizeStructure: PrizeStructure[] = [
  { id: 'prize-1', leagueId: MOCK_LEAGUE_ID, position: 1, label: '1º lugar', amount: 700 },
  { id: 'prize-2', leagueId: MOCK_LEAGUE_ID, position: 2, label: '2º lugar', amount: 300 },
  { id: 'prize-3', leagueId: MOCK_LEAGUE_ID, position: 3, label: '3º lugar', amount: 100 },
]

export const mockAchievementCatalog: Achievement[] = [
  { id: 'ach-champion', slug: 'champion', name: 'Campeão', description: 'Venceu a liga na temporada', icon: 'trophy' },
  { id: 'ach-runner-up', slug: 'runner_up', name: 'Vice-Campeão', description: 'Terminou em 2º lugar na temporada', icon: 'medal' },
  { id: 'ach-best-campaign', slug: 'best_campaign', name: 'Melhor Campanha', description: 'Melhor retrospecto da temporada regular', icon: 'target' },
  { id: 'ach-top-weekly', slug: 'top_weekly_score', name: 'Maior Pontuação da Rodada', description: 'Maior pontuação em uma única rodada', icon: 'flame' },
  { id: 'ach-win-streak', slug: 'win_streak', name: 'Maior Sequência de Vitórias', description: 'Maior sequência consecutiva de vitórias', icon: 'zap' },
]

export const mockUserAchievements: UserAchievement[] = [
  {
    id: 'ua-1',
    achievementId: 'ach-top-weekly',
    userId: MOCK_USER_ID,
    leagueId: MOCK_LEAGUE_ID,
    seasonId: 'mock-season-nfl-2026',
    awardedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    notes: null,
    achievement: mockAchievementCatalog[3],
    leagueName: mockLeague.name,
    seasonName: mockLeague.seasonName,
  },
]
