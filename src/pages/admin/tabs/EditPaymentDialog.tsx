import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useUpsertPayment } from '@/hooks/usePayments'
import type { PaymentStatus } from '@/types/database'
import type { PaymentWithMember } from '@/services/payments/api'
import { useEffect, useState, type FormEvent } from 'react'

const STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'partial', label: 'Parcial' },
  { value: 'waived', label: 'Isento' },
]

export function EditPaymentDialog({
  payment,
  leagueId,
  open,
  onOpenChange,
}: {
  payment: PaymentWithMember | null
  leagueId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const upsert = useUpsertPayment(leagueId)
  const [expected, setExpected] = useState('0')
  const [paid, setPaid] = useState('0')
  const [status, setStatus] = useState<PaymentStatus>('pending')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (payment) {
      setExpected(String(payment.expectedAmount))
      setPaid(String(payment.paidAmount))
      setStatus(payment.status)
      setNotes(payment.notes ?? '')
    }
  }, [payment])

  if (!payment) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!payment) return
    await upsert.mutateAsync({
      leagueId,
      membershipId: payment.membershipId,
      expectedAmount: Number(expected) || 0,
      paidAmount: Number(paid) || 0,
      status,
      paidAt: status === 'paid' ? new Date().toISOString() : payment.paidAt,
      notes: notes || null,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagamento — {payment.teamName ?? payment.profileDisplayName ?? 'Participante'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expected">Valor esperado</Label>
              <Input id="expected" type="number" min={0} value={expected} onChange={(e) => setExpected(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="paid">Valor pago</Label>
              <Input id="paid" type="number" min={0} value={paid} onChange={(e) => setPaid(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as PaymentStatus)}
              className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Observação</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <Button type="submit" disabled={upsert.isPending}>
            {upsert.isPending ? 'Salvando…' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
