import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '@/components/shared/Sidebar'
import Topbar  from '@/components/shared/Topbar'

const TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/projects':  'Projects',
  '/admin/tasks':     'Tasks',
  '/admin/crm':       'CRM',
  '/admin/hr':        'HR Management',
  '/admin/finance':   'Finance',
  '/admin/chat':      'Chat',
  '/admin/files':     'Files',
  '/admin/reports':   'Reports',
  '/admin/settings':  'Settings',
  '/admin/team':      'Team Management',
  '/hr/dashboard':    'HR Management',
  '/hr/chat':         'Chat',
  '/hr/files':        'Files',
  '/hr/settings':     'Settings',
}

export default function AdminLayout() {
  const location = useLocation()
  const title    = TITLES[location.pathname] || 'NexaWork'

  return (
    // ROOT — full viewport, no scroll, flex column
    <div className="flex flex-col h-screen overflow-hidden bg-bg">

      {/* TOPBAR — fixed height, never grows or shrinks */}
      <Topbar title={title} />

      {/* BODY ROW — fills everything below topbar */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR — height comes from parent (flex-1 row), NOT h-screen */}
        <Sidebar />

        {/* MAIN — only this area scrolls */}
        <main className="flex-1 overflow-y-auto bg-bg">
          <div className="p-6 pt-24 max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  )
}