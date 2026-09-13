import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { MOCK_USER_ID, mockApi } from '@/mocks/store'
import { getProfile } from '@/services/profiles/api'
import type { Profile } from '@/types/domain'
import type { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

interface AuthContextValue {
  user: { id: string; email: string | null } | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const MOCK_SESSION_KEY = 'fantasyclub_mock_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    const p = await getProfile(userId)
    setProfile(p)
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const hasMockSession = localStorage.getItem(MOCK_SESSION_KEY) === 'true'
      if (hasMockSession) {
        setUser({ id: MOCK_USER_ID, email: 'beto@fantasyclub.local' })
        loadProfile(MOCK_USER_ID).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? null } : null)
      if (sessionUser) loadProfile(sessionUser.id).finally(() => setLoading(false))
      else setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser: User | null = session?.user ?? null
      setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? null } : null)
      if (sessionUser) loadProfile(sessionUser.id)
      else setProfile(null)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      async signIn(email, password) {
        if (!isSupabaseConfigured) {
          localStorage.setItem(MOCK_SESSION_KEY, 'true')
          setUser({ id: MOCK_USER_ID, email })
          await loadProfile(MOCK_USER_ID)
          return { error: null }
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error ? traduzErroAuth(error.message) : null }
      },
      async signUp(email, password, displayName) {
        if (!isSupabaseConfigured) {
          localStorage.setItem(MOCK_SESSION_KEY, 'true')
          await mockApi.updateProfile(MOCK_USER_ID, { displayName })
          setUser({ id: MOCK_USER_ID, email })
          await loadProfile(MOCK_USER_ID)
          return { error: null }
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        })
        return { error: error ? traduzErroAuth(error.message) : null }
      },
      async signOut() {
        if (!isSupabaseConfigured) {
          localStorage.removeItem(MOCK_SESSION_KEY)
          setUser(null)
          setProfile(null)
          return
        }
        await supabase.auth.signOut()
      },
      async refreshProfile() {
        if (user) await loadProfile(user.id)
      },
    }),
    [user, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

function traduzErroAuth(message: string): string {
  if (message.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (message.includes('already registered')) return 'Este e-mail já está cadastrado.'
  if (message.includes('Password should be')) return 'A senha precisa ter pelo menos 6 caracteres.'
  return 'Não foi possível concluir a operação. Tente novamente.'
}
