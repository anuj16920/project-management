import express from 'express'
import { listUsers, createEmployee, createClient, deleteUser } from '../controllers/users.controller.js'
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js'
import { attachTenant } from '../middleware/tenantMiddleware.js'

const router = express.Router()

// All routes require admin access
router.use(verifyToken, attachTenant, requireAdmin)

router.get('/', listUsers)
router.post('/employee', createEmployee)
router.post('/client', createClient)
router.delete('/:id', deleteUser)

export default router
