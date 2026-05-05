import * as Chat   from '../services/chat.service.js'
import { success, error } from '../utils/response.js'

// ─── ROOMS ────────────────────────────────────────────────────────────────────
export const listRooms = async (req,res) => {
  try { return success(res, await Chat.listRooms(req.tenantId, req.user.uid)) }
  catch(err){
    console.error('[chat/rooms]', err.message)
    return error(res, err.message, 500)
  }
}
export const createRoom = async (req,res) => {
  try {
    if (!req.body.member_uids?.length) return error(res, 'member_uids required', 400)
    return success(res, await Chat.createRoom(req.tenantId, req.user.uid, req.body), 'Room created', 201)
  } catch(err){ return error(res, err.message, 500) }
}
export const getRoom = async (req,res) => {
  try { return success(res, await Chat.getRoom(req.tenantId, req.params.id, req.user.uid)) }
  catch(err){ return error(res, err.message, 500) }
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
export const listMessages = async (req,res) => {
  try { return success(res, await Chat.listMessages(req.tenantId, req.params.roomId, req.query)) }
  catch(err){ return error(res, err.message, 500) }
}
export const sendMessage = async (req,res) => {
  try {
    if (!req.body.content && !req.body.file_url) return error(res, 'content or file required', 400)
    const msg = await Chat.sendMessage(req.tenantId, req.params.roomId, req.user.uid, req.body)
    // Emit via socket
    req.io?.to(req.params.roomId).emit('new_message', msg)
    return success(res, msg, 'Sent', 201)
  } catch(err){ return error(res, err.message, err.status||500) }
}
export const editMessage = async (req,res) => {
  try {
    const msg = await Chat.editMessage(req.tenantId, req.params.msgId, req.user.uid, req.body.content)
    req.io?.to(msg.room_id).emit('message_updated', msg)
    return success(res, msg)
  } catch(err){ return error(res, err.message, 500) }
}
export const deleteMessage = async (req,res) => {
  try {
    const msg = await Chat.deleteMessage(req.tenantId, req.params.msgId, req.user.uid)
    req.io?.to(msg.room_id).emit('message_deleted', { id: msg.id, room_id: msg.room_id })
    return success(res, msg)
  } catch(err){ return error(res, err.message, 500) }
}
export const markRead = async (req,res) => {
  try { await Chat.markRoomRead(req.params.roomId, req.user.uid); return success(res, null, 'Marked read') }
  catch(err){ return error(res, err.message, 500) }
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const listNotifications = async (req,res) => {
  try { return success(res, await Chat.listNotifications(req.tenantId, req.user.uid, req.query)) }
  catch(err){ return error(res, err.message, 500) }
}
export const markNotifRead = async (req,res) => {
  try { return success(res, await Chat.markNotifRead(req.tenantId, req.user.uid, req.params.id)) }
  catch(err){ return error(res, err.message, 500) }
}
export const markAllRead = async (req,res) => {
  try { await Chat.markAllNotifsRead(req.tenantId, req.user.uid); return success(res, null, 'All marked read') }
  catch(err){ return error(res, err.message, 500) }
}
export const getUnreadCount = async (req,res) => {
  try { return success(res, { count: await Chat.getUnreadCount(req.tenantId, req.user.uid) }) }
  catch(err){ return error(res, err.message, 500) }
}