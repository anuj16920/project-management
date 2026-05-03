import React, { useState, useEffect } from 'react'
import { X, User, Building2, Briefcase, Calendar, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { hrAPI }    from '@/lib/hrAPI'
import { usersAPI } from '@/lib/usersAPI'
import { toast }    from 'sonner'

export default function AddEmployeeModal({ depts=[], onClose, onSuccess }) {
  const [users,   setUsers]   = useState([])    // existing profiles not yet employees
  const [form,    setForm]    = useState({
    profile_uid:'', department_id:'', designation:'',
    employment_type:'full_time',
    date_of_joining: new Date().toISOString().split('T')[0],
    salary:'', employee_code:'',
  })
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f => ({...f, [k]:v}))

  useEffect(() => {
    // Load existing tenant users so admin can pick who to create an HR record for
    usersAPI.listUsers().then(r => setUsers(r.data.data || [])).catch(() => {})
  }, [])

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!form.profile_uid) return toast.error('Please select a user')
    setLoading(true)
    try {
      await hrAPI.createEmployee({ ...form, salary: parseFloat(form.salary)||0 })
      toast.success('Employee record created! 🎉')
      onSuccess?.()
      onClose?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
        <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
          className="relative z-10 w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-surface z-10">
            <h2 className="font-display font-bold text-lg text-accent">Add HR Record</h2>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-m">
              <X size={16}/>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Select existing user */}
            <div>
              <label className="text-text-m text-xs mb-1.5 block">Select User *</label>
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-f"/>
                <select value={form.profile_uid} onChange={e => set('profile_uid', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl pl-8 pr-3 py-2.5 text-text-p text-sm outline-none">
                  <option value="">Choose a team member...</option>
                  {users.map(u => (
                    <option key={u.firebase_uid} value={u.firebase_uid} className="bg-surface">
                      {u.full_name} — {u.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-m text-xs mb-1.5 block">Department</label>
                <div className="relative">
                  <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-f"/>
                  <select value={form.department_id} onChange={e => set('department_id', e.target.value)}
                    className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl pl-8 pr-3 py-2.5 text-text-p text-sm outline-none">
                    <option value="">Select Dept</option>
                    {depts.map(d => <option key={d.id} value={d.id} className="bg-surface">{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-text-m text-xs mb-1.5 block">Designation</label>
                <div className="relative">
                  <Briefcase size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-f"/>
                  <input type="text" placeholder="e.g. Developer"
                    value={form.designation} onChange={e => set('designation', e.target.value)}
                    className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl pl-8 pr-3 py-2.5 text-text-p text-sm outline-none placeholder:text-text-f"/>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-text-m text-xs mb-1.5 block">Type</label>
                <select value={form.employment_type} onChange={e => set('employment_type', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none">
                  {['full_time','part_time','contract','intern'].map(t => (
                    <option key={t} value={t} className="bg-surface capitalize">{t.replace('_',' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-text-m text-xs mb-1.5 flex items-center gap-1">
                  <Calendar size={10}/> Joining Date
                </label>
                <input type="date" value={form.date_of_joining}
                  onChange={e => set('date_of_joining', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none"/>
              </div>
              <div>
                <label className="text-text-m text-xs mb-1.5 flex items-center gap-1">
                  <DollarSign size={10}/> Salary/mo
                </label>
                <input type="number" placeholder="50000" value={form.salary}
                  onChange={e => set('salary', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none placeholder:text-text-f"/>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 border border-white/10 hover:border-white/20 text-text-m text-sm font-medium py-2.5 rounded-xl transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-accent hover:bg-accent-h text-white text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60">
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                      Creating...
                    </span>
                  : '🎉 Create Record'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}