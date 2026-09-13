import { EmptyState, ErrorState, LoadingState } from '@/components/shared/StateViews'
import { Card, CardContent } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useAuth } from '@/context/AuthContext'
import { useLatestMatchups, useLeagueMemberships, useMemberLeagues } from '@/hooks/useLeagues'
import { getMembershipForUser } from '@/services/leagues/api'
import { useQuery } from '@tanstack/react-query'
import { Trophy } from 'lucide-react'
import { MatchupsList } from './league/MatchupsList'
import { ParticipantsGrid } from './league/ParticipantsGrid'
import { StandingsList } from './league/StandingsList'

export function LeaguePage() {
  const { user } = useAuth()
  const { data: leagues, isLoading: loadingLeagues, isError: leaguesError } = useMemberLeagues()
  const league = leagues?.[0]

  const { data: memberships, isLoading: loadingMemberships } = useLeagueMemberships(league?.id)
  const { data: matchups, isLoading: loadingMatchups } = useLatestMatchups(league?.id)
  const { data: myMembership } = useQuery({
    queryKey: ['membership', league?.id, user?.id],
    queryFn: () => getMembershipForUser(league!.id, user!.id),
    enabled: Boolean(league && user),
  })

  if (loadingLeagues) return <LoadingState label="Carregando liga…" />
  if (leaguesError) return <ErrorState message="Não foi possível carregar sua liga." />
  if (!league) {
    return (
      <EmptyState
        icon={Trophy}
        title="Nenhuma liga configurada"
        message="Assim que o comissário te associar a uma liga, ela aparecerá aqui."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {league.sportName} · {league.seasonName}
          </p>
          <h1 className="text-xl font-bold text-foreground">{league.name}</h1>
          {league.description && (
            <p className="mt-1 text-sm text-muted-foreground">{league.description}</p>
          )}
          <div className="mt-3 flex gap-6 text-sm">
            <div>
              <p className="font-semibold text-foreground">{memberships?.length ?? league.maxParticipants ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Participantes</p>
            </div>
            <div>
              <p className="font-semibold text-accent">
                {league.currency} {league.prizePool.toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">Premiação</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="visao-geral">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="classificacao">Classificação</TabsTrigger>
          <TabsTrigger value="confrontos">Confrontos</TabsTrigger>
          <TabsTrigger value="participantes">Participantes</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral">
          {loadingMemberships ? (
            <LoadingState />
          ) : (
            <StandingsList memberships={(memberships ?? []).slice(0, 5)} highlightUserId={user?.id} />
          )}
        </TabsContent>

        <TabsContent value="classificacao">
          {loadingMemberships ? (
            <LoadingState />
          ) : (
            <StandingsList memberships={memberships ?? []} highlightUserId={user?.id} />
          )}
        </TabsContent>

        <TabsContent value="confrontos">
          {loadingMatchups ? (
            <LoadingState />
          ) : (
            <MatchupsList matchups={matchups ?? []} myMembershipId={myMembership?.id} />
          )}
        </TabsContent>

        <TabsContent value="participantes">
          {loadingMemberships ? (
            <LoadingState />
          ) : (
            <ParticipantsGrid memberships={memberships ?? []} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
