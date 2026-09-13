import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { mockApi } from '@/mocks/store'
import type { PaymentStatus } from '@/types/database'
import type { Payment } from '@/types/domain'

export interface PaymentWithMember extends Payment {
  teamName: string | null
  profileDisplayName: string | null
}

interface PaymentRow {
  id: string
  league_id: string
  membership_id: string
  expected_amount: number
  paid_amount: number
  status: PaymentStatus
  paid_at: string | null
  notes: string | null
  membership: {
    team_name: string | null
    profile: { display_name: string } | null
  } | null
}

function toPayment(row: PaymentRow): PaymentWithMember {
  return {
    id: row.id,
    leagueId: row.league_id,
    membershipId: row.membership_id,
    expectedAmount: Number(row.expected_amount),
    paidAmount: Number(row.paid_amount),
    status: row.status,
    paidAt: row.paid_at,
    notes: row.notes,
    teamName: row.membership?.team_name ?? null,
    profileDisplayName: row.membership?.profile?.display_name ?? null,
  }
}

export async function listLeaguePayments(leagueId: string): Promise<PaymentWithMember[]> {
  if (!isSupabaseConfigured) {
    const [payments, memberships] = await Promise.all([
      mockApi.listLeaguePayments(),
      mockApi.listLeagueMemberships(),
    ])
    return payments.map((p) => {
      const membership = memberships.find((m) => m.id === p.membershipId)
      return {
        ...p,
        teamName: membership?.teamName ?? null,
        profileDisplayName: membership?.profile?.displayName ?? null,
      }
    })
  }

  const { data, error } = await supabase
    .from('payments')
    .select(
      'id, league_id, membership_id, expected_amount, paid_amount, status, paid_at, notes, membership:league_memberships ( team_name, profile:profiles ( display_name ) )',
    )
    .eq('league_id', leagueId)

  if (error) throw error
  return (data as unknown as PaymentRow[]).map(toPayment)
}

export interface UpsertPaymentInput {
  leagueId: string
  membershipId: string
  expectedAmount: number
  paidAmount: number
  status: PaymentStatus
  paidAt: string | null
  notes: string | null
}

export async function upsertPayment(input: UpsertPaymentInput): Promise<void> {
  if (!isSupabaseConfigured) return mockApi.upsertPayment(input)

  const { error } = await supabase.from('payments').upsert(
    {
      league_id: input.leagueId,
      membership_id: input.membershipId,
      expected_amount: input.expectedAmount,
      paid_amount: input.paidAmount,
      status: input.status,
      paid_at: input.paidAt,
      notes: input.notes,
    },
    { onConflict: 'membership_id' },
  )

  if (error) throw error
}

export function summarizePayments(payments: Payment[]) {
  return payments.reduce(
    (acc, p) => {
      acc.expected += p.expectedAmount
      acc.paid += p.paidAmount
      acc.pending += Math.max(p.expectedAmount - p.paidAmount, 0)
      return acc
    },
    { expected: 0, paid: 0, pending: 0 },
  )
}
