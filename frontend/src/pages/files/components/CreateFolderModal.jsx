import React, { useState } from 'react'
import { X, Folder } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { filesAPI } from '@/lib/filesAPI'
import { toast }    from 'sonner'

const COLORS = [
  '#6366F1','#10B981','#F59E0B','#EF4444',
  '#3B82F6','#8B5CF6','#EC4899','#F97316',
]

export default function CreateFolderModal({ parentId, onClose, onSuccess }) {
  const [name,    setName]    = useState('')
  const [color,   setColor]   = useState('#6366F1')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Folder name required')
    setLoading(true)
    try {
      await filesAPI.createFolder({ name: name.trim(), color, parent_id: parentId })
      toast.success('Folder created! 📁')
      onSuccess?.()
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
        <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
          className="relative z-10 w-full max-w-sm bg-surface border border-white/10 rounded-2xl shadow-2xl">

          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="font-display font-bold text-lg text-accent">New Folder</h2>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-m">
              <X size={16}/>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Folder preview */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: `${color}20` }}>
                <Folder size={32} style={{ color }}/>
              </div>
            </div>

            <div>
              <label className="text-text-f text-xs block mb-1.5">Folder Name *</label>
              <input autoFocus type="text" placeholder="e.g. Design Assets"
                value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/40
                  rounded-xl px-3 py-2.5 text-text-p text-sm outline-none placeholder:text-text-f"/>
            </div>

            <div>
              <label className="text-text-f text-xs block mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-xl transition-all
                      ${color === c ? 'scale-110 ring-2 ring-white/30 ring-offset-1 ring-offset-surface' : 'hover:scale-105'}`}
                    style={{ background: c }}/>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 border border-white/10 hover:border-white/20 text-text-m
                  text-sm font-medium py-2.5 rounded-xl transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-accent hover:bg-accent-h text-white text-sm font-semibold
                  py-2.5 rounded-xl transition-all disabled:opacity-60">
                {loading ? 'Creating...' : '📁 Create Folder'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}