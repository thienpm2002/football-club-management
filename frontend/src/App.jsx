import { useEffect } from 'react'

import AppRouter from '@/routes/AppRouter'
import useAuthStore from '@/stores/auth.store'
import AppLoading from '@/components/shared/AppLoading'

import { initializeAuth } from '@/services/auth-session.service'

function App() {

  const isInitializing = useAuthStore((state) => state.isInitializing)

  useEffect(() => {
    initializeAuth()
  }, [])

  if (isInitializing) {
    return <AppLoading />
  }

  return <AppRouter />
}

export default App;