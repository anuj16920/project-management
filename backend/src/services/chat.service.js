import supabaseAdmin from '../config/supabase.admin.js'

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getProfiles = async (uids) => {
  if (!uids?.length) return {}
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('firebase_uid, full_name, avatar_url, role')
    .in('firebase_uid', uids)
  return Object.fromEntries((data||[]).map(p => [p.firebase_uid, p]))
}

// ─── ROOMS ────────────────────────────────────────────────────────────────────
export const listRooms = async (tenantId, uid) => {
  // Get rooms where user is a member
  const { data: memberRows, error: mErr } = await supabaseAdmin
    .from('chat_room_members')
    .select('room_id, last_read')
    .eq('user_uid', uid)
  if (mErr) throw mErr
  if (!memberRows?.length) return []

  const roomIds = memberRows.map(m => m.room_id)
  const lastReadMap = Object.fromEntries(memberRows.map(m => [m.room_id, m.last_read]))

  const { data: rooms, error } = await supabaseAdmin
    .from('chat_rooms')
    .select(`*, chat_room_members(user_uid)`)
    .eq('tenant_id', tenantId)
    .in('id', roomIds)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
  if (error) throw error

  // Get last message for each room
  const lastMsgs = await Promise.all(
    rooms.map(r =>
      supabaseAdmin
        .from('chat_messages')
        .select('content, created_at, sender_uid, type')
        .eq('room_id', r.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        .then(res => ({ roomId: r.id, msg: res.data }))
        .catch(() => ({ roomId: r.id, msg: null }))
    )
  )
  const lastMsgMap = Object.fromEntries(lastMsgs.map(l => [l.roomId, l.msg]))

  // Get unread counts
  const unreadCounts = await Promise.all(
    rooms.map(r => {
      const lastRead = lastReadMap[r.id]
      if (!lastRead) return Promise.resolve({ roomId: r.id, count: 0 })
      return supabaseAdmin
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', r.id)
        .eq('is_deleted', false)
        .neq('sender_uid', uid)
        .gt('created_at', lastRead)
        .then(res => ({ roomId: r.id, count: res.count || 0 }))
        .catch(() => ({ roomId: r.id, count: 0 }))
    })
  )
  const unreadMap = Object.fromEntries(unreadCounts.map(u => [u.roomId, u.count]))

  // Fetch member profiles
  const allUids = [...new Set(rooms.flatMap(r => r.chat_room_members.map(m => m.user_uid)))]
  const profileMap = await getProfiles(allUids)

  return rooms.map(r => ({
    ...r,
    members:       r.chat_room_members.map(m => ({ ...m, profile: profileMap[m.user_uid] || null })),
    last_message:  lastMsgMap[r.id] || null,
    unread_count:  unreadMap[r.id]  || 0,
  }))
}

export const createRoom = async (tenantId, uid, payload) => {
  const { name, type = 'direct', member_uids = [], project_id } = payload

  // For direct chats — check if room already exists
  if (type === 'direct' && member_uids.length === 1) {
    const otherUid = member_uids[0]
    const { data: existing } = await supabaseAdmin
      .from('chat_room_members')
      .select('room_id')
      .eq('user_uid', uid)
    const myRoomIds = (existing||[]).map(r => r.room_id)

    if (myRoomIds.length > 0) {
      const { data: shared } = await supabaseAdmin
        .from('chat_room_members')
        .select('room_id')
        .eq('user_uid', otherUid)
        .in('room_id', myRoomIds)
      if (shared?.length > 0) {
        // Check it's actually a direct room
        const { data: existingRoom } = await supabaseAdmin
          .from('chat_rooms')
          .select('*')
          .eq('id', shared[0].room_id)
          .eq('type', 'direct')
          .single()
        if (existingRoom) return existingRoom
      }
    }
  }

  const { data: room, error } = await supabaseAdmin
    .from('chat_rooms')
    .insert({ tenant_id: tenantId, name, type, project_id, created_by: uid })
    .select()
    .single()
  if (error) throw error

  // Add creator + members
  const allMembers = [...new Set([uid, ...member_uids])]
  await supabaseAdmin.from('chat_room_members').insert(
    allMembers.map(u => ({
      room_id:  room.id,
      user_uid: u,
      role:     u === uid ? 'admin' : 'member',
    }))
  )
  return room
}

export const getRoom = async (tenantId, roomId, uid) => {
  const { data: room, error } = await supabaseAdmin
    .from('chat_rooms')
    .select(`*, chat_room_members(user_uid, role, last_read)`)
    .eq('tenant_id', tenantId)
    .eq('id', roomId)
    .single()
  if (error) throw error

  const allUids    = room.chat_room_members.map(m => m.user_uid)
  const profileMap = await getProfiles(allUids)

  return {
    ...room,
    members: room.chat_room_members.map(m => ({
      ...m,
      profile: profileMap[m.user_uid] || null,
    })),
  }
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
export const listMessages = async (tenantId, roomId, { limit = 50, before } = {}) => {
  let q = supabaseAdmin
    .from('chat_messages')
    .select('*')
    .eq('room_id', roomId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (before) q = q.lt('created_at', before)

  const { data, error } = await q
  if (error) throw error

  const msgs = (data || []).reverse()
  if (!msgs.length) return []

  // Fetch sender profiles
  const senderUids = [...new Set(msgs.map(m => m.sender_uid))]
  const profileMap = await getProfiles(senderUids)

  return msgs.map(m => ({
    ...m,
    sender: profileMap[m.sender_uid] || null,
  }))
}

export const sendMessage = async (tenantId, roomId, uid, payload) => {
  const { content, type = 'text', file_url, file_name, file_size, reply_to } = payload

  // Verify sender is a member
  const { data: member } = await supabaseAdmin
    .from('chat_room_members')
    .select('id')
    .eq('room_id', roomId)
    .eq('user_uid', uid)
    .single()
  if (!member) throw { message: 'Not a member of this room', status: 403 }

  const { data: msg, error } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      room_id:    roomId,
      sender_uid: uid,
      content,
      type,
      file_url,
      file_name,
      file_size,
      reply_to,
    })
    .select()
    .single()
  if (error) throw error

  // Fetch sender profile
  const profileMap = await getProfiles([uid])
  return { ...msg, sender: profileMap[uid] || null }
}

export const editMessage = async (tenantId, msgId, uid, content) => {
  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .update({ content, is_edited: true, updated_at: new Date() })
    .eq('id', msgId)
    .eq('sender_uid', uid)        // only sender can edit
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteMessage = async (tenantId, msgId, uid) => {
  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .update({ is_deleted: true, content: 'This message was deleted', updated_at: new Date() })
    .eq('id', msgId)
    .eq('sender_uid', uid)
    .select()
    .single()
  if (error) throw error
  return data
}

export const markRoomRead = async (roomId, uid) => {
  const { error } = await supabaseAdmin
    .from('chat_room_members')
    .update({ last_read: new Date() })
    .eq('room_id', roomId)
    .eq('user_uid', uid)
  if (error) throw error
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const listNotifications = async (tenantId, uid, { limit = 30, unread_only } = {}) => {
  let q = supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('user_uid', uid)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (unread_only) q = q.eq('is_read', false)

  const { data, error } = await q
  if (error) throw error
  return data || []
}

export const markNotifRead = async (tenantId, uid, id) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('tenant_id', tenantId)
    .eq('user_uid', uid)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const markAllNotifsRead = async (tenantId, uid) => {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('tenant_id', tenantId)
    .eq('user_uid', uid)
    .eq('is_read', false)
  if (error) throw error
}

export const createNotification = async (tenantId, payload) => {
  const { user_uid, type, title, body, link, meta } = payload
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .insert({ tenant_id: tenantId, user_uid, type, title, body, link, meta: meta || {} })
    .select()
    .single()
  if (error) throw error
  return data
}

export const getUnreadCount = async (tenantId, uid) => {
  const { count } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('user_uid', uid)
    .eq('is_read', false)
  return count || 0
}