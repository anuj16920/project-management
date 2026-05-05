import React, { useEffect, useState } from 'react'
import {
  User, Building2, Bell, Shield, Save, Eye, EyeOff,
  Mail, Phone, Briefcase, FileText, ExternalLink, Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { toast } from 'sonner'
import { auth } from '@/lib/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'
import Avatar from '@/components/ui/Avatar'

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User      },
  { id: 'workspace',     label: 'Workspace',      icon: Building2 },
  { id: 'notifications', label: 'Notifications',  icon: Bell      },
  { id: 'security',      label: 'Security',       icon: Shield    },
]

const NOTIF_DEFAULTS = {
  email_notifications: true,
  task_assignments:    true,
  project_updates:     true,
  invoice_alerts:      true,
  mention_alerts:      true,
}

const LS_KEY = 'notif_prefs'

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

export default function AdminSettings() {
  const { profile } = useAuth()
  const [tab,     setTab]     = useState('profile')
  const [saving,  setSaving]  = useState(false)

  // --- Profile tab ---
  const [form, setForm] = useState({
    full_name:  '',
    phone:      '',
    job_title:  '',
    bio:        '',
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
    toast.success('Notification preference saved')
  }

  // --- Security tab ---
  const [pwResetSent, setPwResetSent] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)

  const handleSendResetEmail = async () => {
    if (!profile?.email) return
    setSendingReset(true)
    try {
      await sendPasswordResetEmail(auth, profile.email)
      setPwResetSent(true)
      toast.success('Password reset email sent!')
    } catch {
      toast.error('Failed to send reset email')
    } finally {
      setSendingReset(false)
    }
  }

  const inputCls =
    'w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f'

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="font-display font-black text-2xl text-text-p">Settings</h2>
        <p className="text-text-m text-sm mt-1">Manage your profile, workspace, and preferences</p>
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
              <Avatar name={profile?.full_name || 'Admin'} size="xl" />
              <div>
                <p className="text-text-p font-semibold">
                  {profile?.full_name || 'Admin'}
                </p>
                <p className="text-text-m text-sm">{profile?.email}</p>
                <span className="inline-block mt-1.5 text-xs px-2.5 py-0.5 bg-accent/15 text-accent rounded-full">
                  Admin
                </span>
              </div>
            </div>

            {/* Form */}
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
                  placeholder="e.g. Project Manager"
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
                placeholder="Tell your team a little about yourself..."
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

        {/* ── WORKSPACE TAB ───────────────────────────────────────────────── */}
        {tab === 'workspace' && (
          <motion.div key="workspace"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <h3 className="font-display font-bold text-base text-text-p mb-5">Workspace Info</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between bg-surface2 border border-white/5 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-text-f text-xs mb-0.5">Organization Name</p>
                    <p className="text-text-p text-sm font-semibold">
                      {profile?.tenant?.name || profile?.tenant_id || 'Your Workspace'}
                    </p>
                  </div>
                  <Building2 size={18} className="text-text-f" />
                </div>

                <div className="flex items-center justify-between bg-surface2 border border-white/5 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-text-f text-xs mb-0.5">Current Plan</p>
                    <div className="flex items-center gap-2">
                      <p className="text-text-p text-sm font-semibold capitalize">
                        {profile?.tenant?.plan || 'Pro'}
                      </p>
                      <span className="text-xs px-2 py-0.5 bg-accent/15 text-accent rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-surface2 border border-white/5 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-text-f text-xs mb-0.5">Member Since</p>
                    <p className="text-text-p text-sm font-semibold">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-surface2 border border-white/5 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-text-f text-xs mb-0.5">Role</p>
                    <p className="text-text-p text-sm font-semibold capitalize">{profile?.role || 'Admin'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <h3 className="font-display font-bold text-base text-text-p mb-2">Need Help?</h3>
              <p className="text-text-m text-sm mb-4">
                Reach out to our support team for billing, upgrades, or technical issues.
              </p>
              <a
                href="mailto:support@nexawork.io"
                className="inline-flex items-center gap-2 bg-surface2 border border-white/10 hover:border-white/20 text-text-p text-sm px-4 py-2.5 rounded-xl transition-all"
              >
                <Mail size={14} />
                Contact Support
                <ExternalLink size={12} className="text-text-f" />
              </a>
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
              Choose which events trigger notifications for you.
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
              description="Payment received, overdue invoices"
            />
            <Toggle
              checked={notifs.mention_alerts}
              onChange={v => setNotif('mention_alerts', v)}
              label="Mention Alerts"
              description="When someone @mentions you in comments"
            />
          </motion.div>
        )}

        {/* ── SECURITY TAB ────────────────────────────────────────────────── */}
        {tab === 'security' && (
          <motion.div key="security"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <h3 className="font-display font-bold text-base text-text-p mb-1">Change Password</h3>
              <p className="text-text-f text-sm mb-5">
                We'll send a secure password reset link to your registered email address.
              </p>

              <div className="bg-surface2 border border-white/5 rounded-xl px-4 py-3 mb-5">
                <p className="text-text-f text-xs mb-0.5">Registered Email</p>
                <p className="text-text-p text-sm font-medium">{profile?.email}</p>
              </div>

              {pwResetSent ? (
                <div className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-xl px-4 py-3">
                  <Check size={16} className="text-success flex-shrink-0" />
                  <div>
                    <p className="text-success text-sm font-medium">Reset email sent!</p>
                    <p className="text-text-f text-xs mt-0.5">
                      Check your inbox at <span className="text-text-m">{profile?.email}</span> for the reset link.
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSendResetEmail}
                  disabled={sendingReset}
                  className="flex items-center gap-2 bg-accent hover:bg-accent-h text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60 hover:scale-105 active:scale-95"
                >
                  <Shield size={14} />
                  {sendingReset ? 'Sending...' : 'Send Password Reset Email'}
                </button>
              )}
            </div>

            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <h3 className="font-display font-bold text-base text-text-p mb-1">Active Sessions</h3>
              <p className="text-text-f text-sm mb-4">
                You are currently signed in on this device.
              </p>
              <div className="bg-surface2 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-text-p text-sm font-medium">Current Session</p>
                  <p className="text-text-f text-xs mt-0.5">
                    {typeof window !== 'undefined' ? navigator.userAgent.split('(')[0].trim() : 'Browser'}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-success/15 text-success rounded-full">Active</span>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
