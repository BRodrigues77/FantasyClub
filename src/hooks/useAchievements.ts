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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['achievements', 'user', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['passport', variables.userId] })
    },
  })
}

export function useRevokeAchievement(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userAchievementId: string) => revokeAchievement(userAchievementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements', 'user', userId] })
      queryClient.invalidateQueries({ queryKey: ['passport', userId] })
    },
  })
}
