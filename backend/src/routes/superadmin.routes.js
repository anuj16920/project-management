import express from 'express'
import supabaseAdmin from '../config/supabase.admin.js'
import { verifyToken, requireSuperAdmin } from '../middleware/authMiddleware.js'
import { attachTenant } from '../middleware/tenantMiddleware.js'
import { success, error } from '../utils/response.js'

const router = express.Router()
router.use(verifyToken, attachTenant, requireSuperAdmin)

// Stats
router.get('/stats', async (req, res) => {
  try {
    const [tenants, profiles] = await Promise.all([
      supabaseAdmin.from('tenants').select('id, plan, is_active'),
      supabaseAdmin.from('profiles').select('id'),
    ])
    const t = tenants.data || []
    return success(res, {
      totalTenants:      t.length,
      totalUsers:        profiles.data?.length || 0,
      activePlans:       t.filter(x => x.plan !== 'free').length,
      freeTenants:       t.filter(x => x.plan === 'free').length,
      proTenants:        t.filter(x => x.plan === 'pro').length,
      enterpriseTenants: t.filter(x => x.plan === 'enterprise').length,
      revenue:           0,  // hook up Stripe later in Module 8
    })
  } catch (err) { return error(res, err.message, 500) }
})

// List tenants
router.get('/tenants', async (req, res) => {
  try {
    let q = supabaseAdmin
      .from('tenants')
      .select('*, profiles!tenants_owner_uid_fkey(email, full_name)')
      .order('created_at', { ascending: false })
    if (req.query.plan)   q = q.eq('plan',  req.query.plan)
    if (req.query.search) q = q.ilike('name', `%${req.query.search}%`)
    const { data, error: err } = await q
    if (err) throw err
    const enriched = data.map(t => ({
      ...t,
      owner_email: t.profiles?.email,
      owner_name:  t.profiles?.full_name,
    }))
    return success(res, enriched)
  } catch (err) { return error(res, err.message, 500) }
})

// Update tenant
router.patch('/tenants/:id', async (req, res) => {
  try {
    const { data, error: err } = await supabaseAdmin
      .from('tenants').update(req.body).eq('id', req.params.id).select().single()
    if (err) throw err
    return success(res, data, 'Tenant updated')
  } catch (err) { return error(res, err.message, 500) }
})

// Delete tenant
router.delete('/tenants/:id', async (req, res) => {
  try {
    const { error: err } = await supabaseAdmin
      .from('tenants').delete().eq('id', req.params.id)
    if (err) throw err
    return success(res, null, 'Tenant deleted')
  } catch (err) { return error(res, err.message, 500) }
})

export default router