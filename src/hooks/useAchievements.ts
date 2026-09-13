import {
  awardAchievement,
  listAchievementCatalog,
  listLeagueAchievements,
  listUserAchievements,
  revokeAchievement,
  type AwardAchievementInput,
} from '@/services/achievements/api'
import { getPassportSummary } from '@/services/profiles/passport'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useAchievementCatalog() {
  return useQuery({ queryKey: ['achievements', 'catalog'], queryFn: listAchievementCatalog })
}

export function useUserAchievements(userId: string | undefined) {
  return useQuery({
    queryKey: ['achievements', 'user', userId],
    queryFn: () => listUserAchievements(userId!),
    enabled: Boolean(userId),
  })
}

export function useLeagueAchievements(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['achievements', 'league', leagueId],
    queryFn: () => listLeagueAchievements(leagueId!),
    enabled: Boolean(leagueId),
  })
}

export function usePassportSummary(userId: string | undefined) {
  return useQuery({
    queryKey: ['passport', userId],
    queryFn: () => getPassportSummary(userId!),
    enabled: Boolean(userId),
  })
}

export function useAwardAchievement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AwardAchievementInput) => awardAchievement(input),
    onSuccess: () => {
      // Awarding shows up in three places at once (the member's own
      // passport, the league ranking feed, and this admin list) — broad
      // invalidation is simpler and safer than tracking each key.
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
      queryClient.invalidateQueries({ queryKey: ['passport'] })
    },
  })
}

export function useRevokeAchievement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userAchievementId: string) => revokeAchievement(userAchievementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
      queryClient.invalidateQueries({ queryKey: ['passport'] })
    },
  })
}
