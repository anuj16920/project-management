import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { hrAPI } from '@/lib/hrAPI'
import { toast }  from 'sonner'

export default function DepartmentsManager() {
  const [depts,   setDepts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding,  setAdding]  = useState(false)
  const [showForm,setShowForm]= useState(false)

  const load = async () => {
    setLoading(true)
    try { const r = await hrAPI.listDepts(); setDepts(r.data.data || []) }
    catch { toast.error('Failed to load departments') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return toast.error('Enter a department name')
    setAdding(true)
    try {
      await hrAPI.createDept({ name: newName.trim() })
      toast.success('Department created ✅')
      setNewName('')
      setShowForm(false)
      load()
    } catch { toast.error('Failed') }
    finally { setAdding(false) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete department "${name}"?`)) return
    try { await hrAPI.deleteDept(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-accent"/>
          <h4 className="font-display font-bold text-sm text-text-p">Departments</h4>
          <span className="text-text-f text-xs bg-white/5 px-2 py-0.5 rounded-full">{depts.length}</span>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-accent text-xs hover:bg-accent/10 px-2.5 py-1.5 rounded-lg transition-all">
          <Plus size={12}/> Add
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
            exit={{ opacity:0, height:0 }} onSubmit={handleAdd}
            className="flex gap-2 mb-4 overflow-hidden">
            <input
              autoFocus
              type="text" placeholder="e.g. Engineering, Marketing..."
              value={newName} onChange={e => setNewName(e.target.value)}
              className="flex-1 bg-surface2 border border-white/10 focus:border-accent/40
                rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f"/>
            <button type="submit" disabled={adding}
              className="bg-accent hover:bg-accent-h text-white text-sm font-semibold px-4 py-2
                rounded-xl transition-all disabled:opacity-60 whitespace-nowrap">
              {adding ? '...' : 'Add'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Departments list */}
      {loading ? (
        <div className="space-y-2">
          {Array(3).fill(0).map((_,i) => (
            <div key={i} className="h-12 bg-surface2 rounded-xl animate-pulse"/>
          ))}
        </div>
      ) : depts.length === 0 ? (
        <p className="text-text-f text-sm text-center py-6">No departments yet</p>
      ) : (
        <div className="space-y-2">
          {depts.map((d, i) => (
            <motion.div key={d.id}
              initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between px-3 py-2.5
                bg-surface2 hover:bg-white/5 rounded-xl group transition-all">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-accent/60"/>
                <span className="text-text-p text-sm font-medium">{d.name}</span>
                <span className="text-text-f text-xs">
                  {d.headcount || 0} member{(d.headcount||0) !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => handleDelete(d.id, d.name)}
                className="w-7 h-7 rounded-lg hover:bg-red-400/10 flex items-center justify-center
                  text-text-f hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={12}/>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}