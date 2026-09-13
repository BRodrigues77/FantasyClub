import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { mockApi } from '@/mocks/store'
import type { PrizeStructure } from '@/types/domain'

interface PrizeRow {
  id: string
  league_id: string
  position: number
  label: string
  amount: number
}

function toPrize(row: PrizeRow): PrizeStructure {
  return {
    id: row.id,
    leagueId: row.league_id,
    position: row.position,
    label: row.label,
    amount: Number(row.amount),
  }
}

export async function listPrizeStructure(leagueId: string): Promise<PrizeStructure[]> {
  if (!isSupabaseConfigured) return mockApi.listPrizeStructure()

  const { data, error } = await supabase
    .from('prize_structures')
    .select('id, league_id, position, label, amount')
    .eq('league_id', leagueId)
    .order('position', { ascending: true })

  if (error) throw error
  return (data as unknown as PrizeRow[]).map(toPrize)
}

export interface PrizeEntryInput {
  position: number
  label: string
  amount: number
}

/** Replaces the whole prize table for a league — simplest correct approach for a handful of rows. */
export async function replacePrizeStructure(leagueId: string, entries: PrizeEntryInput[]): Promise<void> {
  if (!isSupabaseConfigured) return mockApi.replacePrizeStructure(leagueId, entries)

  const { error: deleteError } = await supabase
    .from('prize_structures')
    .delete()
    .eq('league_id', leagueId)
  if (deleteError) throw deleteError

  if (entries.length === 0) return

  const { error: insertError } = await supabase.from('prize_structures').insert(
    entries.map((e) => ({
      league_id: leagueId,
      position: e.position,
      label: e.label,
      amount: e.amount,
    })),
  )
  if (insertError) throw insertError
}
