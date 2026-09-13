import { EmptyState, LoadingState } from '@/components/shared/StateViews'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useLeagueMemberships } from '@/hooks/useLeagues'
import type { LeagueMembership } from '@/types/domain'
import { Users } from 'lucide-react'
import { useState } from 'react'
import { AssociateMembershipDialog } from './AssociateMembershipDialog'

export function ParticipantsTab({ leagueId }: { leagueId: string }) {
  const { data: memberships, isLoading } = useLeagueMemberships(leagueId)
  const [selected, setSelected] = useState<LeagueMembership | null>(null)

  if (isLoading) return <LoadingState />
  if (!memberships || memberships.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum participante ainda"
        message="Sincronize a liga com o Sleeper na aba de integração para importar os participantes."
      />
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Usuário Sleeper</th>
              <th className="px-4 py-3 font-medium">Usuário FantasyClub</th>
              <th className="px-4 py-3 font-medium">Campanha</th>
              <th className="px-4 py-3 font-medium">Ação</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((m) => (
              <tr key={m.id} className="border-t border-border">
                <td className="flex items-center gap-2 px-4 py-3">
                  <Avatar name={m.teamName ?? 'Time'} className="h-7 w-7 text-xs" />
                  <span className="font-medium text-foreground">{m.teamName ?? '—'}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{m.externalDisplayName ?? '—'}</td>
                <td className="px-4 py-3">
                  {m.profile ? (
                    <Badge variant="primary">{m.profile.displayName}</Badge>
                  ) : (
                    <Badge variant="warning">Não associado</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {m.wins}-{m.losses}
                  {m.ties > 0 ? `-${m.ties}` : ''}
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => setSelected(m)}>
                    {m.profile ? 'Editar' : 'Associar'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AssociateMembershipDialog
        membership={selected}
        leagueId={leagueId}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </>
  )
}
