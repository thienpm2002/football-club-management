import useAuthStore from '@/stores/auth.store'
import authService from '@/services/auth.service'

function HomePage() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  const handlerClick = async () => {
        try {
          await authService.logout()
        } catch (error) {
          console.log(error)
        } finally {
          useAuthStore.getState().clearAuth()
        }
  }

  return (
    <div>
      <h1>Home Page</h1>
      <p>{user?.displayName}</p>
      {isAuthenticated && <button className='cursor-pointer' onClick={handlerClick}>Logout</button>}
    </div>
  )
}

export default HomePage

