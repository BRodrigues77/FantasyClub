import { EmptyState, ErrorState, LoadingState } from '@/components/shared/StateViews'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'
import { usePassportSummary } from '@/hooks/useAchievements'
import { getAchievementIcon } from '@/lib/achievementIcons'
import { formatDate } from '@/lib/date'
import { Medal, Sparkles, Trophy } from 'lucide-react'

export function ProfilePage() {
  const { profile, user } = useAuth()
  const { data: passport, isLoading, isError } = usePassportSummary(user?.id)

  if (isLoading) return <LoadingState label="Carregando seu passaporte…" />
  if (isError) return <ErrorState message="Não foi possível carregar seu perfil." />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <Avatar name={profile?.displayName ?? 'Jogador'} className="h-20 w-20 text-2xl" />
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wide text-foreground">
            {profile?.displayName}
          </h1>
          {profile?.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <StatBlock value={passport?.seasonsPlayed ?? 0} label="Temporadas" />
        <StatBlock value={passport?.leaguesPlayed ?? 0} label="Ligas" />
        <StatBlock value={passport?.titles ?? 0} label="Títulos" accent />
        <StatBlock value={passport?.podiums ?? 0} label="Pódios" accent />
      </div>

      {passport && passport.bySport.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {passport.bySport.map((s) => (
            <span
              key={s.sportSlug}
              className="rounded-full bg-secondary/25 px-3 py-1 text-xs font-medium text-secondary-foreground"
            >
              {s.sportName} · {s.leagues} {s.leagues === 1 ? 'liga' : 'ligas'}
            </span>
          ))}
        </div>
      )}

      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-accent" /> Conquistas
        </h2>
        {!passport || passport.achievements.length === 0 ? (
          <EmptyState
            icon={Medal}
            title="Ainda sem conquistas"
            message="Suas conquistas aparecerão aqui conforme a temporada avança."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {passport.achievements.map((a) => {
              const Icon = getAchievementIcon(a.achievement.icon)
              return (
                <Card key={a.id} className="flex items-center gap-3 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{a.achievement.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.leagueName ?? 'FantasyClub'} · {formatDate(a.awardedAt)}
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {(!passport || passport.leaguesPlayed === 0) && (
        <EmptyState
          icon={Trophy}
          title="Seu Fantasy Passport está começando"
          message="Assim que você for associado a uma liga, seu histórico e conquistas aparecem aqui."
        />
      )}
    </div>
  )
}

function StatBlock({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-control)] bg-surface py-3">
      <span className={accent ? 'text-xl font-bold text-accent' : 'text-xl font-bold text-foreground'}>
        {value}
      </span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}
