import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicRoutes    from './PublicRoutes'
import ProtectedRoutes from './ProtectedRoutes'
import { ROLES }       from '@/lib/constants'

// Layouts
import AdminLayout      from '@/layouts/AdminLayout'
import EmployeeLayout   from '@/layouts/EmployeeLayout'
import ClientLayout     from '@/layouts/ClientLayout'
import SuperAdminLayout from '@/layouts/SuperAdminLayout'

// Pages
import LandingPage      from '@/pages/landing/LandingPage'
import Login            from '@/pages/auth/Login'
import Signup           from '@/pages/auth/Signup'
import ForgotPassword   from '@/pages/auth/ForgotPassword'
import ResetPassword    from '@/pages/auth/ResetPassword'

// Dashboards
import AdminDashboard       from '@/pages/dashboard/AdminDashboard'

import ProjectsList  from '@/pages/projects/ProjectsList'
import ProjectDetail from '@/pages/projects/ProjectDetail'

import KanbanBoard from '@/pages/tasks/KanbanBoard'

import CRMPage     from '@/pages/crm/CRMPage'
import ClientDetail from '@/pages/crm/ClientDetail'

import TeamManagement from '@/pages/team/TeamManagement'


// Employee routes
import EmployeeDashboard  from '@/pages/employee/dashboard/EmployeeDashboard'
import EmployeeProjects   from '@/pages/employee/projects/EmployeeProjects'
import EmployeeTasks      from '@/pages/tasks/EmployeeTasks'

// Client routes
import ClientDashboard    from '@/pages/client/dashboard/ClientDashboard'
import ClientProjects     from '@/pages/client/projects/ClientProjects'
import ClientTasks        from '@/pages/client/tasks/ClientTasks'
import ClientAccount      from '@/pages/client/account/ClientAccount'

// Super Admin routes
import SuperAdminDashboard from '@/pages/superadmin/dashboard/SuperAdminDashboard'
import TenantsPage         from '@/pages/superadmin/tenants/TenantsPage'


const FinancePage    = lazy(() => import('@/pages/finance/FinancePage'))
const InvoiceDetail  = lazy(() => import('@/pages/finance/components/InvoiceDetail'))
const ClientInvoices = lazy(() => import('@/pages/client/invoices/ClientInvoices'))
const ChatPage = lazy(() => import('@/pages/chat/ChatPage'))
const FilesPage = lazy(() => import('@/pages/files/FilesPage'))
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'))
const EmployeesList  = lazy(() => import('@/pages/hr/EmployeesList'))
const EmployeeDetail = lazy(() => import('@/pages/hr/EmployeeDetail'))
const EmployeeHRPage = lazy(() => import('@/pages/hr/EmployeeHRPage'))
const AdminSettings      = lazy(() => import('@/pages/settings/AdminSettings'))
const EmployeeSettings   = lazy(() => import('@/pages/settings/EmployeeSettings'))
const ClientReports      = lazy(() => import('@/pages/client/reports/ClientReports'))
const AnalyticsPage      = lazy(() => import('@/pages/superadmin/analytics/AnalyticsPage'))
const SuperAdminSettings = lazy(() => import('@/pages/superadmin/settings/SuperAdminSettings'))
const SubscriptionManager = lazy(() => import('@/pages/superadmin/SubscriptionManager'))
const FeatureToggles     = lazy(() => import('@/pages/superadmin/FeatureToggles'))



export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth */}
      <Route element={<PublicRoutes />}>
        <Route path="/login"           element={<Login />} />
        <Route path="/signup"          element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoutes allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard"             element={<AdminDashboard />} />
          <Route path="/admin/reports"               element={<ReportsPage />} />
          <Route path="/admin/chat"                  element={<ChatPage />} />
          <Route path="/admin/projects"              element={<ProjectsList />} />
          <Route path="/admin/projects/:id"          element={<ProjectDetail />} />
          <Route path="/admin/tasks"                 element={<KanbanBoard />} />
          <Route path="/admin/files"                 element={<FilesPage />} />
          <Route path="/admin/crm"                   element={<CRMPage />} />
          <Route path="/admin/crm/:id"               element={<ClientDetail />} />
          <Route path="/admin/team"                  element={<TeamManagement />} />
          <Route path="/admin/finance"               element={<FinancePage />} />
          <Route path="/admin/finance/invoices/:id"  element={<InvoiceDetail />} />
          <Route path="/admin/hr"                    element={<EmployeesList />} />
          <Route path="/admin/hr/:id"                element={<EmployeeDetail />} />
          <Route path="/admin/settings"              element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Employee */}
      <Route element={<ProtectedRoutes allowedRoles={[ROLES.EMPLOYEE]} />}>
        <Route element={<EmployeeLayout />}>
          <Route path="/employee/dashboard"    element={<EmployeeDashboard />} />
          <Route path="/employee/projects"     element={<EmployeeProjects />} />
          <Route path="/employee/projects/:id" element={<ProjectDetail />} />
          <Route path="/employee/tasks"        element={<EmployeeTasks />} />
          <Route path="/employee/files"        element={<FilesPage />} />
          <Route path="/employee/chat"         element={<ChatPage />} />
          <Route path="/employee/hr"            element={<EmployeeHRPage />} />
          <Route path="/employee/settings"     element={<EmployeeSettings />} />
        </Route>
      </Route>

      {/* Client */}
      <Route element={<ProtectedRoutes allowedRoles={[ROLES.CLIENT]} />}>
        <Route element={<ClientLayout />}>
          <Route path="/client/dashboard"   element={<ClientDashboard />} />
          <Route path="/client/projects"    element={<ClientProjects />} />
          <Route path="/client/tasks"       element={<ClientTasks />} />
          <Route path="/client/account"     element={<ClientAccount />} />
          <Route path="/client/invoices"    element={<ClientInvoices />} />
          <Route path="/client/files"       element={<FilesPage />} />
          <Route path="/client/chat"        element={<ChatPage />} />
          <Route path="/client/reports"     element={<ClientReports />} />
        </Route>
      </Route>

      {/* Super Admin */}
      <Route element={<ProtectedRoutes allowedRoles={[ROLES.SUPER_ADMIN]} />}>
        <Route element={<SuperAdminLayout />}>
          <Route path="/superadmin/dashboard"     element={<SuperAdminDashboard />} />
          <Route path="/superadmin/tenants"       element={<TenantsPage />} />
          <Route path="/superadmin/analytics"     element={<AnalyticsPage />} />
          <Route path="/superadmin/settings"      element={<SuperAdminSettings />} />
          <Route path="/superadmin/subscriptions" element={<SubscriptionManager />} />
          <Route path="/superadmin/features"      element={<FeatureToggles />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
          <p className="font-display font-black text-6xl text-text-f">404</p>
          <p className="text-text-m text-lg">Page not found</p>
          <a href="/" className="text-accent hover:underline text-sm">Go home</a>
        </div>
      } />
    </Routes>
    </Suspense>
  )
}