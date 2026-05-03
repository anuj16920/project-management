import { useAuth } from './useAuth'
import { ROLES }   from '@/lib/constants'

export function useRoleGuard() {
  const { profile } = useAuth()
  const role        = profile?.role

  return {
    isAdmin:      role === ROLES.ADMIN,
    isSuperAdmin: role === ROLES.SUPER_ADMIN,
    isEmployee:   role === ROLES.EMPLOYEE,
    isClient:     role === ROLES.CLIENT,

    // ✅ Can create employees or clients
    canCreateStaff: ['admin', 'super_admin'].includes(role),

    // ✅ Can create admins
    canCreateAdmin: role === ROLES.SUPER_ADMIN,

    // ✅ Can deactivate / delete users
    canDeleteUser:  role === ROLES.SUPER_ADMIN,

    // ✅ Can reset passwords
    canResetPassword: ['admin', 'super_admin'].includes(role),
  }
}