import api from '@/api/axios'
import userService from '@/services/user.service'
import useAuthStore from '@/stores/auth.store'

let initializationPromise = null

export function initializeAuth() {
  // Đảm bảo không gọi refresh nhiều lần khi khởi tạo.
  if (initializationPromise) {
    return initializationPromise
  }

  initializationPromise = (async () => {
    const authStore = useAuthStore.getState()

    try {
      // Bước 1: Lấy access token mới từ refresh cookie.
      const refreshResponse = await api.post('/auth/refresh')

      const accessToken = refreshResponse.data?.accessToken

      if (!accessToken) {
        throw new Error('Refresh response không có accessToken')
      }

      // Bước 2: Lưu access token vào Zustand memory.
      // Request GET /users/me tiếp theo sẽ tự gắn Bearer token.
      authStore.setAccessToken(accessToken)

      // Bước 3: Lấy thông tin user mới nhất từ backend.
      const userResponse = await userService.getCurrentUser()
      const user = userResponse?.data

      if (!user) {
        throw new Error('Không lấy được thông tin user')
      }

      // Bước 4: Hoàn tất khôi phục phiên.
      authStore.setAuth(user, accessToken)
    } catch {
      // Refresh hoặc lấy user thất bại:
      // Xem phiên hiện tại là không hợp lệ.
      authStore.clearAuth()
    }
  })()

  return initializationPromise
}
