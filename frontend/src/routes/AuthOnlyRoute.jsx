import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '@/stores/auth.store'

function AuthOnlyRoute() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  )

  return isAuthenticated
    ? <Navigate to="/" replace />
    : <Outlet />
}

export default AuthOnlyRoute