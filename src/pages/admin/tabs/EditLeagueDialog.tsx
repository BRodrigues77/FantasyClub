import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useUpdateLeague } from '@/hooks/useLeagues'
import type { League } from '@/types/domain'
import { Pencil } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

export function EditLeagueDialog({ league }: { league: League }) {
  const updateLeague = useUpdateLeague(league.id)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(league.name)
  const [description, setDescription] = useState(league.description ?? '')
  const [entryFee, setEntryFee] = useState(String(league.entryFee))
  const [maxParticipants, setMaxParticipants] = useState(String(league.maxParticipants ?? ''))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await updateLeague.mutateAsync({
      name,
      description: description || null,
      entryFee: Number(entryFee) || 0,
      maxParticipants: maxParticipants ? Number(maxParticipants) : null,
    })
    toast.success('Liga atualizada.')
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setName(league.name)
          setDescription(league.description ?? '')
          setEntryFee(String(league.entryFee))
          setMaxParticipants(String(league.maxParticipants ?? ''))
        }
        setOpen(next)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" /> Editar liga
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar liga</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-league-name">Nome da liga</Label>
            <Input id="edit-league-name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-league-description">Descrição</Label>
            <Input
              id="edit-league-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-entry-fee">Valor de inscrição</Label>
              <Input
                id="edit-entry-fee"
                type="number"
                min={0}
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-max-participants">Máx. participantes</Label>
              <Input
                id="edit-max-participants"
                type="number"
                min={2}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={updateLeague.isPending}>
            {updateLeague.isPending ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
