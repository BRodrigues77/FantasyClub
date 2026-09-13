import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import type { LeagueMembership } from '@/types/domain'

export function ParticipantsGrid({ memberships }: { memberships: LeagueMembership[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {memberships.map((m) => {
        const name = m.teamName ?? m.externalDisplayName ?? 'Time sem nome'
        return (
          <Card key={m.id} className="flex items-center gap-3 p-3">
            <Avatar name={name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {m.profile?.displayName ?? m.externalDisplayName ?? 'Sem associação de perfil'}
              </p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
