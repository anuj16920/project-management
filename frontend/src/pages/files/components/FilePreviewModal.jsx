import React, { useState } from 'react'
import {
  X, Download, Trash2, Star, FileText,
  Image, Film, Music, Archive, ExternalLink,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const FILE_ICONS = {
  image: { icon: Image,    color: '#10B981' },
  pdf:   { icon: FileText, color: '#EF4444' },
  doc:   { icon: FileText, color: '#3B82F6' },
  video: { icon: Film,     color: '#8B5CF6' },
  audio: { icon: Music,    color: '#EC4899' },
  zip:   { icon: Archive,  color: '#F97316' },
  other: { icon: FileText, color: '#6366F1' },
}

export default function FilePreviewModal({ file, onClose, onDelete, onDownload }) {
  const [starred, setStarred] = useState(file.is_starred)
  const meta = FILE_ICONS[file.file_type] || FILE_ICONS.other
  const Icon = meta.icon

  const renderPreview = () => {
    if (file.file_type === 'image' && file.public_url) {
      return (
        <img
          src={file.public_url}
          alt={file.name}
          className="max-w-full max-h-[60vh] object-contain rounded-xl"
        />
      )
    }
    if (file.file_type === 'pdf' && file.public_url) {
      return (
        <iframe
          src={file.public_url}
          className="w-full h-[60vh] rounded-xl border border-white/5"
          title={file.name}
        />
      )
    }
    if (file.file_type === 'video' && file.public_url) {
      return (
        <video
          src={file.public_url}
          controls
          className="max-w-full max-h-[60vh] rounded-xl"
        />
      )
    }
    if (file.file_type === 'audio' && file.public_url) {
      return (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-24 h-24 rounded-2xl bg-pink-500/15 flex items-center justify-center">
            <Music size={40} className="text-pink-400"/>
          </div>
          <audio src={file.public_url} controls className="w-full mt-2"/>
        </div>
      )
    }
    // Default — no preview available
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: `${meta.color}20` }}>
          <Icon size={40} style={{ color: meta.color }}/>
        </div>
        <p className="text-text-m text-sm">Preview not available</p>
        <button onClick={() => onDownload(file)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-h text-white
            text-sm font-medium px-4 py-2.5 rounded-xl transition-all">
          <Download size={14}/> Download to view
        </button>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}/>
        <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
          className="relative z-10 w-full max-w-3xl bg-surface border border-white/10
            rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${meta.color}20` }}>
              <Icon size={16} style={{ color: meta.color }}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-p text-sm font-bold truncate">{file.name}</p>
              <p className="text-text-f text-xs">{file.size_formatted} · {file.file_type?.toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => { setStarred(s => !s); /* onStar handled */ }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all
                  ${starred
                    ? 'bg-yellow-400/15 text-yellow-400'
                    : 'hover:bg-white/5 text-text-f hover:text-yellow-400'}`}>
                <Star size={15} className={starred ? 'fill-yellow-400' : ''}/>
              </button>
              <button onClick={() => onDownload(file)}
                className="w-8 h-8 rounded-xl hover:bg-accent/10 flex items-center
                  justify-center text-text-f hover:text-accent transition-all">
                <Download size={15}/>
              </button>
              {file.public_url && (
                <a href={file.public_url} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl hover:bg-white/5 flex items-center
                    justify-center text-text-f hover:text-text-m transition-all">
                  <ExternalLink size={15}/>
                </a>
              )}
              <button onClick={() => onDelete(file.id)}
                className="w-8 h-8 rounded-xl hover:bg-red-400/10 flex items-center
                  justify-center text-text-f hover:text-red-400 transition-all">
                <Trash2 size={15}/>
              </button>
              <button onClick={onClose}
                className="w-8 h-8 rounded-xl hover:bg-white/5 flex items-center
                  justify-center text-text-m transition-all">
                <X size={15}/>
              </button>
            </div>
          </div>

          {/* Preview area */}
          <div className="p-5 flex justify-center bg-[#0d0c13]">
            {renderPreview()}
          </div>

          {/* File meta */}
          <div className="grid grid-cols-3 gap-4 px-5 py-4 border-t border-white/5">
            {[
              { label:'Uploaded by', value: file.uploader?.full_name || '—'   },
              { label:'Upload date', value: new Date(file.created_at).toLocaleDateString('en-IN',{ day:'numeric',month:'long',year:'numeric' }) },
              { label:'Downloads',   value: file.download_count || 0          },
            ].map(m => (
              <div key={m.label}>
                <p className="text-text-f text-xs mb-0.5">{m.label}</p>
                <p className="text-text-p text-sm font-medium">{m.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}