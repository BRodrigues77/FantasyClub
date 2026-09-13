import { EmptyState, ErrorState, LoadingState } from '@/components/shared/StateViews'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'
import { useLeagueAchievements } from '@/hooks/useAchievements'
import { useLeagueMemberships, useMemberLeagues } from '@/hooks/useLeagues'
import { getAchievementIcon } from '@/lib/achievementIcons'
import { formatDistanceToNow } from '@/lib/date'
import { Trophy } from 'lucide-react'
import { StandingsList } from './league/StandingsList'

export function RankingPage() {
  const { user } = useAuth()
  const { data: leagues, isLoading: loadingLeagues } = useMemberLeagues()
  const league = leagues?.[0]
  const { data: memberships, isLoading, isError } = useLeagueMemberships(league?.id)
  const { data: achievements } = useLeagueAchievements(league?.id)

  if (loadingLeagues || isLoading) return <LoadingState label="Carregando ranking…" />
  if (isError) return <ErrorState message="Não foi possível carregar o ranking." />
  if (!league || !memberships || memberships.length === 0) {
    return (
      <EmptyState icon={Trophy} title="Ranking indisponível" message="Assim que sua liga tiver dados, o ranking aparece aqui." />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-1 text-lg font-bold text-foreground">Ranking — {league.name}</h1>
        <p className="text-sm text-muted-foreground">Posição atual por vitórias e pontos.</p>
      </div>

      <StandingsList memberships={memberships} highlightUserId={user?.id} />

      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Conquistas recentes</h2>
        {!achievements || achievements.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma conquista atribuída ainda nesta temporada.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {achievements.map((a) => {
              const Icon = getAchievementIcon(a.achievement.icon)
              return (
                <Card key={a.id} className="flex items-center gap-3 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{a.achievement.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.userDisplayName}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(a.awardedAt)}
                  </span>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
