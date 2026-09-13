import { EmptyState, ErrorState, LoadingState } from '@/components/shared/StateViews'
import { useMemberLeagues } from '@/hooks/useLeagues'
import { Trophy } from 'lucide-react'
import { LeagueSummaryCard } from './LeagueSummaryCard'

export function HomePage() {
  const { data: leagues, isLoading, isError } = useMemberLeagues()

  if (isLoading) return <LoadingState label="Carregando suas ligas…" />
  if (isError) return <ErrorState message="Não foi possível carregar suas ligas." />

  if (!leagues || leagues.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="Você ainda não está em nenhuma liga"
        message="Peça ao comissário da sua liga para te associar ao seu time no FantasyClub."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {leagues.map((league) => (
        <LeagueSummaryCard key={league.id} league={league} />
      ))}
    </div>
  )
}
