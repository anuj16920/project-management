import React, { useEffect, useState } from 'react'
import { useParams, useNavigate }      from 'react-router-dom'
import { ArrowLeft, Send, CheckCircle, Printer, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import { financeAPI }    from '@/lib/invoiceAPI'
import RecordPaymentModal from './components/RecordPaymentModal'
import { toast } from 'sonner'

const STATUS_META = {
  draft:     { color: 'bg-white/10 text-text-m',      label: 'Draft'     },
  sent:      { color: 'bg-blue-400/15 text-blue-400', label: 'Sent'      },
  viewed:    { color: 'bg-cyan-400/15 text-cyan-400', label: 'Viewed'    },
  paid:      { color: 'bg-success/15 text-success',   label: 'Paid ✓'    },
  overdue:   { color: 'bg-red-400/15 text-red-400',   label: 'Overdue'   },
  cancelled: { color: 'bg-white/5 text-text-f',       label: 'Cancelled' },
}

export default function InvoiceDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [inv,     setInv]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPayModal, setShowPayModal] = useState(false)

  const load = async () => {
    try {
      const r = await financeAPI.getInvoice(id)
      setInv(r.data.data)
    } catch { toast.error('Failed to load invoice') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleStatus = async (status) => {
    try {
      await financeAPI.updateStatus(id, status)
      toast.success(`Invoice marked as ${status}`)
      load()
    } catch { toast.error('Failed') }
  }

  const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  if (!inv) return null

  const meta = STATUS_META[inv.status] || STATUS_META.draft

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <button onClick={() => navigate('/admin/finance')}
          className="w-9 h-9 rounded-xl border border-white/10 hover:border-white/20 flex items-center justify-center text-text-m transition-all">
          <ArrowLeft size={16}/>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-black text-xl text-text-p">{inv.invoice_number}</h2>
            <span className={`text-xs px-2.5 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
          </div>
          <p className="text-text-f text-sm mt-0.5">{inv.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {inv.status === 'draft' && (
            <button onClick={() => handleStatus('sent')}
              className="flex items-center gap-2 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 text-sm font-medium px-4 py-2 rounded-xl transition-all">
              <Send size={14}/> Send Invoice
            </button>
          )}
          {['sent','viewed'].includes(inv.status) && (
            <button onClick={() => setShowPayModal(true)}
              className="flex items-center gap-2 bg-success/15 hover:bg-success/25 border border-success/30 text-success text-sm font-medium px-4 py-2 rounded-xl transition-all">
              <DollarSign size={14}/> Record Payment
            </button>
          )}
          <button onClick={() => window.print()}
            className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-text-m text-sm px-3 py-2 rounded-xl transition-all">
            <Printer size={14}/>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Invoice body */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl p-6">

          {/* From / To */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-text-f text-xs uppercase tracking-wider mb-2">From</p>
              <p className="text-text-p font-bold text-sm">NexaWork Inc.</p>
              <p className="text-text-m text-xs mt-0.5">workspace@nexawork.app</p>
            </div>
            <div>
              <p className="text-text-f text-xs uppercase tracking-wider mb-2">Bill To</p>
              <p className="text-text-p font-bold text-sm">{inv.profiles?.full_name || '—'}</p>
              <p className="text-text-m text-xs mt-0.5">{inv.profiles?.email}</p>
              {inv.projects?.name && (
                <p className="text-text-f text-xs mt-0.5">Project: {inv.projects.name}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-8 pb-6 border-b border-white/5">
            <div>
              <p className="text-text-f text-xs mb-1">Invoice Date</p>
              <p className="text-text-p text-sm">
                {new Date(inv.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
              </p>
            </div>
            <div>
              <p className="text-text-f text-xs mb-1">Due Date</p>
              <p className={`text-sm font-semibold ${
                inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'paid'
                  ? 'text-red-400' : 'text-text-p'}`}>
                {inv.due_date
                  ? new Date(inv.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})
                  : '—'}
              </p>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b border-white/5">
                {['Description','Qty','Unit Price','Amount'].map(h => (
                  <th key={h} className="text-left text-text-f text-xs font-medium uppercase tracking-wider py-2 last:text-right">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(inv.invoice_items||[]).map(item => (
                <tr key={item.id}>
                  <td className="text-text-p text-sm py-3">{item.description}</td>
                  <td className="text-text-m text-sm py-3 tabular-nums">{item.quantity}</td>
                  <td className="text-text-m text-sm py-3 tabular-nums">{fmt(item.unit_price)}</td>
                  <td className="text-text-p text-sm py-3 text-right tabular-nums font-medium">{fmt(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="space-y-2 border-t border-white/5 pt-4 ml-auto max-w-xs">
            <div className="flex justify-between text-sm text-text-m">
              <span>Subtotal</span>
              <span className="tabular-nums">{fmt(inv.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-text-m">
              <span>Tax ({inv.tax_percent}%)</span>
              <span className="tabular-nums">{fmt(inv.tax_amount)}</span>
            </div>
            {inv.discount > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount</span>
                <span className="tabular-nums">-{fmt(inv.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-text-p border-t border-white/10 pt-2">
              <span>Total</span>
              <span className="tabular-nums text-success">{fmt(inv.total)}</span>
            </div>
          </div>

          {inv.notes && (
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-text-f text-xs mb-1">Notes</p>
              <p className="text-text-m text-sm">{inv.notes}</p>
            </div>
          )}
        </motion.div>

        {/* Side info */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4">

          {/* Summary card */}
          <div className="bg-surface border border-white/5 rounded-2xl p-5">
            <h4 className="font-display font-bold text-sm text-text-p mb-4">Summary</h4>
            <div className="space-y-3">
              {[
                { label:'Invoice #',  value: inv.invoice_number },
                { label:'Status',     value: <span className={`text-xs px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span> },
                { label:'Total',      value: <span className="text-success font-bold">{fmt(inv.total)}</span> },
                { label:'Currency',   value: inv.currency },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-text-f text-xs">{row.label}</span>
                  <span className="text-text-p text-sm">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick status actions */}
          {inv.status !== 'paid' && inv.status !== 'cancelled' && (
            <div className="bg-surface border border-white/5 rounded-2xl p-5">
              <h4 className="font-display font-bold text-sm text-text-p mb-3">Quick Actions</h4>
              <div className="space-y-2">
                {inv.status === 'draft' && (
                  <button onClick={() => handleStatus('sent')}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-sm py-2.5 rounded-xl transition-all">
                    <Send size={14}/> Mark as Sent
                  </button>
                )}
                {['sent','viewed'].includes(inv.status) && (
                  <button onClick={() => setShowPayModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-success/15 hover:bg-success/25 text-success text-sm py-2.5 rounded-xl transition-all">
                    <CheckCircle size={14}/> Record Payment
                  </button>
                )}
                <button onClick={() => handleStatus('cancelled')}
                  className="w-full text-red-400/70 hover:text-red-400 text-xs py-2 transition-all">
                  Cancel Invoice
                </button>
              </div>
            </div>
          )}

          {/* Paid confirmation */}
          {inv.status === 'paid' && (
            <div className="bg-success/10 border border-success/20 rounded-2xl p-5 text-center">
              <CheckCircle size={28} className="text-success mx-auto mb-2"/>
              <p className="text-success font-bold text-sm">Payment Received</p>
              {inv.paid_at && (
                <p className="text-text-m text-xs mt-1">
                  {new Date(inv.paid_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {showPayModal && (
        <RecordPaymentModal
          invoice={inv}
          onClose={() => setShowPayModal(false)}
          onSuccess={() => { setShowPayModal(false); load() }}/>
      )}
    </div>
  )
}