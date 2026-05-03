import admin from '../config/firebase.admin.js'
import { error } from '../utils/response.js'

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer '))
      return error(res, 'No token provided', 401)
    const token   = authHeader.split('Bearer ')[1]
    const decoded = await admin.auth().verifyIdToken(token)
    req.user      = decoded
    next()
  } catch (err) {
    return error(res, 'Invalid or expired token', 401)
  }
}

// ✅ Only Admin or Super Admin
export const requireAdmin = (req, res, next) => {
  if (!['admin', 'super_admin'].includes(req.userRole))
    return error(res, 'Access denied. Admins only.', 403)
  next()
}

// ✅ Only Super Admin
export const requireSuperAdmin = (req, res, next) => {
  if (req.userRole !== 'super_admin')
    return error(res, 'Access denied. Super Admins only.', 403)
  next()
}