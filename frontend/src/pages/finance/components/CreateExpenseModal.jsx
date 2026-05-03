import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { financeAPI } from '@/lib/invoiceAPI'
import { toast }       from 'sonner'

export default function CreateExpenseModal({ onClose, onSuccess }) {
  const [categories, setCategories] = useState([])
  const [form,       setForm]       = useState({
    title: '', amount: '', category_id: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    financeAPI.listCategories().then(r => setCategories(r.data.data || [])).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.amount) return toast.error('Title and amount required')
    setLoading(true)
    try {
      await financeAPI.createExpense({ ...form, amount: parseFloat(form.amount) })
      toast.success('Expense submitted! 📋')
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
          className="relative z-10 w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl">

          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="font-display font-bold text-lg text-accent">Add Expense</h2>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-m">
              <X size={16}/>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="text-text-f text-xs block mb-1.5">Title *</label>
              <input type="text" placeholder="e.g. Office Supplies"
                value={form.title} onChange={e => set('title', e.target.value)}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/40
                  rounded-xl px-3 py-2.5 text-text-p text-sm outline-none placeholder:text-text-f"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-f text-xs block mb-1.5">Amount (₹) *</label>
                <input type="number" min="0" placeholder="0.00"
                  value={form.amount} onChange={e => set('amount', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/40
                    rounded-xl px-3 py-2.5 text-text-p text-sm outline-none tabular-nums placeholder:text-text-f"/>
              </div>
              <div>
                <label className="text-text-f text-xs block mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/40
                    rounded-xl px-3 py-2.5 text-text-p text-sm outline-none"/>
              </div>
            </div>
            <div>
              <label className="text-text-f text-xs block mb-1.5">Category</label>
              <select value={form.category_id} onChange={e => set('category_id', e.target.value)}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/40
                  rounded-xl px-3 py-2.5 text-text-p text-sm outline-none">
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id} className="bg-surface">{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-text-f text-xs block mb-1.5">Notes</label>
              <textarea rows={2} placeholder="Additional details..."
                value={form.notes} onChange={e => set('notes', e.target.value)}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/40
                  rounded-xl px-3 py-2.5 text-text-p text-sm outline-none resize-none placeholder:text-text-f"/>
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
                {loading ? 'Submitting...' : '📋 Submit Expense'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}