import React, { useState, useEffect } from 'react'
import { X, CheckSquare, Calendar, Clock, User, Flag, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { taskAPI }    from '@/lib/taskAPI'
import { projectAPI } from '@/lib/projectAPI'

const STATUSES  = ['todo','in_progress','review','done']
const PRIORITIES= ['low','medium','high','urgent']

export default function CreateTaskModal({ onClose, onSuccess, defaultStatus = 'todo', projectId = '' }) {
  const [form, setForm] = useState({
    title:'', description:'', project_id: projectId, assignee_uid:'',
    priority:'medium', status: defaultStatus,
    due_date:'', estimated_hrs:'', label:'',
  })
  const [projects, setProjects] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    projectAPI.list({}).then(r => setProjects(r.data.data || [])).catch(() => {})
  }, [])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Task title is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        ...form,
        project_id:    form.project_id    || null,
        assignee_uid:  form.assignee_uid  || null,
        estimated_hrs: form.estimated_hrs ? parseFloat(form.estimated_hrs) : null,
        due_date:      form.due_date      || null,
      }
      const res = await taskAPI.create(payload)
      toast.success('Task created! ✅')
      onSuccess?.(res.data.data)
      onClose?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
          className="relative z-10 w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-card-h overflow-hidden max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-surface z-10">
            <div className="flex items-center gap-2">
              <CheckSquare size={18} className="text-accent" />
              <h2 className="font-display font-bold text-lg text-text-p">New Task</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-m transition-all">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Title */}
            <div>
              <label className="text-text-m text-xs font-medium block mb-1.5">Task Title *</label>
              <input type="text" placeholder="What needs to be done?"
                value={form.title} onChange={e => set('title', e.target.value)} autoFocus
                className={`w-full bg-surface2 border ${errors.title?'border-error/60':'border-white/10'} focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
              {errors.title && <p className="text-error text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="text-text-m text-xs font-medium block mb-1.5">Description</label>
              <textarea rows={2} placeholder="Add details..."
                value={form.description} onChange={e => set('description', e.target.value)}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none resize-none transition-all placeholder:text-text-f" />
            </div>

            {/* Project + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">Project</label>
                <select value={form.project_id} onChange={e => set('project_id', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none">
                  <option value="" className="bg-surface">No Project</option>
                  {projects.map(p => <option key={p.id} value={p.id} className="bg-surface">{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">
                  <Flag size={11} className="inline mr-1" />Status
                </label>
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none capitalize">
                  {STATUSES.map(s => <option key={s} value={s} className="bg-surface capitalize">{s.replace('_',' ')}</option>)}
                </select>
              </div>
            </div>

            {/* Priority + Label */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">Priority</label>
                <select value={form.priority} onChange={e => set('priority', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none capitalize">
                  {PRIORITIES.map(p => <option key={p} value={p} className="bg-surface capitalize">{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">
                  <Tag size={11} className="inline mr-1" />Label
                </label>
                <input type="text" placeholder="bug, feature..."
                  value={form.label} onChange={e => set('label', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none placeholder:text-text-f" />
              </div>
            </div>

            {/* Due Date + Estimate */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">
                  <Calendar size={11} className="inline mr-1" />Due Date
                </label>
                <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none" />
              </div>
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">
                  <Clock size={11} className="inline mr-1" />Estimate (hrs)
                </label>
                <input type="number" step="0.5" placeholder="4"
                  value={form.estimated_hrs} onChange={e => set('estimated_hrs', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none placeholder:text-text-f" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 border border-white/10 hover:border-white/20 text-text-m text-sm font-medium py-2.5 rounded-xl transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-accent hover:bg-accent-h text-white text-sm font-semibold py-2.5 rounded-xl transition-all glow-accent disabled:opacity-60">
                {loading
                  ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</span>
                  : '✅ Create Task'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}