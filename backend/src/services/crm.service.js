import supabaseAdmin from '../config/supabase.admin.js'
import * as AuthService from './auth.service.js'

// ─── CLIENTS ──────────────────────────────────────────────────────────────────

export const listClients = async (tenantId, filters = {}) => {
  let q = supabaseAdmin
    .from('clients')
    .select(`
      *,
      contacts(id, full_name, email, is_primary),
      deals(id, value, stage),
      projects(id, name, status)
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (filters.status) q = q.eq('status', filters.status)
  if (filters.search) q = q.ilike('company_name', `%${filters.search}%`)
  if (filters.profile_uid) q = q.eq('profile_uid', filters.profile_uid)

  const { data, error } = await q
  if (error) throw error

  return data.map(c => ({
    ...c,
    activeProjects: c.projects?.filter(p => p.status === 'active').length || 0,
    totalDeals:     c.deals?.length || 0,
    openDeals:      c.deals?.filter(d => !['won','lost'].includes(d.stage)).length || 0,
    dealValue:      c.deals?.reduce((s, d) => s + (d.value || 0), 0) || 0,
    primaryContact: c.contacts?.find(ct => ct.is_primary) || c.contacts?.[0] || null,
  }))
}

export const getClient = async (tenantId, clientId) => {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select(`
      *,
      contacts(*),
      deals(*),
      projects(id, name, status, progress, due_date),
      crm_activities(*)
    `)
    .eq('tenant_id', tenantId)
    .eq('id', clientId)
    .single()
  if (error) throw error
  return data
}

export const createClient = async (tenantId, creatorRole, payload) => {
  const {
    email, fullName, tempPassword,
    company_name, industry, website,
    address, city, country, gstin,
    source, notes, phone,
  } = payload

  // 1. Create Firebase + Profile via auth service
  const profile = await AuthService.createClientByAdmin({
    creatorTenantId: tenantId,
    creatorRole,
    email, fullName, phone,
    companyName: company_name,
    tempPassword,
  })

  // 2. Create clients record
  const { data, error } = await supabaseAdmin
    .from('clients')
    .insert({
      tenant_id:   tenantId,
      profile_uid: profile.firebase_uid,
      company_name, industry, website,
      address, city,
      country:     country || 'India',
      gstin, source, notes,
    })
    .select()
    .single()
  if (error) throw error
  return { ...data, profile }
}

export const updateClient = async (tenantId, clientId, payload) => {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .update({ ...payload, updated_at: new Date() })
    .eq('tenant_id', tenantId)
    .eq('id', clientId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteClient = async (tenantId, clientId) => {
  const { error } = await supabaseAdmin
    .from('clients')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', clientId)
  if (error) throw error
}

// ─── CONTACTS ─────────────────────────────────────────────────────────────────

export const addContact = async (tenantId, clientId, payload) => {
  // if marked primary, unset others
  if (payload.is_primary) {
    await supabaseAdmin
      .from('contacts')
      .update({ is_primary: false })
      .eq('client_id', clientId)
  }
  const { data, error } = await supabaseAdmin
    .from('contacts')
    .insert({ ...payload, tenant_id: tenantId, client_id: clientId })
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteContact = async (tenantId, contactId) => {
  const { error } = await supabaseAdmin
    .from('contacts')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', contactId)
  if (error) throw error
}

// ─── DEALS ────────────────────────────────────────────────────────────────────

export const listDeals = async (tenantId, filters = {}) => {
  let q = supabaseAdmin
    .from('deals')
    .select('*, clients(company_name, industry)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (filters.stage)     q = q.eq('stage',     filters.stage)
  if (filters.client_id) q = q.eq('client_id', filters.client_id)

  const { data, error } = await q
  if (error) throw error
  return data
}

export const createDeal = async (tenantId, payload) => {
  const { data, error } = await supabaseAdmin
    .from('deals')
    .insert({ ...payload, tenant_id: tenantId })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateDeal = async (tenantId, dealId, payload) => {
  const { data, error } = await supabaseAdmin
    .from('deals')
    .update({ ...payload, updated_at: new Date() })
    .eq('tenant_id', tenantId)
    .eq('id', dealId)
    .select()
    .single()
  if (error) throw error

  // Update client total_value if deal won
  if (payload.stage === 'won') {
    const { data: deal } = await supabaseAdmin
      .from('deals').select('client_id, value').eq('id', dealId).single()
    const { data: client } = await supabaseAdmin
      .from('clients').select('total_value').eq('id', deal.client_id).single()
    await supabaseAdmin
      .from('clients')
      .update({ total_value: (client?.total_value || 0) + (deal.value || 0) })
      .eq('id', deal.client_id)
  }
  return data
}

export const deleteDeal = async (tenantId, dealId) => {
  const { error } = await supabaseAdmin
    .from('deals').delete()
    .eq('tenant_id', tenantId).eq('id', dealId)
  if (error) throw error
}

// ─── ACTIVITIES ───────────────────────────────────────────────────────────────

export const listActivities = async (tenantId, clientId = null) => {
  let q = supabaseAdmin
    .from('crm_activities')
    .select('*, clients(company_name)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (clientId) q = q.eq('client_id', clientId)

  const { data, error } = await q
  if (error) throw error
  return data
}

export const addActivity = async (tenantId, actorUid, payload) => {
  const { data, error } = await supabaseAdmin
    .from('crm_activities')
    .insert({ ...payload, tenant_id: tenantId, actor_uid: actorUid })
    .select()
    .single()
  if (error) throw error
  return data
}

export const toggleActivity = async (tenantId, activityId) => {
  const { data: current } = await supabaseAdmin
    .from('crm_activities').select('is_done').eq('id', activityId).single()
  const { data, error } = await supabaseAdmin
    .from('crm_activities')
    .update({ is_done: !current.is_done })
    .eq('id', activityId)
    .eq('tenant_id', tenantId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── CRM Stats ────────────────────────────────────────────────────────────────

export const getCRMStats = async (tenantId) => {
  const [clients, deals, activities] = await Promise.all([
    supabaseAdmin.from('clients').select('id, status, total_value').eq('tenant_id', tenantId),
    supabaseAdmin.from('deals').select('id, stage, value').eq('tenant_id', tenantId),
    supabaseAdmin.from('crm_activities').select('id, is_done').eq('tenant_id', tenantId),
  ])

  const wonDeals  = deals.data?.filter(d => d.stage === 'won')  || []
  const openDeals = deals.data?.filter(d => !['won','lost'].includes(d.stage)) || []

  return {
    totalClients:  clients.data?.length || 0,
    activeClients: clients.data?.filter(c => c.status === 'active').length || 0,
    totalDeals:    deals.data?.length   || 0,
    openDeals:     openDeals.length,
    wonDeals:      wonDeals.length,
    pipeline:      openDeals.reduce((s, d) => s + (d.value || 0), 0),
    revenue:       wonDeals.reduce((s, d) => s + (d.value || 0), 0),
    pendingTasks:  activities.data?.filter(a => !a.is_done).length || 0,
  }
}