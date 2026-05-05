import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Send, Paperclip, MoreVertical, Edit2, Trash2, Reply, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatAPI }   from '@/lib/chatAPI'
import { useSocket } from '@/hooks/useSocket'
import { toast }     from 'sonner'

const getRoomName = (room, currentUid) => {
  if (room.name) return room.name
  if (room.type === 'direct') {
    const other = room.members?.find(m => m.user_uid !== currentUid)
    return other?.profile?.full_name || 'Unknown'
  }
  return 'Group Chat'
}

const formatMsgTime = (ts) =>
  new Date(ts).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12: true })

export default function ChatWindow({ room, currentUid, currentProfile }) {
  const { joinRoom, leaveRoom, startTyping, stopTyping, on, off } = useSocket()
  const [messages,    setMessages]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [input,       setInput]       = useState('')
  const [sending,     setSending]     = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [replyTo,     setReplyTo]     = useState(null)
  const [editingMsg,  setEditingMsg]  = useState(null)
  const [menuMsgId,   setMenuMsgId]   = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimerRef = useRef(null)
  const inputRef       = useRef(null)

  // Load messages
  const loadMessages = useCallback(async () => {
    setLoading(true)
    try {
      const r = await chatAPI.listMessages(room.id)
      setMessages(r.data.data || [])
    } catch { toast.error('Failed to load messages') }
    finally { setLoading(false) }
  }, [room.id])

  useEffect(() => {
    loadMessages()
    joinRoom(room.id)
    return () => leaveRoom(room.id)
  }, [room.id])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Socket listeners
  useEffect(() => {
    const handleNewMsg = (msg) => {
      if (msg.room_id !== room.id) return
      setMessages(prev => [...prev, msg])
      if (msg.sender_uid !== currentUid) chatAPI.markRead(room.id).catch(() => {})
    }
    const handleUpdated = (msg) => {
      if (msg.room_id !== room.id) return
      setMessages(prev => prev.map(m => m.id === msg.id ? msg : m))
    }
    const handleDeleted = ({ id }) => {
      setMessages(prev => prev.map(m => m.id === id
        ? { ...m, is_deleted: true, content: 'This message was deleted' } : m))
    }
    const handleTyping = ({ uid, name, roomId }) => {
      if (roomId !== room.id || uid === currentUid) return
      setTypingUsers(prev => prev.includes(name) ? prev : [...prev, name])
    }
    const handleStopTyping = ({ uid, roomId }) => {
      if (roomId !== room.id) return
      // Find name from messages
      setTypingUsers(prev => {
        const userMsg = messages.find(m => m.sender_uid === uid)
        const name = userMsg?.sender?.full_name
        return name ? prev.filter(n => n !== name) : prev
      })
    }

    const c1 = on('new_message',          handleNewMsg)
    const c2 = on('message_updated',      handleUpdated)
    const c3 = on('message_deleted',      handleDeleted)
    const c4 = on('user_typing',          handleTyping)
    const c5 = on('user_stopped_typing',  handleStopTyping)

    return () => { c1?.(); c2?.(); c3?.(); c4?.(); c5?.() }
  }, [room.id, on, currentUid, messages])

  // Typing debounce
  const handleInputChange = (val) => {
    setInput(val)
    if (editingMsg) return
    startTyping(room.id)
    clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => stopTyping(room.id), 2000)
  }

  const handleSend = async () => {
    const content = input.trim()
    if (!content) return

    // Editing mode
    if (editingMsg) {
      try {
        await chatAPI.editMessage(editingMsg.id, content)
        setMessages(prev => prev.map(m => m.id === editingMsg.id
          ? { ...m, content, is_edited: true } : m))
        setEditingMsg(null)
        setInput('')
      } catch { toast.error('Failed to edit') }
      return
    }

    setSending(true)
    try {
      await chatAPI.sendMessage(room.id, {
        content,
        type:     'text',
        reply_to: replyTo?.id || null,
      })
      setInput('')
      setReplyTo(null)
      stopTyping(room.id)
    } catch { toast.error('Failed to send') }
    finally { setSending(false) }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') {
      setEditingMsg(null)
      setReplyTo(null)
      setInput('')
    }
  }

  const handleDelete = async (msgId) => {
    try {
      await chatAPI.deleteMessage(msgId)
      setMessages(prev => prev.map(m => m.id === msgId
        ? { ...m, is_deleted: true, content: 'This message was deleted' } : m))
      setMenuMsgId(null)
    } catch { toast.error('Failed') }
  }

  const startEdit = (msg) => {
    setEditingMsg(msg)
    setInput(msg.content)
    setMenuMsgId(null)
    inputRef.current?.focus()
  }

  // Group messages by date
  const groupedMsgs = messages.reduce((groups, msg) => {
    const date = new Date(msg.created_at).toLocaleDateString('en-IN',
      { day:'numeric', month:'long', year:'numeric' })
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
    return groups
  }, {})

  const roomName = getRoomName(room, currentUid)

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center text-accent text-sm font-bold">
            {roomName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-text-p text-sm font-bold">{roomName}</p>
            <p className="text-text-f text-xs">
              {room.members?.length} member{room.members?.length !== 1 ? 's' : ''}
              {room.type === 'group' && ' · Group'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-text-f text-sm">No messages yet</p>
            <p className="text-text-f text-xs mt-1">Say hello! 👋</p>
          </div>
        ) : (
          Object.entries(groupedMsgs).map(([date, msgs]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-white/5"/>
                <span className="text-text-f text-xs px-2">{date}</span>
                <div className="flex-1 h-px bg-white/5"/>
              </div>

              {msgs.map((msg, i) => {
                const isMine     = msg.sender_uid === currentUid
                const isDeleted  = msg.is_deleted
                const prevMsg    = msgs[i - 1]
                const showAvatar = !isMine && (!prevMsg || prevMsg.sender_uid !== msg.sender_uid)

                return (
                  <motion.div key={msg.id}
                    initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                    className={`flex items-end gap-2 group mb-0.5
                      ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>

                    {/* Avatar */}
                    {!isMine && (
                      <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center
                        justify-center text-xs font-bold bg-white/8 text-text-m
                        ${showAvatar ? 'visible' : 'invisible'}`}>
                        {msg.sender?.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}

                    {/* Bubble */}
                    <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                      {showAvatar && !isMine && (
                        <span className="text-text-f text-xs mb-1 ml-1">
                          {msg.sender?.full_name}
                        </span>
                      )}

                      {/* Reply preview */}
                      {msg.reply_to && (
                        <div className={`text-xs px-3 py-1.5 rounded-t-xl mb-0.5
                          bg-white/5 border-l-2 border-accent/40 text-text-f
                          ${isMine ? 'self-end' : 'self-start'}`}>
                          Replying to a message
                        </div>
                      )}

                      <div
                        className={`relative px-3 py-2 rounded-2xl text-sm
                          ${isMine
                            ? 'bg-accent text-white rounded-br-sm'
                            : 'bg-surface border border-white/5 text-text-p rounded-bl-sm'}
                          ${isDeleted ? 'opacity-50 italic' : ''}`}
                        onMouseLeave={() => setMenuMsgId(null)}>

                        {isDeleted ? (
                          <span className="text-xs">This message was deleted</span>
                        ) : (
                          <>
                            <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-0.5
                              ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <span className={`text-xs opacity-60 ${isMine ? 'text-white' : 'text-text-f'}`}>
                                {formatMsgTime(msg.created_at)}
                              </span>
                              {msg.is_edited && (
                                <span className={`text-xs opacity-40 ${isMine ? 'text-white' : 'text-text-f'}`}>
                                  (edited)
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Message actions */}
                      {!isDeleted && (
                        <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100
                          transition-opacity ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                          <button onClick={() => setReplyTo(msg)}
                            className="w-6 h-6 rounded-md hover:bg-white/5 flex items-center justify-center text-text-f hover:text-text-m">
                            <Reply size={11}/>
                          </button>
                          {isMine && (
                            <>
                              <button onClick={() => startEdit(msg)}
                                className="w-6 h-6 rounded-md hover:bg-white/5 flex items-center justify-center text-text-f hover:text-text-m">
                                <Edit2 size={11}/>
                              </button>
                              <button onClick={() => handleDelete(msg.id)}
                                className="w-6 h-6 rounded-md hover:bg-red-400/10 flex items-center justify-center text-text-f hover:text-red-400">
                                <Trash2 size={11}/>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 py-1">
            <div className="bg-surface border border-white/5 rounded-2xl rounded-bl-sm px-3 py-2">
              <div className="flex items-center gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 bg-text-f rounded-full animate-bounce"
                    style={{ animationDelay: `${i*0.15}s` }}/>
                ))}
              </div>
            </div>
            <span className="text-text-f text-xs">{typingUsers.join(', ')} typing...</span>
          </div>
        )}

        <div ref={messagesEndRef}/>
      </div>

      {/* Reply / Edit bar */}
      <AnimatePresence>
        {(replyTo || editingMsg) && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }}
            className="px-5 py-2 bg-surface border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-text-m">
              {editingMsg ? (
                <><Edit2 size={12} className="text-accent"/><span>Editing message</span></>
              ) : (
                <><Reply size={12} className="text-accent"/><span>Replying to <strong>{replyTo?.sender?.full_name}</strong></span></>
              )}
            </div>
            <button onClick={() => { setReplyTo(null); setEditingMsg(null); setInput('') }}
              className="w-5 h-5 rounded-md hover:bg-white/5 flex items-center justify-center text-text-f">
              <X size={11}/>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-white/5 flex-shrink-0">
        <div className="flex items-end gap-2 bg-surface border border-white/10 focus-within:border-accent/30
          rounded-2xl px-4 py-3 transition-all">
          <textarea
            ref={inputRef}
            rows={1}
            placeholder={editingMsg ? 'Edit message...' : 'Type a message... (Enter to send)'}
            value={input}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-text-p text-sm outline-none resize-none
              placeholder:text-text-f leading-relaxed max-h-32 overflow-y-auto"
            style={{ minHeight: '20px' }}
          />
          <button onClick={handleSend} disabled={!input.trim() || sending}
            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
              transition-all ${input.trim()
                ? 'bg-accent hover:bg-accent-h text-white'
                : 'bg-white/5 text-text-f cursor-not-allowed'}`}>
            {sending
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              : <Send size={14}/>}
          </button>
        </div>
      </div>
    </div>
  )
}