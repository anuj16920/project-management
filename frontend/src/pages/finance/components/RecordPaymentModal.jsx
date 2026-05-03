import React, { useState } from 'react'
import { X, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { financeAPI } from '@/lib/invoiceAPI'
import { toast }       from 'sonner'

const METHODS = ['bank_transfer','upi','card','cash','cheque','stripe','razorpay']

export default function RecordPaymentModal({ invoice, onClose, onSuccess }) {
  const [form,    setForm]    = useState({
    amount:         invoice?.total || '',
    payment_method: 'bank_transfer',
    transaction_id: '',
    notes:          '',
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount) return toast.error('Amount required')
    setLoading(true)
    try {
      await financeAPI.recordPayment({
        invoice_id:     invoice.id,
        amount:         parseFloat(form.amount),
        payment_method: form.payment_method,
        transaction_id: form.transaction_id,
        notes:          form.notes,
      })
      toast.success('Payment recorded! 💰')
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
            <div>
              <h2 className="font-display font-bold text-lg text-accent">Record Payment</h2>
              <p className="text-text-f text-xs mt-0.5">{invoice?.invoice_number} · ₹{Number(invoice?.total||0).toLocaleString()}</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-m">
              <X size={16}/>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="text-text-f text-xs block mb-1.5">Amount Received (₹) *</label>
              <input type="number" min="0"
                value={form.amount} onChange={e => set('amount', e.target.value)}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/40
                  rounded-xl px-3 py-2.5 text-text-p text-sm outline-none tabular-nums"/>
            </div>
            <div>
              <label className="text-text-f text-xs block mb-1.5">Payment Method</label>
              <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/40
                  rounded-xl px-3 py-2.5 text-text-p text-sm outline-none capitalize">
                {METHODS.map(m => (
                  <option key={m} value={m} className="bg-surface capitalize">{m.replace('_',' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-text-f text-xs block mb-1.5">Transaction ID (optional)</label>
              <input type="text" placeholder="UTR / Transaction reference..."
                value={form.transaction_id} onChange={e => set('transaction_id', e.target.value)}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/40
                  rounded-xl px-3 py-2.5 text-text-p text-sm outline-none placeholder:text-text-f"/>
            </div>
            <div>
              <label className="text-text-f text-xs block mb-1.5">Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/40
                  rounded-xl px-3 py-2.5 text-text-p text-sm outline-none resize-none"/>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 border border-white/10 hover:border-white/20 text-text-m
                  text-sm font-medium py-2.5 rounded-xl transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-success/20 hover:bg-success/30 border border-success/30 text-success
                  text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60">
                {loading ? 'Recording...' : '💰 Confirm Payment'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}