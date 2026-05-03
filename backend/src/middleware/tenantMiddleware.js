import supabaseAdmin from '../config/supabase.admin.js'
import { error } from '../utils/response.js'

export const attachTenant = async (req, res, next) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('tenant_id, role')
      .eq('firebase_uid', req.user.uid)
      .single()

    if (!profile) return error(res, 'Profile not found', 404)

    req.tenantId = profile.tenant_id
    req.userRole = profile.role
    next()
  } catch {
    return error(res, 'Tenant resolution failed', 500)
  }
}