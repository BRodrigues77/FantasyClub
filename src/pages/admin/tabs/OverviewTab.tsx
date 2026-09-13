import { LoadingState } from '@/components/shared/StateViews'
import { Card, CardContent } from '@/components/ui/Card'
import { useLeagueMemberships } from '@/hooks/useLeagues'
import { useLeaguePayments, usePrizeStructure } from '@/hooks/usePayments'
import { summarizePayments } from '@/services/payments/api'
import type { League } from '@/types/domain'
import { EditLeagueDialog } from './EditLeagueDialog'

export function OverviewTab({ league }: { league: League }) {
  const { data: memberships, isLoading } = useLeagueMemberships(league.id)
  const { data: payments } = useLeaguePayments(league.id)
  const { data: prizes } = usePrizeStructure(league.id)

  if (isLoading) return <LoadingState />

  const summary = summarizePayments(payments ?? [])
  const associated = (memberships ?? []).filter((m) => m.userId).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <EditLeagueDialog league={league} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Participantes</p>
          <p className="text-2xl font-bold text-foreground">
            {memberships?.length ?? 0}
            <span className="text-sm font-normal text-muted-foreground">
              {' '}
              / {league.maxParticipants ?? '—'}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{associated} associados a um perfil</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Financeiro</p>
          <p className="text-2xl font-bold text-accent">
            {league.currency} {summary.paid.toFixed(0)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            de {league.currency} {summary.expected.toFixed(0)} esperado
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Premiação total</p>
          <p className="text-2xl font-bold text-foreground">
            {league.currency} {(prizes ?? []).reduce((acc, p) => acc + p.amount, 0).toFixed(0)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{(prizes ?? []).length} posições definidas</p>
        </CardContent>
      </Card>

        {league.description && (
          <Card className="lg:col-span-3">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Descrição</p>
              <p className="mt-1 text-sm text-foreground">{league.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
