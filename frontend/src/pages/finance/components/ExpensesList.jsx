import React, { useEffect, useState } from 'react'
import { Trash2, CheckCircle, XCircle, Receipt } from 'lucide-react'
import { motion } from 'framer-motion'
import { financeAPI } from '@/lib/invoiceAPI'
import { toast }       from 'sonner'

const STATUS_META = {
  pending:  { color: 'bg-warning/15 text-warning', label: 'Pending'  },
  approved: { color: 'bg-success/15 text-success', label: 'Approved' },
  rejected: { color: 'bg-red-400/15 text-red-400', label: 'Rejected' },
}

export default function ExpensesList({ onRefresh }) {
  const [expenses,    setExpenses]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = filter ? { status: filter } : {}
      const [e, c] = await Promise.all([
        financeAPI.listExpenses(params),
        financeAPI.listCategories(),
      ])
      setExpenses(e.data.data   || [])
      setCategories(c.data.data || [])
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const handleReview = async (id, status) => {
    try {
      await financeAPI.reviewExpense(id, status)
      toast.success(`Expense ${status}`)
      load(); onRefresh?.()
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return
    try { await financeAPI.deleteExpense(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`
  const total = expenses.reduce((s,e) => s+(e.amount||0), 0)

  return (
    <div>
      {/* Filter + total */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex gap-1 bg-surface border border-white/5 rounded-xl p-1">
          {['','pending','approved','rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                ${filter===f ? 'bg-accent/20 text-accent' : 'text-text-m hover:text-text-p'}`}>
              {f || 'All'}
            </button>
          ))}
        </div>
        {expenses.length > 0 && (
          <div className="text-right">
            <p className="text-text-f text-xs">Total</p>
            <p className="text-text-p font-bold text-sm tabular-nums">{fmt(total)}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_,i) => <div key={i} className="h-16 bg-surface rounded-2xl animate-pulse"/>)}
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-white/5 rounded-2xl">
          <Receipt size={32} className="text-text-f mx-auto mb-2 opacity-40"/>
          <p className="text-text-f text-sm">No expenses found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((exp, i) => {
            const meta = STATUS_META[exp.status] || STATUS_META.pending
            return (
              <motion.div key={exp.id}
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i*0.04 }}
                className="flex items-center justify-between bg-surface border border-white/5
                  hover:border-white/10 rounded-2xl px-4 py-3 transition-all gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: exp.expense_categories?.color || '#6366F1' }}/>
                  <div className="min-w-0">
                    <p className="text-text-p text-sm font-medium truncate">{exp.title}</p>
                    <div className="flex items-center gap-2 text-text-f text-xs mt-0.5">
                      {exp.expense_categories?.name && <span>{exp.expense_categories.name}</span>}
                      {exp.expense_categories?.name && <span>·</span>}
                      <span>{new Date(exp.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                      {exp.profiles?.full_name && (
                        <><span>·</span><span>by {exp.profiles.full_name}</span></>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-text-p font-bold text-sm tabular-nums">{fmt(exp.amount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                  {exp.status === 'pending' && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleReview(exp.id, 'approved')}
                        className="w-7 h-7 rounded-lg hover:bg-success/10 flex items-center justify-center text-text-f hover:text-success transition-all">
                        <CheckCircle size={13}/>
                      </button>
                      <button onClick={() => handleReview(exp.id, 'rejected')}
                        className="w-7 h-7 rounded-lg hover:bg-red-400/10 flex items-center justify-center text-text-f hover:text-red-400 transition-all">
                        <XCircle size={13}/>
                      </button>
                    </div>
                  )}
                  <button onClick={() => handleDelete(exp.id)}
                    className="w-7 h-7 rounded-lg hover:bg-red-400/10 flex items-center justify-center text-text-f hover:text-red-400 transition-all">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}