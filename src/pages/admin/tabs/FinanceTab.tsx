import { EmptyState, LoadingState } from '@/components/shared/StateViews'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useLeagueMemberships } from '@/hooks/useLeagues'
import { useLeaguePayments, useUpsertPayment } from '@/hooks/usePayments'
import { formatDate } from '@/lib/date'
import { summarizePayments, type PaymentWithMember } from '@/services/payments/api'
import type { League } from '@/types/domain'
import { Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EditPaymentDialog } from './EditPaymentDialog'
import { PaymentStatusBadge } from './PaymentStatusBadge'

export function FinanceTab({ league }: { league: League }) {
  const { data: memberships, isLoading: loadingMemberships } = useLeagueMemberships(league.id)
  const { data: payments, isLoading: loadingPayments } = useLeaguePayments(league.id)
  const upsert = useUpsertPayment(league.id)
  const [editing, setEditing] = useState<PaymentWithMember | null>(null)

  const rows = useMemo<PaymentWithMember[]>(() => {
    if (!memberships) return []
    return memberships.map((m) => {
      const existing = payments?.find((p) => p.membershipId === m.id)
      if (existing) return existing
      return {
        id: `placeholder-${m.id}`,
        leagueId: league.id,
        membershipId: m.id,
        expectedAmount: league.entryFee,
        paidAmount: 0,
        status: 'pending' as const,
        paidAt: null,
        notes: null,
        teamName: m.teamName,
        profileDisplayName: m.profile?.displayName ?? null,
      }
    })
  }, [memberships, payments, league])

  if (loadingMemberships || loadingPayments) return <LoadingState />
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Nenhum participante para cobrar ainda"
        message="Sincronize a liga com o Sleeper para importar os participantes."
      />
    )
  }

  const summary = summarizePayments(rows)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total esperado</p>
            <p className="text-xl font-bold text-foreground">
              {league.currency} {summary.expected.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total recebido</p>
            <p className="text-xl font-bold text-accent">
              {league.currency} {summary.paid.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total pendente</p>
            <p className="text-xl font-bold text-warning">
              {league.currency} {summary.pending.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-surface text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Jogador</th>
              <th className="px-4 py-3 font-medium">Esperado</th>
              <th className="px-4 py-3 font-medium">Pago</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Observação</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.membershipId} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-foreground">
                  {row.teamName ?? row.profileDisplayName ?? '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {league.currency} {row.expectedAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {league.currency} {row.paidAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <PaymentStatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.paidAt ? formatDate(row.paidAt) : '—'}
                </td>
                <td className="max-w-[160px] truncate px-4 py-3 text-muted-foreground">
                  {row.notes ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {row.status !== 'paid' && (
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() =>
                          upsert.mutate({
                            leagueId: league.id,
                            membershipId: row.membershipId,
                            expectedAmount: row.expectedAmount,
                            paidAmount: row.expectedAmount,
                            status: 'paid',
                            paidAt: new Date().toISOString(),
                            notes: row.notes,
                          })
                        }
                      >
                        Marcar pago
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setEditing(row)}>
                      Editar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditPaymentDialog
        payment={editing}
        leagueId={league.id}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />
    </div>
  )
}
