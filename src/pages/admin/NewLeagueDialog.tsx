import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuth } from '@/context/AuthContext'
import { useCreateLeague } from '@/hooks/useLeagues'
import { slugify } from '@/lib/utils'
import { getActiveSeason } from '@/services/seasons/api'
import { PlusCircle } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

export function NewLeagueDialog() {
  const { user } = useAuth()
  const createLeague = useCreateLeague()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [externalLeagueId, setExternalLeagueId] = useState('')
  const [entryFee, setEntryFee] = useState('100')
  const [maxParticipants, setMaxParticipants] = useState('12')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)

    const season = await getActiveSeason('nfl')
    if (!season) {
      setError('Nenhuma temporada de NFL ativa foi encontrada. Verifique a configuração inicial do banco.')
      return
    }

    try {
      await createLeague.mutateAsync({
        seasonId: season.id,
        commissionerId: user.id,
        name,
        slug: slugify(name),
        platform: 'sleeper',
        externalLeagueId: externalLeagueId || undefined,
        entryFee: Number(entryFee) || 0,
        maxParticipants: Number(maxParticipants) || undefined,
      })
      toast.success('Liga criada com sucesso.')
      setOpen(false)
      setName('')
      setExternalLeagueId('')
    } catch {
      setError('Não foi possível criar a liga. Tente novamente.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4" /> Criar liga
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova liga</DialogTitle>
          <DialogDescription>
            Configure uma liga de NFL. Você poderá informar o Sleeper League ID agora ou depois, na
            aba de integração.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="league-name">Nome da liga</Label>
            <Input id="league-name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sleeper-id">Sleeper League ID (opcional)</Label>
            <Input
              id="sleeper-id"
              value={externalLeagueId}
              onChange={(e) => setExternalLeagueId(e.target.value)}
              placeholder="Ex: 1124834889196843008"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entry-fee">Valor de inscrição</Label>
              <Input
                id="entry-fee"
                type="number"
                min={0}
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="max-participants">Máx. participantes</Label>
              <Input
                id="max-participants"
                type="number"
                min={2}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={createLeague.isPending}>
            {createLeague.isPending ? 'Criando…' : 'Criar liga'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
