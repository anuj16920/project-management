import express from 'express'
import {
  getStats,
  listInvoices, getInvoice, createInvoice,
  updateInvoice, updateStatus, deleteInvoice,
  listExpenses, createExpense, updateExpense,
  reviewExpense, deleteExpense,
  listCategories, createCategory,
  listPayments, recordPayment,
} from '../controllers/finance.controller.js'
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js'
import { attachTenant }              from '../middleware/tenantMiddleware.js'

const router = express.Router()
router.use(verifyToken, attachTenant)

// Stats
router.get('/stats',                          getStats)

// Invoices
router.get('/invoices',                       listInvoices)
router.get('/invoices/:id',                   getInvoice)
router.post('/invoices',       requireAdmin,  createInvoice)
router.patch('/invoices/:id',  requireAdmin,  updateInvoice)
router.patch('/invoices/:id/status', requireAdmin, updateStatus)
router.delete('/invoices/:id', requireAdmin,  deleteInvoice)

// Expenses
router.get('/expenses',                       listExpenses)
router.post('/expenses',                      createExpense)
router.patch('/expenses/:id',                 updateExpense)
router.patch('/expenses/:id/review', requireAdmin, reviewExpense)
router.delete('/expenses/:id', requireAdmin,  deleteExpense)

// Expense Categories
router.get('/expense-categories',             listCategories)
router.post('/expense-categories', requireAdmin, createCategory)

// Payments
router.get('/payments',                       listPayments)
router.post('/payments',       requireAdmin,  recordPayment)

export default router