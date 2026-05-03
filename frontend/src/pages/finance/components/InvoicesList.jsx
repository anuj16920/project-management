import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Trash2, Send, CheckCircle, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { financeAPI } from '@/lib/invoiceAPI'
import { toast }       from 'sonner'

const STATUS_META = {
  draft:     { color: 'bg-white/10 text-text-m',      label: 'Draft'     },
  sent:      { color: 'bg-blue-400/15 text-blue-400', label: 'Sent'      },
  viewed:    { color: 'bg-cyan-400/15 text-cyan-400', label: 'Viewed'    },
  paid:      { color: 'bg-success/15 text-success',   label: 'Paid'      },
  overdue:   { color: 'bg-red-400/15 text-red-400',   label: 'Overdue'   },
  cancelled: { color: 'bg-white/5 text-text-f',       label: 'Cancelled' },
}

export default function InvoicesList({ onRefresh }) {
  const navigate           = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('')
  const [search,   setSearch]   = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = filter ? { status: filter } : {}
      const r = await financeAPI.listInvoices(params)
      setInvoices(r.data.data || [])
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const handleStatusUpdate = async (e, id, status) => {
    e.stopPropagation()
    try {
      await financeAPI.updateStatus(id, status)
      toast.success(`Marked as ${status} ✅`)
      load(); onRefresh?.()
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this invoice?')) return
    try {
      await financeAPI.deleteInvoice(id)
      toast.success('Deleted')
      load(); onRefresh?.()
    } catch { toast.error('Failed') }
  }

  const filtered = invoices.filter(inv =>
    !search ||
    inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
    inv.title?.toLowerCase().includes(search.toLowerCase()) ||
    inv.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={14} className="text-text-f"/>
          <input placeholder="Search by number, title, client..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-text-p text-sm outline-none w-full placeholder:text-text-f"/>
        </div>
        <div className="flex gap-1 bg-surface border border-white/5 rounded-xl p-1">
          {['', 'draft', 'sent', 'paid', 'overdue'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                ${filter===f ? 'bg-accent/20 text-accent' : 'text-text-m hover:text-text-p'}`}>
              {f || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_,i) => (
            <div key={i} className="h-16 bg-surface rounded-2xl animate-pulse"/>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-white/5 rounded-2xl">
          <p className="text-text-f text-sm">No invoices found</p>
        </div>
      ) : (
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Invoice','Client','Project','Amount','Due Date','Status','Actions'].map(h => (
                  <th key={h} className="text-left text-text-f text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((inv, i) => {
                const meta = STATUS_META[inv.status] || STATUS_META.draft
                const isOverdue = inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'paid'
                return (
                  <motion.tr key={inv.id}
                    initial={{ opacity:0 }} animate={{ opacity:1 }}
                    transition={{ delay: i*0.03 }}
                    onClick={() => navigate(`/admin/finance/invoices/${inv.id}`)}
                    className="hover:bg-white/2 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-text-p text-sm font-semibold">{inv.invoice_number}</p>
                      <p className="text-text-f text-xs truncate max-w-32">{inv.title}</p>
                    </td>
                    <td className="px-4 py-3 text-text-m text-sm">
                      {inv.profiles?.full_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-m text-sm">
                      {inv.projects?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-p text-sm font-bold tabular-nums">
                      {fmt(inv.total)}
                    </td>
                    <td className={`px-4 py-3 text-sm tabular-nums ${isOverdue ? 'text-red-400' : 'text-text-m'}`}>
                      {inv.due_date
                        ? new Date(inv.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => navigate(`/admin/finance/invoices/${inv.id}`)}
                          className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-f hover:text-text-m transition-all"
                          title="View">
                          <Eye size={13}/>
                        </button>
                        {inv.status === 'draft' && (
                          <button onClick={e => handleStatusUpdate(e, inv.id, 'sent')}
                            className="w-7 h-7 rounded-lg hover:bg-blue-400/10 flex items-center justify-center text-text-f hover:text-blue-400 transition-all"
                            title="Mark Sent">
                            <Send size={13}/>
                          </button>
                        )}
                        {['sent','viewed'].includes(inv.status) && (
                          <button onClick={e => handleStatusUpdate(e, inv.id, 'paid')}
                            className="w-7 h-7 rounded-lg hover:bg-success/10 flex items-center justify-center text-text-f hover:text-success transition-all"
                            title="Mark Paid">
                            <CheckCircle size={13}/>
                          </button>
                        )}
                        <button onClick={e => handleDelete(e, inv.id)}
                          className="w-7 h-7 rounded-lg hover:bg-red-400/10 flex items-center justify-center text-text-f hover:text-red-400 transition-all"
                          title="Delete">
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}