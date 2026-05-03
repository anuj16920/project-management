import express      from 'express'
import {
  listRooms, createRoom, getRoom,
  listMessages, sendMessage, editMessage, deleteMessage, markRead,
  listNotifications, markNotifRead, markAllRead, getUnreadCount,
} from '../controllers/chat.controller.js'
import { verifyToken }  from '../middleware/authMiddleware.js'
import { attachTenant } from '../middleware/tenantMiddleware.js'

const router = express.Router()
router.use(verifyToken, attachTenant)

// Rooms
router.get('/rooms',              listRooms)
router.post('/rooms',             createRoom)
router.get('/rooms/:id',          getRoom)

// Messages
router.get('/rooms/:roomId/messages',        listMessages)
router.post('/rooms/:roomId/messages',       sendMessage)
router.patch('/messages/:msgId',             editMessage)
router.delete('/messages/:msgId',            deleteMessage)
router.post('/rooms/:roomId/read',           markRead)

// Notifications
router.get('/notifications',                 listNotifications)
router.get('/notifications/unread-count',    getUnreadCount)
router.patch('/notifications/:id/read',      markNotifRead)
router.patch('/notifications/read-all',      markAllRead)

export default router