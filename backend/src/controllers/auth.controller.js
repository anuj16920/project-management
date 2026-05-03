import * as AuthService from '../services/auth.service.js'
import * as HRService from '../services/hr.service.js'
import * as CRMService from '../services/crm.service.js'
import { success, error } from '../utils/response.js'

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const profile = await AuthService.getProfileByUID(req.user.uid)
    if (!profile) return error(res, 'Account not found. Please sign up.', 404)
    if (!profile.is_active) return error(res, 'Your account has been deactivated. Contact your admin.', 403)
    return success(res, profile, 'Login successful')
  } catch (err) {
    return error(res, err.message || 'Login failed', 500)
  }
}

// ─── Signup (self-serve, creates Admin + Tenant) ─────────────────────────────
export const signup = async (req, res) => {
  try {
    const { uid, email, fullName, companyName } = req.body
    if (uid !== req.user.uid) return error(res, 'Unauthorized', 403)

    const existing = await AuthService.getProfileByUID(uid).catch(() => null)
    if (existing) return success(res, existing, 'Already registered')

    const profile = await AuthService.createTenantAndAdmin({ uid, email, fullName, companyName })
    return success(res, profile, 'Workspace created', 201)
  } catch (err) {
    return error(res, err.message || 'Signup failed', 500)
  }
}

// ─── Google Auth ──────────────────────────────────────────────────────────────
export const googleAuth = async (req, res) => {
  try {
    const { uid, email, fullName, photo } = req.body
    if (uid !== req.user.uid) return error(res, 'Unauthorized', 403)
    const profile = await AuthService.upsertGoogleProfile({ uid, email, fullName, photo })
    return success(res, profile, 'Google auth successful')
  } catch (err) {
    return error(res, err.message || 'Google auth failed', 500)
  }
}

// ─── Get current user ─────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const profile = await AuthService.getProfileByUID(req.user.uid)
    if (!profile) return error(res, 'Profile not found', 404)
    return success(res, profile)
  } catch (err) {
    return error(res, err.message, 500)
  }
}

// ─── Create Employee (Admin/SuperAdmin only) ──────────────────────────────────
export const createEmployee = async (req, res) => {
  try {
    const { email, fullName, department, phone, tempPassword } = req.body
    if (!email || !fullName || !tempPassword)
      return error(res, 'email, fullName and tempPassword are required', 400)

    const employeeProfile = await AuthService.createEmployeeByAdmin({
      creatorTenantId: req.tenantId,
      creatorRole:     req.userRole,
      email, fullName, department, phone, tempPassword,
    })

    // Also create the HR employee record
    await HRService.createEmployee(req.tenantId, {
      profile_uid: employeeProfile.firebase_uid,
      department_id: null,
      designation: department || 'Employee',
      phone: phone,
    }).catch(console.error) // Ignore errors if it already exists or fails

    return success(res, employeeProfile, 'Employee account created', 201)
  } catch (err) {
    return error(res, err.message || 'Failed to create employee', err.status || 500)
  }
}

// ─── Create Client (Admin/SuperAdmin only) ────────────────────────────────────
export const createClient = async (req, res) => {
  try {
    const { email, fullName, phone, companyName, tempPassword } = req.body
    if (!email || !fullName || !tempPassword)
      return error(res, 'email, fullName and tempPassword are required', 400)

    const client = await CRMService.createClient(req.tenantId, req.userRole, {
      email, fullName, phone, tempPassword,
      company_name: companyName || fullName,
    })

    return success(res, client.profile, 'Client account created', 201)
  } catch (err) {
    return error(res, err.message || 'Failed to create client', err.status || 500)
  }
}

// ─── Create Admin (SuperAdmin only) ──────────────────────────────────────────
export const createAdminAccount = async (req, res) => {
  try {
    const { email, fullName, tempPassword, targetTenantId } = req.body
    if (!email || !fullName || !tempPassword || !targetTenantId)
      return error(res, 'All fields required', 400)

    const newAdmin = await AuthService.createAdminBySuperAdmin({
      creatorRole:     req.userRole,
      targetTenantId,
      email, fullName, tempPassword,
    })
    return success(res, newAdmin, 'Admin account created', 201)
  } catch (err) {
    return error(res, err.message || 'Failed to create admin', err.status || 500)
  }
}

// ─── List users in tenant ─────────────────────────────────────────────────────
export const listUsers = async (req, res) => {
  try {
    const { role } = req.query
    const users    = await AuthService.listTenantUsers(req.tenantId, role || null)
    return success(res, users)
  } catch (err) {
    return error(res, err.message, 500)
  }
}

// ─── Deactivate user (SuperAdmin only) ───────────────────────────────────────
export const deactivateUser = async (req, res) => {
  try {
    const { targetUid } = req.params
    const result = await AuthService.deactivateUser({ targetUid, creatorRole: req.userRole })
    return success(res, result, 'User deactivated')
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

// ─── Reset password ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { targetUid, newPassword } = req.body
    if (!targetUid || !newPassword) return error(res, 'targetUid and newPassword required', 400)
    const result = await AuthService.resetUserPassword({ targetUid, newPassword, creatorRole: req.userRole })
    return success(res, result)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}