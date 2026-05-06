import supabaseAdmin from '../config/supabase.admin.js'

// ─── List tasks (with filters) ────────────────────────────────────────────────
export const listTasks = async (tenantId, filters = {}) => {
  let q = supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (filters.project_id)   q = q.eq('project_id',   filters.project_id)
  if (filters.status)       q = q.eq('status',        filters.status)
  if (filters.priority)     q = q.eq('priority',      filters.priority)
  if (filters.assignee_uid) q = q.eq('assignee_uid',  filters.assignee_uid)
  if (filters.search)       q = q.ilike('title',      `%${filters.search}%`)

  const { data, error } = await q
  if (error) throw error
  return data || []
}

// ─── Get single task ──────────────────────────────────────────────────────────
export const getTask = async (tenantId, taskId) => {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select(`
      *,
      projects(name, cover_color),
      task_comments(*),
      task_attachments(*),
      task_time_logs(*),
      subtasks:tasks!parent_id(*)
    `)
    .eq('tenant_id', tenantId)
    .eq('id', taskId)
    .single()
  if (error) throw error

  // Fetch assignee profile separately (TEXT uid, no FK)
  let assigneeProfile = null
  if (data?.assignee_uid) {
    const { data: p } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email, avatar_url')
      .eq('firebase_uid', data.assignee_uid)
      .single()
    assigneeProfile = p
  }

  // Fetch comment author profiles
  const comments = data?.task_comments || []
  if (comments.length > 0) {
    const authorUids = [...new Set(comments.map(c => c.author_uid).filter(Boolean))]
    const { data: authorProfiles } = await supabaseAdmin
      .from('profiles').select('firebase_uid, full_name, avatar_url').in('firebase_uid', authorUids)
    const profileMap = Object.fromEntries((authorProfiles || []).map(p => [p.firebase_uid, p]))
    data.task_comments = comments.map(c => ({ ...c, profile: profileMap[c.author_uid] || null }))
  }

  return { ...data, assigneeProfile }
}

// ─── Create task ──────────────────────────────────────────────────────────────
export const createTask = async (tenantId, creatorUid, payload) => {
  // Get max position in same status column
  const { data: maxPos } = await supabaseAdmin
    .from('tasks')
    .select('position')
    .eq('tenant_id', tenantId)
    .eq('status', payload.status || 'todo')
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = (maxPos?.position ?? -1) + 1

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .insert({ ...payload, tenant_id: tenantId, position, status: payload.status || 'todo' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Update task ──────────────────────────────────────────────────────────────
export const updateTask = async (tenantId, taskId, payload) => {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .update({ ...payload, updated_at: new Date() })
    .eq('tenant_id', tenantId)
    .eq('id', taskId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Delete task ──────────────────────────────────────────────────────────────
export const deleteTask = async (tenantId, taskId) => {
  const { error } = await supabaseAdmin
    .from('tasks')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', taskId)
  if (error) throw error
}

// ─── Move task (Kanban drag) ──────────────────────────────────────────────────
export const moveTask = async (tenantId, taskId, newStatus, newPosition) => {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .update({ status: newStatus, position: newPosition, updated_at: new Date() })
    .eq('tenant_id', tenantId)
    .eq('id', taskId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Reorder tasks in a column ────────────────────────────────────────────────
export const reorderTasks = async (tenantId, updates) => {
  // updates = [{ id, position, status }]
  const promises = updates.map(u =>
    supabaseAdmin.from('tasks')
      .update({ position: u.position, status: u.status })
      .eq('tenant_id', tenantId)
      .eq('id', u.id)
  )
  await Promise.all(promises)
}

// ─── Comments ─────────────────────────────────────────────────────────────────
export const addComment = async (tenantId, taskId, authorUid, content) => {
  const { data, error } = await supabaseAdmin
    .from('task_comments')
    .insert({ tenant_id: tenantId, task_id: taskId, author_uid: authorUid, content })
    .select('*, profiles!task_comments_author_uid_fkey(full_name)')
    .single()
  if (error) throw error
  return data
}

export const deleteComment = async (tenantId, commentId, requesterUid) => {
  const { data: comment } = await supabaseAdmin
    .from('task_comments').select('author_uid').eq('id', commentId).single()
  if (comment?.author_uid !== requesterUid)
    throw { message: 'Cannot delete another user\'s comment', status: 403 }
  const { error } = await supabaseAdmin
    .from('task_comments').delete().eq('id', commentId).eq('tenant_id', tenantId)
  if (error) throw error
}

// ─── Time Logs ────────────────────────────────────────────────────────────────
export const logTime = async (tenantId, taskId, userUid, { hours, description, logged_date }) => {
  const { data, error } = await supabaseAdmin
    .from('task_time_logs')
    .insert({ tenant_id: tenantId, task_id: taskId, user_uid: userUid, hours, description, logged_date })
    .select()
    .single()
  if (error) throw error

  // Update logged_hrs on task
  const { data: task } = await supabaseAdmin
    .from('tasks').select('logged_hrs').eq('id', taskId).single()
  await supabaseAdmin.from('tasks')
    .update({ logged_hrs: (task?.logged_hrs || 0) + hours })
    .eq('id', taskId)

  return data
}

// ─── Subtasks ─────────────────────────────────────────────────────────────────
export const createSubtask = async (tenantId, parentId, payload) => {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .insert({ ...payload, tenant_id: tenantId, parent_id: parentId, status: 'todo' })
    .select()
    .single()
  if (error) throw error
  return data
}