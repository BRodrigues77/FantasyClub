import { useAuth } from '@/context/AuthContext'
import { useIsCommissioner } from '@/hooks/useLeagues'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Trophy, User, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/liga', label: 'Liga', icon: Users },
  { to: '/ranking', label: 'Ranking', icon: Trophy },
  { to: '/perfil', label: 'Perfil', icon: User },
]

export function PlayerLayout() {
  const { isCommissioner } = useIsCommissioner()
  const { profile } = useAuth()

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col bg-background">
      <header className="flex items-center justify-between px-4 pb-2 pt-5 sm:px-6">
        <div>
          <p className="text-xs text-muted-foreground">Bem-vindo de volta</p>
          <p className="text-lg font-semibold text-foreground">{profile?.displayName ?? 'Jogador'}</p>
        </div>
        {isCommissioner && (
          <NavLink
            to="/admin"
            className="rounded-full border border-border-strong px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover"
          >
            Área do comissário
          </NavLink>
        )}
      </header>

      <main className="flex-1 px-4 pb-24 pt-2 sm:px-6">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-stretch justify-around">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium text-muted-foreground transition-colors',
                  isActive && 'text-primary',
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
