import { LoadingState } from '@/components/shared/StateViews'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { usePrizeStructure, useReplacePrizeStructure } from '@/hooks/usePayments'
import type { PrizeEntryInput } from '@/services/leagues/prizes'
import type { League } from '@/types/domain'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function PrizesTab({ league }: { league: League }) {
  const { data: prizes, isLoading } = usePrizeStructure(league.id)
  const replace = useReplacePrizeStructure(league.id)
  const [entries, setEntries] = useState<PrizeEntryInput[]>([])

  useEffect(() => {
    if (prizes) setEntries(prizes.map((p) => ({ position: p.position, label: p.label, amount: p.amount })))
  }, [prizes])

  if (isLoading) return <LoadingState />

  const total = entries.reduce((acc, e) => acc + (Number(e.amount) || 0), 0)

  function updateEntry(index: number, patch: Partial<PrizeEntryInput>) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)))
  }

  function addEntry() {
    setEntries((prev) => [...prev, { position: prev.length + 1, label: `${prev.length + 1}º lugar`, amount: 0 }])
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index).map((e, i) => ({ ...e, position: i + 1 })))
  }

  async function handleSave() {
    await replace.mutateAsync(entries)
    toast.success('Premiação atualizada.')
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Premiação total</p>
          <p className="text-2xl font-bold text-accent">
            {league.currency} {total.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {entries.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              className="w-40"
              value={entry.label}
              onChange={(e) => updateEntry(index, { label: e.target.value })}
              placeholder="Ex: 1º lugar"
            />
            <Input
              type="number"
              min={0}
              value={entry.amount}
              onChange={(e) => updateEntry(index, { amount: Number(e.target.value) })}
              placeholder="Valor"
            />
            <Button variant="ghost" size="icon" onClick={() => removeEntry(index)} aria-label="Remover">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={addEntry}>
          <Plus className="h-4 w-4" /> Adicionar posição
        </Button>
        <Button onClick={handleSave} disabled={replace.isPending}>
          {replace.isPending ? 'Salvando…' : 'Salvar premiação'}
        </Button>
      </div>
    </div>
  )
}
