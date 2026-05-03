import supabaseAdmin from '../config/supabase.admin.js'
import { v4 as uuidv4 } from 'uuid'

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getFileType = (mimeType) => {
  if (!mimeType) return 'other'
  if (mimeType.startsWith('image/'))  return 'image'
  if (mimeType.startsWith('video/'))  return 'video'
  if (mimeType.startsWith('audio/'))  return 'audio'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc'
  if (mimeType.includes('excel') || mimeType.includes('sheet'))   return 'excel'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'ppt'
  if (mimeType.includes('zip'))       return 'zip'
  if (mimeType.startsWith('text/'))   return 'text'
  return 'other'
}

const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B','KB','MB','GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const getProfiles = async (uids) => {
  if (!uids?.length) return {}
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('firebase_uid, full_name, avatar_url')
    .in('firebase_uid', uids)
  return Object.fromEntries((data||[]).map(p => [p.firebase_uid, p]))
}

// ─── FOLDERS ──────────────────────────────────────────────────────────────────
export const listFolders = async (tenantId, parentId = null) => {
  let q = supabaseAdmin
    .from('file_folders')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name')

  if (parentId) q = q.eq('parent_id', parentId)
  else          q = q.is('parent_id', null)

  const { data, error } = await q
  if (error) throw error
  return data || []
}

export const createFolder = async (tenantId, uid, payload) => {
  const { name, parent_id, color, project_id } = payload
  const { data, error } = await supabaseAdmin
    .from('file_folders')
    .insert({
      tenant_id:  tenantId,
      name,
      parent_id:  parent_id || null,
      color:      color || '#6366F1',
      project_id: project_id || null,
      created_by: uid,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export const renameFolder = async (tenantId, id, name) => {
  const { data, error } = await supabaseAdmin
    .from('file_folders')
    .update({ name })
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteFolder = async (tenantId, id) => {
  // Delete all files in folder from storage first
  const { data: folderFiles } = await supabaseAdmin
    .from('files')
    .select('storage_path')
    .eq('folder_id', id)

  if (folderFiles?.length) {
    const paths = folderFiles.map(f => f.storage_path)
    await supabaseAdmin.storage.from('files').remove(paths)
  }

  const { error } = await supabaseAdmin
    .from('file_folders')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', id)
  if (error) throw error
}

// ─── FILES ────────────────────────────────────────────────────────────────────
export const listFiles = async (tenantId, filters = {}) => {
  let q = supabaseAdmin
    .from('files')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (filters.folder_id)  q = q.eq('folder_id',  filters.folder_id)
  if (filters.project_id) q = q.eq('project_id', filters.project_id)
  if (filters.task_id)    q = q.eq('task_id',     filters.task_id)
  if (filters.starred)    q = q.eq('is_starred',  true)
  if (filters.type) {
    const mimeMap = {
      image:  ['image/jpeg','image/png','image/gif','image/webp'],
      pdf:    ['application/pdf'],
      doc:    ['application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      video:  ['video/mp4','video/quicktime'],
    }
    if (mimeMap[filters.type]) q = q.in('mime_type', mimeMap[filters.type])
  }
  if (filters.search) q = q.ilike('name', `%${filters.search}%`)
  if (!filters.folder_id && !filters.project_id && !filters.task_id && !filters.starred && !filters.search) {
    q = q.is('folder_id', null)
  }

  const { data, error } = await q
  if (error) throw error
  if (!data?.length) return []

  // Fetch uploader profiles
  const uids       = [...new Set(data.map(f => f.uploaded_by))]
  const profileMap = await getProfiles(uids)

  return data.map(f => ({
    ...f,
    file_type:     getFileType(f.mime_type),
    size_formatted: formatBytes(f.size),
    uploader:      profileMap[f.uploaded_by] || null,
  }))
}

export const getFile = async (tenantId, id) => {
  const { data, error } = await supabaseAdmin
    .from('files')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .single()
  if (error) throw error

  const profileMap = await getProfiles([data.uploaded_by])
  return {
    ...data,
    file_type:      getFileType(data.mime_type),
    size_formatted: formatBytes(data.size),
    uploader:       profileMap[data.uploaded_by] || null,
  }
}

export const getUploadUrl = async (tenantId, uid, { fileName, mimeType, folderId, projectId, taskId }) => {
  const ext          = fileName.split('.').pop()
  const storagePath  = `${tenantId}/${uuidv4()}.${ext}`

  // Generate signed upload URL (valid 60 seconds)
  const { data, error } = await supabaseAdmin.storage
    .from('files')
    .createSignedUploadUrl(storagePath)
  if (error) throw error

  return {
    upload_url:   data.signedUrl,
    storage_path: storagePath,
    token:        data.token,
  }
}

export const confirmUpload = async (tenantId, uid, payload) => {
  const {
    storage_path, original_name, mime_type,
    size, folder_id, project_id, task_id,
    description, tags,
  } = payload

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from('files')
    .getPublicUrl(storage_path)

  const name = original_name.replace(/\.[^/.]+$/, '')

  const { data, error } = await supabaseAdmin
    .from('files')
    .insert({
      tenant_id:     tenantId,
      folder_id:     folder_id   || null,
      project_id:    project_id  || null,
      task_id:       task_id     || null,
      name,
      original_name,
      mime_type,
      size:          size || 0,
      storage_path,
      public_url:    urlData?.publicUrl || null,
      uploaded_by:   uid,
      description:   description || null,
      tags:          tags || [],
    })
    .select()
    .single()
  if (error) throw error

  const profileMap = await getProfiles([uid])
  return {
    ...data,
    file_type:      getFileType(data.mime_type),
    size_formatted: formatBytes(data.size),
    uploader:       profileMap[uid] || null,
  }
}

export const getDownloadUrl = async (tenantId, id) => {
  const { data: file, error } = await supabaseAdmin
    .from('files')
    .select('storage_path, original_name')
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .single()
  if (error) throw error

  // Increment download count
  await supabaseAdmin
    .from('files')
    .update({ download_count: supabaseAdmin.raw('download_count + 1') })
    .eq('id', id)

  const { data, error: signErr } = await supabaseAdmin.storage
    .from('files')
    .createSignedUrl(file.storage_path, 300) // 5 min expiry
  if (signErr) throw signErr

  return { url: data.signedUrl, file_name: file.original_name }
}

export const toggleStar = async (tenantId, id) => {
  const { data: current } = await supabaseAdmin
    .from('files')
    .select('is_starred')
    .eq('id', id)
    .single()

  const { data, error } = await supabaseAdmin
    .from('files')
    .update({ is_starred: !current?.is_starred })
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateFile = async (tenantId, id, payload) => {
  const { name, description, tags, folder_id } = payload
  const { data, error } = await supabaseAdmin
    .from('files')
    .update({ name, description, tags, folder_id, updated_at: new Date() })
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteFile = async (tenantId, id) => {
  const { data: file } = await supabaseAdmin
    .from('files')
    .select('storage_path')
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .single()

  if (file?.storage_path) {
    await supabaseAdmin.storage.from('files').remove([file.storage_path])
  }

  const { error } = await supabaseAdmin
    .from('files')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', id)
  if (error) throw error
}

export const getStorageStats = async (tenantId) => {
  const { data, error } = await supabaseAdmin
    .from('files')
    .select('size, mime_type')
    .eq('tenant_id', tenantId)
  if (error) throw error

  const totalSize  = data?.reduce((s, f) => s + (f.size || 0), 0) || 0
  const totalFiles = data?.length || 0

  const byType = data?.reduce((acc, f) => {
    const type = getFileType(f.mime_type)
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  return {
    total_size:            totalSize,
    total_size_formatted:  formatBytes(totalSize),
    total_files:           totalFiles,
    by_type:               byType || {},
    storage_limit:         10 * 1024 * 1024 * 1024, // 10GB
    storage_used_percent:  Math.round((totalSize / (10 * 1024 * 1024 * 1024)) * 100),
  }
}