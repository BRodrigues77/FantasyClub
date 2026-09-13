import { useAuth } from '@/context/AuthContext'
import {
  associateMembershipToUser,
  createLeague,
  getLeagueById,
  listCommissionedLeagues,
  listLatestMatchups,
  listLeagueMemberships,
  listMemberLeagues,
  updateLeague,
  type CreateLeagueInput,
  type UpdateLeagueInput,
} from '@/services/leagues/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useCommissionedLeagues() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['leagues', 'commissioned', user?.id],
    queryFn: () => listCommissionedLeagues(user!.id),
    enabled: Boolean(user),
  })
}

/** True once we know whether the current user commissions at least one league. */
export function useIsCommissioner() {
  const query = useCommissionedLeagues()
  return { isCommissioner: (query.data?.length ?? 0) > 0, isLoading: query.isLoading }
}

export function useMemberLeagues() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['leagues', 'member', user?.id],
    queryFn: () => listMemberLeagues(user!.id),
    enabled: Boolean(user),
  })
}

export function useLeague(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['league', leagueId],
    queryFn: () => getLeagueById(leagueId!),
    enabled: Boolean(leagueId),
  })
}

export function useLeagueMemberships(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['league-memberships', leagueId],
    queryFn: () => listLeagueMemberships(leagueId!),
    enabled: Boolean(leagueId),
  })
}

export function useLatestMatchups(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['matchups', leagueId],
    queryFn: () => listLatestMatchups(leagueId!),
    enabled: Boolean(leagueId),
  })
}

export function useCreateLeague() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateLeagueInput) => createLeague(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues'] })
    },
  })
}

export function useUpdateLeague(leagueId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateLeagueInput) => updateLeague(leagueId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['league', leagueId] })
      queryClient.invalidateQueries({ queryKey: ['leagues'] })
    },
  })
}

export function useAssociateMembership(leagueId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ membershipId, userId }: { membershipId: string; userId: string | null }) =>
      associateMembershipToUser(membershipId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['league-memberships', leagueId] })
    },
  })
}
