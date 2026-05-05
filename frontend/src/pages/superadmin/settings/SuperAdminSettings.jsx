import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Server, Loader2, Save } from 'lucide-react'
import api from '@/lib/api'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'

function Toggle({ enabled, onChange, disabled = false, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${disabled ? 'text-text-f' : 'text-text-p'}`}>{label}</p>
        {description && <p className="text-text-f text-xs mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none mt-0.5
          ${enabled ? 'bg-accent' : 'bg-surface2'}
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90'}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform ring-0 transition duration-200
            ${enabled ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}

function InputField({ label, description, value, onChange, type = 'number', min, disabled = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-p">{label}</p>
        {description && <p className="text-text-f text-xs mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <input
        type={type}
        min={min}
        value={value}
        onChange={e => onChange(type === 'number' ? parseInt(e.target.value, 10) || 0 : e.target.value)}
        disabled={disabled}
        className="w-24 bg-surface2 border border-white/10 rounded-xl px-3 py-1.5 text-text-p text-sm text-right focus:outline-none focus:border-accent/50 transition-colors disabled:opacity-50 tabular-nums"
      />
    </div>
  )
}

const DIVIDER = <div className="border-t border-white/5" />

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [form,     setForm]     = useState({
    maintenance_mode:   false,
    signups_enabled:    true,
    force_2fa:          false,
    max_users_free:     5,
    max_projects_free:  3,
  })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/superadmin/settings')
        const d   = res.data.data || res.data
        setSettings(d)
        setForm({
          maintenance_mode:  d.maintenance_mode  ?? false,
          signups_enabled:   d.signups_enabled   ?? true,
          force_2fa:         d.force_2fa         ?? false,
          max_users_free:    d.max_users_free    ?? 5,
          max_projects_free: d.max_projects_free ?? 3,
        })
      } catch {
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/superadmin/settings', form)
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-black text-2xl text-text-p">Platform Settings</h2>
            <p className="text-text-m text-sm mt-1">Configure global platform controls and limits</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Settings
          </button>
        </div>
      </motion.div>

      <div className="space-y-4">

        {/* Platform Controls */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-surface border border-white/5 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center gap-2.5 p-5 border-b border-white/5">
            <Shield size={16} className="text-accent" />
            <h3 className="font-display font-bold text-sm text-text-p">Platform Controls</h3>
          </div>
          <div className="px-5 divide-y divide-white/5">
            {loading ? (
              <div className="py-4 space-y-4">
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <>
                <Toggle
                  enabled={form.maintenance_mode}
                  onChange={set('maintenance_mode')}
                  label="Maintenance Mode"
                  description="When enabled, all tenant workspaces will display a maintenance notice and block logins."
                />
                {DIVIDER}
                <Toggle
                  enabled={form.signups_enabled}
                  onChange={set('signups_enabled')}
                  label="New Signups Enabled"
                  description="Allow new organizations to register on the platform. Disable to freeze new sign-ups."
                />
                {DIVIDER}
                <Toggle
                  enabled={form.force_2fa}
                  onChange={set('force_2fa')}
                  disabled
                  label="Force 2FA (Planned)"
                  description="Require two-factor authentication for all users platform-wide. Coming soon."
                />
              </>
            )}
          </div>
        </motion.div>

        {/* Plan Limits */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="bg-surface border border-white/5 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center gap-2.5 p-5 border-b border-white/5">
            <Server size={16} className="text-text-m" />
            <h3 className="font-display font-bold text-sm text-text-p">Plan Limits</h3>
          </div>
          <div className="px-5 divide-y divide-white/5">
            {loading ? (
              <div className="py-4 space-y-4">
                {Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <>
                <InputField
                  label="Max Users (Free Plan)"
                  description="Maximum number of users allowed per workspace on the free tier."
                  value={form.max_users_free}
                  onChange={set('max_users_free')}
                  min={1}
                />
                {DIVIDER}
                <InputField
                  label="Max Projects (Free Plan)"
                  description="Maximum number of projects allowed per workspace on the free tier."
                  value={form.max_projects_free}
                  onChange={set('max_projects_free')}
                  min={1}
                />
              </>
            )}
          </div>
        </motion.div>

        {/* System Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-surface border border-white/5 rounded-2xl p-5"
        >
          <h3 className="font-display font-bold text-sm text-text-p mb-4">System Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Node Version', value: 'v20.x' },
              { label: 'Database',     value: 'Supabase' },
              { label: 'Auth',         value: 'Firebase' },
            ].map(info => (
              <div key={info.label} className="bg-surface2 rounded-xl px-4 py-3">
                <p className="text-text-f text-xs uppercase tracking-wider mb-1">{info.label}</p>
                <p className="text-text-p text-sm font-semibold font-mono">{info.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
          className="bg-surface border border-error/30 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <AlertTriangle size={16} className="text-error" />
            <h3 className="font-display font-bold text-sm text-error">Danger Zone</h3>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-text-p text-sm font-medium">Delete All Demo Data</p>
              <p className="text-text-f text-xs mt-0.5 leading-relaxed">
                Permanently remove all seeded demo tenants, users, and sample data from the platform.
                This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => toast.error('This feature is restricted')}
              className="flex-shrink-0 bg-error/15 hover:bg-error/25 text-error text-sm font-semibold px-4 py-2 rounded-xl border border-error/20 hover:border-error/40 transition-colors whitespace-nowrap"
            >
              Delete All Demo Data
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
