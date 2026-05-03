import React, { useState } from 'react'
import { Search, Bell, ChevronDown, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import NotificationBell from './NotificationBell'

export default function Topbar({ title = '', sidebarCollapsed = false }) {
  const { profile, logout } = useAuth()
  const navigate            = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)

  const marginLeft = sidebarCollapsed ? 64 : 240

  return (
    <header className="fixed top-0 right-0 z-30 flex items-center justify-between px-6 py-4 bg-bg/80 backdrop-blur-md border-b border-white/5"
      style={{ left: marginLeft }}>
      {/* Title */}
      <h1 className="font-display font-bold text-lg text-text-p">{title}</h1>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-surface border border-white/10 rounded-xl px-3 py-2 w-56">
          <Search size={14} className="text-text-f" />
          <input placeholder="Search..." className="bg-transparent text-text-p text-sm outline-none w-full placeholder:text-text-f" />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-text-m hover:text-text-p hover:border-white/20 transition-all">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>

        {/* Settings */}
        <button onClick={() => navigate(`/${profile?.role?.replace('_','')+'/settings'}`)}
          className="w-9 h-9 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-text-m hover:text-text-p hover:border-white/20 transition-all">
          <Settings size={16} />
        </button>

        {/* Avatar dropdown */}
        <div className="relative">
          <button onClick={() => setDropOpen(!dropOpen)}
            className="flex items-center gap-2 bg-surface border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 transition-all">
            <Avatar name={profile?.full_name || 'User'} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-text-p text-xs font-semibold leading-none">{profile?.full_name?.split(' ')[0]}</p>
              <p className="text-text-f text-xs capitalize mt-0.5">{profile?.role?.replace('_',' ')}</p>
            </div>
            <ChevronDown size={13} className={`text-text-f transition-transform ${dropOpen?'rotate-180':''}`} />
          </button>
          {dropOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 glass border border-white/10 rounded-xl py-1 shadow-card-h">
              <button className="w-full text-left px-4 py-2.5 text-text-m text-sm hover:text-text-p hover:bg-white/5 transition-colors">Profile</button>
              <button className="w-full text-left px-4 py-2.5 text-text-m text-sm hover:text-text-p hover:bg-white/5 transition-colors">Settings</button>
              <div className="my-1 border-t border-white/5" />
              <button onClick={() => { logout(); navigate('/login') }}
                className="w-full text-left px-4 py-2.5 text-error text-sm hover:bg-error/10 transition-colors">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}