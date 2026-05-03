import api from './api'

export const projectAPI = {
  list:   (params)       => api.get('/projects', { params }),
  get:    (id)           => api.get(`/projects/${id}`),
  create: (data)         => api.post('/projects', data),
  update: (id, data)     => api.patch(`/projects/${id}`, data),
  archive:(id)           => api.delete(`/projects/${id}`),

  addMilestone:    (id, data)              => api.post(`/projects/${id}/milestones`, data),
  toggleMilestone: (id, milestoneId)       => api.patch(`/projects/${id}/milestones/${milestoneId}/toggle`),

  addMember:    (id, userUid, role)        => api.post(`/projects/${id}/members`, { userUid, role }),
  removeMember: (id, userUid)              => api.delete(`/projects/${id}/members/${userUid}`),
}