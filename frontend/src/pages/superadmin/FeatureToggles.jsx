import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Zap, Database, X, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'

function Toggle({ enabled, onChange, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none
        ${enabled ? 'bg-accent' : 'bg-surface2'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90'}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform ring-0 transition duration-200
          ${enabled ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  )
}

const EMPTY_FORM = { name: '', description: '', enabled: true }

export default function FeatureToggles() {
  const [features, setFeatures] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [saving,   setSaving]   = useState(false)
  const [toggling, setToggling] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/superadmin/features')
        setFeatures(res.data.data || res.data || [])
      } catch {
        toast.error('Failed to load feature flags')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleToggle = async (feature) => {
    if (toggling[feature.id]) return
    setToggling(prev => ({ ...prev, [feature.id]: true }))
    const newEnabled = !feature.enabled
    // Optimistic update
    setFeatures(prev => prev.map(f => f.id === feature.id ? { ...f, enabled: newEnabled } : f))
    try {
      await api.patch(`/superadmin/features/${feature.id}`, { enabled: newEnabled })
      toast.success(`"${feature.name}" ${newEnabled ? 'enabled' : 'disabled'}`)
    } catch {
      // Revert
      setFeatures(prev => prev.map(f => f.id === feature.id ? { ...f, enabled: feature.enabled } : f))
      toast.error('Failed to update feature flag')
    } finally {
      setToggling(prev => ({ ...prev, [feature.id]: false }))
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Feature name is required')
    setSaving(true)
    try {
      const res = await api.post('/superadmin/features', form)
      const created = res.data.data || res.data
      setFeatures(prev => [created, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
      toast.success('Feature flag created')
    } catch {
      toast.error('Failed to create feature flag')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-black text-2xl text-text-p">Feature Flags</h2>
            <p className="text-text-m text-sm mt-1">Manage platform-wide feature toggles</p>
          </div>
          <button
            onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} />
            New Feature Flag
          </button>
        </div>
      </motion.div>

      {/* Inline Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <form
              onSubmit={handleCreate}
              className="bg-surface border border-white/10 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display font-bold text-sm text-text-p">New Feature Flag</h3>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                  className="text-text-f hover:text-text-m transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-m text-xs font-medium mb-1.5">Flag Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. enable_chat"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-surface2 border border-white/10 rounded-xl px-3 py-2 text-text-p text-sm placeholder:text-text-f focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-text-m text-xs font-medium mb-1.5">Description</label>
                  <input
                    type="text"
                    placeholder="Short description of this flag"
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full bg-surface2 border border-white/10 rounded-xl px-3 py-2 text-text-p text-sm placeholder:text-text-f focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Toggle enabled={form.enabled} onChange={val => setForm(p => ({ ...p, enabled: val }))} />
                  <span className="text-text-m text-sm">Enable immediately</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                    className="text-text-m text-sm px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    Create Flag
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flags Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-surface border border-white/5 rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-accent" />
            <h3 className="font-display font-bold text-sm text-text-p">All Feature Flags</h3>
          </div>
          <span className="text-text-f text-xs">
            {loading ? '—' : `${features.length} flag${features.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : features.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface2 flex items-center justify-center mb-4">
              <Zap size={22} className="text-text-f" />
            </div>
            <p className="text-text-p text-sm font-semibold mb-1">No feature flags configured</p>
            <p className="text-text-f text-xs max-w-xs">
              Create your first feature flag using the button above to start managing platform features.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Flag Name', 'Description', 'Status', 'Toggle'].map(h => (
                  <th
                    key={h}
                    className="text-left text-text-f text-xs font-medium uppercase tracking-wider px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {features.map(f => (
                <tr key={f.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-3.5">
                    <p className="text-text-p text-sm font-medium font-mono">{f.name}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-text-m text-sm">{f.description || <span className="text-text-f italic">No description</span>}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium
                      ${f.enabled ? 'bg-success/15 text-success' : 'bg-white/8 text-text-f'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${f.enabled ? 'bg-success' : 'bg-text-f'}`} />
                      {f.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {toggling[f.id] ? (
                      <Loader2 size={16} className="animate-spin text-text-f" />
                    ) : (
                      <Toggle enabled={f.enabled} onChange={() => handleToggle(f)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Footer note */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="mt-4 flex items-start gap-2.5 bg-surface border border-white/5 rounded-xl p-4"
      >
        <Database size={14} className="text-text-f mt-0.5 flex-shrink-0" />
        <p className="text-text-f text-xs leading-relaxed">
          Feature flags are stored in the database. The{' '}
          <code className="text-text-m font-mono bg-surface2 px-1 py-0.5 rounded text-xs">feature_flags</code>{' '}
          table must exist in Supabase.
        </p>
      </motion.div>
    </div>
  )
}
