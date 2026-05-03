import React, { useEffect, useState, useRef } from 'react'
import { Bell, CheckCheck, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { chatAPI }     from '@/lib/chatAPI'
import { useSocket }   from '@/hooks/useSocket'
import { useAuth }     from '@/hooks/useAuth'

const NOTIF_ICONS = {
  task_assigned:   '📋',
  task_completed:  '✅',
  project_created: '🚀',
  invoice_sent:    '🧾',
  invoice_paid:    '💰',
  expense_approved:'✅',
  expense_rejected:'❌',
  mention:         '💬',
  message:         '💬',
  leave_approved:  '🏖️',
  leave_rejected:  '❌',
  general:         '🔔',
}

export default function NotificationBell() {
  const navigate            = useNavigate()
  const { profile }         = useAuth()
  const { on }              = useSocket()
  const [notifs,     setNotifs]     = useState([])
  const [unread,     setUnread]     = useState(0)
  const [open,       setOpen]       = useState(false)
  const [loading,    setLoading]    = useState(false)
  const panelRef                    = useRef(null)

  const loadNotifs = async () => {
    setLoading(true)
    try {
      const [n, c] = await Promise.all([
        chatAPI.listNotifications({ limit: 20 }),
        chatAPI.unreadCount(),
      ])
      setNotifs(n.data.data || [])
      setUnread(c.data.data?.count || 0)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { if (profile) loadNotifs() }, [profile])

  // Real-time notifications via socket
  useEffect(() => {
    const cleanup = on('notification', (notif) => {
      setNotifs(prev => [notif, ...prev].slice(0, 20))
      setUnread(prev => prev + 1)
    })
    return cleanup
  }, [on])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkAll = async () => {
    try {
      await chatAPI.markAllRead()
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnread(0)
    } catch {}
  }

  const handleClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await chatAPI.markRead(notif.id)
        setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
        setUnread(prev => Math.max(0, prev - 1))
      } catch {}
    }
    if (notif.link) { navigate(notif.link); setOpen(false) }
  }

  const formatTime = (ts) => {
    const diff = Date.now() - new Date(ts).getTime()
    if (diff < 60000)    return 'just now'
    if (diff < 3600000)  return `${Math.floor(diff/60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`
    return new Date(ts).toLocaleDateString('en-IN', { day:'numeric', month:'short' })
  }

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 rounded-xl hover:bg-white/5 flex items-center
          justify-center text-text-m hover:text-text-p transition-all">
        <Bell size={17}/>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 bg-accent text-white
            text-xs font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, scale:0.95, y:-8 }}
            animate={{ opacity:1, scale:1,    y:0   }}
            exit={{    opacity:0, scale:0.95, y:-8  }}
            transition={{ duration:0.15 }}
            className="absolute right-0 top-11 w-80 bg-surface border border-white/10
              rounded-2xl shadow-2xl z-50 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <p className="text-text-p text-sm font-bold">Notifications</p>
              {unread > 0 && (
                <button onClick={handleMarkAll}
                  className="flex items-center gap-1.5 text-accent text-xs hover:underline">
                  <CheckCheck size={12}/> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="space-y-2 p-3">
                  {Array(4).fill(0).map((_,i) => (
                    <div key={i} className="h-12 bg-surface2 rounded-xl animate-pulse"/>
                  ))}
                </div>
              ) : notifs.length === 0 ? (
                <div className="text-center py-10">
                  <Bell size={24} className="text-text-f mx-auto mb-2 opacity-40"/>
                  <p className="text-text-f text-xs">No notifications</p>
                </div>
              ) : (
                notifs.map(notif => (
                  <button key={notif.id} onClick={() => handleClick(notif)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left
                      hover:bg-white/3 transition-all
                      ${!notif.is_read ? 'bg-accent/5' : ''}`}>
                    <span className="text-base flex-shrink-0 mt-0.5">
                      {NOTIF_ICONS[notif.type] || '🔔'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate
                        ${notif.is_read ? 'text-text-m' : 'text-text-p'}`}>
                        {notif.title}
                      </p>
                      {notif.body && (
                        <p className="text-text-f text-xs truncate mt-0.5">{notif.body}</p>
                      )}
                      <p className="text-text-f text-xs mt-1">{formatTime(notif.created_at)}</p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5"/>
                    )}
                    {notif.link && (
                      <ExternalLink size={11} className="text-text-f flex-shrink-0 mt-1"/>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}