import { PlayerLayout } from '@/components/layout/PlayerLayout'
import { LoadingState } from '@/components/shared/StateViews'
import { AuthProvider } from '@/context/AuthContext'
import { queryClient } from '@/lib/queryClient'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { HomePage } from '@/pages/player/HomePage'
import { LeaguePage } from '@/pages/player/LeaguePage'
import { ProfilePage } from '@/pages/player/ProfilePage'
import { RankingPage } from '@/pages/player/RankingPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'

// The admin panel is desktop-first and only ever opened by a commissioner —
// lazy-loading it keeps the mobile-first player bundle (the experience most
// people actually use) small.
const AdminLayout = lazy(() =>
  import('@/components/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const DashboardPage = lazy(() =>
  import('@/pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const LeaguesListPage = lazy(() =>
  import('@/pages/admin/LeaguesListPage').then((m) => ({ default: m.LeaguesListPage })),
)
const LeagueDetailLayout = lazy(() =>
  import('@/pages/admin/LeagueDetailLayout').then((m) => ({ default: m.LeagueDetailLayout })),
)
const RedirectToLeagueTab = lazy(() =>
  import('@/pages/admin/RedirectToLeagueTab').then((m) => ({ default: m.RedirectToLeagueTab })),
)
const OverviewTabRoute = lazy(() =>
  import('@/pages/admin/tabs/routes').then((m) => ({ default: m.OverviewTabRoute })),
)
const ParticipantsTabRoute = lazy(() =>
  import('@/pages/admin/tabs/routes').then((m) => ({ default: m.ParticipantsTabRoute })),
)
const FinanceTabRoute = lazy(() =>
  import('@/pages/admin/tabs/routes').then((m) => ({ default: m.FinanceTabRoute })),
)
const PrizesTabRoute = lazy(() =>
  import('@/pages/admin/tabs/routes').then((m) => ({ default: m.PrizesTabRoute })),
)
const AchievementsTabRoute = lazy(() =>
  import('@/pages/admin/tabs/routes').then((m) => ({ default: m.AchievementsTabRoute })),
)
const IntegrationTabRoute = lazy(() =>
  import('@/pages/admin/tabs/routes').then((m) => ({ default: m.IntegrationTabRoute })),
)

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster theme="dark" position="top-center" richColors />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<SignupPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<PlayerLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/liga" element={<LeaguePage />} />
                <Route path="/ranking" element={<RankingPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
              </Route>

              <Route
                path="/admin"
                element={
                  <Suspense fallback={<LoadingState label="Carregando painel…" />}>
                    <AdminLayout />
                  </Suspense>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="ligas" element={<LeaguesListPage />} />
                <Route path="ligas/:leagueId" element={<LeagueDetailLayout />}>
                  <Route index element={<OverviewTabRoute />} />
                  <Route path="participantes" element={<ParticipantsTabRoute />} />
                  <Route path="financeiro" element={<FinanceTabRoute />} />
                  <Route path="premiacao" element={<PrizesTabRoute />} />
                  <Route path="conquistas" element={<AchievementsTabRoute />} />
                  <Route path="integracao" element={<IntegrationTabRoute />} />
                </Route>
                <Route path="participantes" element={<RedirectToLeagueTab tab="participantes" />} />
                <Route path="financeiro" element={<RedirectToLeagueTab tab="financeiro" />} />
                <Route path="configuracoes" element={<RedirectToLeagueTab tab="integracao" />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
