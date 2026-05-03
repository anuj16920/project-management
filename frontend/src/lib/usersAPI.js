import api from './api'

export const usersAPI = {
  // List all users
  list: (params) => api.get('/users', { params }),
  
  // Create employee
  createEmployee: (data) => api.post('/users/employee', data),
  
  // Create client
  createClient: (data) => api.post('/users/client', data),
  
  // Delete user
  delete: (id) => api.delete(`/users/${id}`),
}

export default usersAPI
