import { Server }    from 'socket.io'
import { verifyFirebaseToken } from './firebase.admin.js'
import supabaseAdmin from './supabase.admin.js'

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
      methods:     ['GET','POST'],
      credentials: true,
    },
  })

  // ── Auth middleware ──────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('No token'))

      const decoded = await verifyFirebaseToken(token)
      socket.uid = decoded.uid

      // Get tenant_id
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('tenant_id, full_name, role')
        .eq('firebase_uid', decoded.uid)
        .single()

      if (!profile?.tenant_id) return next(new Error('No tenant'))
      socket.tenantId  = profile.tenant_id
      socket.fullName  = profile.full_name
      socket.role      = profile.role
      next()
    } catch (err) {
      next(new Error('Auth failed'))
    }
  })

  // ── Connection ───────────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.uid} (${socket.fullName})`)

    // Join tenant room (for notifications)
    socket.join(`tenant:${socket.tenantId}`)
    // Join personal room (for DMs / notifications)
    socket.join(`user:${socket.uid}`)

    // ── Join a chat room ───────────────────────────────────────────────────────
    socket.on('join_room', async (roomId) => {
      // Verify membership
      const { data } = await supabaseAdmin
        .from('chat_room_members')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_uid', socket.uid)
        .single()
      if (data) {
        socket.join(roomId)
        socket.to(roomId).emit('user_joined', {
          uid:      socket.uid,
          name:     socket.fullName,
          room_id:  roomId,
        })
      }
    })

    // ── Leave a chat room ──────────────────────────────────────────────────────
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId)
    })

    // ── Typing indicators ──────────────────────────────────────────────────────
    socket.on('typing_start', ({ roomId }) => {
      socket.to(roomId).emit('user_typing', { uid: socket.uid, name: socket.fullName, roomId })
    })
    socket.on('typing_stop', ({ roomId }) => {
      socket.to(roomId).emit('user_stopped_typing', { uid: socket.uid, roomId })
    })

    // ── Disconnect ─────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.uid}`)
    })
  })

  return io
}