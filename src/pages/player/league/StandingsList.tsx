import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import type { LeagueMembership } from '@/types/domain'

export function StandingsList({
  memberships,
  highlightUserId,
}: {
  memberships: LeagueMembership[]
  highlightUserId?: string
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border">
      <div className="grid grid-cols-[2rem_1fr_3.5rem_3.5rem] items-center gap-2 bg-surface px-3 py-2 text-xs font-medium text-muted-foreground sm:grid-cols-[2rem_1fr_4rem_4rem_4rem]">
        <span>#</span>
        <span>Time</span>
        <span className="text-right">W-L</span>
        <span className="text-right">PF</span>
        <span className="hidden text-right sm:block">PA</span>
      </div>
      {memberships.map((m) => {
        const name = m.teamName ?? m.externalDisplayName ?? 'Time sem nome'
        const isMe = m.userId === highlightUserId
        return (
          <div
            key={m.id}
            className={cn(
              'grid grid-cols-[2rem_1fr_3.5rem_3.5rem] items-center gap-2 border-t border-border px-3 py-2.5 sm:grid-cols-[2rem_1fr_4rem_4rem_4rem]',
              isMe && 'bg-primary/10',
            )}
          >
            <span className="text-sm font-semibold text-muted-foreground">{m.rank ?? '—'}</span>
            <div className="flex min-w-0 items-center gap-2">
              <Avatar name={name} className="h-7 w-7 text-[11px]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{name}</p>
                {m.profile?.displayName && (
                  <p className="truncate text-xs text-muted-foreground">{m.profile.displayName}</p>
                )}
              </div>
            </div>
            <span className="text-right text-sm text-foreground">
              {m.wins}-{m.losses}
              {m.ties > 0 ? `-${m.ties}` : ''}
            </span>
            <span className="text-right text-sm text-foreground">{m.pointsFor.toFixed(1)}</span>
            <span className="hidden text-right text-sm text-muted-foreground sm:block">
              {m.pointsAgainst.toFixed(1)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
