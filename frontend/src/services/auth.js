import api from './api'

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password })
    return response.data
  },

  register: async (userData) => {
    const response = await api.post('/auth/register/', userData)
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/users/me/')
    return response.data
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/me/', profileData)
    return response.data
  },
}

