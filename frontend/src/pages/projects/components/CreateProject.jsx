import React, { useState } from 'react'
import { X, FolderPlus, Calendar, DollarSign, Flag, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { projectAPI } from '@/lib/projectAPI'

const COLORS   = ['#6366F1','#06B6D4','#10B981','#F59E0B','#EF4444','#EC4899','#8B5CF6','#F97316']
const STATUSES = ['active','on_hold']
const PRIORITY = ['low','medium','high','urgent']

export default function CreateProjectModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name:'', description:'', status:'active', priority:'medium',
    start_date:'', due_date:'', budget:'', tags:'', cover_color:'#6366F1',
  })
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Project name is required'
    if (form.start_date && form.due_date && new Date(form.due_date) < new Date(form.start_date))
      e.due_date = 'Due date must be after start date'
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
        budget: form.budget ? parseFloat(form.budget) : null,
        tags:   form.tags   ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        start_date: form.start_date || null,
        due_date:   form.due_date   || null,
      }
      const res = await projectAPI.create(payload)
      toast.success('Project created! 🚀')
      onSuccess?.(res.data.data)
      onClose?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create project')
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
              <FolderPlus size={18} className="text-accent" />
              <h2 className="font-display font-bold text-lg text-text-p">New Project</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-m transition-all">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Color picker */}
            <div>
              <label className="text-text-m text-xs font-medium block mb-2">Project Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => set('cover_color', c)}
                    className={`w-7 h-7 rounded-lg transition-all ${form.cover_color===c?'scale-110 ring-2 ring-white/40 ring-offset-1 ring-offset-surface':''}`}
                    style={{ background:c }} />
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-text-m text-xs font-medium block mb-1.5">Project Name *</label>
              <input type="text" placeholder="e.g. Mobile App Redesign"
                value={form.name} onChange={e => set('name', e.target.value)}
                className={`w-full bg-surface2 border ${errors.name?'border-error/60':'border-white/10'} focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
              {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="text-text-m text-xs font-medium block mb-1.5">Description</label>
              <textarea rows={3} placeholder="What is this project about?"
                value={form.description} onChange={e => set('description', e.target.value)}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f resize-none" />
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">
                  <Flag size={11} className="inline mr-1" />Status
                </label>
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none capitalize">
                  {STATUSES.map(s => <option key={s} value={s} className="bg-surface capitalize">{s.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">
                  <Flag size={11} className="inline mr-1" />Priority
                </label>
                <select value={form.priority} onChange={e => set('priority', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none capitalize">
                  {PRIORITY.map(p => <option key={p} value={p} className="bg-surface capitalize">{p}</option>)}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">
                  <Calendar size={11} className="inline mr-1" />Start Date
                </label>
                <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none" />
              </div>
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">
                  <Calendar size={11} className="inline mr-1" />Due Date
                </label>
                <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)}
                  className={`w-full bg-surface2 border ${errors.due_date?'border-error/60':'border-white/10'} focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none`} />
                {errors.due_date && <p className="text-error text-xs mt-1">{errors.due_date}</p>}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="text-text-m text-xs font-medium block mb-1.5">
                <DollarSign size={11} className="inline mr-1" />Budget (optional)
              </label>
              <input type="number" placeholder="50000"
                value={form.budget} onChange={e => set('budget', e.target.value)}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none placeholder:text-text-f" />
            </div>

            {/* Tags */}
            <div>
              <label className="text-text-m text-xs font-medium block mb-1.5">
                <Tag size={11} className="inline mr-1" />Tags (comma separated)
              </label>
              <input type="text" placeholder="design, frontend, api"
                value={form.tags} onChange={e => set('tags', e.target.value)}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none placeholder:text-text-f" />
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
                  : '🚀 Create Project'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}