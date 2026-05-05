import React, { useEffect, useState } from 'react'
import {
  User, Bell, Save, Mail, Phone, Briefcase, FileText, Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { toast } from 'sonner'
import Avatar from '@/components/ui/Avatar'

const TABS = [
  { id: 'profile',       label: 'Profile',      icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

const NOTIF_DEFAULTS = {
  email_notifications: true,
  task_assignments:    true,
  project_updates:     true,
  invoice_alerts:      false,
  mention_alerts:      true,
}

const LS_KEY = 'emp_notif_prefs'

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div>
        <p className="text-text-p text-sm font-medium">{label}</p>
        {description && <p className="text-text-f text-xs mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
          checked ? 'bg-accent' : 'bg-white/10'
        }`}
        aria-checked={checked}
        role="switch"
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-text-f text-xs mb-1.5">
        {Icon && <Icon size={11} />}
        {label}
      </label>
      {children}
    </div>
  )
}

export default function EmployeeSettings() {
  const { profile } = useAuth()
  const [tab,    setTab]    = useState('profile')
  const [saving, setSaving] = useState(false)

  // --- Profile tab ---
  const [form, setForm] = useState({
    full_name: '',
    phone:     '',
    job_title: '',
    bio:       '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name  || '',
        phone:     profile.phone      || '',
        job_title: profile.job_title  || '',
        bio:       profile.bio        || '',
      })
    }
  }, [profile])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await api.patch('/auth/me', form)
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  // --- Notifications tab ---
  const [notifs, setNotifs] = useState(() => {
    try {
      return { ...NOTIF_DEFAULTS, ...JSON.parse(localStorage.getItem(LS_KEY) || '{}') }
    } catch {
      return NOTIF_DEFAULTS
    }
  })

  const setNotif = (k, v) => {
    const next = { ...notifs, [k]: v }
    setNotifs(next)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
    toast.success('Preference saved')
  }

  const inputCls =
    'w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f'

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="font-display font-black text-2xl text-text-p">Settings</h2>
        <p className="text-text-m text-sm mt-1">Manage your profile and notification preferences</p>
      </motion.div>

      {/* Tab Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-1 bg-surface border border-white/5 rounded-xl p-1 mb-6 w-fit"
      >
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-accent/20 text-accent'
                  : 'text-text-m hover:text-text-p'
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          )
        })}
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ── PROFILE TAB ─────────────────────────────────────────────────── */}
        {tab === 'profile' && (
          <motion.div key="profile"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-surface border border-white/5 rounded-2xl p-6 space-y-6"
          >
            {/* Avatar row */}
            <div className="flex items-center gap-4">
              <Avatar name={profile?.full_name || 'Employee'} size="xl" />
              <div>
                <p className="text-text-p font-semibold">
                  {profile?.full_name || 'Employee'}
                </p>
                <p className="text-text-m text-sm">{profile?.email}</p>
                <span className="inline-block mt-1.5 text-xs px-2.5 py-0.5 bg-cyan/15 text-cyan rounded-full">
                  Employee
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name" icon={User}>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  placeholder="Your full name"
                  className={inputCls}
                />
              </Field>

              <Field label="Phone" icon={Phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  className={inputCls}
                />
              </Field>

              <Field label="Job Title" icon={Briefcase}>
                <input
                  type="text"
                  value={form.job_title}
                  onChange={e => set('job_title', e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  className={inputCls}
                />
              </Field>

              <Field label="Email" icon={Mail}>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className={`${inputCls} opacity-50 cursor-not-allowed`}
                />
              </Field>
            </div>

            <Field label="Bio" icon={FileText}>
              <textarea
                rows={3}
                value={form.bio}
                onChange={e => set('bio', e.target.value)}
                placeholder="Share a bit about yourself with the team..."
                className={`${inputCls} resize-none`}
              />
            </Field>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 bg-accent hover:bg-accent-h text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60 hover:scale-105 active:scale-95"
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── NOTIFICATIONS TAB ───────────────────────────────────────────── */}
        {tab === 'notifications' && (
          <motion.div key="notifications"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-surface border border-white/5 rounded-2xl p-6"
          >
            <h3 className="font-display font-bold text-base text-text-p mb-1">Notification Preferences</h3>
            <p className="text-text-f text-sm mb-5">
              Control which events send you notifications.
            </p>

            <Toggle
              checked={notifs.email_notifications}
              onChange={v => setNotif('email_notifications', v)}
              label="Email Notifications"
              description="Receive important updates via email"
            />
            <Toggle
              checked={notifs.task_assignments}
              onChange={v => setNotif('task_assignments', v)}
              label="Task Assignments"
              description="When a task is assigned to you"
            />
            <Toggle
              checked={notifs.project_updates}
              onChange={v => setNotif('project_updates', v)}
              label="Project Updates"
              description="Status changes and milestone completions"
            />
            <Toggle
              checked={notifs.invoice_alerts}
              onChange={v => setNotif('invoice_alerts', v)}
              label="Invoice Alerts"
              description="Payment and invoice status changes"
            />
            <Toggle
              checked={notifs.mention_alerts}
              onChange={v => setNotif('mention_alerts', v)}
              label="Mention Alerts"
              description="When someone @mentions you in comments"
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
