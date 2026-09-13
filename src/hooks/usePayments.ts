import { listLeaguePayments, upsertPayment, type UpsertPaymentInput } from '@/services/payments/api'
import { listPrizeStructure, replacePrizeStructure, type PrizeEntryInput } from '@/services/leagues/prizes'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useLeaguePayments(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['payments', leagueId],
    queryFn: () => listLeaguePayments(leagueId!),
    enabled: Boolean(leagueId),
  })
}

export function useUpsertPayment(leagueId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpsertPaymentInput) => upsertPayment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', leagueId] })
    },
  })
}

export function usePrizeStructure(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['prize-structure', leagueId],
    queryFn: () => listPrizeStructure(leagueId!),
    enabled: Boolean(leagueId),
  })
}

export function useReplacePrizeStructure(leagueId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entries: PrizeEntryInput[]) => replacePrizeStructure(leagueId, entries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prize-structure', leagueId] })
      queryClient.invalidateQueries({ queryKey: ['league', leagueId] })
    },
  })
}
