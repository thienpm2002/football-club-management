import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,

  // Được gọi sau khi login hoặc khôi phục session thành công.
  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isInitializing: false,
    }),

  // Cập nhật access token.  
  setAccessToken: (accessToken) =>
    set({
      accessToken,
  }),  

  // Cập nhật thông tin user.
  setUser: (user) =>
    set({
      user,
    }),

  // Được gọi khi logout hoặc session không còn hợp lệ.
  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitializing: false,
    }),

  // Đánh dấu quá trình kiểm tra session hoàn tất.
  finishInitializing: () =>
    set({
      isInitializing: false,
    }),
}))

export default useAuthStore