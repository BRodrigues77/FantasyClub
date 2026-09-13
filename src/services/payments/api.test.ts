import { describe, expect, it } from 'vitest'
import { summarizePayments } from './api'
import type { Payment } from '@/types/domain'

function payment(overrides: Partial<Payment>): Payment {
  return {
    id: 'p1',
    leagueId: 'l1',
    membershipId: 'm1',
    expectedAmount: 100,
    paidAmount: 0,
    status: 'pending',
    paidAt: null,
    notes: null,
    ...overrides,
  }
}

describe('summarizePayments', () => {
  it('sums expected and paid across all entries', () => {
    const summary = summarizePayments([
      payment({ expectedAmount: 100, paidAmount: 100 }),
      payment({ expectedAmount: 100, paidAmount: 0 }),
    ])
    expect(summary.expected).toBe(200)
    expect(summary.paid).toBe(100)
    expect(summary.pending).toBe(100)
  })

  it('never lets pending go negative for an overpayment', () => {
    const summary = summarizePayments([payment({ expectedAmount: 100, paidAmount: 150 })])
    expect(summary.pending).toBe(0)
  })

  it('excludes waived payments from every total — nobody owes them', () => {
    const summary = summarizePayments([
      payment({ expectedAmount: 100, paidAmount: 0, status: 'waived' }),
      payment({ expectedAmount: 100, paidAmount: 100, status: 'paid' }),
    ])
    expect(summary.expected).toBe(100)
    expect(summary.paid).toBe(100)
    expect(summary.pending).toBe(0)
  })
})
