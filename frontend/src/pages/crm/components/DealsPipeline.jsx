import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, DollarSign, TrendingUp, X } from 'lucide-react'
import { crmAPI } from '@/lib/crmAPI'
import { toast } from 'sonner'

const STAGES = [
  { id:'lead',        label:'Lead',        color:'#475569' },
  { id:'qualified',   label:'Qualified',   color:'#6366F1' },
  { id:'proposal',    label:'Proposal',    color:'#F59E0B' },
  { id:'negotiation', label:'Negotiation', color:'#06B6D4' },
  { id:'won',         label:'Won',         color:'#10B981' },
  { id:'lost',        label:'Lost',        color:'#EF4444' },
]

function DealCard({ deal, onUpdate }) {
  const [moving, setMoving] = useState(false)
  const stage = STAGES.find(s => s.id === deal.stage)

  const moveStage = async (newStage) => {
    setMoving(true)
    try {
      await crmAPI.updateDeal(deal.id, { stage: newStage })
      toast.success(`Deal moved to ${newStage}`)
      onUpdate?.()
    } catch { toast.error('Failed to move deal') }
    finally { setMoving(false) }
  }

  return (
    <div className="bg-surface2 border border-white/8 hover:border-white/15 rounded-xl p-3 transition-all">
      <p className="text-text-p text-xs font-semibold mb-1 leading-snug">{deal.title}</p>
      {deal.clients?.company_name && (
        <p className="text-text-f text-xs mb-2">{deal.clients.company_name}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-success text-xs font-bold tabular-nums">
          ${(deal.value||0).toLocaleString()}
        </span>
        <span className="text-text-f text-xs">{deal.probability}%</span>
      </div>
      {deal.expected_close && (
        <p className="text-text-f text-xs mt-1.5">
          Close: {new Date(deal.expected_close).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
        </p>
      )}
    </div>
  )
}

export default function DealPipeline({ deals = [], clients = [], onRefresh }) {
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState({ title:'', client_id:'', value:'', stage:'lead', probability:20, expected_close:'' })
  const [loading,   setLoading]   = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title || !form.client_id) return
    setLoading(true)
    try {
      await crmAPI.createDeal({
        ...form,
        value:       parseFloat(form.value) || 0,
        probability: parseInt(form.probability) || 0,
        expected_close: form.expected_close || null,
      })
      toast.success('Deal created!')
      setShowForm(false)
      setForm({ title:'', client_id:'', value:'', stage:'lead', probability:20, expected_close:'' })
      onRefresh?.()
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  }

  const pipeline = STAGES.reduce((acc, s) => {
    acc[s.id] = deals.filter(d => d.stage === s.id)
    return acc
  }, {})

  const totalPipeline = deals
    .filter(d => !['won','lost'].includes(d.stage))
    .reduce((s, d) => s + (d.value || 0), 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-base text-text-p">Deal Pipeline</h3>
          <p className="text-text-f text-xs mt-0.5">
            Pipeline value: <span className="text-success font-semibold">${totalPipeline.toLocaleString()}</span>
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-accent text-xs hover:text-accent-h transition-colors">
          <Plus size={13} /> Add Deal
        </button>
      </div>

      {/* Add Deal Form */}
      {showForm && (
        <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
          className="bg-surface2 border border-white/8 rounded-2xl p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-text-p text-sm font-semibold">New Deal</h4>
            <button onClick={() => setShowForm(false)} className="text-text-f hover:text-text-m">
              <X size={14} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <input type="text" placeholder="Deal title *" value={form.title}
              onChange={e => set('title', e.target.value)}
              className="w-full bg-surface border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f" />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.client_id} onChange={e => set('client_id', e.target.value)}
                className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-text-p text-sm outline-none">
                <option value="">Select Client *</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
              <select value={form.stage} onChange={e => set('stage', e.target.value)}
                className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-text-p text-sm outline-none capitalize">
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" placeholder="Value ($)" value={form.value}
                onChange={e => set('value', e.target.value)}
                className="bg-surface border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f" />
              <input type="number" placeholder="Probability %" value={form.probability}
                onChange={e => set('probability', e.target.value)} min={0} max={100}
                className="bg-surface border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f" />
              <input type="date" value={form.expected_close}
                onChange={e => set('expected_close', e.target.value)}
                className="bg-surface border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none" />
            </div>
            <button type="submit" disabled={loading || !form.title || !form.client_id}
              className="w-full bg-accent hover:bg-accent-h text-white text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 glow-accent">
              {loading ? 'Creating...' : 'Create Deal'}
            </button>
          </form>
        </motion.div>
      )}

      {/* Pipeline columns */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <div key={stage.id} className="flex-shrink-0 w-48">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                <span className="text-text-p text-xs font-semibold">{stage.label}</span>
              </div>
              <span className="text-text-f text-xs bg-surface2 px-1.5 py-0.5 rounded-full">
                {pipeline[stage.id]?.length || 0}
              </span>
            </div>
            <div className="space-y-2 min-h-16">
              {pipeline[stage.id]?.map(d => (
                <DealCard key={d.id} deal={d} onUpdate={onRefresh} />
              ))}
              {pipeline[stage.id]?.length === 0 && (
                <div className="text-text-f text-xs text-center py-4 border-2 border-dashed border-white/5 rounded-xl">
                  Empty
                </div>
              )}
            </div>
            {/* Column total */}
            {pipeline[stage.id]?.length > 0 && (
              <div className="mt-2 px-1">
                <p className="text-text-f text-xs text-center">
                  ${pipeline[stage.id].reduce((s,d)=>s+(d.value||0),0).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}