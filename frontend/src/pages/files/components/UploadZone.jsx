import React, { useCallback, useState } from 'react'
import { useDropzone }  from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { filesAPI } from '@/lib/filesAPI'
import { toast }    from 'sonner'

const MAX_SIZE = 50 * 1024 * 1024  // 50MB

export default function UploadZone({ folderId, projectId, taskId, onSuccess, className = '' }) {
  const [uploads, setUploads] = useState([])  // { id, name, progress, status, error }

  const updateUpload = (id, updates) =>
    setUploads(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u))

  const uploadFile = async (file) => {
    const id = crypto.randomUUID()
    setUploads(prev => [...prev, { id, name: file.name, progress: 0, status: 'uploading' }])

    try {
      await filesAPI.uploadFile(
        file,
        { folder_id: folderId, project_id: projectId, task_id: taskId },
        (progress) => updateUpload(id, { progress })
      )
      updateUpload(id, { status: 'done', progress: 100 })
      onSuccess?.()
      toast.success(`${file.name} uploaded! ✅`)
      // Remove from list after 3s
      setTimeout(() => setUploads(prev => prev.filter(u => u.id !== id)), 3000)
    } catch (err) {
      updateUpload(id, { status: 'error', error: err.message })
      toast.error(`Failed to upload ${file.name}`)
    }
  }

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    rejectedFiles.forEach(f => {
      const reason = f.errors[0]?.code === 'file-too-large'
        ? 'File exceeds 50MB limit'
        : f.errors[0]?.message
      toast.error(`${f.file.name}: ${reason}`)
    })
    acceptedFiles.forEach(uploadFile)
  }, [folderId, projectId, taskId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_SIZE,
    multiple: true,
  })

  return (
    <div className={className}>
      <div {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl px-6 py-5 text-center
          cursor-pointer transition-all
          ${isDragActive
            ? 'border-accent bg-accent/8 scale-[1.01]'
            : 'border-white/10 hover:border-accent/40 hover:bg-white/2'}`}>
        <input {...getInputProps()}/>
        <Upload size={20} className={`mx-auto mb-2 transition-all
          ${isDragActive ? 'text-accent scale-110' : 'text-text-f'}`}/>
        <p className="text-text-m text-sm font-medium">
          {isDragActive ? 'Drop files here!' : 'Drop files or click to upload'}
        </p>
        <p className="text-text-f text-xs mt-1">Any file type · Max 50MB per file</p>
      </div>

      {/* Upload progress list */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
            exit={{ opacity:0, height:0 }}
            className="mt-3 space-y-2">
            {uploads.map(u => (
              <motion.div key={u.id}
                initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                exit={{ opacity:0, x:10 }}
                className="flex items-center gap-3 bg-surface border border-white/5 rounded-xl px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-text-p text-xs font-medium truncate">{u.name}</p>
                    <span className="text-text-f text-xs flex-shrink-0 ml-2">
                      {u.status === 'uploading' ? `${u.progress}%` : ''}
                    </span>
                  </div>
                  {u.status === 'uploading' && (
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all duration-300"
                        style={{ width: `${u.progress}%` }}/>
                    </div>
                  )}
                  {u.status === 'error' && (
                    <p className="text-red-400 text-xs">{u.error}</p>
                  )}
                </div>
                {u.status === 'done'    && <CheckCircle size={14} className="text-success flex-shrink-0"/>}
                {u.status === 'error'   && <AlertCircle size={14} className="text-red-400 flex-shrink-0"/>}
                {u.status !== 'uploading' && (
                  <button onClick={() => setUploads(prev => prev.filter(up => up.id !== u.id))}
                    className="text-text-f hover:text-text-m transition-all">
                    <X size={12}/>
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}