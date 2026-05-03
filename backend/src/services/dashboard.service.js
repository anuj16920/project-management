import supabaseAdmin from '../config/supabase.admin.js'

export const getAdminStats = async (tenantId) => {
  const [projects, tasks, members, revenue] = await Promise.all([
    supabaseAdmin.from('projects').select('id, status').eq('tenant_id', tenantId),
    supabaseAdmin.from('tasks').select('id, status').eq('tenant_id', tenantId),
    supabaseAdmin.from('profiles').select('id').eq('tenant_id', tenantId),
    supabaseAdmin.from('invoices').select('amount, status').eq('tenant_id', tenantId).eq('status','paid'),
  ])

  const totalRevenue = revenue.data?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
  const activeProjects = projects.data?.filter(p => p.status !== 'completed').length || 0
  const openTasks = tasks.data?.filter(t => t.status !== 'done').length || 0

  return {
    totalRevenue,
    activeProjects,
    openTasks,
    teamMembers: members.data?.length || 0,
  }
}

export const getEmployeeStats = async (tenantId, uid) => {
  const [myTasks, profile] = await Promise.all([
    supabaseAdmin.from('tasks').select('id, status').eq('tenant_id', tenantId).eq('assignee_uid', uid),
    supabaseAdmin.from('profiles').select('*').eq('firebase_uid', uid).single(),
  ])
  return {
    totalTasks:    myTasks.data?.length || 0,
    completedTasks:myTasks.data?.filter(t=>t.status==='done').length || 0,
    profile:       profile.data,
  }
}

export const getClientStats = async (tenantId, uid) => {
  const [projects, invoices] = await Promise.all([
    supabaseAdmin.from('projects').select('id, status, name').eq('tenant_id', tenantId).eq('client_uid', uid),
    supabaseAdmin.from('invoices').select('id, amount, status').eq('tenant_id', tenantId).eq('client_uid', uid),
  ])
  const totalPaid = invoices.data?.filter(i=>i.status==='paid').reduce((s,i)=>s+i.amount,0) || 0
  return {
    activeProjects: projects.data?.filter(p=>p.status!=='completed').length || 0,
    totalProjects:  projects.data?.length || 0,
    totalPaid,
    pendingInvoices:invoices.data?.filter(i=>i.status==='pending').length || 0,
  }
}

export const getSuperAdminStats = async () => {
  const [tenants, profiles] = await Promise.all([
    supabaseAdmin.from('tenants').select('id, plan, is_active'),
    supabaseAdmin.from('profiles').select('id'),
  ])
  return {
    totalTenants:   tenants.data?.length || 0,
    activeTenants:  tenants.data?.filter(t=>t.is_active).length || 0,
    totalUsers:     profiles.data?.length || 0,
    planBreakdown: {
      starter:    tenants.data?.filter(t=>t.plan==='starter').length || 0,
      pro:        tenants.data?.filter(t=>t.plan==='pro').length || 0,
      enterprise: tenants.data?.filter(t=>t.plan==='enterprise').length || 0,
    },
  }
}