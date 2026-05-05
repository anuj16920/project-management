import supabaseAdmin from '../config/supabase.admin.js'

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const applyDateFilter = (q, col, from, to) => {
  if (from) q = q.gte(col, from)
  if (to)   q = q.lte(col, to)
  return q
}

// ─── OVERVIEW KPIs ────────────────────────────────────────────────────────────
export const getOverviewKPIs = async (tenantId, { from, to } = {}) => {
  const [
    revenueRes, expenseRes,
    projectRes, taskRes,
    clientRes,  employeeRes,
    invoiceRes,
  ] = await Promise.all([
    // Total revenue (paid invoices) — column is `total` not `total_amount`
    (() => {
      let q = supabaseAdmin.from('invoices')
        .select('total')
        .eq('tenant_id', tenantId)
        .eq('status', 'paid')
      q = applyDateFilter(q, 'paid_at', from, to)
      return q
    })(),
    // Total expenses (approved) — column is `date` not `expense_date`
    (() => {
      let q = supabaseAdmin.from('expenses')
        .select('amount')
        .eq('tenant_id', tenantId)
        .eq('status', 'approved')
      q = applyDateFilter(q, 'date', from, to)
      return q
    })(),
    // Projects
    supabaseAdmin.from('projects')
      .select('id, status')
      .eq('tenant_id', tenantId),
    // Tasks
    supabaseAdmin.from('tasks')
      .select('id, status')
      .eq('tenant_id', tenantId),
    // Clients — no dedicated clients table; count profiles with role=client
    supabaseAdmin.from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('role', 'client'),
    // Employees
    supabaseAdmin.from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .eq('role', 'employee'),
    // Outstanding invoices
    supabaseAdmin.from('invoices')
      .select('total')
      .eq('tenant_id', tenantId)
      .in('status', ['sent','overdue']),
  ])

  const revenue     = revenueRes.data?.reduce((s, r) => s + (r.total || 0), 0) || 0
  const expenses    = expenseRes.data?.reduce((s, r) => s + (r.amount || 0), 0) || 0
  const projects    = projectRes.data || []
  const tasks       = taskRes.data || []
  const outstanding = invoiceRes.data?.reduce((s, r) => s + (r.total || 0), 0) || 0

  return {
    revenue:            revenue,
    expenses:           expenses,
    profit:             revenue - expenses,
    profit_margin:      revenue > 0 ? Math.round(((revenue - expenses) / revenue) * 100) : 0,
    outstanding:        outstanding,
    total_projects:     projects.length,
    active_projects:    projects.filter(p => p.status === 'active').length,
    completed_projects: projects.filter(p => p.status === 'completed').length,
    total_tasks:        tasks.length,
    completed_tasks:    tasks.filter(t => t.status === 'done').length,
    task_completion:    tasks.length > 0
      ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0,
    total_clients:      clientRes.count   || 0,
    total_employees:    employeeRes.count || 0,
  }
}

// ─── REVENUE TREND ────────────────────────────────────────────────────────────
export const getRevenueTrend = async (tenantId, { from, to, groupBy = 'month' } = {}) => {
  let q = supabaseAdmin
    .from('invoices')
    .select('total, paid_at')           // `total` not `total_amount`, no `issue_date`
    .eq('tenant_id', tenantId)
    .eq('status', 'paid')
    .order('paid_at')

  q = applyDateFilter(q, 'paid_at', from, to)
  const { data, error } = await q
  if (error) throw error

  // Also get expenses for same period — column is `date` not `expense_date`
  let eq = supabaseAdmin
    .from('expenses')
    .select('amount, date')
    .eq('tenant_id', tenantId)
    .eq('status', 'approved')
    .order('date')
  eq = applyDateFilter(eq, 'date', from, to)
  const { data: expData } = await eq

  // Group by month
  const groupKey = (dateStr) => {
    if (!dateStr) return 'Unknown'
    const d = new Date(dateStr)
    if (groupBy === 'day')   return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' })
    if (groupBy === 'week')  return `W${Math.ceil(d.getDate()/7)} ${d.toLocaleDateString('en-IN',{ month:'short' })}`
    return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
  }

  const revenueMap = {}
  data?.forEach(inv => {
    const key = groupKey(inv.paid_at)
    revenueMap[key] = (revenueMap[key] || 0) + (inv.total || 0)
  })

  const expenseMap = {}
  expData?.forEach(exp => {
    const key = groupKey(exp.date)
    expenseMap[key] = (expenseMap[key] || 0) + (exp.amount || 0)
  })

  const allKeys = [...new Set([...Object.keys(revenueMap), ...Object.keys(expenseMap)])]
  return allKeys.map(k => ({
    period:   k,
    revenue:  revenueMap[k]  || 0,
    expenses: expenseMap[k]  || 0,
    profit:   (revenueMap[k] || 0) - (expenseMap[k] || 0),
  }))
}

// ─── PROJECT STATS ────────────────────────────────────────────────────────────
export const getProjectStats = async (tenantId, { from, to } = {}) => {
  let q = supabaseAdmin
    .from('projects')
    .select(`
      id, name, status, budget, start_date, end_date,
      tasks(id, status)
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
  q = applyDateFilter(q, 'created_at', from, to)
  const { data, error } = await q
  if (error) throw error

  const statusCounts = (data||[]).reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})

  const projectList = (data||[]).map(p => ({
    id:              p.id,
    name:            p.name,
    status:          p.status,
    budget:          p.budget,
    total_tasks:     p.tasks?.length || 0,
    completed_tasks: p.tasks?.filter(t => t.status === 'done').length || 0,
    completion:      p.tasks?.length
      ? Math.round((p.tasks.filter(t => t.status === 'done').length / p.tasks.length) * 100) : 0,
  }))

  return { status_counts: statusCounts, projects: projectList }
}

// ─── TASK ANALYTICS ───────────────────────────────────────────────────────────
export const getTaskAnalytics = async (tenantId, { from, to } = {}) => {
  let q = supabaseAdmin
    .from('tasks')
    .select('id, status, priority, assigned_to, due_date, created_at')
    .eq('tenant_id', tenantId)
  q = applyDateFilter(q, 'created_at', from, to)
  const { data, error } = await q
  if (error) throw error

  const tasks = data || []

  const byStatus = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1; return acc }, {})
  const byPriority = tasks.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1; return acc }, {})

  // Overdue tasks
  const now    = new Date()
  const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'done').length

  return {
    total:       tasks.length,
    by_status:   byStatus,
    by_priority: byPriority,
    overdue,
    completed:   byStatus['done'] || 0,
    in_progress: byStatus['in_progress'] || 0,
  }
}

// ─── EMPLOYEE PERFORMANCE ─────────────────────────────────────────────────────
export const getEmployeePerformance = async (tenantId, { from, to } = {}) => {
  // Tasks per employee
  let q = supabaseAdmin
    .from('tasks')
    .select('assigned_to, status')
    .eq('tenant_id', tenantId)
    .not('assigned_to', 'is', null)
  q = applyDateFilter(q, 'created_at', from, to)
  const { data: tasks } = await q

  // Profiles
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('firebase_uid, full_name, role, department')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)

  const profileMap = Object.fromEntries((profiles||[]).map(p => [p.firebase_uid, p]))

  const empMap = {}
  tasks?.forEach(t => {
    if (!empMap[t.assigned_to]) {
      empMap[t.assigned_to] = { total: 0, completed: 0, in_progress: 0, overdue: 0 }
    }
    empMap[t.assigned_to].total++
    if (t.status === 'done')        empMap[t.assigned_to].completed++
    if (t.status === 'in_progress') empMap[t.assigned_to].in_progress++
  })

  return Object.entries(empMap)
    .map(([uid, stats]) => ({
      uid,
      profile:    profileMap[uid] || null,
      name:       profileMap[uid]?.full_name || uid,
      ...stats,
      completion: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.completion - a.completion)
    .slice(0, 10)
}

// ─── CLIENT REVENUE ───────────────────────────────────────────────────────────
export const getClientRevenue = async (tenantId, { from, to } = {}) => {
  // `client_uid` not `client_id`; `total` not `total_amount`
  let q = supabaseAdmin
    .from('invoices')
    .select('client_uid, total, status')
    .eq('tenant_id', tenantId)
    .eq('status', 'paid')
  q = applyDateFilter(q, 'paid_at', from, to)
  const { data: invoices } = await q

  // No `clients` table — client profiles are in `profiles` with role=client
  const clientUids = [...new Set((invoices||[]).map(i => i.client_uid).filter(Boolean))]
  const { data: clientProfiles } = clientUids.length
    ? await supabaseAdmin.from('profiles').select('firebase_uid, full_name').in('firebase_uid', clientUids)
    : { data: [] }
  const clientMap = Object.fromEntries((clientProfiles||[]).map(p => [p.firebase_uid, p]))

  const revenueMap = {}
  invoices?.forEach(inv => {
    revenueMap[inv.client_uid] = (revenueMap[inv.client_uid] || 0) + (inv.total || 0)
  })

  return Object.entries(revenueMap)
    .map(([uid, revenue]) => ({
      client_id: uid,
      name:      clientMap[uid]?.full_name || uid,
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
}

// ─── EXPENSE BREAKDOWN ────────────────────────────────────────────────────────
export const getExpenseBreakdown = async (tenantId, { from, to } = {}) => {
  // column is `date` not `expense_date`; join expense_categories for name
  let q = supabaseAdmin
    .from('expenses')
    .select('amount, date, status, expense_categories(name)')
    .eq('tenant_id', tenantId)
    .eq('status', 'approved')
  q = applyDateFilter(q, 'date', from, to)
  const { data, error } = await q
  if (error) throw error

  const byCategory = (data||[]).reduce((acc, e) => {
    const cat = e.expense_categories?.name || 'Uncategorized'
    acc[cat] = (acc[cat] || 0) + (e.amount || 0); return acc }, {})

  return Object.entries(byCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

// ─── INVOICE SUMMARY ──────────────────────────────────────────────────────────
export const getInvoiceSummary = async (tenantId, { from, to } = {}) => {
  // `total` not `total_amount`; `created_at` not `issue_date`
  let q = supabaseAdmin
    .from('invoices')
    .select('id, total, status, created_at, due_date, paid_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
  q = applyDateFilter(q, 'created_at', from, to)
  const { data, error } = await q
  if (error) throw error

  const invoices = data || []
  const byStatus = invoices.reduce((acc, inv) => {
    if (!acc[inv.status]) acc[inv.status] = { count: 0, amount: 0 }
    acc[inv.status].count++
    acc[inv.status].amount += inv.total || 0
    return acc
  }, {})

  return {
    total:        invoices.length,
    by_status:    byStatus,
    total_amount: invoices.reduce((s, i) => s + (i.total || 0), 0),
  }
}

// ─── SAVED REPORTS ────────────────────────────────────────────────────────────
export const listSavedReports = async (tenantId) => {
  const { data, error } = await supabaseAdmin
    .from('saved_reports')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
  if (error) return []   // table may not exist yet
  return data || []
}

export const createSavedReport = async (tenantId, uid, payload) => {
  const { data, error } = await supabaseAdmin
    .from('saved_reports')
    .insert({ tenant_id: tenantId, created_by: uid, ...payload })
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteSavedReport = async (tenantId, id) => {
  const { error } = await supabaseAdmin
    .from('saved_reports')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', id)
  if (error) throw error
}