import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'
import { useLatestMatchups } from '@/hooks/useLeagues'
import { getMembershipForUser } from '@/services/leagues/api'
import type { League } from '@/types/domain'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function LeagueSummaryCard({ league }: { league: League }) {
  const { user } = useAuth()
  const { data: membership } = useQuery({
    queryKey: ['membership', league.id, user?.id],
    queryFn: () => getMembershipForUser(league.id, user!.id),
    enabled: Boolean(user),
  })
  const { data: matchups } = useLatestMatchups(league.id)

  const myMatchup = matchups?.find(
    (m) => m.home?.membershipId === membership?.id || m.away?.membershipId === membership?.id,
  )
  const opponent = myMatchup
    ? myMatchup.home?.membershipId === membership?.id
      ? myMatchup.away
      : myMatchup.home
    : null

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {league.sportName} {league.seasonYear}
          </p>
          <p className="text-lg font-semibold text-foreground">{league.name}</p>
        </div>
        <Badge variant="primary">{league.platform === 'sleeper' ? 'Sleeper' : league.platform}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {membership ? (
          <div className="flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {membership.rank ? `${membership.rank}º` : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Posição</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {membership.wins}-{membership.losses}
                {membership.ties > 0 ? `-${membership.ties}` : ''}
              </p>
              <p className="text-xs text-muted-foreground">Campanha</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{membership.pointsFor.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">PF</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Seu time ainda não foi associado a esta liga pelo comissário.
          </p>
        )}

        {opponent && (
          <div className="rounded-[var(--radius-control)] bg-background px-3 py-2 text-sm">
            <p className="text-xs text-muted-foreground">Próximo confronto</p>
            <p className="font-medium text-foreground">
              {membership?.teamName ?? 'Você'} vs {opponent.teamName}
            </p>
          </div>
        )}

        <Button asChild variant="outline" className="justify-between">
          <Link to="/liga">
            Ver liga
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
