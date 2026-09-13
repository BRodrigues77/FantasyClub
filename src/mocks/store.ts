/**
 * In-memory implementation of the same functions the real services expose,
 * used only when Supabase isn't configured. State is seeded from
 * `fixtures.ts` and mutated in place, so demo actions (mark as paid,
 * associate a player, sync) feel real for the session but reset on reload.
 */
import type { League, LeagueMembership, Payment, Profile } from '@/types/domain'
import {
  MOCK_LEAGUE_ID,
  MOCK_USER_ID,
  mockAchievementCatalog,
  mockLeague,
  mockMatchups,
  mockMemberships,
  mockPayments,
  mockPrizeStructure,
  mockProfiles,
  mockUserAchievements,
} from './fixtures'
import type { AwardAchievementInput } from '@/services/achievements/api'
import type { PrizeEntryInput } from '@/services/leagues/prizes'
import type { UpsertPaymentInput } from '@/services/payments/api'

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

const state = {
  league: { ...mockLeague },
  memberships: mockMemberships.map((m) => ({ ...m })),
  matchups: mockMatchups.map((m) => ({ ...m })),
  payments: mockPayments.map((p) => ({ ...p })),
  prizeStructure: mockPrizeStructure.map((p) => ({ ...p })),
  userAchievements: mockUserAchievements.map((a) => ({ ...a })),
  profiles: mockProfiles.map((p) => ({ ...p })),
}

export const mockApi = {
  currentUserId: MOCK_USER_ID,

  async listCommissionedLeagues(): Promise<League[]> {
    await delay()
    return [state.league]
  },

  async listMemberLeagues(): Promise<League[]> {
    await delay()
    return [state.league]
  },

  async getLeagueById(leagueId: string): Promise<League | null> {
    await delay()
    return leagueId === state.league.id ? state.league : null
  },

  async listLeagueMemberships(): Promise<LeagueMembership[]> {
    await delay()
    return state.memberships
      .map((m) => ({ ...m, profile: state.profiles.find((p) => p.id === m.userId) ?? null }))
      .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
  },

  async getMembershipForUser(_leagueId: string, userId: string): Promise<LeagueMembership | null> {
    await delay()
    return state.memberships.find((m) => m.userId === userId) ?? null
  },

  async associateMembershipToUser(membershipId: string, userId: string | null): Promise<void> {
    await delay()
    const membership = state.memberships.find((m) => m.id === membershipId)
    if (membership) membership.userId = userId
  },

  async listLatestMatchups() {
    await delay()
    return state.matchups
  },

  async listLeaguePayments(): Promise<Payment[]> {
    await delay()
    return state.payments
  },

  async upsertPayment(input: UpsertPaymentInput): Promise<void> {
    await delay()
    const existing = state.payments.find((p) => p.membershipId === input.membershipId)
    if (existing) {
      Object.assign(existing, {
        expectedAmount: input.expectedAmount,
        paidAmount: input.paidAmount,
        status: input.status,
        paidAt: input.paidAt,
        notes: input.notes,
      })
    } else {
      state.payments.push({
        id: `pay-${input.membershipId}`,
        leagueId: input.leagueId,
        membershipId: input.membershipId,
        expectedAmount: input.expectedAmount,
        paidAmount: input.paidAmount,
        status: input.status,
        paidAt: input.paidAt,
        notes: input.notes,
      })
    }
  },

  async listPrizeStructure() {
    await delay()
    return state.prizeStructure
  },

  async replacePrizeStructure(_leagueId: string, entries: PrizeEntryInput[]): Promise<void> {
    await delay()
    state.prizeStructure = entries.map((e, i) => ({
      id: `prize-${i}`,
      leagueId: state.league.id,
      position: e.position,
      label: e.label,
      amount: e.amount,
    }))
  },

  async listAchievementCatalog() {
    await delay()
    return mockAchievementCatalog
  },

  async listUserAchievements(userId: string) {
    await delay()
    return state.userAchievements.filter((a) => a.userId === userId)
  },

  async listLeagueAchievements(leagueId: string) {
    await delay()
    return state.userAchievements
      .filter((a) => a.leagueId === leagueId)
      .map((a) => ({
        ...a,
        userDisplayName: state.profiles.find((p) => p.id === a.userId)?.displayName ?? 'Jogador',
      }))
  },

  async awardAchievement(input: AwardAchievementInput): Promise<void> {
    await delay()
    const achievement = mockAchievementCatalog.find((a) => a.id === input.achievementId)
    if (!achievement) return
    state.userAchievements.push({
      id: `ua-${Date.now()}`,
      achievementId: input.achievementId,
      userId: input.userId,
      leagueId: input.leagueId ?? null,
      seasonId: input.seasonId ?? null,
      awardedAt: new Date().toISOString(),
      notes: input.notes ?? null,
      achievement,
      leagueName: state.league.name,
      seasonName: state.league.seasonName,
    })
  },

  async revokeAchievement(userAchievementId: string): Promise<void> {
    await delay()
    state.userAchievements = state.userAchievements.filter((a) => a.id !== userAchievementId)
  },

  async getProfile(userId: string): Promise<Profile | null> {
    await delay()
    return state.profiles.find((p) => p.id === userId) ?? null
  },

  async updateProfile(userId: string, input: Partial<Profile>): Promise<void> {
    await delay()
    const profile = state.profiles.find((p) => p.id === userId)
    if (profile) Object.assign(profile, input)
  },

  async searchProfiles(query: string): Promise<Profile[]> {
    await delay()
    const term = query.trim().toLowerCase()
    if (term.length < 2) return []
    return state.profiles.filter(
      (p) => p.displayName.toLowerCase().includes(term) || p.username?.toLowerCase().includes(term),
    )
  },

  async syncLeagueWithSleeper() {
    await delay(900)
    state.league.lastSyncedAt = new Date().toISOString()
    state.league.lastSyncError = null
    return { membershipsSynced: state.memberships.length, matchupsSynced: state.matchups.length, week: 3 }
  },

  async previewSleeperLeague() {
    await delay(500)
    return { name: state.league.name, season: '2026', sport: 'nfl', totalRosters: 12, status: 'in_season' }
  },

  async createLeague(input: { name: string; entryFee?: number }): Promise<League> {
    await delay()
    state.league = { ...state.league, name: input.name, entryFee: input.entryFee ?? state.league.entryFee }
    return state.league
  },

  async updateLeague(_leagueId: string, input: Partial<League>): Promise<void> {
    await delay()
    Object.assign(state.league, input)
  },
}

export { MOCK_LEAGUE_ID, MOCK_USER_ID }
