import api from './api'

export const taskAPI = {
  list:      (params)              => api.get('/tasks', { params }),
  get:       (id)                  => api.get(`/tasks/${id}`),
  create:    (data)                => api.post('/tasks', data),
  update:    (id, data)            => api.patch(`/tasks/${id}`, data),
  delete:    (id)                  => api.delete(`/tasks/${id}`),
  move:      (id, newStatus, newPosition) =>
                                      api.patch(`/tasks/${id}/move`, { newStatus, newPosition }),
  reorder:   (updates)             => api.post('/tasks/reorder', { updates }),

  addComment:    (id, content)     => api.post(`/tasks/${id}/comments`, { content }),
  deleteComment: (id, commentId)   => api.delete(`/tasks/${id}/comments/${commentId}`),

  logTime:    (id, data)           => api.post(`/tasks/${id}/time-logs`, data),
  createSubtask: (id, data)        => api.post(`/tasks/${id}/subtasks`, data),
}