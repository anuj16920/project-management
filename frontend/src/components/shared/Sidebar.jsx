import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FolderKanban, CheckSquare,
  Users, UsersRound, UserCircle,
  BarChart3, ChevronLeft, ChevronRight,
  Briefcase, DollarSign, MessageSquare,
  FolderOpen, FileBarChart, Settings,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// ── Nav configs ───────────────────────────────────────────────────────────────
const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Projects',  to: '/admin/projects',  icon: FolderKanban    },
  { label: 'Tasks',     to: '/admin/tasks',     icon: CheckSquare     },
  { label: 'CRM',       to: '/admin/crm',       icon: UsersRound      },
  { label: 'Team',      to: '/admin/team',      icon: UserCircle      },
  { label: 'HR',        to: '/admin/hr',        icon: Briefcase       },
  { label: 'Finance',   to: '/admin/finance',   icon: DollarSign      },
  { label: 'Chat',      to: '/admin/chat',      icon: MessageSquare   },
  { label: 'Files',     to: '/admin/files',     icon: FolderOpen      },
  { label: 'Reports',   to: '/admin/reports',   icon: FileBarChart    },
  { label: 'Settings',  to: '/admin/settings',  icon: Settings        },
]

const EMPLOYEE_NAV = [
  { label: 'Dashboard', to: '/employee/dashboard', icon: LayoutDashboard },
  { label: 'Projects',  to: '/employee/projects',  icon: FolderKanban    },
  { label: 'Tasks',     to: '/employee/tasks',     icon: CheckSquare     },
  { label: 'My HR',     to: '/employee/hr',        icon: Briefcase       },
  { label: 'Chat',      to: '/employee/chat',      icon: MessageSquare   },
  { label: 'Files',     to: '/employee/files',     icon: FolderOpen      },
]

const CLIENT_NAV = [
  { label: 'Dashboard', to: '/client/dashboard', icon: LayoutDashboard },
  { label: 'Projects',  to: '/client/projects',  icon: FolderKanban    },
  { label: 'Tasks',     to: '/client/tasks',     icon: CheckSquare     },
  { label: 'Invoices',  to: '/client/invoices',  icon: DollarSign      },
  { label: 'Files',     to: '/client/files',     icon: FolderOpen      },
  { label: 'Account',   to: '/client/account',   icon: UserCircle      },
]

const SUPERADMIN_NAV = [
  { label: 'Dashboard', to: '/superadmin/dashboard', icon: LayoutDashboard },
  { label: 'Tenants',   to: '/superadmin/tenants',   icon: Users           },
  { label: 'Analytics', to: '/superadmin/analytics', icon: BarChart3       },
  { label: 'Settings',  to: '/superadmin/settings',  icon: Settings        },
]

const NAV_BY_ROLE = {
  admin:       ADMIN_NAV,
  manager:     ADMIN_NAV,
  employee:    EMPLOYEE_NAV,
  client:      CLIENT_NAV,
  super_admin: SUPERADMIN_NAV,
}

export default function Sidebar() {
  const { profile }               = useAuth()
  const location                  = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const role     = profile?.role || 'employee'
  const navItems = NAV_BY_ROLE[role] || ADMIN_NAV

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NW'

  return (
    <aside
      style={{ width: collapsed ? '64px' : '224px' }}
      className="
        relative flex flex-col flex-shrink-0
        bg-[#13121a] border-r border-white/[0.06]
        transition-all duration-300 ease-in-out
        overflow-hidden
      "
    >
      {/* ── Logo ── */}
      <div className="
        flex items-center gap-3 px-3 py-4
        border-b border-white/[0.06] flex-shrink-0
        overflow-hidden
      ">
        <div className="
          w-8 h-8 rounded-xl flex-shrink-0
          bg-indigo-500/20 border border-indigo-500/30
          flex items-center justify-center
        ">
          <span className="text-indigo-400 text-xs font-black">{initials}</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden min-w-0">
            <p className="text-white text-sm font-bold truncate leading-tight">NexaWork</p>
            <p className="text-white/40 text-xs capitalize truncate">{role} Portal</p>
          </div>
        )}
      </div>

      {/* ── Nav items — overflow-y-auto so it SCROLLS if too many items ── */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto overflow-x-hidden">
        <div className="space-y-0.5">
          {navItems.map(item => {
            const Icon   = item.icon
            // match exact path OR child paths (e.g. /admin/hr/123 still highlights HR)
            const active = location.pathname === item.to
                        || location.pathname.startsWith(item.to + '/')

            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={`
                  flex items-center gap-3 rounded-xl
                  text-sm font-medium transition-all duration-150
                  ${collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5'}
                  ${active
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]'}
                `}
              >
                <Icon
                  size={17}
                  className={`flex-shrink-0 ${active ? 'text-indigo-400' : 'text-white/40'}`}
                />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* ── Collapse toggle button ── */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="
          absolute right-0 top-[52px]
          w-5 h-9
          bg-[#1e1c2a] border border-white/10
          rounded-l-lg
          flex items-center justify-center
          text-white/30 hover:text-white/70
          hover:bg-white/5
          transition-all z-20
        "
        style={{ right: '-1px' }}
      >
        {collapsed
          ? <ChevronRight size={11} />
          : <ChevronLeft  size={11} />}
      </button>

      {/* ── User info at bottom ── */}
      <div className="flex-shrink-0 p-3 border-t border-white/[0.06]">
        {collapsed ? (
          // Collapsed — just avatar
          <div className="
            w-8 h-8 mx-auto rounded-xl
            bg-indigo-500/20 flex items-center justify-center
          ">
            <span className="text-indigo-400 text-xs font-bold">{initials}</span>
          </div>
        ) : (
          // Expanded — avatar + name
          <div className="
            flex items-center gap-2.5 px-2 py-2
            rounded-xl hover:bg-white/[0.04]
            transition-all cursor-pointer
          ">
            <div className="
              w-7 h-7 rounded-lg flex-shrink-0
              bg-indigo-500/20
              flex items-center justify-center
            ">
              <span className="text-indigo-400 text-xs font-bold">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white/90 text-xs font-semibold truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-white/30 text-xs capitalize truncate">{role}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}