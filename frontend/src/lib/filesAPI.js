import api    from './api'
import axios  from 'axios'

export const filesAPI = {
  // Stats
  stats:          ()             => api.get('/files/stats'),

  // Folders
  listFolders:    (parentId)     => api.get('/files/folders', { params: { parent_id: parentId } }),
  createFolder:   (data)         => api.post('/files/folders', data),
  renameFolder:   (id, name)     => api.patch(`/files/folders/${id}`, { name }),
  deleteFolder:   (id)           => api.delete(`/files/folders/${id}`),

  // Files
  listFiles:      (params)       => api.get('/files', { params }),
  getFile:        (id)           => api.get(`/files/${id}`),
  updateFile:     (id, data)     => api.patch(`/files/${id}`, data),
  toggleStar:     (id)           => api.patch(`/files/${id}/star`),
  deleteFile:     (id)           => api.delete(`/files/${id}`),
  getDownloadUrl: (id)           => api.get(`/files/${id}/download`),

  // Upload — 2 step: get signed URL → upload directly to Supabase → confirm
  uploadFile: async (file, meta = {}, onProgress) => {
    // Step 1 — get signed upload URL
    const { data: res } = await api.post('/files/upload-url', {
      fileName:  file.name,
      mimeType:  file.type,
      ...meta,
    })
    const { upload_url, storage_path } = res.data

    // Step 2 — upload directly to Supabase Storage
    await axios.put(upload_url, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
      },
    })

    // Step 3 — confirm upload & save metadata
    const { data: confirmed } = await api.post('/files/confirm-upload', {
      storage_path,
      original_name: file.name,
      mime_type:     file.type,
      size:          file.size,
      ...meta,
    })
    return confirmed.data
  },
}