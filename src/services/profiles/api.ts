import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { mockApi } from '@/mocks/store'
import type { Profile } from '@/types/domain'

interface ProfileRow {
  id: string
  display_name: string
  username: string | null
  avatar_url: string | null
}

function toProfile(row: ProfileRow): Profile {
  return { id: row.id, displayName: row.display_name, username: row.username, avatarUrl: row.avatar_url }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return mockApi.getProfile(userId)

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, avatar_url')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data ? toProfile(data as ProfileRow) : null
}

export interface UpdateProfileInput {
  displayName?: string
  username?: string | null
  avatarUrl?: string | null
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<void> {
  if (!isSupabaseConfigured) return mockApi.updateProfile(userId, input)

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: input.displayName,
      username: input.username,
      avatar_url: input.avatarUrl,
    })
    .eq('id', userId)

  if (error) throw error
}

/** Used by the admin "associate participant" flow to find platform users by name. */
export async function searchProfiles(query: string): Promise<Profile[]> {
  if (!isSupabaseConfigured) return mockApi.searchProfiles(query)

  // Strip characters meaningful to PostgREST's filter grammar (`,`, `(`, `)`)
  // so user input can't inject extra filter clauses into `.or()`.
  const term = query.trim().replace(/[,()]/g, '')
  if (term.length < 2) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, avatar_url')
    .or(`display_name.ilike.%${term}%,username.ilike.%${term}%`)
    .limit(10)

  if (error) throw error
  return (data as unknown as ProfileRow[]).map(toProfile)
}
