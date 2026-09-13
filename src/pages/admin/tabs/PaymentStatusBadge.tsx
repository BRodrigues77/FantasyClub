import { Badge } from '@/components/ui/Badge'
import type { PaymentStatus } from '@/types/database'

const LABEL: Record<PaymentStatus, string> = {
  paid: 'Pago',
  pending: 'Pendente',
  partial: 'Parcial',
  waived: 'Isento',
}

// Never green — paid uses accent gold, pending/partial use warning amber, waived is neutral.
const VARIANT: Record<PaymentStatus, 'accent' | 'warning' | 'neutral'> = {
  paid: 'accent',
  pending: 'warning',
  partial: 'warning',
  waived: 'neutral',
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>
}
