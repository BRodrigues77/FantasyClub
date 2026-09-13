import { EmptyState, ErrorState, LoadingState } from '@/components/shared/StateViews'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useCommissionedLeagues, useLeagueMemberships } from '@/hooks/useLeagues'
import { useLeaguePayments } from '@/hooks/usePayments'
import { summarizePayments } from '@/services/payments/api'
import { formatDistanceToNow } from '@/lib/date'
import { AlertTriangle, PlusCircle, RefreshCw, Trophy, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { data: leagues, isLoading, isError } = useCommissionedLeagues()
  const league = leagues?.[0]
  const { data: memberships } = useLeagueMemberships(league?.id)
  const { data: payments } = useLeaguePayments(league?.id)

  if (isLoading) return <LoadingState label="Carregando painel…" />
  if (isError) return <ErrorState message="Não foi possível carregar o painel administrativo." />

  if (!league) {
    return (
      <EmptyState
        icon={Trophy}
        title="Crie sua primeira liga"
        message="Configure uma liga do Sleeper para começar a administrar sua temporada."
        action={
          <Button asChild>
            <Link to="/admin/ligas">
              <PlusCircle className="h-4 w-4" /> Criar liga
            </Link>
          </Button>
        }
      />
    )
  }

  const summary = summarizePayments(payments ?? [])
  const paidCount = (payments ?? []).filter((p) => p.status === 'paid').length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumo operacional de {league.name}.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Ligas ativas" value={leagues!.length} />
        <StatCard label="Participantes" value={memberships?.length ?? 0} icon={Users} />
        <StatCard label="Pagamentos" value={`${paidCount}/${payments?.length ?? 0}`} />
        <StatCard label="Recebido" value={`${league.currency} ${summary.paid.toFixed(0)}`} accent />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent className="flex flex-col gap-3 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Liga ativa</h2>
              <Badge variant="primary">{league.status === 'active' ? 'Ativa' : league.status}</Badge>
            </div>
            <p className="text-lg font-semibold text-foreground">{league.name}</p>
            <p className="text-sm text-muted-foreground">
              {league.sportName} · {league.seasonName}
            </p>

            <div className="mt-2 flex items-center justify-between rounded-[var(--radius-control)] bg-background px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {league.lastSyncedAt
                    ? `Sincronizado ${formatDistanceToNow(league.lastSyncedAt)}`
                    : 'Ainda não sincronizado'}
                </span>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to={`/admin/ligas/${league.id}/integracao`}>Ver integração</Link>
              </Button>
            </div>

            {league.lastSyncError && (
              <div className="flex items-start gap-2 rounded-[var(--radius-control)] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {league.lastSyncError}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 pt-4">
            <h2 className="text-sm font-semibold text-foreground">Financeiro</h2>
            <FinanceRow label="Esperado" value={summary.expected} currency={league.currency} />
            <FinanceRow label="Recebido" value={summary.paid} currency={league.currency} accent />
            <FinanceRow label="Pendente" value={summary.pending} currency={league.currency} warning />
            <Button asChild variant="outline" size="sm">
              <Link to={`/admin/ligas/${league.id}/financeiro`}>Ver financeiro completo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
  icon: Icon,
}: {
  label: string
  value: string | number
  accent?: boolean
  icon?: typeof Users
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-4">
        <div>
          <p className={accent ? 'text-xl font-bold text-accent' : 'text-xl font-bold text-foreground'}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
      </CardContent>
    </Card>
  )
}

function FinanceRow({
  label,
  value,
  currency,
  accent,
  warning,
}: {
  label: string
  value: number
  currency: string
  accent?: boolean
  warning?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          accent ? 'font-semibold text-accent' : warning ? 'font-semibold text-warning' : 'font-semibold text-foreground'
        }
      >
        {currency} {value.toFixed(2)}
      </span>
    </div>
  )
}
