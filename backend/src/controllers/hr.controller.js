import * as HR from '../services/hr.service.js'
import { success, error } from '../utils/response.js'

// ── Departments ───────────────────────────────────────────────────────────────
export const listDepts    = async (req,res) => {
  try { return success(res, await HR.listDepartments(req.tenantId)) }
  catch(err){ return error(res, err.message, 500) }
}
export const createDept   = async (req,res) => {
  try {
    if (!req.body.name) return error(res, 'name required', 400)
    return success(res, await HR.createDepartment(req.tenantId, req.body), 'Created', 201)
  } catch(err){ return error(res, err.message, 500) }
}
export const deleteDept   = async (req,res) => {
  try { await HR.deleteDepartment(req.tenantId, req.params.id); return success(res, null, 'Deleted') }
  catch(err){ return error(res, err.message, 500) }
}

// ── Employees ─────────────────────────────────────────────────────────────────
export const listEmployees  = async (req,res) => {
  try { return success(res, await HR.listEmployees(req.tenantId, req.query)) }
  catch(err){ return error(res, err.message, 500) }
}
export const getEmployee    = async (req,res) => {
  try { return success(res, await HR.getEmployee(req.tenantId, req.params.id)) }
  catch(err){ return error(res, err.message, 500) }
}
export const getMyProfile   = async (req,res) => {
  try { return success(res, await HR.getMyEmployee(req.tenantId, req.user.uid)) }
  catch(err){ return error(res, err.message, 500) }
}
export const createEmployee = async (req,res) => {
  try {
    if (!req.body.profile_uid) return error(res, 'profile_uid required', 400)
    return success(res, await HR.createEmployee(req.tenantId, req.body), 'Employee created', 201)
  } catch(err){ return error(res, err.message, err.status||500) }
}
export const updateEmployee = async (req,res) => {
  try { return success(res, await HR.updateEmployee(req.tenantId, req.params.id, req.body), 'Updated') }
  catch(err){ return error(res, err.message, 500) }
}
export const deleteEmployee = async (req,res) => {
  try { await HR.deleteEmployee(req.tenantId, req.params.id); return success(res, null, 'Deleted') }
  catch(err){ return error(res, err.message, 500) }
}

// ── Attendance ────────────────────────────────────────────────────────────────
export const clockIn        = async (req,res) => {
  try { return success(res, await HR.clockIn(req.tenantId, req.user.uid), 'Clocked in ✅') }
  catch(err){ return error(res, err.message, err.status||500) }
}
export const clockOut       = async (req,res) => {
  try { return success(res, await HR.clockOut(req.tenantId, req.user.uid), 'Clocked out 🌙') }
  catch(err){ return error(res, err.message, err.status||500) }
}
export const getAttendance  = async (req,res) => {
  try { return success(res, await HR.getAttendance(req.tenantId, req.query)) }
  catch(err){ return error(res, err.message, 500) }
}
export const markAttendance = async (req,res) => {
  try { return success(res, await HR.markAttendance(req.tenantId, req.body), 'Marked') }
  catch(err){ return error(res, err.message, 500) }
}

// ── Leave Types ───────────────────────────────────────────────────────────────
export const listLeaveTypes  = async (req,res) => {
  try { return success(res, await HR.listLeaveTypes(req.tenantId)) }
  catch(err){ return error(res, err.message, 500) }
}
export const createLeaveType = async (req,res) => {
  try {
    if (!req.body.name) return error(res, 'name required', 400)
    return success(res, await HR.createLeaveType(req.tenantId, req.body), 'Created', 201)
  } catch(err){ return error(res, err.message, 500) }
}

// ── Leave Requests ────────────────────────────────────────────────────────────
export const listLeaves  = async (req,res) => {
  try { return success(res, await HR.listLeaveRequests(req.tenantId, req.query)) }
  catch(err){ return error(res, err.message, 500) }
}
export const applyLeave  = async (req,res) => {
  try {
    const { from_date, to_date, leave_type_id } = req.body
    if (!from_date||!to_date||!leave_type_id) return error(res, 'from_date, to_date, leave_type_id required', 400)
    return success(res, await HR.applyLeave(req.tenantId, req.user.uid, req.body), 'Leave applied', 201)
  } catch(err){ return error(res, err.message, 500) }
}
export const reviewLeave = async (req,res) => {
  try {
    if (!req.body.status) return error(res, 'status required', 400)
    return success(res, await HR.reviewLeave(req.tenantId, req.params.id, req.user.uid, req.body))
  } catch(err){ return error(res, err.message, err.status||500) }
}
export const cancelLeave = async (req,res) => {
  try { await HR.cancelLeave(req.tenantId, req.params.id, req.user.uid); return success(res, null, 'Cancelled') }
  catch(err){ return error(res, err.message, err.status||500) }
}

// ── Payroll ───────────────────────────────────────────────────────────────────
export const listPayroll     = async (req,res) => {
  try { return success(res, await HR.listPayroll(req.tenantId, req.query)) }
  catch(err){ return error(res, err.message, 500) }
}
export const generatePayroll = async (req,res) => {
  try {
    const { month, year } = req.body
    if (!month||!year) return error(res, 'month and year required', 400)
    return success(res, await HR.generatePayroll(req.tenantId, month, year), 'Payroll generated', 201)
  } catch(err){ return error(res, err.message, 500) }
}
export const processPayroll  = async (req,res) => {
  try { return success(res, await HR.processPayroll(req.tenantId, req.params.id), 'Processed') }
  catch(err){ return error(res, err.message, 500) }
}
export const markPaid        = async (req,res) => {
  try { return success(res, await HR.markPayrollPaid(req.tenantId, req.params.id), 'Marked as paid 💰') }
  catch(err){ return error(res, err.message, 500) }
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export const getHRStats = async (req,res) => {
  try { return success(res, await HR.getHRStats(req.tenantId)) }
  catch(err){ return error(res, err.message, 500) }
}