import * as DashService from '../services/dashboard.service.js'
import { success, error } from '../utils/response.js'

export const getAdminDashboard = async (req, res) => {
  try {
    const data = await DashService.getAdminStats(req.tenantId)
    return success(res, data)
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const getEmployeeDashboard = async (req, res) => {
  try {
    const data = await DashService.getEmployeeStats(req.tenantId, req.user.uid)
    return success(res, data)
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const getClientDashboard = async (req, res) => {
  try {
    const data = await DashService.getClientStats(req.tenantId, req.user.uid)
    return success(res, data)
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const getSuperAdminDashboard = async (req, res) => {
  try {
    if (req.userRole !== 'super_admin') return error(res, 'Forbidden', 403)
    const data = await DashService.getSuperAdminStats()
    return success(res, data)
  } catch (err) {
    return error(res, err.message, 500)
  }
}