import express from 'express'
import { getAdminDashboard, getEmployeeDashboard, getClientDashboard, getSuperAdminDashboard } from '../controllers/dashboard.controller.js'
import { verifyToken }    from '../middleware/authMiddleware.js'
import { attachTenant }   from '../middleware/tenantMiddleware.js'

const router = express.Router()

router.use(verifyToken, attachTenant)

router.get('/admin',      getAdminDashboard)
router.get('/employee',   getEmployeeDashboard)
router.get('/client',     getClientDashboard)
router.get('/superadmin', getSuperAdminDashboard)

export default router