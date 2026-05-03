import supabaseAdmin from '../config/supabase.admin.js'

// ─── List all projects for tenant ─────────────────────────────────────────────
export const listProjects = async (tenantId, filters = {}) => {
  let q = supabaseAdmin
    .from('projects')
    .select(`
      *,
      milestones(id, is_done),
      project_members(user_uid, role),
      tasks(id, status)
    `)
    .eq('tenant_id', tenantId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  if (filters.status)   q = q.eq('status', filters.status)
  if (filters.priority) q = q.eq('priority', filters.priority)
  if (filters.search)   q = q.ilike('name', `%${filters.search}%`)

  const { data, error } = await q
  if (error) throw error

  // compute live progress from tasks
  return data.map(p => ({
    ...p,
    progress: p.tasks?.length
      ? Math.round((p.tasks.filter(t => t.status === 'done').length / p.tasks.length) * 100)
      : 0,
    milestonesTotal: p.milestones?.length || 0,
    milestonesDone:  p.milestones?.filter(m => m.is_done).length || 0,
    memberCount:     p.project_members?.length || 0,
    taskCount:       p.tasks?.length || 0,
  }))
}

// ─── Get single project ───────────────────────────────────────────────────────
export const getProject = async (tenantId, projectId) => {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select(`
      *,
      milestones(*),
      project_members(*, profiles(full_name, email, role)),
      tasks(id, title, status, priority, assignee_uid, due_date),
      project_activity(*, profiles(full_name))
    `)
    .eq('tenant_id', tenantId)
    .eq('id', projectId)
    .single()
  if (error) throw error
  return data
}

// ─── Create project ───────────────────────────────────────────────────────────
export const createProject = async (tenantId, creatorUid, payload) => {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({ ...payload, tenant_id: tenantId })
    .select()
    .single()
  if (error) throw error

  // Add creator as owner in project_members
  await supabaseAdmin.from('project_members').insert({
    tenant_id:  tenantId,
    project_id: data.id,
    user_uid:   creatorUid,
    role:       'owner',
  })

  // Log activity
  await logActivity(tenantId, data.id, creatorUid, 'created_project', { name: data.name })
  return data
}

// ─── Update project ───────────────────────────────────────────────────────────
export const updateProject = async (tenantId, projectId, actorUid, payload) => {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .update({ ...payload, updated_at: new Date() })
    .eq('tenant_id', tenantId)
    .eq('id', projectId)
    .select()
    .single()
  if (error) throw error
  await logActivity(tenantId, projectId, actorUid, 'updated_project', payload)
  return data
}

// ─── Delete (archive) project ─────────────────────────────────────────────────
export const archiveProject = async (tenantId, projectId, actorUid) => {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .update({ is_archived: true })
    .eq('tenant_id', tenantId)
    .eq('id', projectId)
    .select()
    .single()
  if (error) throw error
  await logActivity(tenantId, projectId, actorUid, 'archived_project', {})
  return data
}

// ─── Milestones ───────────────────────────────────────────────────────────────
export const addMilestone = async (tenantId, projectId, actorUid, payload) => {
  const { data, error } = await supabaseAdmin
    .from('milestones')
    .insert({ ...payload, tenant_id: tenantId, project_id: projectId })
    .select()
    .single()
  if (error) throw error
  await logActivity(tenantId, projectId, actorUid, 'added_milestone', { title: data.title })
  return data
}

export const toggleMilestone = async (tenantId, milestoneId, actorUid) => {
  const { data: current } = await supabaseAdmin
    .from('milestones').select('*').eq('id', milestoneId).single()
  const { data, error } = await supabaseAdmin
    .from('milestones')
    .update({ is_done: !current.is_done })
    .eq('id', milestoneId)
    .select()
    .single()
  if (error) throw error
  await logActivity(tenantId, current.project_id, actorUid,
    data.is_done ? 'completed_milestone' : 'reopened_milestone', { title: data.title })
  return data
}

// ─── Members ──────────────────────────────────────────────────────────────────
export const addMember = async (tenantId, projectId, actorUid, userUid, role = 'member') => {
  const { data, error } = await supabaseAdmin
    .from('project_members')
    .insert({ tenant_id: tenantId, project_id: projectId, user_uid: userUid, role })
    .select()
    .single()
  if (error) throw error
  await logActivity(tenantId, projectId, actorUid, 'added_member', { userUid, role })
  return data
}

export const removeMember = async (tenantId, projectId, actorUid, userUid) => {
  const { error } = await supabaseAdmin
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_uid', userUid)
  if (error) throw error
  await logActivity(tenantId, projectId, actorUid, 'removed_member', { userUid })
}

// ─── Activity log helper ──────────────────────────────────────────────────────
export const logActivity = async (tenantId, projectId, actorUid, action, meta = {}) => {
  await supabaseAdmin.from('project_activity').insert({
    tenant_id: tenantId, project_id: projectId,
    actor_uid: actorUid, action, meta,
  })
}