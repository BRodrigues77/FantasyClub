import { EmptyState, ErrorState, LoadingState } from '@/components/shared/StateViews'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useCommissionedLeagues } from '@/hooks/useLeagues'
import { Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NewLeagueDialog } from './NewLeagueDialog'

export function LeaguesListPage() {
  const { data: leagues, isLoading, isError } = useCommissionedLeagues()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Ligas</h1>
          <p className="text-sm text-muted-foreground">Ligas que você administra.</p>
        </div>
        <NewLeagueDialog />
      </div>

      {isLoading && <LoadingState label="Carregando ligas…" />}
      {isError && <ErrorState message="Não foi possível carregar suas ligas." />}

      {leagues && leagues.length === 0 && (
        <EmptyState icon={Trophy} title="Nenhuma liga criada" message="Crie sua primeira liga para começar." />
      )}

      {leagues && leagues.length > 0 && (
        <div className="flex flex-col gap-3">
          {leagues.map((league) => (
            <Card key={league.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-semibold text-foreground">{league.name}</p>
                  <Badge variant={league.status === 'active' ? 'primary' : 'neutral'}>{league.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {league.sportName} · {league.seasonName} · {league.platform}
                  {league.externalLeagueId ? ` · ID ${league.externalLeagueId}` : ''}
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to={`/admin/ligas/${league.id}`}>Gerenciar</Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
