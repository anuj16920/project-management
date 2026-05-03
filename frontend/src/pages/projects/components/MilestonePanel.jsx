import React, { useState } from 'react'
import { Plus, CheckCircle, Circle, Calendar, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { projectAPI } from '@/lib/projectAPI'
import { motion } from 'framer-motion'

export default function MilestonePanel({ projectId, milestones = [], onRefresh }) {
  const [adding,  setAdding]  = useState(false)
  const [title,   setTitle]   = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!title.trim()) return
    setLoading(true)
    try {
      await projectAPI.addMilestone(projectId, { title, due_date: dueDate || null })
      toast.success('Milestone added')
      setTitle(''); setDueDate(''); setAdding(false)
      onRefresh?.()
    } catch { toast.error('Failed to add milestone') }
    finally { setLoading(false) }
  }

  const handleToggle = async (milestoneId) => {
    try {
      await projectAPI.toggleMilestone(projectId, milestoneId)
      onRefresh?.()
    } catch { toast.error('Failed to update milestone') }
  }

  const done  = milestones.filter(m => m.is_done).length
  const total = milestones.length

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-base text-text-p">Milestones</h3>
          {total > 0 && <p className="text-text-f text-xs mt-0.5">{done}/{total} completed</p>}
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-accent text-xs hover:text-accent-h transition-colors">
          <Plus size={13} /> Add
        </button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-1.5 bg-surface2 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-success rounded-full transition-all duration-500"
            style={{ width:`${(done/total)*100}%` }} />
        </div>
      )}

      {/* Add form */}
      {adding && (
        <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
          className="mb-4 bg-surface2 border border-white/8 rounded-xl p-3 space-y-2">
          <input type="text" placeholder="Milestone title..." value={title}
            onChange={e => setTitle(e.target.value)} autoFocus
            className="w-full bg-transparent border-b border-white/10 text-text-p text-sm py-1 outline-none placeholder:text-text-f" />
          <div className="flex items-center gap-2">
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="flex-1 bg-transparent text-text-m text-xs outline-none" />
            <button onClick={handleAdd} disabled={loading || !title.trim()}
              className="bg-accent text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all hover:bg-accent-h">
              {loading ? '...' : 'Add'}
            </button>
            <button onClick={() => { setAdding(false); setTitle(''); setDueDate('') }}
              className="text-text-f text-xs hover:text-text-m transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Milestones list */}
      <div className="space-y-2">
        {milestones.length === 0 && !adding && (
          <p className="text-text-f text-sm text-center py-4">No milestones yet</p>
        )}
        {milestones.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
            className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${m.is_done?'opacity-60':''}`}>
            <button onClick={() => handleToggle(m.id)} className="flex-shrink-0 transition-transform hover:scale-110">
              {m.is_done
                ? <CheckCircle size={16} className="text-success" />
                : <Circle size={16} className="text-text-f" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${m.is_done?'text-text-f line-through':'text-text-p'}`}>{m.title}</p>
              {m.due_date && (
                <p className="text-text-f text-xs flex items-center gap-1 mt-0.5">
                  <Calendar size={10} />
                  {new Date(m.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}