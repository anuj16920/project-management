import express from 'express'
import {
  listDepts, createDept, deleteDept,
  listEmployees, getEmployee, getMyProfile,
  createEmployee, updateEmployee, deleteEmployee,
  clockIn, clockOut, getAttendance, markAttendance,
  listLeaveTypes, createLeaveType,
  listLeaves, applyLeave, reviewLeave, cancelLeave,
  listPayroll, generatePayroll, processPayroll, markPaid,
  getHRStats,
} from '../controllers/hr.controller.js'
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js'
import { attachTenant }              from '../middleware/tenantMiddleware.js'

const router = express.Router()
router.use(verifyToken, attachTenant)

// Stats
router.get('/stats',                           getHRStats)

// Departments
router.get('/departments',                     listDepts)
router.post('/departments',     requireAdmin,  createDept)
router.delete('/departments/:id', requireAdmin, deleteDept)

// Employees
router.get('/employees',                       listEmployees)
router.get('/employees/me',                    getMyProfile)
router.get('/employees/:id',                   getEmployee)
router.post('/employees',       requireAdmin,  createEmployee)
router.patch('/employees/:id',  requireAdmin,  updateEmployee)
router.delete('/employees/:id', requireAdmin,  deleteEmployee)

// Attendance
router.post('/attendance/clock-in',            clockIn)
router.post('/attendance/clock-out',           clockOut)
router.get('/attendance',                      getAttendance)
router.post('/attendance',      requireAdmin,  markAttendance)

// Leave Types
router.get('/leave-types',                     listLeaveTypes)
router.post('/leave-types',     requireAdmin,  createLeaveType)

// Leave Requests
router.get('/leaves',                          listLeaves)
router.post('/leaves',                         applyLeave)
router.patch('/leaves/:id/review', requireAdmin, reviewLeave)
router.patch('/leaves/:id/cancel',             cancelLeave)

// Payroll
router.get('/payroll',                         listPayroll)
router.post('/payroll/generate',  requireAdmin, generatePayroll)
router.patch('/payroll/:id/process', requireAdmin, processPayroll)
router.patch('/payroll/:id/paid',    requireAdmin, markPaid)

export default router