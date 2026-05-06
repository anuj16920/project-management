import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROLES, ROUTES } from '@/lib/constants'

export default function PublicRoutes() {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (user && profile) {
    const redirect = {
      [ROLES.SUPER_ADMIN]: ROUTES.SUPER_DASH,
      [ROLES.ADMIN]:       ROUTES.ADMIN_DASH,
      [ROLES.EMPLOYEE]:    ROUTES.EMPLOYEE_DASH,
      [ROLES.CLIENT]:      ROUTES.CLIENT_DASH,
      [ROLES.HR]:          ROUTES.HR_DASH,
    }
    return <Navigate to={redirect[profile.role] || ROUTES.ADMIN_DASH} replace />
  }

  return <Outlet />
}