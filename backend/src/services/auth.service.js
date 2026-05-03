import supabaseAdmin from '../config/supabase.admin.js'
import admin         from '../config/firebase.admin.js'
import { v4 as uuidv4 } from 'uuid'

// ─── Get profile by Firebase UID ─────────────────────────────────────────────
export const getProfileByUID = async (uid) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*, tenants(*)')
    .eq('firebase_uid', uid)
    .maybeSingle()
  // maybeSingle() returns null (not an error) when no row found
  if (error) throw error
  return data  // null if not found
}

// ─── Create tenant + first Admin on signup ────────────────────────────────────
export const createTenantAndAdmin = async ({ uid, email, fullName, companyName }) => {
  const tenantId = uuidv4()

  const { error: tErr } = await supabaseAdmin
    .from('tenants')
    .insert({ id: tenantId, name: companyName, owner_uid: uid })
  if (tErr) throw tErr

  const { data, error: pErr } = await supabaseAdmin
    .from('profiles')
    .insert({
      firebase_uid: uid,
      tenant_id:    tenantId,
      email,
      full_name:    fullName,
      role:         'admin',
    })
    .select()
    .single()
  if (pErr) throw pErr
  return data
}

// ─── Google upsert ────────────────────────────────────────────────────────────
export const upsertGoogleProfile = async ({ uid, email, fullName, photo }) => {
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('*, tenants(*)')
    .eq('firebase_uid', uid)
    .single()
  if (existing) return existing
  return createTenantAndAdmin({
    uid, email, fullName,
    companyName: `${fullName}'s Workspace`,
  })
}

// ─── Admin/SuperAdmin creates an Employee ─────────────────────────────────────
export const createEmployeeByAdmin = async ({
  creatorTenantId, creatorRole,
  email, fullName, department, phone, tempPassword,
}) => {
  // Only admin or super_admin allowed (double-check in service layer too)
  if (!['admin', 'super_admin'].includes(creatorRole))
    throw { message: 'Only admins can create employees', status: 403 }

  // 1. Create Firebase user
  const firebaseUser = await admin.auth().createUser({
    email,
    password:    tempPassword,
    displayName: fullName,
  })

  // 2. Create Supabase profile under same tenant
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      firebase_uid: firebaseUser.uid,
      tenant_id:    creatorTenantId,
      email,
      full_name:    fullName,
      role:         'employee',
      department:   department || null,
      phone:        phone      || null,
    })
    .select()
    .single()
  if (error) {
    // Rollback Firebase user if Supabase fails
    await admin.auth().deleteUser(firebaseUser.uid).catch(() => {})
    throw error
  }
  return data
}

// ─── Admin/SuperAdmin creates a Client ───────────────────────────────────────
export const createClientByAdmin = async ({
  creatorTenantId, creatorRole,
  email, fullName, phone, companyName, tempPassword,
}) => {
  if (!['admin', 'super_admin'].includes(creatorRole))
    throw { message: 'Only admins can create clients', status: 403 }

  const firebaseUser = await admin.auth().createUser({
    email,
    password:    tempPassword,
    displayName: fullName,
  })

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      firebase_uid: firebaseUser.uid,
      tenant_id:    creatorTenantId,
      email,
      full_name:    fullName,
      role:         'client',
      phone:        phone       || null,
      department:   companyName || null,   // reuse department col for client company
    })
    .select()
    .single()
  if (error) {
    await admin.auth().deleteUser(firebaseUser.uid).catch(() => {})
    throw error
  }
  return data
}

// ─── SuperAdmin creates another Admin ────────────────────────────────────────
export const createAdminBySuperAdmin = async ({
  creatorRole, targetTenantId,
  email, fullName, tempPassword,
}) => {
  if (creatorRole !== 'super_admin')
    throw { message: 'Only super admins can create admin accounts', status: 403 }

  const firebaseUser = await admin.auth().createUser({
    email,
    password:    tempPassword,
    displayName: fullName,
  })

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      firebase_uid: firebaseUser.uid,
      tenant_id:    targetTenantId,
      email,
      full_name:    fullName,
      role:         'admin',
    })
    .select()
    .single()
  if (error) {
    await admin.auth().deleteUser(firebaseUser.uid).catch(() => {})
    throw error
  }
  return data
}

// ─── List all users in a tenant ───────────────────────────────────────────────
export const listTenantUsers = async (tenantId, role = null) => {
  let query = supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (role) query = query.eq('role', role)

  const { data, error } = await query
  if (error) throw error
  return data
}

// ─── Deactivate user (super_admin only) ───────────────────────────────────────
export const deactivateUser = async ({ targetUid, creatorRole }) => {
  if (creatorRole !== 'super_admin')
    throw { message: 'Only super admins can deactivate users', status: 403 }

  await admin.auth().updateUser(targetUid, { disabled: true })

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ is_active: false })
    .eq('firebase_uid', targetUid)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Reset password (admin sends new temp password) ───────────────────────────
export const resetUserPassword = async ({ targetUid, newPassword, creatorRole }) => {
  if (!['admin', 'super_admin'].includes(creatorRole))
    throw { message: 'Only admins can reset passwords', status: 403 }

  await admin.auth().updateUser(targetUid, { password: newPassword })
  return { message: 'Password reset successfully' }
}