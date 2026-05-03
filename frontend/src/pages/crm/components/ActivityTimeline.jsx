import React, { useState } from 'react'
import { Phone, Mail, Users, StickyNote, Bell, Monitor,
         CheckCircle, Circle, Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { crmAPI } from '@/lib/crmAPI'
import { toast } from 'sonner'

const TYPE_META = {
  call:      { icon: Phone,     color:'text-cyan',    bg:'bg-cyan/15'    },
  email:     { icon: Mail,      color:'text-accent',  bg:'bg-accent/15'  },
  meeting:   { icon: Users,     color:'text-success', bg:'bg-success/15' },
  note:      { icon: StickyNote,color:'text-warning', bg:'bg-warning/15' },
  follow_up: { icon: Bell,      color:'text-error',   bg:'bg-error/15'   },
  demo:      { icon: Monitor,   color:'text-purple',  bg:'bg-purple/15'  },
}

const TYPES = Object.keys(TYPE_META)

export default function ActivityTimeline({ activities = [], clientId, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState({ type:'call', title:'', description:'', scheduled_at:'' })
  const [loading,  setLoading]  = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title) return
    setLoading(true)
    try {
      await crmAPI.addActivity({
        ...form,
        client_id:    clientId || null,
        scheduled_at: form.scheduled_at || null,
      })
      toast.success('Activity logged')
      setShowForm(false)
      setForm({ type:'call', title:'', description:'', scheduled_at:'' })
      onRefresh?.()
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  }

  const handleToggle = async (id) => {
    try { await crmAPI.toggleActivity(id); onRefresh?.() }
    catch { toast.error('Failed') }
  }

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-base text-text-p">Activity Timeline</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-accent text-xs hover:text-accent-h transition-colors">
          <Plus size={13} /> Log Activity
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            onSubmit={handleAdd}
            className="bg-surface2 border border-white/8 rounded-2xl p-4 mb-5 space-y-3 overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-text-p text-sm font-semibold">Log Activity</p>
              <button type="button" onClick={() => setShowForm(false)} className="text-text-f hover:text-text-m">
                <X size={14} />
              </button>
            </div>
            {/* Type pills */}
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(t => {
                const m = TYPE_META[t]
                const Icon = m.icon
                return (
                  <button key={t} type="button" onClick={() => set('type', t)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all
                      ${form.type===t ? `${m.bg} ${m.color} border border-current/30` : 'bg-surface border border-white/8 text-text-m'}`}>
                    <Icon size={11} />{t.replace('_',' ')}
                  </button>
                )
              })}
            </div>
            <input type="text" placeholder="Title *" value={form.title}
              onChange={e => set('title', e.target.value)}
              className="w-full bg-surface border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f" />
            <textarea rows={2} placeholder="Description (optional)" value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full bg-surface border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none resize-none placeholder:text-text-f" />
            <input type="datetime-local" value={form.scheduled_at}
              onChange={e => set('scheduled_at', e.target.value)}
              className="w-full bg-surface border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none" />
            <button type="submit" disabled={loading || !form.title}
              className="w-full bg-accent hover:bg-accent-h text-white text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 glow-accent">
              {loading ? 'Saving...' : 'Save Activity'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Timeline */}
      {activities.length === 0 && (
        <p className="text-text-f text-sm text-center py-6">No activities yet</p>
      )}
      <div className="relative space-y-4">
        {activities.length > 1 && (
          <div className="absolute left-4 top-4 bottom-4 w-px bg-white/5" />
        )}
        {activities.map((a, i) => {
          const m    = TYPE_META[a.type] || TYPE_META.note
          const Icon = m.icon
          return (
            <motion.div key={a.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 relative">
              <div className={`w-8 h-8 rounded-full ${m.bg} border border-current/10 flex items-center justify-center flex-shrink-0 z-10`}>
                <Icon size={13} className={m.color} />
              </div>
              <div className="flex-1 min-w-0 bg-surface2 border border-white/5 hover:border-white/10 rounded-xl p-3 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-medium ${a.is_done ? 'text-text-f line-through' : 'text-text-p'}`}>{a.title}</p>
                    {a.description && <p className="text-text-f text-xs mt-0.5 leading-relaxed">{a.description}</p>}
                    {a.scheduled_at && (
                      <p className="text-text-f text-xs mt-1">
                        🕐 {new Date(a.scheduled_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                      </p>
                    )}
                    <p className="text-text-f text-xs mt-1">
                      {new Date(a.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </p>
                  </div>
                  <button onClick={() => handleToggle(a.id)} className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110">
                    {a.is_done
                      ? <CheckCircle size={15} className="text-success" />
                      : <Circle size={15} className="text-text-f hover:text-text-m" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}