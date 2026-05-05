import express from 'express'
import supabaseAdmin from '../config/supabase.admin.js'
import { verifyToken, requireSuperAdmin } from '../middleware/authMiddleware.js'
import { attachTenant } from '../middleware/tenantMiddleware.js'
import { success, error } from '../utils/response.js'

const router = express.Router()
router.use(verifyToken, attachTenant, requireSuperAdmin)

// Stats
router.get('/stats', async (_req, res) => {
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

// Platform Analytics
router.get('/analytics', async (_req, res) => {
  try {
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear() })
    }
    const [tenants, profiles] = await Promise.all([
      supabaseAdmin.from('tenants').select('id, plan, is_active, created_at'),
      supabaseAdmin.from('profiles').select('id, created_at, role'),
    ])
    const t = tenants.data  || []
    const p = profiles.data || []
    const growth = months.map(m => ({
      month:   m.label,
      tenants: t.filter(x => { const d = new Date(x.created_at); return d.getFullYear() === m.year && d.getMonth() + 1 === m.month }).length,
      users:   p.filter(x => { const d = new Date(x.created_at); return d.getFullYear() === m.year && d.getMonth() + 1 === m.month }).length,
    }))
    return success(res, {
      growth,
      totalTenants: t.length,
      activeTenants: t.filter(x => x.is_active).length,
      totalUsers: p.length,
      adminCount: p.filter(x => x.role === 'admin').length,
      employeeCount: p.filter(x => x.role === 'employee').length,
      clientCount: p.filter(x => x.role === 'client').length,
      planBreakdown: {
        free: t.filter(x => x.plan === 'free').length,
        pro:  t.filter(x => x.plan === 'pro').length,
        enterprise: t.filter(x => x.plan === 'enterprise').length,
      },
    })
  } catch (err) { return error(res, err.message, 500) }
})

// Feature flags (stored in DB if table exists, else return defaults)
router.get('/features', async (_req, res) => {
  try {
    const { data } = await supabaseAdmin.from('feature_flags').select('*').order('name')
    return success(res, data || [])
  } catch { return success(res, []) }
})

router.post('/features', async (req, res) => {
  try {
    const { name, description, enabled, tenant_id } = req.body
    const { data, error: err } = await supabaseAdmin
      .from('feature_flags').insert({ name, description, enabled: enabled ?? true, tenant_id: tenant_id || null }).select().single()
    if (err) throw err
    return success(res, data, 'Feature flag created')
  } catch (err) { return error(res, err.message, 500) }
})

router.patch('/features/:id', async (req, res) => {
  try {
    const { data, error: err } = await supabaseAdmin
      .from('feature_flags').update(req.body).eq('id', req.params.id).select().single()
    if (err) throw err
    return success(res, data, 'Feature flag updated')
  } catch (err) { return error(res, err.message, 500) }
})

// Platform settings
router.get('/settings', async (_req, res) => {
  try {
    const { data } = await supabaseAdmin.from('platform_settings').select('*').single()
    return success(res, data || { maintenance_mode: false, signup_enabled: true, max_users_free: 5, max_projects_free: 3 })
  } catch { return success(res, { maintenance_mode: false, signup_enabled: true, max_users_free: 5, max_projects_free: 3 }) }
})

router.patch('/settings', async (req, res) => {
  try {
    const { data, error: err } = await supabaseAdmin
      .from('platform_settings').upsert({ id: 1, ...req.body, updated_at: new Date().toISOString() }).select().single()
    if (err) throw err
    return success(res, data, 'Settings updated')
  } catch (err) { return error(res, err.message, 500) }
})

export default router