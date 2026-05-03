import api from './api'

export const invoiceAPI = {
  // Stats
  stats:            ()            => api.get('/finance/stats'),

  // Invoices
  listInvoices:     (params)      => api.get('/finance/invoices', { params }),
  getInvoice:       (id)          => api.get(`/finance/invoices/${id}`),
  createInvoice:    (data)        => api.post('/finance/invoices', data),
  updateInvoice:    (id, data)    => api.patch(`/finance/invoices/${id}`, data),
  updateStatus:     (id, status)  => api.patch(`/finance/invoices/${id}/status`, { status }),
  deleteInvoice:    (id)          => api.delete(`/finance/invoices/${id}`),

  // Expenses
  listExpenses:     (params)      => api.get('/finance/expenses', { params }),
  createExpense:    (data)        => api.post('/finance/expenses', data),
  updateExpense:    (id, data)    => api.patch(`/finance/expenses/${id}`, data),
  reviewExpense:    (id, status)  => api.patch(`/finance/expenses/${id}/review`, { status }),
  deleteExpense:    (id)          => api.delete(`/finance/expenses/${id}`),

  // Categories
  listCategories:   ()            => api.get('/finance/expense-categories'),
  createCategory:   (data)        => api.post('/finance/expense-categories', data),

  // Payments
  listPayments:     (params)      => api.get('/finance/payments', { params }),
  recordPayment:    (data)        => api.post('/finance/payments', data),
}

// Alias for backward compatibility
export const financeAPI = invoiceAPI