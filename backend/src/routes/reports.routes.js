import express from 'express'
import {
  overview, revenue, projects, tasks, employees, clients, expenses, invoices,
  exportReport,
  listSaved, createSaved, deleteSaved,
} from '../controllers/reports.controller.js'
import { verifyToken, requireAdmin }  from '../middleware/authMiddleware.js'
import { attachTenant } from '../middleware/tenantMiddleware.js'

const router = express.Router()
router.use(verifyToken, attachTenant)

// Analytics
router.get('/overview',   overview)
router.get('/revenue',    revenue)
router.get('/projects',   projects)
router.get('/tasks',      tasks)
router.get('/employees',  requireAdmin, employees)
router.get('/clients',    clients)
router.get('/expenses',   expenses)
router.get('/invoices',   invoices)

// Export
router.get('/export',     exportReport)

// Saved reports
router.get('/saved',      listSaved)
router.post('/saved',     createSaved)
router.delete('/saved/:id', deleteSaved)

export default router