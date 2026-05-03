import supabaseAdmin from '../config/supabase.admin.js'

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const calcInvoiceTotals = (items = [], taxPercent = 18, discount = 0) => {
  const subtotal   = items.reduce((s, i) => s + (i.quantity * i.unit_price), 0)
  const tax_amount = parseFloat(((subtotal * taxPercent) / 100).toFixed(2))
  const total      = parseFloat((subtotal + tax_amount - discount).toFixed(2))
  return { subtotal: parseFloat(subtotal.toFixed(2)), tax_amount, total }
}

const nextInvoiceNumber = async (tenantId) => {
  const { count } = await supabaseAdmin
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
  const pad = String((count || 0) + 1).padStart(4, '0')
  return `INV-${new Date().getFullYear()}-${pad}`
}

// ─── FINANCE STATS ────────────────────────────────────────────────────────────
export const getFinanceStats = async (tenantId) => {
  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [inv, exp, pay, overdue] = await Promise.all([
    supabaseAdmin
      .from('invoices')
      .select('total,status')
      .eq('tenant_id', tenantId),
    supabaseAdmin
      .from('expenses')
      .select('amount,status')
      .eq('tenant_id', tenantId)
      .gte('created_at', monthStart),
    supabaseAdmin
      .from('payments')
      .select('amount')
      .eq('tenant_id', tenantId)
      .gte('paid_at', monthStart),
    supabaseAdmin
      .from('invoices')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('status', 'overdue'),
  ])

  const totalRevenue    = inv.data?.filter(i => i.status === 'paid').reduce((s,i) => s+(i.total||0), 0) || 0
  const pendingInvoices = inv.data?.filter(i => ['sent','viewed'].includes(i.status)).reduce((s,i) => s+(i.total||0), 0) || 0
  const monthlyExpenses = exp.data?.reduce((s,e) => s+(e.amount||0), 0) || 0
  const monthlyPayments = pay.data?.reduce((s,p) => s+(p.amount||0), 0) || 0

  return {
    totalRevenue,
    pendingInvoices,
    monthlyExpenses,
    monthlyPayments,
    overdueCount:  overdue.data?.length || 0,
    totalInvoices: inv.data?.length     || 0,
  }
}

// ─── INVOICES ─────────────────────────────────────────────────────────────────
export const listInvoices = async (tenantId, filters = {}) => {
  try {
    let q = supabaseAdmin
      .from('invoices')
      .select(`
        *,
        invoice_items(*)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (filters.status)     q = q.eq('status',     filters.status)
    if (filters.client_uid) q = q.eq('client_uid', filters.client_uid)
    if (filters.project_id) q = q.eq('project_id', filters.project_id)

    const { data, error } = await q
    if (error) {
      console.error('❌ Invoice query error:', error)
      throw error
    }
    if (!data || data.length === 0) return []

    // Fetch profiles separately using firebase_uid
    const clientUids = [...new Set(data.map(inv => inv.client_uid).filter(Boolean))]
    const projectIds = [...new Set(data.map(inv => inv.project_id).filter(Boolean))]

    const [profilesResult, projectsResult] = await Promise.all([
      clientUids.length > 0 
        ? supabaseAdmin.from('profiles').select('firebase_uid, full_name, email').in('firebase_uid', clientUids)
        : { data: [] },
      projectIds.length > 0
        ? supabaseAdmin.from('projects').select('id, name').in('id', projectIds)
        : { data: [] }
    ])

    const clientMap = {}
    profilesResult.data?.forEach(p => { clientMap[p.firebase_uid] = p })

    const projectMap = {}
    projectsResult.data?.forEach(p => { projectMap[p.id] = p })

    return data.map(inv => ({
      ...inv,
      profiles: clientMap[inv.client_uid] || null,
      projects: inv.project_id ? projectMap[inv.project_id] || null : null
    }))
  } catch (err) {
    console.error('❌ listInvoices service error:', err)
    throw err
  }
}

export const getInvoice = async (tenantId, id) => {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select(`
      *,
      invoice_items(*)
    `)
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .single()
  if (error) throw error

  // Fetch profile and project separately
  const [profileResult, projectResult] = await Promise.all([
    data.client_uid
      ? supabaseAdmin.from('profiles').select('firebase_uid, full_name, email, phone').eq('firebase_uid', data.client_uid).maybeSingle()
      : { data: null },
    data.project_id
      ? supabaseAdmin.from('projects').select('id, name').eq('id', data.project_id).maybeSingle()
      : { data: null }
  ])

  return {
    ...data,
    profiles: profileResult.data || null,
    projects: projectResult.data || null
  }
}

export const createInvoice = async (tenantId, payload) => {
  const {
    client_uid, project_id, title, description,
    items = [], tax_percent = 18, discount = 0,
    due_date, notes, currency = 'INR',
  } = payload

  const invoice_number               = await nextInvoiceNumber(tenantId)
  const { subtotal, tax_amount, total } = calcInvoiceTotals(items, tax_percent, discount)

  const { data: invoice, error } = await supabaseAdmin
    .from('invoices')
    .insert({
      tenant_id: tenantId, invoice_number, client_uid, project_id,
      title, description, currency,
      subtotal, tax_percent, tax_amount, discount, total,
      due_date, notes, status: 'draft',
    })
    .select()
    .single()
  if (error) throw error

  if (items.length > 0) {
    const lineItems = items.map(i => ({
      invoice_id:  invoice.id,
      description: i.description,
      quantity:    i.quantity   || 1,
      unit_price:  i.unit_price || 0,
      amount:      (i.quantity  || 1) * (i.unit_price || 0),
    }))
    const { error: itemsError } = await supabaseAdmin
      .from('invoice_items')
      .insert(lineItems)
    if (itemsError) throw itemsError
  }

  return getInvoice(tenantId, invoice.id)
}

export const updateInvoice = async (tenantId, id, payload) => {
  const { items, ...rest } = payload

  if (items) {
    const { subtotal, tax_amount, total } = calcInvoiceTotals(
      items, rest.tax_percent ?? 18, rest.discount ?? 0
    )
    Object.assign(rest, { subtotal, tax_amount, total })

    await supabaseAdmin.from('invoice_items').delete().eq('invoice_id', id)
    await supabaseAdmin.from('invoice_items').insert(
      items.map(i => ({
        invoice_id:  id,
        description: i.description,
        quantity:    i.quantity   || 1,
        unit_price:  i.unit_price || 0,
        amount:      (i.quantity  || 1) * (i.unit_price || 0),
      }))
    )
  }

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .update({ ...rest, updated_at: new Date() })
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateInvoiceStatus = async (tenantId, id, status) => {
  const validStatuses = ['draft','sent','viewed','paid','overdue','cancelled']
  if (!validStatuses.includes(status))
    throw { message: 'Invalid status', status: 400 }

  const updates = { status, updated_at: new Date() }
  if (status === 'paid') updates.paid_at = new Date()

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .update(updates)
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteInvoice = async (tenantId, id) => {
  const { error } = await supabaseAdmin
    .from('invoices')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', id)
  if (error) throw error
}

// ─── EXPENSES ─────────────────────────────────────────────────────────────────
export const listExpenses = async (tenantId, filters = {}) => {
  let q = supabaseAdmin
    .from('expenses')
    .select(`
      *,
      expense_categories(name, color, icon)
    `)
    .eq('tenant_id', tenantId)
    .order('date', { ascending: false })

  if (filters.status)      q = q.eq('status',      filters.status)
  if (filters.category_id) q = q.eq('category_id', filters.category_id)
  if (filters.from)        q = q.gte('date',        filters.from)
  if (filters.to)          q = q.lte('date',        filters.to)

  const { data, error } = await q
  if (error) throw error
  return data
}

export const createExpense = async (tenantId, uid, payload) => {
  const { data, error } = await supabaseAdmin
    .from('expenses')
    .insert({
      ...payload,
      tenant_id: tenantId,
      paid_by:   uid,
      status:    'pending',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateExpense = async (tenantId, id, payload) => {
  const { data, error } = await supabaseAdmin
    .from('expenses')
    .update(payload)
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const reviewExpense = async (tenantId, id, uid, status) => {
  if (!['approved','rejected'].includes(status))
    throw { message: 'Status must be approved or rejected', status: 400 }

  const { data, error } = await supabaseAdmin
    .from('expenses')
    .update({
      status,
      approved_by: uid,
      approved_at: new Date(),
    })
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteExpense = async (tenantId, id) => {
  const { error } = await supabaseAdmin
    .from('expenses')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', id)
  if (error) throw error
}

// ─── EXPENSE CATEGORIES ───────────────────────────────────────────────────────
export const listExpenseCategories = async (tenantId) => {
  const { data, error } = await supabaseAdmin
    .from('expense_categories')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name')
  if (error) throw error
  return data
}

export const createExpenseCategory = async (tenantId, payload) => {
  const { data, error } = await supabaseAdmin
    .from('expense_categories')
    .insert({ ...payload, tenant_id: tenantId })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const listPayments = async (tenantId, filters = {}) => {
  let q = supabaseAdmin
    .from('payments')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('paid_at', { ascending: false })

  if (filters.invoice_id) q = q.eq('invoice_id', filters.invoice_id)

  const { data, error } = await q
  if (error) throw error
  if (!data || data.length === 0) return []

  // Fetch related invoices separately
  const invoiceIds = [...new Set(data.map(p => p.invoice_id).filter(Boolean))]
  
  if (invoiceIds.length === 0) return data

  const { data: invoices } = await supabaseAdmin
    .from('invoices')
    .select('id, invoice_number, title, client_uid')
    .in('id', invoiceIds)

  const invoiceMap = {}
  invoices?.forEach(inv => { invoiceMap[inv.id] = inv })

  // Fetch client profiles
  const clientUids = [...new Set(invoices?.map(inv => inv.client_uid).filter(Boolean) || [])]
  const profileMap = {}
  
  if (clientUids.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('firebase_uid, full_name, email')
      .in('firebase_uid', clientUids)
    
    profiles?.forEach(p => { profileMap[p.firebase_uid] = p })
  }

  return data.map(payment => {
    const invoice = invoiceMap[payment.invoice_id]
    return {
      ...payment,
      invoices: invoice ? {
        ...invoice,
        profiles: invoice.client_uid ? profileMap[invoice.client_uid] || null : null
      } : null
    }
  })
}

export const recordPayment = async (tenantId, payload) => {
  const { invoice_id, amount, payment_method, transaction_id, notes } = payload

  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert({
      tenant_id:      tenantId,
      invoice_id,
      amount,
      payment_method,
      transaction_id,
      notes,
      paid_at:        new Date(),
    })
    .select()
    .single()
  if (error) throw error

  // Auto-mark invoice as paid
  if (invoice_id) {
    await supabaseAdmin
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date() })
      .eq('id', invoice_id)
      .eq('tenant_id', tenantId)
  }

  return data
}