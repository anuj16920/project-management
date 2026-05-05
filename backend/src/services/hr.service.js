import supabaseAdmin from '../config/supabase.admin.js'

// ─── DEPARTMENTS ──────────────────────────────────────────────────────────────
export const listDepartments = async (tenantId) => {
  const { data, error } = await supabaseAdmin
    .from('departments')
    .select('*, employees(id)')
    .eq('tenant_id', tenantId)
    .order('name')
  if (error) throw error
  return data.map(d => ({ ...d, headcount: d.employees?.length || 0 }))
}

export const createDepartment = async (tenantId, payload) => {
  const { data, error } = await supabaseAdmin
    .from('departments')
    .insert({ ...payload, tenant_id: tenantId })
    .select().single()
  if (error) throw error
  return data
}

export const deleteDepartment = async (tenantId, id) => {
  const { error } = await supabaseAdmin
    .from('departments')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', id)
  if (error) throw error
}

// ─── EMPLOYEES ────────────────────────────────────────────────────────────────
export const listEmployees = async (tenantId, filters = {}) => {
  let q = supabaseAdmin
    .from('employees')
    .select(`*, departments(name)`)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (filters.status)        q = q.eq('status', filters.status)
  if (filters.department_id) q = q.eq('department_id', filters.department_id)
  if (filters.search)        q = q.or(`employee_code.ilike.%${filters.search}%,designation.ilike.%${filters.search}%`)

  const { data, error } = await q
  if (error) throw error

  // profiles uses firebase_uid (text) — fetch separately, never via FK join
  const uids = [...new Set((data || []).map(e => e.profile_uid).filter(Boolean))]
  if (uids.length) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('firebase_uid, full_name, email')
      .in('firebase_uid', uids)
    const profileMap = Object.fromEntries((profiles || []).map(p => [p.firebase_uid, p]))
    return (data || []).map(e => ({ ...e, profiles: profileMap[e.profile_uid] || null }))
  }
  return data || []
}

export const getEmployee = async (tenantId, id) => {
  const { data, error } = await supabaseAdmin
    .from('employees')
    .select(`*, departments(name), leave_requests(*, leave_types(name, color)), payroll(*)`)
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .single()
  if (error) throw error

  // fetch profile separately — firebase_uid (text) FK not recognized by Supabase
  if (data?.profile_uid) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('firebase_uid, full_name, email, phone')
      .eq('firebase_uid', data.profile_uid)
      .single()
    return { ...data, profiles: profile || null }
  }
  return data
}

export const getMyEmployee = async (tenantId, uid) => {
  const { data, error } = await supabaseAdmin
    .from('employees')
    .select(`*, departments(name), leave_requests(*, leave_types(name, color)), payroll(*)`)
    .eq('tenant_id', tenantId)
    .eq('profile_uid', uid)
    .single()
  if (error) throw error

  if (data?.profile_uid) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('firebase_uid, full_name, email, phone')
      .eq('firebase_uid', data.profile_uid)
      .single()
    return { ...data, profiles: profile || null }
  }
  return data
}

export const createEmployee = async (tenantId, payload) => {
  const {
    profile_uid,
    department_id, designation,
    employment_type, date_of_joining,
    salary, employee_code, phone,
    address, date_of_birth,
  } = payload

  const { data, error } = await supabaseAdmin
    .from('employees')
    .insert({
      tenant_id:      tenantId,
      profile_uid,
      department_id,
      designation,
      employment_type: employment_type || 'full_time',
      date_of_joining,
      salary:          salary || 0,
      phone,
      address,
      date_of_birth,
      employee_code:   employee_code || `EMP-${Date.now().toString().slice(-5)}`,
    })
    .select().single()
  if (error) throw error
  return data
}

export const updateEmployee = async (tenantId, id, payload) => {
  const { data, error } = await supabaseAdmin
    .from('employees')
    .update({ ...payload, updated_at: new Date() })
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .select().single()
  if (error) throw error
  return data
}

export const deleteEmployee = async (tenantId, id) => {
  const { error } = await supabaseAdmin
    .from('employees')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', id)
  if (error) throw error
}

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const clockIn = async (tenantId, uid) => {
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabaseAdmin
    .from('attendance')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('employee_uid', uid)
    .eq('date', today)
    .single()

  if (existing?.clock_in) throw { message: 'Already clocked in today', status: 400 }

  const { data, error } = await supabaseAdmin
    .from('attendance')
    .upsert({
      tenant_id:    tenantId,
      employee_uid: uid,
      date:         today,
      clock_in:     new Date(),
      status:       new Date().getHours() >= 10 ? 'late' : 'present',
    })
    .select().single()
  if (error) throw error
  return data
}

export const clockOut = async (tenantId, uid) => {
  const today = new Date().toISOString().split('T')[0]
  const { data: record } = await supabaseAdmin
    .from('attendance')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('employee_uid', uid)
    .eq('date', today)
    .single()

  if (!record?.clock_in) throw { message: 'Not clocked in today', status: 400 }
  if (record?.clock_out)  throw { message: 'Already clocked out', status: 400 }

  const clockOut   = new Date()
  const clockIn    = new Date(record.clock_in)
  const work_hours = parseFloat(((clockOut - clockIn) / 3600000).toFixed(2))

  const { data, error } = await supabaseAdmin
    .from('attendance')
    .update({ clock_out: clockOut, work_hours })
    .eq('id', record.id)
    .select().single()
  if (error) throw error
  return data
}

export const getAttendance = async (tenantId, filters = {}) => {
  let q = supabaseAdmin
    .from('attendance')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('date', { ascending: false })

  if (filters.employee_uid) q = q.eq('employee_uid', filters.employee_uid)
  if (filters.date)         q = q.eq('date', filters.date)
  if (filters.month && filters.year) {
    const from = `${filters.year}-${String(filters.month).padStart(2,'0')}-01`
    const to   = new Date(filters.year, filters.month, 0).toISOString().split('T')[0]
    q = q.gte('date', from).lte('date', to)
  }

  const { data, error } = await q
  if (error) throw error

  // fetch profiles separately
  const uids = [...new Set((data || []).map(r => r.employee_uid).filter(Boolean))]
  if (uids.length) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles').select('firebase_uid, full_name').in('firebase_uid', uids)
    const pm = Object.fromEntries((profiles || []).map(p => [p.firebase_uid, p]))
    return (data || []).map(r => ({ ...r, profiles: pm[r.employee_uid] || null }))
  }
  return data || []
}

export const markAttendance = async (tenantId, payload) => {
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .upsert({ ...payload, tenant_id: tenantId })
    .select().single()
  if (error) throw error
  return data
}

// ─── LEAVE TYPES ──────────────────────────────────────────────────────────────
export const listLeaveTypes = async (tenantId) => {
  const { data, error } = await supabaseAdmin
    .from('leave_types')
    .select('*')
    .eq('tenant_id', tenantId)
  if (error) throw error
  return data
}

export const createLeaveType = async (tenantId, payload) => {
  const { data, error } = await supabaseAdmin
    .from('leave_types')
    .insert({ ...payload, tenant_id: tenantId })
    .select().single()
  if (error) throw error
  return data
}

// ─── LEAVE REQUESTS ───────────────────────────────────────────────────────────
export const listLeaveRequests = async (tenantId, filters = {}) => {
  let q = supabaseAdmin
    .from('leave_requests')
    .select(`*, leave_types(name, color)`)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (filters.status)       q = q.eq('status',       filters.status)
  if (filters.employee_uid) q = q.eq('employee_uid', filters.employee_uid)

  const { data, error } = await q
  if (error) throw error

  // fetch profiles separately
  const uids = [...new Set((data || []).map(r => r.employee_uid).filter(Boolean))]
  if (uids.length) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles').select('firebase_uid, full_name, email').in('firebase_uid', uids)
    const pm = Object.fromEntries((profiles || []).map(p => [p.firebase_uid, p]))
    return (data || []).map(r => ({ ...r, profiles: pm[r.employee_uid] || null }))
  }
  return data || []
}

export const applyLeave = async (tenantId, uid, payload) => {
  const { from_date, to_date, leave_type_id, reason } = payload
  const days = Math.ceil((new Date(to_date) - new Date(from_date)) / 86400000) + 1

  const { data, error } = await supabaseAdmin
    .from('leave_requests')
    .insert({
      tenant_id: tenantId, employee_uid: uid,
      leave_type_id, from_date, to_date, days, reason,
    })
    .select().single()
  if (error) throw error
  return data
}

export const reviewLeave = async (tenantId, id, reviewerUid, { status, review_note }) => {
  if (!['approved','rejected'].includes(status))
    throw { message: 'Status must be approved or rejected', status: 400 }

  const { data, error } = await supabaseAdmin
    .from('leave_requests')
    .update({ status, review_note, reviewed_by: reviewerUid, reviewed_at: new Date() })
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .select().single()
  if (error) throw error

  // Auto-mark attendance as on_leave for approved requests
  if (status === 'approved') {
    const { data: lr } = await supabaseAdmin
      .from('leave_requests')
      .select('from_date, to_date, employee_uid')
      .eq('id', id).single()
    for (let d = new Date(lr.from_date); d <= new Date(lr.to_date); d.setDate(d.getDate()+1)) {
      await supabaseAdmin.from('attendance').upsert({
        tenant_id:    tenantId,
        employee_uid: lr.employee_uid,
        date:         d.toISOString().split('T')[0],
        status:       'on_leave',
      })
    }
  }
  return data
}

export const cancelLeave = async (tenantId, id, uid) => {
  const { data: lr } = await supabaseAdmin
    .from('leave_requests').select('employee_uid, status').eq('id', id).single()
  if (lr?.employee_uid !== uid) throw { message: 'Not authorized', status: 403 }
  if (lr?.status !== 'pending') throw { message: 'Can only cancel pending requests', status: 400 }
  const { error } = await supabaseAdmin
    .from('leave_requests').update({ status: 'cancelled' })
    .eq('id', id).eq('tenant_id', tenantId)
  if (error) throw error
}

// ─── PAYROLL ──────────────────────────────────────────────────────────────────
export const listPayroll = async (tenantId, filters = {}) => {
  let q = supabaseAdmin
    .from('payroll')
    .select(`*, employees(designation, departments(name))`)
    .eq('tenant_id', tenantId)
    .order('year',  { ascending: false })
    .order('month', { ascending: false })

  if (filters.month)        q = q.eq('month',        filters.month)
  if (filters.year)         q = q.eq('year',         filters.year)
  if (filters.status)       q = q.eq('status',       filters.status)
  if (filters.employee_uid) q = q.eq('employee_uid', filters.employee_uid)

  const { data, error } = await q
  if (error) throw error

  // fetch profiles separately
  const uids = [...new Set((data || []).map(r => r.employee_uid).filter(Boolean))]
  if (uids.length) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles').select('firebase_uid, full_name, email').in('firebase_uid', uids)
    const pm = Object.fromEntries((profiles || []).map(p => [p.firebase_uid, p]))
    return (data || []).map(r => ({ ...r, profiles: pm[r.employee_uid] || null }))
  }
  return data || []
}

export const generatePayroll = async (tenantId, month, year) => {
  const { data: emps } = await supabaseAdmin
    .from('employees')
    .select('profile_uid, salary')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')

  const records = emps.map(e => {
    const basic      = parseFloat(e.salary) || 0
    const hra        = basic * 0.4
    const allowances = basic * 0.1
    const tax        = basic * 0.1
    const net_salary = basic + hra + allowances - tax
    return {
      tenant_id: tenantId, employee_uid: e.profile_uid,
      month, year, basic_salary: basic,
      hra, allowances, deductions: 0, tax, net_salary, status: 'draft',
    }
  })

  const { data, error } = await supabaseAdmin
    .from('payroll')
    .upsert(records, { onConflict: 'tenant_id,employee_uid,month,year' })
    .select()
  if (error) throw error
  return data
}

export const processPayroll = async (tenantId, id) => {
  const { data, error } = await supabaseAdmin
    .from('payroll').update({ status: 'processed' })
    .eq('tenant_id', tenantId).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const markPayrollPaid = async (tenantId, id) => {
  const { data, error } = await supabaseAdmin
    .from('payroll').update({ status: 'paid', paid_at: new Date() })
    .eq('tenant_id', tenantId).eq('id', id).select().single()
  if (error) throw error
  return data
}

// ─── HR STATS ─────────────────────────────────────────────────────────────────
export const getHRStats = async (tenantId) => {
  const today = new Date().toISOString().split('T')[0]
  const [emps, att, leaves, payroll] = await Promise.all([
    supabaseAdmin.from('employees').select('id,status').eq('tenant_id', tenantId),
    supabaseAdmin.from('attendance').select('id,status').eq('tenant_id', tenantId).eq('date', today),
    supabaseAdmin.from('leave_requests').select('id').eq('tenant_id', tenantId).eq('status', 'pending'),
    supabaseAdmin.from('payroll').select('net_salary').eq('tenant_id', tenantId).eq('status', 'paid')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ])
  return {
    totalEmployees:  emps.data?.length || 0,
    activeEmployees: emps.data?.filter(e => e.status === 'active').length || 0,
    presentToday:    att.data?.filter(a => ['present','late'].includes(a.status)).length || 0,
    onLeaveToday:    att.data?.filter(a => a.status === 'on_leave').length || 0,
    pendingLeaves:   leaves.data?.length || 0,
    monthlyPayroll:  payroll.data?.reduce((s,p) => s + (p.net_salary||0), 0) || 0,
  }
}