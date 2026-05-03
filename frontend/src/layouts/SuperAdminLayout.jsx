import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '@/components/shared/Sidebar'
import Topbar  from '@/components/shared/Topbar'

const TITLES = {
  '/superadmin/dashboard':     'Platform Overview',
  '/superadmin/tenants':       'Tenant Management',
  '/superadmin/subscriptions': 'Subscriptions',
  '/superadmin/features':      'Feature Flags',
  '/superadmin/analytics':     'Platform Analytics',
}

export default function SuperAdminLayout() {
  const location = useLocation()
  const title    = TITLES[location.pathname] || 'Super Admin'

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg">

      <Topbar title={title} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-bg">
          <div className="p-6 max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  )
}