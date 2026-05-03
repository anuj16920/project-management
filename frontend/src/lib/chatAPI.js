import api from './api'

export const chatAPI = {
  // Rooms
  listRooms:    ()              => api.get('/chat/rooms'),
  createRoom:   (data)          => api.post('/chat/rooms', data),
  getRoom:      (id)            => api.get(`/chat/rooms/${id}`),

  // Messages
  listMessages: (roomId, params) => api.get(`/chat/rooms/${roomId}/messages`, { params }),
  sendMessage:  (roomId, data)   => api.post(`/chat/rooms/${roomId}/messages`, data),
  editMessage:  (msgId, content) => api.patch(`/chat/messages/${msgId}`, { content }),
  deleteMessage:(msgId)          => api.delete(`/chat/messages/${msgId}`),
  markRead:     (roomId)         => api.post(`/chat/rooms/${roomId}/read`),

  // Notifications
  listNotifications: (params)   => api.get('/chat/notifications', { params }),
  unreadCount:       ()         => api.get('/chat/notifications/unread-count'),
  markRead:          (id)       => api.patch(`/chat/notifications/${id}/read`),
  markAllRead:       ()         => api.patch('/chat/notifications/read-all'),
}