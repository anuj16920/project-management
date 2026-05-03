import api from './api'

export const reportsAPI = {
  overview:   (params) => api.get('/reports/overview',  { params }),
  revenue:    (params) => api.get('/reports/revenue',   { params }),
  projects:   (params) => api.get('/reports/projects',  { params }),
  tasks:      (params) => api.get('/reports/tasks',     { params }),
  employees:  (params) => api.get('/reports/employees', { params }),
  clients:    (params) => api.get('/reports/clients',   { params }),
  expenses:   (params) => api.get('/reports/expenses',  { params }),
  invoices:   (params) => api.get('/reports/invoices',  { params }),

  // Export — triggers file download
  export: (params) => api.get('/reports/export', {
    params,
    responseType: 'blob',
  }),

  // Saved
  listSaved:   ()       => api.get('/reports/saved'),
  createSaved: (data)   => api.post('/reports/saved', data),
  deleteSaved: (id)     => api.delete(`/reports/saved/${id}`),
}

// Helper — download blob as file
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href    = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}