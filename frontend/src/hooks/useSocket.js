import { useEffect, useRef, useCallback } from 'react'
import { io }        from 'socket.io-client'
import { useAuth }   from './useAuth'

let socketInstance = null

export const useSocket = () => {
  const { user }     = useAuth()
  const socketRef    = useRef(null)

  useEffect(() => {
    if (!user) return

    const connect = async () => {
      const token = await user.getIdToken()

      if (socketInstance?.connected) {
        socketRef.current = socketInstance
        return
      }

      socketInstance = io(import.meta.env.VITE_API_BASE_URL?.replace('/api','') || 'http://localhost:5000', {
        auth:        { token },
        transports:  ['websocket','polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay:    1000,
      })

      socketInstance.on('connect', () => {
        console.log('✅ Socket connected:', socketInstance.id)
      })
      socketInstance.on('connect_error', (err) => {
        console.error('❌ Socket error:', err.message)
      })

      socketRef.current = socketInstance
    }

    connect()

    return () => {
      // Don't disconnect on unmount — keep alive for the session
    }
  }, [user])

  const joinRoom = useCallback((roomId) => {
    socketRef.current?.emit('join_room', roomId)
  }, [])

  const leaveRoom = useCallback((roomId) => {
    socketRef.current?.emit('leave_room', roomId)
  }, [])

  const startTyping = useCallback((roomId) => {
    socketRef.current?.emit('typing_start', { roomId })
  }, [])

  const stopTyping = useCallback((roomId) => {
    socketRef.current?.emit('typing_stop', { roomId })
  }, [])

  const on = useCallback((event, cb) => {
    socketRef.current?.on(event, cb)
    return () => socketRef.current?.off(event, cb)
  }, [])

  const off = useCallback((event, cb) => {
    socketRef.current?.off(event, cb)
  }, [])

  return {
    socket:     socketRef.current,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping,
    on,
    off,
  }
}