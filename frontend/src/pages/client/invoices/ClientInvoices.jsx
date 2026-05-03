import React, { useEffect, useState } from 'react'
import { FileText, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth }     from '@/hooks/useAuth'
import { financeAPI }  from '@/lib/invoiceAPI'
import { toast }       from 'sonner'

const STATUS_META = {
  draft:     { color: 'bg-white/10 text-text-m',      label: 'Draft'   },
  sent:      { color: 'bg-blue-400/15 text-blue-400', label: 'Sent'    },
  viewed:    { color: 'bg-cyan-400/15 text-cyan-400', label: 'Viewed'  },
  paid:      { color: 'bg-success/15 text-success',   label: 'Paid ✓'  },
  overdue:   { color: 'bg-red-400/15 text-red-400',   label: 'Overdue' },
  cancelled: { color: 'bg-white/5 text-text-f',       label: 'Void'    },
}

export default function ClientInvoices() {
  const { profile }         = useAuth()
  const [invoices, setInvoices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!profile) return
    financeAPI.listInvoices({ client_uid: profile.firebase_uid })
      .then(r => {
        setInvoices(r.data.data || [])
        // Auto-mark as viewed if status is 'sent'
        const sentInvoices = r.data.data?.filter(i => i.status === 'sent') || []
        sentInvoices.forEach(i => financeAPI.updateStatus(i.id, 'viewed').catch(() => {}))
      })
      .catch(() => toast.error('Failed to load invoices'))
      .finally(() => setLoading(false))
  }, [profile])

  const fmt   = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`
  const total = invoices.filter(i => i.status === 'paid').reduce((s,i) => s+(i.total||0), 0)
  const pending = invoices.filter(i => ['sent','viewed'].includes(i.status)).reduce((s,i) => s+(i.total||0), 0)

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display font-black text-2xl text-text-p">My Invoices</h2>
        <p className="text-text-m text-sm mt-1">View and track your invoices</p>
      </div>

      {/* Summary cards */}
      {!loading && invoices.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label:'Total Paid',    value: fmt(total),            color:'text-success', bg:'bg-success/10'  },
            { label:'Pending',       value: fmt(pending),          color:'text-warning', bg:'bg-warning/10'  },
            { label:'Total Invoices',value: invoices.length,       color:'text-text-p',  bg:'bg-white/5'     },
          ].map((s,i) => (
            <div key={i} className={`${s.bg} border border-white/5 rounded-2xl p-4`}>
              <p className="text-text-f text-xs mb-1">{s.label}</p>
              <p className={`${s.color} text-xl font-black tabular-nums`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_,i) => <div key={i} className="h-20 bg-surface rounded-2xl animate-pulse"/>)}
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-white/5 rounded-2xl">
          <FileText size={40} className="text-text-f mx-auto mb-3 opacity-40"/>
          <p className="text-text-m font-medium mb-1">No invoices yet</p>
          <p className="text-text-f text-sm">Your invoices will appear here once sent</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv, i) => {
            const meta     = STATUS_META[inv.status] || STATUS_META.draft
            const isOverdue = inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'paid'
            return (
              <motion.div key={inv.id}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i*0.05 }}
                onClick={() => setSelected(selected?.id === inv.id ? null : inv)}
                className="bg-surface border border-white/5 hover:border-white/10 rounded-2xl
                  p-4 cursor-pointer transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-accent"/>
                    </div>
                    <div className="min-w-0">
                      <p className="text-text-p text-sm font-semibold truncate">{inv.invoice_number}</p>
                      <p className="text-text-f text-xs truncate">{inv.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-text-p font-bold text-sm tabular-nums">{fmt(inv.total)}</p>
                      {inv.due_date && (
                        <p className={`text-xs tabular-nums ${isOverdue ? 'text-red-400' : 'text-text-f'}`}>
                          {isOverdue ? '⚠ Overdue · ' : 'Due · '}
                          {new Date(inv.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {selected?.id === inv.id && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                    className="mt-4 pt-4 border-t border-white/5 overflow-hidden">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {[
                        { label:'Subtotal',  value: fmt(inv.subtotal)  },
                        { label:`Tax (${inv.tax_percent}%)`, value: fmt(inv.tax_amount) },
                        { label:'Discount',  value: fmt(inv.discount)  },
                        { label:'Total',     value: fmt(inv.total)     },
                      ].map(s => (
                        <div key={s.label}>
                          <p className="text-text-f text-xs mb-0.5">{s.label}</p>
                          <p className="text-text-p text-sm font-semibold tabular-nums">{s.value}</p>
                        </div>
                      ))}
                    </div>
                    {inv.invoice_items?.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-text-f text-xs font-medium uppercase tracking-wider mb-2">Line Items</p>
                        {inv.invoice_items.map(item => (
                          <div key={item.id} className="flex justify-between text-xs text-text-m bg-surface2 rounded-xl px-3 py-2">
                            <span className="truncate mr-4">{item.description}</span>
                            <span className="flex-shrink-0 tabular-nums">{item.quantity} × {fmt(item.unit_price)} = <strong>{fmt(item.amount)}</strong></span>
                          </div>
                        ))}
                      </div>
                    )}
                    {inv.notes && (
                      <p className="text-text-f text-xs mt-3 italic">"{inv.notes}"</p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}