import { useLeagueOutletContext } from '../LeagueDetailLayout'
import { FinanceTab } from './FinanceTab'
import { IntegrationTab } from './IntegrationTab'
import { OverviewTab } from './OverviewTab'
import { ParticipantsTab } from './ParticipantsTab'
import { PrizesTab } from './PrizesTab'

export function OverviewTabRoute() {
  const { league } = useLeagueOutletContext()
  return <OverviewTab league={league} />
}

export function ParticipantsTabRoute() {
  const { league } = useLeagueOutletContext()
  return <ParticipantsTab leagueId={league.id} />
}

export function FinanceTabRoute() {
  const { league } = useLeagueOutletContext()
  return <FinanceTab league={league} />
}

export function PrizesTabRoute() {
  const { league } = useLeagueOutletContext()
  return <PrizesTab league={league} />
}

export function IntegrationTabRoute() {
  const { league } = useLeagueOutletContext()
  return <IntegrationTab league={league} />
}
