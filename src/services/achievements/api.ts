import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { mockApi } from '@/mocks/store'
import type { Achievement, UserAchievement } from '@/types/domain'

interface AchievementRow {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
}

export async function listAchievementCatalog(): Promise<Achievement[]> {
  if (!isSupabaseConfigured) return mockApi.listAchievementCatalog()

  const { data, error } = await supabase
    .from('achievements')
    .select('id, slug, name, description, icon')
    .order('name', { ascending: true })

  if (error) throw error
  return data as unknown as AchievementRow[]
}

interface UserAchievementRow {
  id: string
  achievement_id: string
  user_id: string
  league_id: string | null
  season_id: string | null
  awarded_at: string
  notes: string | null
  achievement: AchievementRow
  league: { name: string } | null
  season: { name: string } | null
}

export async function listUserAchievements(userId: string): Promise<UserAchievement[]> {
  if (!isSupabaseConfigured) return mockApi.listUserAchievements(userId)

  const { data, error } = await supabase
    .from('user_achievements')
    .select(
      'id, achievement_id, user_id, league_id, season_id, awarded_at, notes, achievement:achievements ( id, slug, name, description, icon ), league:leagues ( name ), season:seasons ( name )',
    )
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false })

  if (error) throw error
  return (data as unknown as UserAchievementRow[]).map((row) => ({
    id: row.id,
    achievementId: row.achievement_id,
    userId: row.user_id,
    leagueId: row.league_id,
    seasonId: row.season_id,
    awardedAt: row.awarded_at,
    notes: row.notes,
    achievement: row.achievement,
    leagueName: row.league?.name ?? null,
    seasonName: row.season?.name ?? null,
  }))
}

interface LeagueAchievementRow extends UserAchievementRow {
  profile: { display_name: string } | null
}

export interface LeagueAchievementEntry extends UserAchievement {
  userDisplayName: string
}

export async function listLeagueAchievements(leagueId: string): Promise<LeagueAchievementEntry[]> {
  if (!isSupabaseConfigured) {
    const achievements = await mockApi.listUserAchievements(mockApi.currentUserId)
    return achievements
      .filter((a) => a.leagueId === leagueId)
      .map((a) => ({ ...a, userDisplayName: 'Beto Rodrigues' }))
  }

  const { data, error } = await supabase
    .from('user_achievements')
    .select(
      'id, achievement_id, user_id, league_id, season_id, awarded_at, notes, achievement:achievements ( id, slug, name, description, icon ), league:leagues ( name ), season:seasons ( name ), profile:profiles ( display_name )',
    )
    .eq('league_id', leagueId)
    .order('awarded_at', { ascending: false })

  if (error) throw error
  return (data as unknown as LeagueAchievementRow[]).map((row) => ({
    id: row.id,
    achievementId: row.achievement_id,
    userId: row.user_id,
    leagueId: row.league_id,
    seasonId: row.season_id,
    awardedAt: row.awarded_at,
    notes: row.notes,
    achievement: row.achievement,
    leagueName: row.league?.name ?? null,
    seasonName: row.season?.name ?? null,
    userDisplayName: row.profile?.display_name ?? 'Jogador',
  }))
}

export interface AwardAchievementInput {
  achievementId: string
  userId: string
  leagueId?: string | null
  seasonId?: string | null
  notes?: string | null
}

export async function awardAchievement(input: AwardAchievementInput): Promise<void> {
  if (!isSupabaseConfigured) return mockApi.awardAchievement(input)

  const { error } = await supabase.from('user_achievements').insert({
    achievement_id: input.achievementId,
    user_id: input.userId,
    league_id: input.leagueId ?? null,
    season_id: input.seasonId ?? null,
    notes: input.notes ?? null,
  })

  if (error) throw error
}

export async function revokeAchievement(userAchievementId: string): Promise<void> {
  if (!isSupabaseConfigured) return mockApi.revokeAchievement(userAchievementId)

  const { error } = await supabase.from('user_achievements').delete().eq('id', userAchievementId)
  if (error) throw error
}
