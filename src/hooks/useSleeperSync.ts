import { syncLeagueWithSleeper } from '@/services/sleeper'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useSyncLeagueWithSleeper(leagueId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => syncLeagueWithSleeper(leagueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['league', leagueId] })
      queryClient.invalidateQueries({ queryKey: ['league-memberships', leagueId] })
      queryClient.invalidateQueries({ queryKey: ['matchups', leagueId] })
    },
  })
}
