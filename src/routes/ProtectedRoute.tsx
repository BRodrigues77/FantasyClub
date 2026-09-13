import { LoadingState } from '@/components/shared/StateViews'
import { useAuth } from '@/context/AuthContext'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingState label="Carregando sua conta…" />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  return <Outlet />
}
