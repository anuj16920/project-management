import React, { useState } from 'react'
import {
  FileText, Image, Film, Music, Archive,
  Star, Download, Trash2, Eye, MoreVertical,
} from 'lucide-react'
import { motion } from 'framer-motion'

const FILE_ICONS = {
  image: { icon: Image,    color: '#10B981', bg: '#10B98115' },
  pdf:   { icon: FileText, color: '#EF4444', bg: '#EF444415' },
  doc:   { icon: FileText, color: '#3B82F6', bg: '#3B82F615' },
  excel: { icon: FileText, color: '#10B981', bg: '#10B98115' },
  ppt:   { icon: FileText, color: '#F59E0B', bg: '#F59E0B15' },
  video: { icon: Film,     color: '#8B5CF6', bg: '#8B5CF615' },
  audio: { icon: Music,    color: '#EC4899', bg: '#EC489915' },
  zip:   { icon: Archive,  color: '#F97316', bg: '#F9731615' },
  text:  { icon: FileText, color: '#6B7280', bg: '#6B728015' },
  other: { icon: FileText, color: '#6366F1', bg: '#6366F115' },
}

export default function FileGrid({ files, onPreview, onDelete, onStar, onDownload }) {
  const [menuId, setMenuId] = useState(null)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {files.map((file, i) => {
        const meta    = FILE_ICONS[file.file_type] || FILE_ICONS.other
        const Icon    = meta.icon
        const isImage = file.file_type === 'image'

        return (
          <motion.div key={file.id}
            initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
            transition={{ delay: i * 0.03 }}
            className="relative group bg-surface border border-white/5 hover:border-white/10
              rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg"
            onClick={() => onPreview(file)}>

            {/* Thumbnail / Icon */}
            <div className="h-28 flex items-center justify-center"
              style={{ background: meta.bg }}>
              {isImage && file.public_url ? (
                <img
                  src={file.public_url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={e => { e.target.style.display='none' }}
                />
              ) : (
                <Icon size={32} style={{ color: meta.color }}/>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-text-p text-xs font-semibold truncate">{file.name}</p>
              <p className="text-text-f text-xs mt-0.5">{file.size_formatted}</p>
            </div>

            {/* Star indicator */}
            {file.is_starred && (
              <div className="absolute top-2 left-2">
                <Star size={12} className="text-yellow-400 fill-yellow-400"/>
              </div>
            )}

            {/* Hover actions */}
            <div className="absolute top-2 right-2 flex gap-1
              opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={e => { e.stopPropagation(); onStar(file.id) }}
                className="w-6 h-6 rounded-lg bg-black/40 backdrop-blur-sm flex items-center
                  justify-center text-white/70 hover:text-yellow-400 transition-all">
                <Star size={11} className={file.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}/>
              </button>
              <button onClick={e => { e.stopPropagation(); onDownload(file) }}
                className="w-6 h-6 rounded-lg bg-black/40 backdrop-blur-sm flex items-center
                  justify-center text-white/70 hover:text-accent transition-all">
                <Download size={11}/>
              </button>
              <button onClick={e => { e.stopPropagation(); onDelete(file.id) }}
                className="w-6 h-6 rounded-lg bg-black/40 backdrop-blur-sm flex items-center
                  justify-center text-white/70 hover:text-red-400 transition-all">
                <Trash2 size={11}/>
              </button>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}