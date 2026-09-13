import { ErrorState, LoadingState } from '@/components/shared/StateViews'
import { Badge } from '@/components/ui/Badge'
import { useLeague } from '@/hooks/useLeagues'
import { cn } from '@/lib/utils'
import type { League } from '@/types/domain'
import { NavLink, Outlet, useOutletContext, useParams } from 'react-router-dom'

interface LeagueOutletContext {
  league: League
}

export function useLeagueOutletContext() {
  return useOutletContext<LeagueOutletContext>()
}

const TABS = [
  { to: '', label: 'Visão Geral', end: true },
  { to: 'participantes', label: 'Participantes' },
  { to: 'financeiro', label: 'Financeiro' },
  { to: 'premiacao', label: 'Premiação' },
  { to: 'conquistas', label: 'Conquistas' },
  { to: 'integracao', label: 'Integração' },
]

export function LeagueDetailLayout() {
  const { leagueId } = useParams<{ leagueId: string }>()
  const { data: league, isLoading, isError } = useLeague(leagueId)

  if (isLoading) return <LoadingState label="Carregando liga…" />
  if (isError || !league) return <ErrorState message="Liga não encontrada." />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">
            {league.sportName} · {league.seasonName}
          </p>
          <h1 className="text-xl font-bold text-foreground">{league.name}</h1>
        </div>
        <Badge variant={league.status === 'active' ? 'primary' : 'neutral'}>{league.status}</Badge>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'shrink-0 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground',
                isActive && 'border-primary text-primary',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet context={{ league } satisfies LeagueOutletContext} />
    </div>
  )
}
