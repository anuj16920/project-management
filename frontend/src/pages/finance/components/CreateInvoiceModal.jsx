import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { financeAPI } from '@/lib/invoiceAPI'
import { usersAPI }   from '@/lib/usersAPI'
import { toast }      from 'sonner'

const EMPTY_ITEM = { description: '', quantity: 1, unit_price: 0 }

export default function CreateInvoiceModal({ onClose, onSuccess }) {
  const [clients, setClients] = useState([])
  const [items,   setItems]   = useState([{ ...EMPTY_ITEM }])
  const [form,    setForm]    = useState({
    client_uid: '', title: '', description: '',
    tax_percent: 18, discount: 0,
    due_date: '', notes: '', currency: 'INR',
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    usersAPI.listUsers({ role: 'client' })
      .then(r => setClients(r.data.data || []))
      .catch(() => {})
  }, [])

  const updateItem = (i, key, val) =>
    setItems(items.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  const addItem    = () => setItems([...items, { ...EMPTY_ITEM }])
  const removeItem = (i) => items.length > 1 && setItems(items.filter((_, idx) => idx !== i))

  const subtotal   = items.reduce((s, i) => s + (Number(i.quantity)||0) * (Number(i.unit_price)||0), 0)
  const taxAmt     = (subtotal * Number(form.tax_percent||0)) / 100
  const total      = subtotal + taxAmt - Number(form.discount||0)
  const fmt        = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title) return toast.error('Title required')
    if (items.some(i => !i.description)) return toast.error('All items need a description')
    setLoading(true)
    try {
      await financeAPI.createInvoice({
        ...form,
        tax_percent: Number(form.tax_percent),
        discount:    Number(form.discount),
        items: items.map(i => ({
          ...i,
          quantity:   Number(i.quantity),
          unit_price: Number(i.unit_price),
        })),
      })
      toast.success('Invoice created! 🎉')
      onSuccess?.()
    } catch { toast.error('Failed to create invoice') }
    finally { setLoading(false) }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
        <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
          className="relative z-10 w-full max-w-2xl bg-surface border border-white/10
            rounded-2xl shadow-2xl overflow-y-auto max-h-[92vh]">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-surface z-10">
            <h2 className="font-display font-bold text-lg text-accent">New Invoice</h2>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-m">
              <X size={16}/>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-text-f text-xs block mb-1.5">Invoice Title *</label>
                <input type="text" placeholder="e.g. Web Development — Phase 1"
                  value={form.title} onChange={e => set('title', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/40
                    rounded-xl px-3 py-2.5 text-text-p text-sm outline-none placeholder:text-text-f"/>
              </div>
              <div>
                <label className="text-text-f text-xs block mb-1.5">Client</label>
                <select value={form.client_uid} onChange={e => set('client_uid', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/40
                    rounded-xl px-3 py-2.5 text-text-p text-sm outline-none">
                  <option value="">Select client</option>
                  {clients.map(c => (
                    <option key={c.firebase_uid} value={c.firebase_uid} className="bg-surface">
                      {c.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-text-f text-xs block mb-1.5">Due Date</label>
                <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/40
                    rounded-xl px-3 py-2.5 text-text-p text-sm outline-none"/>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-text-m text-xs font-semibold uppercase tracking-wider">Line Items</label>
                <button type="button" onClick={addItem}
                  className="flex items-center gap-1.5 text-accent text-xs hover:bg-accent/10 px-2.5 py-1.5 rounded-lg transition-all">
                  <Plus size={12}/> Add Item
                </button>
              </div>
              <div className="space-y-2">
                {/* Header row */}
                <div className="grid grid-cols-12 gap-2 px-1">
                  <span className="col-span-6 text-text-f text-xs">Description</span>
                  <span className="col-span-2 text-text-f text-xs">Qty</span>
                  <span className="col-span-3 text-text-f text-xs">Unit Price</span>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input type="text" placeholder="Service description"
                      value={item.description}
                      onChange={e => updateItem(i, 'description', e.target.value)}
                      className="col-span-6 bg-surface2 border border-white/10 focus:border-accent/40
                        rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f"/>
                    <input type="number" min="1" placeholder="1"
                      value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', e.target.value)}
                      className="col-span-2 bg-surface2 border border-white/10 focus:border-accent/40
                        rounded-xl px-3 py-2 text-text-p text-sm outline-none text-center tabular-nums"/>
                    <input type="number" min="0" placeholder="0"
                      value={item.unit_price}
                      onChange={e => updateItem(i, 'unit_price', e.target.value)}
                      className="col-span-3 bg-surface2 border border-white/10 focus:border-accent/40
                        rounded-xl px-3 py-2 text-text-p text-sm outline-none tabular-nums"/>
                    <button type="button" onClick={() => removeItem(i)}
                      className="col-span-1 w-7 h-7 rounded-lg hover:bg-red-400/10 flex items-center
                        justify-center text-text-f hover:text-red-400 transition-all mx-auto">
                      <Trash2 size={12}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax / Discount / Total */}
            <div className="bg-surface2 rounded-xl p-4 space-y-2">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-text-f text-xs block mb-1.5">Tax %</label>
                  <input type="number" min="0" max="100"
                    value={form.tax_percent} onChange={e => set('tax_percent', e.target.value)}
                    className="w-full bg-surface border border-white/10 focus:border-accent/40
                      rounded-xl px-3 py-2 text-text-p text-sm outline-none tabular-nums"/>
                </div>
                <div>
                  <label className="text-text-f text-xs block mb-1.5">Discount (₹)</label>
                  <input type="number" min="0"
                    value={form.discount} onChange={e => set('discount', e.target.value)}
                    className="w-full bg-surface border border-white/10 focus:border-accent/40
                      rounded-xl px-3 py-2 text-text-p text-sm outline-none tabular-nums"/>
                </div>
              </div>
              <div className="flex justify-between text-text-m text-sm">
                <span>Subtotal</span><span className="tabular-nums">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-m text-sm">
                <span>Tax ({form.tax_percent}%)</span><span className="tabular-nums">{fmt(taxAmt)}</span>
              </div>
              {Number(form.discount) > 0 && (
                <div className="flex justify-between text-success text-sm">
                  <span>Discount</span><span className="tabular-nums">-{fmt(form.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-text-p border-t border-white/10 pt-2">
                <span>Total</span>
                <span className="text-success tabular-nums text-base">{fmt(total)}</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-text-f text-xs block mb-1.5">Notes (optional)</label>
              <textarea rows={2} placeholder="Payment terms, thank you message..."
                value={form.notes} onChange={e => set('notes', e.target.value)}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/40
                  rounded-xl px-3 py-2.5 text-text-p text-sm outline-none resize-none placeholder:text-text-f"/>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 border border-white/10 hover:border-white/20 text-text-m
                  text-sm font-medium py-2.5 rounded-xl transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-accent hover:bg-accent-h text-white text-sm font-semibold
                  py-2.5 rounded-xl transition-all disabled:opacity-60">
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                      Creating...
                    </span>
                  : '🧾 Create Invoice'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}