import React, { useState, useEffect } from 'react'
import { X, Search, Users, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatAPI }  from '@/lib/chatAPI'
import { usersAPI } from '@/lib/usersAPI'
import { toast }    from 'sonner'

export default function NewChatModal({ onClose, onSuccess }) {
  const [users,    setUsers]    = useState([])
  const [selected, setSelected] = useState([])
  const [search,   setSearch]   = useState('')
  const [type,     setType]     = useState('direct')
  const [name,     setName]     = useState('')
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    usersAPI.listUsers()
      .then(r => setUsers(r.data.data || []))
      .catch(() => toast.error('Failed to load users'))
  }, [])

  const toggle = (uid) =>
    setSelected(prev =>
      prev.includes(uid) ? prev.filter(u => u !== uid) : [...prev, uid]
    )

  const filtered = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    if (!selected.length) return toast.error('Select at least one person')
    if (type === 'group' && !name.trim()) return toast.error('Group name required')
    setLoading(true)
    try {
      const r = await chatAPI.createRoom({
        type,
        name:        type === 'group' ? name.trim() : undefined,
        member_uids: selected,
      })
      toast.success(type === 'direct' ? 'Chat opened! 💬' : 'Group created! 🎉')
      onSuccess?.(r.data.data)
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
        <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
          className="relative z-10 w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl">

          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="font-display font-bold text-lg text-accent">New Conversation</h2>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-m">
              <X size={16}/>
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Type toggle */}
            <div className="flex gap-2">
              {[
                { value:'direct', label:'Direct Message', icon: MessageSquare },
                { value:'group',  label:'Group Chat',     icon: Users },
              ].map(({ value, label, icon: Icon }) => (
                <button key={value} onClick={() => { setType(value); setSelected([]) }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                    text-sm font-medium border transition-all
                    ${type===value
                      ? 'bg-accent/15 border-accent/30 text-accent'
                      : 'border-white/10 text-text-m hover:border-white/20'}`}>
                  <Icon size={14}/>{label}
                </button>
              ))}
            </div>

            {/* Group name */}
            {type === 'group' && (
              <input type="text" placeholder="Group name..."
                value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/40
                  rounded-xl px-3 py-2.5 text-text-p text-sm outline-none placeholder:text-text-f"/>
            )}

            {/* Search */}
            <div className="flex items-center gap-2 bg-surface2 border border-white/10 rounded-xl px-3 py-2">
              <Search size={13} className="text-text-f"/>
              <input placeholder="Search people..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-text-p text-sm outline-none w-full placeholder:text-text-f"/>
            </div>

            {/* Users */}
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {filtered.map(u => {
                const isSelected = selected.includes(u.firebase_uid)
                return (
                  <button key={u.firebase_uid}
                    onClick={() => {
                      if (type === 'direct') setSelected([u.firebase_uid])
                      else toggle(u.firebase_uid)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                      transition-all text-left
                      ${isSelected
                        ? 'bg-accent/15 border border-accent/20'
                        : 'hover:bg-white/4 border border-transparent'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center
                      text-xs font-bold flex-shrink-0
                      ${isSelected ? 'bg-accent/20 text-accent' : 'bg-white/8 text-text-m'}`}>
                      {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-text-p text-sm font-medium truncate">{u.full_name}</p>
                      <p className="text-text-f text-xs capitalize truncate">{u.role}</p>
                    </div>
                    {isSelected && (
                      <div className="ml-auto w-4 h-4 rounded-full bg-accent flex items-center
                        justify-center flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {selected.length > 0 && (
              <p className="text-text-f text-xs text-center">
                {selected.length} person{selected.length > 1 ? 's' : ''} selected
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose}
                className="flex-1 border border-white/10 hover:border-white/20 text-text-m
                  text-sm font-medium py-2.5 rounded-xl transition-all">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={!selected.length || loading}
                className="flex-1 bg-accent hover:bg-accent-h text-white text-sm font-semibold
                  py-2.5 rounded-xl transition-all disabled:opacity-60">
                {loading ? 'Starting...' : type === 'direct' ? '💬 Open Chat' : '🚀 Create Group'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}