import { EmptyState, ErrorState, LoadingState } from '@/components/shared/StateViews'
import { Button } from '@/components/ui/Button'
import { useCommissionedLeagues } from '@/hooks/useLeagues'
import { Trophy } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'

/** Top-level sidebar shortcuts (Participantes, Financeiro…) act on the commissioner's first league. */
export function RedirectToLeagueTab({ tab }: { tab: string }) {
  const { data: leagues, isLoading, isError } = useCommissionedLeagues()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState message="Não foi possível carregar suas ligas." />
  if (!leagues || leagues.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="Crie sua primeira liga"
        message="Assim que você tiver uma liga, esta área ficará disponível."
        action={
          <Button asChild>
            <Link to="/admin/ligas">Criar liga</Link>
          </Button>
        }
      />
    )
  }

  return <Navigate to={`/admin/ligas/${leagues[0].id}/${tab}`} replace />
}
