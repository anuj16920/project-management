import React from 'react'
import { Plus, Search, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'

const getRoomName = (room, currentUid) => {
  if (room.name) return room.name
  if (room.type === 'direct') {
    const other = room.members?.find(m => m.user_uid !== currentUid)
    return other?.profile?.full_name || 'Unknown'
  }
  return 'Unnamed Room'
}

const getAvatar = (room, currentUid) => {
  if (room.type === 'direct') {
    const other = room.members?.find(m => m.user_uid !== currentUid)
    return other?.profile?.full_name?.charAt(0)?.toUpperCase() || '?'
  }
  return room.name?.charAt(0)?.toUpperCase() || '#'
}

const formatTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12: true })
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' })
}

export default function RoomList({ rooms, loading, activeRoomId, onSelect, onNewChat, currentUid }) {
  const [search, setSearch] = React.useState('')

  const filtered = rooms.filter(r => {
    const name = getRoomName(r, currentUid).toLowerCase()
    return !search || name.includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-base text-text-p">Messages</h2>
          <button onClick={onNewChat}
            className="w-8 h-8 rounded-xl bg-accent/15 hover:bg-accent/25 flex items-center
              justify-center text-accent transition-all">
            <Plus size={15}/>
          </button>
        </div>
        <div className="flex items-center gap-2 bg-surface2 border border-white/5 rounded-xl px-3 py-2">
          <Search size={13} className="text-text-f flex-shrink-0"/>
          <input placeholder="Search..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-text-p text-xs outline-none w-full placeholder:text-text-f"/>
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="space-y-1 px-2">
            {Array(6).fill(0).map((_,i) => (
              <div key={i} className="h-14 rounded-xl bg-surface animate-pulse"/>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageSquare size={24} className="text-text-f mx-auto mb-2 opacity-40"/>
            <p className="text-text-f text-xs">No conversations</p>
          </div>
        ) : (
          filtered.map((room, i) => {
            const name    = getRoomName(room, currentUid)
            const avatar  = getAvatar(room, currentUid)
            const isActive = room.id === activeRoomId
            const lastMsg = room.last_message
            const unread  = room.unread_count || 0

            return (
              <motion.button key={room.id}
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onSelect(room)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mx-2
                  transition-all text-left hover:bg-white/5
                  ${isActive ? 'bg-accent/10 border border-accent/20' : ''}
                  `}
                style={{ width: 'calc(100% - 16px)' }}>

                {/* Avatar */}
                <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center
                  text-sm font-bold
                  ${isActive ? 'bg-accent/20 text-accent' : 'bg-white/8 text-text-m'}`}>
                  {avatar}
                </div>

                {/* Name + last message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold truncate
                      ${unread > 0 ? 'text-text-p' : 'text-text-m'}`}>
                      {name}
                    </p>
                    {lastMsg && (
                      <span className="text-text-f text-xs flex-shrink-0">
                        {formatTime(lastMsg.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${unread > 0 ? 'text-text-m' : 'text-text-f'}`}>
                      {lastMsg
                        ? lastMsg.type !== 'text' ? `📎 ${lastMsg.type}` : lastMsg.content
                        : 'No messages yet'}
                    </p>
                    {unread > 0 && (
                      <span className="flex-shrink-0 min-w-4 h-4 bg-accent text-white
                        text-xs font-bold rounded-full flex items-center justify-center px-1">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            )
          })
        )}
      </div>
    </div>
  )
}