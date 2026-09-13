import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export interface SeasonOption {
  id: string
  name: string
  sportSlug: string
}

/** Used when creating a league — for the MVP there's only ever one active NFL season. */
export async function getActiveSeason(sportSlug: string): Promise<SeasonOption | null> {
  if (!isSupabaseConfigured) {
    return { id: 'mock-season-nfl-2026', name: 'NFL 2026', sportSlug: 'nfl' }
  }

  const { data, error } = await supabase
    .from('seasons')
    .select('id, name, status, sport:sports!inner ( slug )')
    .eq('sport.slug', sportSlug)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (error) throw error
  const row = data as unknown as { id: string; name: string } | null
  if (!row) return null
  return { id: row.id, name: row.name, sportSlug }
}
