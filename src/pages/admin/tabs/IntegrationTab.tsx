import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useUpdateLeague } from '@/hooks/useLeagues'
import { useSyncLeagueWithSleeper } from '@/hooks/useSleeperSync'
import { formatDistanceToNow } from '@/lib/date'
import { previewSleeperLeague, SleeperApiError } from '@/services/sleeper'
import type { League } from '@/types/domain'
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function IntegrationTab({ league }: { league: League }) {
  const [externalId, setExternalId] = useState(league.externalLeagueId ?? '')
  const [preview, setPreview] = useState<{ name: string; totalRosters: number } | null>(null)
  const [validating, setValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const updateLeague = useUpdateLeague(league.id)
  const sync = useSyncLeagueWithSleeper(league.id)

  async function handleValidate() {
    setValidating(true)
    setValidationError(null)
    setPreview(null)
    try {
      const result = await previewSleeperLeague(externalId.trim())
      setPreview({ name: result.name, totalRosters: result.totalRosters })
    } catch (err) {
      setValidationError(err instanceof SleeperApiError ? err.message : 'Não foi possível validar o ID informado.')
    } finally {
      setValidating(false)
    }
  }

  async function handleSave() {
    await updateLeague.mutateAsync({ externalLeagueId: externalId.trim() || null })
    toast.success('Sleeper League ID salvo.')
  }

  async function handleSync() {
    try {
      const result = await sync.mutateAsync()
      toast.success(
        `Sincronizado: ${result.membershipsSynced} participantes${result.week ? `, semana ${result.week}` : ''}.`,
      )
    } catch (err) {
      toast.error(err instanceof SleeperApiError ? err.message : 'Falha ao sincronizar com o Sleeper.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sleeper-league-id">Sleeper League ID</Label>
            <div className="flex gap-2">
              <Input
                id="sleeper-league-id"
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
                placeholder="Ex: 1124834889196843008"
              />
              <Button variant="outline" onClick={handleValidate} disabled={!externalId || validating}>
                {validating ? 'Validando…' : 'Validar'}
              </Button>
            </div>
          </div>

          {preview && (
            <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Liga encontrada: <strong>{preview.name}</strong> · {preview.totalRosters} times
            </div>
          )}
          {validationError && (
            <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {validationError}
            </div>
          )}

          <Button onClick={handleSave} disabled={updateLeague.isPending} className="self-start">
            {updateLeague.isPending ? 'Salvando…' : 'Salvar ID'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Status da integração</p>
              <p className="text-xs text-muted-foreground">
                {league.lastSyncedAt
                  ? `Última sincronização ${formatDistanceToNow(league.lastSyncedAt)}`
                  : 'Nunca sincronizado'}
              </p>
            </div>
            <Badge variant={league.externalLeagueId ? 'primary' : 'neutral'}>
              {league.externalLeagueId ? 'Configurado' : 'Não configurado'}
            </Badge>
          </div>

          {league.lastSyncError && (
            <div className="flex items-start gap-2 rounded-[var(--radius-control)] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {league.lastSyncError}
            </div>
          )}

          <Button onClick={handleSync} disabled={!league.externalLeagueId || sync.isPending} className="self-start">
            <RefreshCw className={sync.isPending ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            {sync.isPending ? 'Sincronizando…' : 'Sincronizar agora'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
