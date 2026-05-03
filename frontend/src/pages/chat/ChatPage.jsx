import React, { useEffect, useState, useCallback } from 'react'
import { chatAPI }      from '@/lib/chatAPI'
import { useAuth }      from '@/hooks/useAuth'
import { useSocket }    from '@/hooks/useSocket'
import RoomList         from './components/RoomList'
import ChatWindow       from './components/ChatWindow'
import NewChatModal     from './components/NewChatModal'
import { MessageSquare } from 'lucide-react'
import { toast }         from 'sonner'

export default function ChatPage() {
  const { profile }                 = useAuth()
  const { on, off }                 = useSocket()
  const [rooms,       setRooms]     = useState([])
  const [activeRoom,  setActiveRoom] = useState(null)
  const [loading,     setLoading]   = useState(true)
  const [showNewChat, setShowNewChat] = useState(false)

  const loadRooms = useCallback(async () => {
    try {
      const r = await chatAPI.listRooms()
      setRooms(r.data.data || [])
    } catch { toast.error('Failed to load rooms') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadRooms() }, [loadRooms])

  // Update room list when new message arrives (unread count)
  useEffect(() => {
    const handleNewMsg = (msg) => {
      if (msg.sender_uid === profile?.firebase_uid) return
      setRooms(prev => prev.map(r =>
        r.id === msg.room_id
          ? { ...r,
              last_message: msg,
              unread_count: activeRoom?.id === r.id ? 0 : (r.unread_count || 0) + 1
            }
          : r
      ))
    }
    const cleanup = on('new_message', handleNewMsg)
    return cleanup
  }, [on, profile, activeRoom])

  const handleSelectRoom = async (room) => {
    setActiveRoom(room)
    // Mark as read
    try {
      await chatAPI.markRead(room.id)
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unread_count: 0 } : r))
    } catch {}
  }

  return (
    <div className="flex h-[calc(100vh-64px)] -m-6 overflow-hidden rounded-none">

      {/* Room List */}
      <div className="w-72 flex-shrink-0 border-r border-white/5 flex flex-col bg-[#13121a]">
        <RoomList
          rooms={rooms}
          loading={loading}
          activeRoomId={activeRoom?.id}
          onSelect={handleSelectRoom}
          onNewChat={() => setShowNewChat(true)}
          currentUid={profile?.firebase_uid}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeRoom ? (
          <ChatWindow
            room={activeRoom}
            currentUid={profile?.firebase_uid}
            currentProfile={profile}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
              <MessageSquare size={28} className="text-accent opacity-60"/>
            </div>
            <p className="text-text-p font-semibold mb-1">Select a conversation</p>
            <p className="text-text-f text-sm max-w-48">
              Choose a chat from the list or start a new one
            </p>
            <button onClick={() => setShowNewChat(true)}
              className="mt-4 bg-accent hover:bg-accent-h text-white text-sm font-medium
                px-4 py-2 rounded-xl transition-all">
              New Chat
            </button>
          </div>
        )}
      </div>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onSuccess={(room) => {
            loadRooms()
            setShowNewChat(false)
            setActiveRoom(room)
          }}
        />
      )}
    </div>
  )
}