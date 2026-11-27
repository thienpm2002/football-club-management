import api from '@/api/axios'

const authService = {
  // Register
  async register(payload) {
    const response = await api.post('/auth/register', payload)
    return response
  },

  // Verify email
  async verifyEmail(token) {
    const response = await api.post('/auth/verify-email', { token })
    return response
  },

  // Resend verification email
  async resendVerificationEmail(email) {
    const response = await api.post('/auth/resend-verification', { email })
    return response
  },

  // Login
  async login(payload) {
    const response = await api.post('/auth/login', payload)
    return response
  },

  // Logout current session
  async logout() {
    const response = await api.post('/auth/logout')
    return response
  },

  // Logout all sessions
  async logoutAll() {
    const response = await api.post('/auth/logout-all')
    return response
  },

  // Forgot password
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response
  },

  // Reset password
  async resetPassword({ token, password }) {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword: password,
    })

    return response
  },
}

export default authService