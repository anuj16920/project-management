import axios from 'axios'
import { auth } from './firebase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Auto-attach Firebase JWT
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) window.location.href = '/login'
    return Promise.reject(err)
  }
)

// ─── User Management API helpers ─────────────────────────────────────────────
export const userAPI = {
  // List all users (optionally filter by role)
  list: (role) => api.get('/auth/users', { params: role ? { role } : {} }),

  // Admin/SuperAdmin creates employee
  createEmployee: (data) => api.post('/auth/users/employee', data),

  // Admin/SuperAdmin creates client
  createClient: (data) => api.post('/auth/users/client', data),

  // SuperAdmin creates admin
  createAdmin: (data) => api.post('/auth/users/admin', data),

  // SuperAdmin deactivates user
  deactivate: (targetUid) => api.patch(`/auth/users/${targetUid}/deactivate`),

  // Admin/SuperAdmin resets password
  resetPassword: (targetUid, newPassword) => api.post('/auth/users/reset-password', { targetUid, newPassword }),
}

export default api