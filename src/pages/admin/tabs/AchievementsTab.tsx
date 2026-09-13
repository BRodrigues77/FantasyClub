import { EmptyState, LoadingState } from '@/components/shared/StateViews'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import {
  useAchievementCatalog,
  useAwardAchievement,
  useLeagueAchievements,
  useRevokeAchievement,
} from '@/hooks/useAchievements'
import { useLeagueMemberships } from '@/hooks/useLeagues'
import { getAchievementIcon } from '@/lib/achievementIcons'
import { formatDate } from '@/lib/date'
import type { League } from '@/types/domain'
import { Medal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function AchievementsTab({ league }: { league: League }) {
  const { data: memberships, isLoading: loadingMemberships } = useLeagueMemberships(league.id)
  const { data: catalog, isLoading: loadingCatalog } = useAchievementCatalog()
  const { data: awarded, isLoading: loadingAwarded } = useLeagueAchievements(league.id)
  const award = useAwardAchievement()
  const revoke = useRevokeAchievement()

  const associated = (memberships ?? []).filter((m) => m.userId)
  const [membershipId, setMembershipId] = useState('')
  const [achievementId, setAchievementId] = useState('')

  if (loadingMemberships || loadingCatalog || loadingAwarded) return <LoadingState />

  async function handleAward() {
    const membership = associated.find((m) => m.id === membershipId)
    if (!membership?.userId || !achievementId) return
    await award.mutateAsync({
      achievementId,
      userId: membership.userId,
      leagueId: league.id,
      seasonId: league.seasonId,
    })
    toast.success('Conquista atribuída.')
    setMembershipId('')
    setAchievementId('')
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-4">
        <p className="text-sm font-medium text-foreground">Atribuir conquista</p>
        {associated.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Associe ao menos um participante a um perfil na aba Participantes antes de atribuir
            conquistas.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="award-member">Participante</Label>
              <select
                id="award-member"
                value={membershipId}
                onChange={(e) => setMembershipId(e.target.value)}
                className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Selecione…</option>
                {associated.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.profile?.displayName ?? m.teamName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="award-achievement">Conquista</Label>
              <select
                id="award-achievement"
                value={achievementId}
                onChange={(e) => setAchievementId(e.target.value)}
                className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Selecione…</option>
                {(catalog ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleAward}
              disabled={!membershipId || !achievementId || award.isPending}
            >
              {award.isPending ? 'Atribuindo…' : 'Atribuir'}
            </Button>
          </div>
        )}
      </Card>

      {!awarded || awarded.length === 0 ? (
        <EmptyState icon={Medal} title="Nenhuma conquista atribuída ainda" />
      ) : (
        <div className="flex flex-col gap-2">
          {awarded.map((a) => {
            const Icon = getAchievementIcon(a.achievement.icon)
            return (
              <Card key={a.id} className="flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{a.achievement.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.userDisplayName} · {formatDate(a.awardedAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remover conquista"
                  onClick={() => revoke.mutate(a.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
