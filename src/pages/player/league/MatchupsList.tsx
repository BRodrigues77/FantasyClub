import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { Matchup } from '@/types/domain'

const STATUS_LABEL: Record<Matchup['status'], string> = {
  upcoming: 'A começar',
  in_progress: 'Ao vivo',
  final: 'Final',
}

export function MatchupsList({ matchups, myMembershipId }: { matchups: Matchup[]; myMembershipId?: string }) {
  if (matchups.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Nenhum confronto disponível ainda.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {matchups.map((m) => {
        const isMine =
          m.home?.membershipId === myMembershipId || m.away?.membershipId === myMembershipId
        return (
          <Card key={m.id} className={cn('p-3', isMine && 'border-primary/50')}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Semana {m.week}</span>
              <Badge variant={m.status === 'in_progress' ? 'accent' : 'neutral'}>
                {STATUS_LABEL[m.status]}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <TeamScore name={m.home?.teamName ?? 'A definir'} score={m.home?.score ?? null} />
              <span className="text-xs text-muted-foreground">vs</span>
              <TeamScore name={m.away?.teamName ?? 'Bye'} score={m.away?.score ?? null} align="right" />
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function TeamScore({ name, score, align = 'left' }: { name: string; score: number | null; align?: 'left' | 'right' }) {
  return (
    <div className={cn('flex flex-1 flex-col', align === 'right' && 'items-end text-right')}>
      <span className="truncate text-sm font-medium text-foreground">{name}</span>
      <span className="text-lg font-semibold text-foreground">{score !== null ? score.toFixed(1) : '—'}</span>
    </div>
  )
}
