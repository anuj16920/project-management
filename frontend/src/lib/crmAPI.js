import api from './api'

export const crmAPI = {
  stats:           ()           => api.get('/crm/stats'),

  // Clients
  listClients:     (params)     => api.get('/crm/clients', { params }),
  getClient:       (id)         => api.get(`/crm/clients/${id}`),
  createClient:    (data)       => api.post('/crm/clients', data),
  updateClient:    (id, data)   => api.patch(`/crm/clients/${id}`, data),
  deleteClient:    (id)         => api.delete(`/crm/clients/${id}`),

  // Contacts
  addContact:      (clientId, data)            => api.post(`/crm/clients/${clientId}/contacts`, data),
  deleteContact:   (clientId, contactId)       => api.delete(`/crm/clients/${clientId}/contacts/${contactId}`),

  // Deals
  listDeals:       (params)     => api.get('/crm/deals', { params }),
  createDeal:      (data)       => api.post('/crm/deals', data),
  updateDeal:      (id, data)   => api.patch(`/crm/deals/${id}`, data),
  deleteDeal:      (id)         => api.delete(`/crm/deals/${id}`),

  // Activities
  listActivities:  (params)     => api.get('/crm/activities', { params }),
  addActivity:     (data)       => api.post('/crm/activities', data),
  toggleActivity:  (id)         => api.patch(`/crm/activities/${id}/toggle`),
}