import React from 'react'
import {
  FileText, Image, Film, Music, Archive,
  Star, Download, Trash2, Eye,
} from 'lucide-react'
import { motion } from 'framer-motion'

const FILE_ICONS = {
  image: { icon: Image,    color: '#10B981' },
  pdf:   { icon: FileText, color: '#EF4444' },
  doc:   { icon: FileText, color: '#3B82F6' },
  video: { icon: Film,     color: '#8B5CF6' },
  audio: { icon: Music,    color: '#EC4899' },
  zip:   { icon: Archive,  color: '#F97316' },
  other: { icon: FileText, color: '#6366F1' },
}

export default function FileList({ files, onPreview, onDelete, onStar, onDownload }) {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            {['Name','Size','Type','Uploaded By','Date',''].map(h => (
              <th key={h} className="text-left text-text-f text-xs font-medium
                uppercase tracking-wider px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {files.map((file, i) => {
            const meta = FILE_ICONS[file.file_type] || FILE_ICONS.other
            const Icon = meta.icon
            return (
              <motion.tr key={file.id}
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                transition={{ delay: i * 0.02 }}
                className="hover:bg-white/2 cursor-pointer transition-colors group"
                onClick={() => onPreview(file)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Icon size={16} style={{ color: meta.color }} className="flex-shrink-0"/>
                    <div className="min-w-0">
                      <p className="text-text-p text-sm font-medium truncate max-w-48">{file.name}</p>
                      {file.original_name !== file.name && (
                        <p className="text-text-f text-xs truncate">{file.original_name}</p>
                      )}
                    </div>
                    {file.is_starred && <Star size={11} className="text-yellow-400 fill-yellow-400 flex-shrink-0"/>}
                  </div>
                </td>
                <td className="px-4 py-3 text-text-m text-sm tabular-nums">
                  {file.size_formatted}
                </td>
                <td className="px-4 py-3">
                  <span className="text-text-f text-xs capitalize bg-white/5 px-2 py-0.5 rounded-full">
                    {file.file_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-m text-sm">
                  {file.uploader?.full_name || '—'}
                </td>
                <td className="px-4 py-3 text-text-m text-sm tabular-nums">
                  {new Date(file.created_at).toLocaleDateString('en-IN',
                    { day:'numeric', month:'short', year:'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={e => e.stopPropagation()}>
                    <button onClick={() => onStar(file.id)}
                      className="w-7 h-7 rounded-lg hover:bg-yellow-400/10 flex items-center
                        justify-center text-text-f hover:text-yellow-400 transition-all">
                      <Star size={13} className={file.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}/>
                    </button>
                    <button onClick={() => onDownload(file)}
                      className="w-7 h-7 rounded-lg hover:bg-accent/10 flex items-center
                        justify-center text-text-f hover:text-accent transition-all">
                      <Download size={13}/>
                    </button>
                    <button onClick={() => onPreview(file)}
                      className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center
                        justify-center text-text-f hover:text-text-m transition-all">
                      <Eye size={13}/>
                    </button>
                    <button onClick={() => onDelete(file.id)}
                      className="w-7 h-7 rounded-lg hover:bg-red-400/10 flex items-center
                        justify-center text-text-f hover:text-red-400 transition-all">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}