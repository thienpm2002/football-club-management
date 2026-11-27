import api from '@/api/axios'

const userService = {
  async getCurrentUser() {
    const response = await api.get('/users/me')
    return response
  },
}

export default userService