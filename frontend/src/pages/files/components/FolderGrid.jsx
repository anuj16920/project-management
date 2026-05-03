import React, { useState } from 'react'
import { Folder, MoreVertical, Trash2, Edit2, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { filesAPI } from '@/lib/filesAPI'
import { toast }    from 'sonner'

export default function FolderGrid({ folders, onOpen, onDelete, onRefresh }) {
  const [menuId,   setMenuId]   = useState(null)
  const [editId,   setEditId]   = useState(null)
  const [editName, setEditName] = useState('')

  const handleRename = async (id) => {
    if (!editName.trim()) return
    try {
      await filesAPI.renameFolder(id, editName.trim())
      toast.success('Renamed')
      setEditId(null)
      onRefresh?.()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {folders.map((folder, i) => (
        <motion.div key={folder.id}
          initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
          transition={{ delay: i * 0.04 }}
          className="relative group bg-surface border border-white/5 hover:border-white/10
            rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg"
          onClick={() => editId !== folder.id && onOpen(folder)}>

          {/* Folder icon */}
          <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center"
            style={{ background: `${folder.color}20` }}>
            <Folder size={20} style={{ color: folder.color }}/>
          </div>

          {/* Name */}
          {editId === folder.id ? (
            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleRename(folder.id)
                if (e.key === 'Escape') setEditId(null)
              }}
              onBlur={() => handleRename(folder.id)}
              onClick={e => e.stopPropagation()}
              className="w-full bg-surface2 border border-accent/40 rounded-lg px-2 py-1
                text-text-p text-xs outline-none"
            />
          ) : (
            <p className="text-text-p text-xs font-semibold truncate">{folder.name}</p>
          )}

          {/* Menu button */}
          <button
            onClick={e => { e.stopPropagation(); setMenuId(menuId === folder.id ? null : folder.id) }}
            className="absolute top-2 right-2 w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100
              hover:bg-white/5 flex items-center justify-center text-text-f transition-all">
            <MoreVertical size={12}/>
          </button>

          {/* Dropdown menu */}
          {menuId === folder.id && (
            <div
              className="absolute top-8 right-2 z-20 bg-surface2 border border-white/10
                rounded-xl shadow-2xl py-1 w-36"
              onClick={e => e.stopPropagation()}>
              <button
                onClick={() => { setEditId(folder.id); setEditName(folder.name); setMenuId(null) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-m hover:text-text-p hover:bg-white/4 transition-all">
                <Edit2 size={11}/> Rename
              </button>
              <button
                onClick={() => { onDelete(folder.id); setMenuId(null) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-400/5 transition-all">
                <Trash2 size={11}/> Delete
              </button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}