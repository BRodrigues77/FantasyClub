import { AdminLayout } from '@/components/layout/AdminLayout'
import { PlayerLayout } from '@/components/layout/PlayerLayout'
import { AuthProvider } from '@/context/AuthContext'
import { queryClient } from '@/lib/queryClient'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { LeagueDetailLayout } from '@/pages/admin/LeagueDetailLayout'
import { LeaguesListPage } from '@/pages/admin/LeaguesListPage'
import { RedirectToLeagueTab } from '@/pages/admin/RedirectToLeagueTab'
import {
  AchievementsTabRoute,
  FinanceTabRoute,
  IntegrationTabRoute,
  OverviewTabRoute,
  ParticipantsTabRoute,
  PrizesTabRoute,
} from '@/pages/admin/tabs/routes'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { HomePage } from '@/pages/player/HomePage'
import { LeaguePage } from '@/pages/player/LeaguePage'
import { ProfilePage } from '@/pages/player/ProfilePage'
import { RankingPage } from '@/pages/player/RankingPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'

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

              <Route path="/admin" element={<AdminLayout />}>
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
