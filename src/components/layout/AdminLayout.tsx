import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { LayoutDashboard, LogOut, Settings, ShieldCheck, Trophy, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/ligas', label: 'Ligas', icon: Trophy },
  { to: '/admin/participantes', label: 'Participantes', icon: Users },
  { to: '/admin/financeiro', label: 'Financeiro', icon: ShieldCheck },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export function AdminLayout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="flex h-svh w-full bg-background">
      <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface px-4 py-6 lg:flex">
        <div className="px-2 pb-6">
          <p className="text-lg font-bold tracking-tight text-foreground">FantasyClub</p>
          <p className="text-xs text-muted-foreground">Painel do comissário</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground',
                  isActive && 'bg-primary/15 text-primary hover:bg-primary/15 hover:text-primary',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
          <NavLink to="/" className="text-xs text-muted-foreground hover:text-foreground">
            Voltar para área do jogador
          </NavLink>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">{profile?.displayName}</span>
            <button
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Compact top bar for small/admin-on-mobile screens */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
          <p className="font-bold text-foreground">FantasyClub Admin</p>
          <NavLink to="/" className="text-xs text-muted-foreground hover:text-foreground">
            Área do jogador
          </NavLink>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-2 py-2 lg:hidden">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground',
                  isActive && 'bg-primary/15 text-primary',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
