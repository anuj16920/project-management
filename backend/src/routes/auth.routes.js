import express from 'express'
import {
  login, signup, googleAuth, getMe, updateMe,
  createEmployee, createClient, createAdminAccount,
  listUsers, deactivateUser, resetPassword,
} from '../controllers/auth.controller.js'
import { verifyToken, requireAdmin, requireSuperAdmin } from '../middleware/authMiddleware.js'
import { attachTenant } from '../middleware/tenantMiddleware.js'
import { authLimiter }  from '../middleware/rateLimiter.js'

const router = express.Router()

// ── Public Auth ──────────────────────────────────────────────────────────────
router.post('/login',   authLimiter, verifyToken, login)
router.post('/signup',  authLimiter, verifyToken, signup)
router.post('/google',  authLimiter, verifyToken, googleAuth)
router.get('/me',                    verifyToken, getMe)
router.patch('/me', verifyToken, attachTenant, updateMe)

// ── User Management (Admin/SuperAdmin only) ───────────────────────────────────
router.use(verifyToken, attachTenant)

router.get('/users',                          requireAdmin,      listUsers)
router.post('/users/employee',                requireAdmin,      createEmployee)
router.post('/users/client',                  requireAdmin,      createClient)
router.post('/users/admin',                   requireSuperAdmin, createAdminAccount)
router.patch('/users/:targetUid/deactivate',  requireSuperAdmin, deactivateUser)
router.post('/users/reset-password',          requireAdmin,      resetPassword)

export default router