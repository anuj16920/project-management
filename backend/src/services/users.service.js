import admin from '../config/firebase.admin.js'
import supabaseAdmin from '../config/supabase.admin.js'

// List all users in tenant
export const listUsers = async (tenantId, filters = {}) => {
  let query = supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (filters.role) query = query.eq('role', filters.role)
  if (filters.search) query = query.ilike('full_name', `%${filters.search}%`)

  const { data, error } = await query
  if (error) throw error
  return data
}

// Create employee account
export const createEmployee = async (tenantId, { email, fullName, password, phone, department }) => {
  // Create Firebase user
  const firebaseUser = await admin.auth().createUser({
    email,
    password,
    displayName: fullName,
  })

  // Create profile in Supabase
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      firebase_uid: firebaseUser.uid,
      tenant_id: tenantId,
      email,
      full_name: fullName,
      phone,
      department,
      role: 'employee',
    })
    .select()
    .single()

  if (error) {
    // Rollback Firebase user if Supabase insert fails
    await admin.auth().deleteUser(firebaseUser.uid)
    throw error
  }

  return data
}

// Create client account
export const createClient = async (tenantId, { email, fullName, password, phone, companyName }) => {
  // Create Firebase user
  const firebaseUser = await admin.auth().createUser({
    email,
    password,
    displayName: fullName,
  })

  // Create profile in Supabase
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      firebase_uid: firebaseUser.uid,
      tenant_id: tenantId,
      email,
      full_name: fullName,
      phone,
      company_name: companyName,
      role: 'client',
    })
    .select()
    .single()

  if (error) {
    // Rollback Firebase user if Supabase insert fails
    await admin.auth().deleteUser(firebaseUser.uid)
    throw error
  }

  return data
}

// Create HR staff account
export const createHR = async (tenantId, { email, fullName, password, phone }) => {
  const firebaseUser = await admin.auth().createUser({
    email,
    password,
    displayName: fullName,
  })

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      firebase_uid: firebaseUser.uid,
      tenant_id: tenantId,
      email,
      full_name: fullName,
      phone,
      role: 'hr',
    })
    .select()
    .single()

  if (error) {
    await admin.auth().deleteUser(firebaseUser.uid)
    throw error
  }

  return data
}

// Delete user
export const deleteUser = async (userId) => {
  // Get user to find Firebase UID
  const { data: user } = await supabaseAdmin
    .from('profiles')
    .select('firebase_uid')
    .eq('id', userId)
    .single()

  if (!user) throw new Error('User not found')

  // Delete from Firebase
  await admin.auth().deleteUser(user.firebase_uid)

  // Delete from Supabase
  const { error } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) throw error
  return { success: true }
}
