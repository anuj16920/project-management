import React, { useEffect, useState, useCallback } from 'react'
import {
  Users, UserPlus, Trash2, Search, Shield,
  Briefcase, Building2, Copy, Check, Eye,
  EyeOff, Mail, Lock, Phone, RefreshCw,
  ChevronDown, X, UserCheck, MoreVertical,
  KeyRound, AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { usersAPI } from '@/lib/usersAPI'
import { useAuth } from '@/hooks/useAuth'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Spinner from '@/components/ui/Spinner'

// ── Helpers ───────────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  admin:    { badge: 'error',   bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20' },
  employee: { badge: 'accent',  bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  client:   { badge: 'success', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  hr:       { badge: 'warning', bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20' },
}

const TABS = [
  { id: 'employee', label: 'Employees',  icon: Briefcase,  role: 'employee' },
  { id: 'client',   label: 'Clients',    icon: Building2,  role: 'client'   },
]

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button type="button" onClick={copy}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-all text-text-f hover:text-text-p">
      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
    </button>
  )
}

// ── Credential Success Card ────────────────────────────────────────────────────
function CredentialCard({ user, password, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-surface border border-white/10 rounded-2xl shadow-card-h overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-success/20 to-accent/20 border-b border-white/5 p-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-success/20 border border-success/30 flex items-center justify-center">
                <UserCheck size={20} className="text-success" />
              </div>
              <div>
                <p className="text-text-p font-bold text-base">Account Created! 🎉</p>
                <p className="text-text-m text-xs">Share these credentials with {user.full_name?.split(' ')[0]}</p>
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="p-5 space-y-3">
            {/* Email */}
            <div className="bg-surface2 rounded-xl border border-white/8 px-4 py-3">
              <p className="text-text-f text-xs mb-1 flex items-center gap-1"><Mail size={11} /> Email / Username</p>
              <div className="flex items-center justify-between">
                <p className="text-text-p text-sm font-mono font-medium">{user.email}</p>
                <CopyBtn text={user.email} />
              </div>
            </div>

            {/* Password */}
            <div className="bg-surface2 rounded-xl border border-white/8 px-4 py-3">
              <p className="text-text-f text-xs mb-1 flex items-center gap-1"><Lock size={11} /> Temporary Password</p>
              <div className="flex items-center justify-between">
                <p className="text-text-p text-sm font-mono font-medium">{password}</p>
                <CopyBtn text={password} />
              </div>
            </div>

            {/* Role */}
            <div className="bg-surface2 rounded-xl border border-white/8 px-4 py-3">
              <p className="text-text-f text-xs mb-1 flex items-center gap-1"><Shield size={11} /> Portal Access</p>
              <p className="text-text-p text-sm font-medium capitalize">{user.role} Portal</p>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 bg-warning/8 border border-warning/20 rounded-xl p-3">
              <AlertCircle size={14} className="text-warning mt-0.5 flex-shrink-0" />
              <p className="text-warning text-xs leading-relaxed">
                Save these credentials now — the password won't be shown again. Ask {user.full_name?.split(' ')[0]} to change it after first login.
              </p>
            </div>

            {/* Login URL */}
            <div className="bg-surface2 rounded-xl border border-white/8 px-4 py-3">
              <p className="text-text-f text-xs mb-1">Login URL</p>
              <div className="flex items-center justify-between">
                <p className="text-accent text-sm font-mono">{window.location.origin}/login</p>
                <CopyBtn text={`${window.location.origin}/login`} />
              </div>
            </div>

            <button onClick={onClose}
              className="w-full bg-accent hover:bg-accent-h text-white font-semibold py-3 rounded-xl transition-all mt-2">
              Done
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Create User Modal ──────────────────────────────────────────────────────────
function CreateModal({ type, onClose, onSuccess }) {
  const [form, setForm] = useState({
    fullName: '', email: '', tempPassword: '', phone: '', department: '', companyName: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})

  const genPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!'
    const pwd = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setForm(f => ({ ...f, tempPassword: pwd }))
    setShowPass(true)
  }

  const validate = () => {
    const e = {}
    if (!form.fullName.trim())   e.fullName    = 'Required'
    if (!form.email.trim())      e.email       = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.tempPassword)      e.tempPassword = 'Required'
    else if (form.tempPassword.length < 8) e.tempPassword = 'Min 8 characters'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      let res
      if (type === 'employee') res = await usersAPI.createEmployee({ ...form, password: form.tempPassword })
      if (type === 'client')   res = await usersAPI.createClient({ ...form, password: form.tempPassword })
      onSuccess?.({ user: res.data.data, password: form.tempPassword })
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to create ${type} account`)
    } finally {
      setLoading(false)
    }
  }

  const LABELS = {
    employee: { title: 'Create Employee Account', color: 'text-accent', accent: 'border-accent/30 bg-accent/5' },
    client:   { title: 'Create Client Account',   color: 'text-emerald-400', accent: 'border-emerald-500/30 bg-emerald-500/5' },
  }
  const cfg = LABELS[type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-card-h overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className={`font-display font-bold text-lg ${cfg.color}`}>{cfg.title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-m hover:text-text-p transition-all">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-text-m text-xs font-medium block mb-1.5">Full Name *</label>
            <input type="text" placeholder="John Doe"
              value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
              className={`w-full bg-surface2 border ${errors.fullName?'border-error/60':'border-white/10'} focus:border-accent/60 rounded-xl px-4 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
            {errors.fullName && <p className="text-error text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-text-m text-xs font-medium block mb-1.5">Work Email *</label>
            <input type="email" placeholder="john@company.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className={`w-full bg-surface2 border ${errors.email?'border-error/60':'border-white/10'} focus:border-accent/60 rounded-xl px-4 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
            {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Conditional fields */}
          {type === 'employee' && (
            <div>
              <label className="text-text-m text-xs font-medium block mb-1.5">Department</label>
              <input type="text" placeholder="Engineering, Sales, HR, Design..."
                value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-4 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f" />
            </div>
          )}

          {type === 'client' && (
            <div>
              <label className="text-text-m text-xs font-medium block mb-1.5">Client's Company Name</label>
              <input type="text" placeholder="Acme Corp Ltd."
                value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})}
                className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-4 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f" />
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="text-text-m text-xs font-medium block mb-1.5">Phone <span className="text-text-f">(optional)</span></label>
            <input type="tel" placeholder="+91 98765 43210"
              value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl px-4 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f" />
          </div>

          {/* Temp Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-text-m text-xs font-medium">Temporary Password *</label>
              <button type="button" onClick={genPassword}
                className="flex items-center gap-1 text-accent text-xs hover:text-accent-h transition-colors">
                <RefreshCw size={11} /> Auto-generate
              </button>
            </div>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                value={form.tempPassword} onChange={e => setForm({...form, tempPassword: e.target.value})}
                className={`w-full bg-surface2 border ${errors.tempPassword?'border-error/60':'border-white/10'} focus:border-accent/60 rounded-xl pl-4 pr-16 py-2.5 text-text-p text-sm font-mono outline-none transition-all placeholder:text-text-f`} />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {form.tempPassword && <CopyBtn text={form.tempPassword} />}
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-text-f hover:text-text-m transition-all">
                  {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
            {errors.tempPassword && <p className="text-error text-xs mt-1">{errors.tempPassword}</p>}
            <p className="text-text-f text-xs mt-1.5">
              The user will log in with this password. Ask them to change it after first login.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-white/10 hover:border-white/20 text-text-m text-sm font-medium py-2.5 rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-accent hover:bg-accent-h text-white text-sm font-semibold py-2.5 rounded-xl transition-all glow-accent disabled:opacity-60 disabled:cursor-not-allowed">
              {loading
                ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</span>
                : `Create ${type === 'employee' ? 'Employee' : 'Client'}`}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ── User Row ──────────────────────────────────────────────────────────────────
function UserRow({ user, onDelete }) {
  const col = ROLE_COLORS[user.role] || ROLE_COLORS.employee
  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.full_name} size="sm" />
          <div>
            <p className="text-text-p text-sm font-medium leading-tight">{user.full_name}</p>
            <p className="text-text-f text-xs mt-0.5">{user.department || user.company_name || '—'}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-text-m text-sm">{user.email}</p>
        {user.phone && <p className="text-text-f text-xs mt-0.5">{user.phone}</p>}
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${col.bg} ${col.text} ${col.border} capitalize`}>
          {user.role}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${user.is_active !== false ? 'bg-success' : 'bg-red-500'}`} />
          <span className="text-text-m text-xs">{user.is_active !== false ? 'Active' : 'Inactive'}</span>
        </div>
      </td>
      <td className="px-5 py-4 text-right">
        {user.role !== 'admin' && (
          <button onClick={() => onDelete(user.id, user.full_name)}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-all">
            <Trash2 size={15} />
          </button>
        )}
      </td>
    </motion.tr>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyTab({ type, onAdd }) {
  const cfg = {
    employee: { icon: Briefcase, title: 'No employees yet', desc: 'Add your first team member to get started.', color: 'text-accent', btn: 'Add Employee' },
    client:   { icon: Building2, title: 'No clients yet',   desc: 'Add your first client to manage their projects.', color: 'text-emerald-400', btn: 'Add Client' },
  }[type]

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4">
        <cfg.icon size={28} className={`${cfg.color} opacity-60`} />
      </div>
      <p className="text-text-p font-semibold mb-1">{cfg.title}</p>
      <p className="text-text-f text-sm mb-6 max-w-xs">{cfg.desc}</p>
      <button onClick={onAdd}
        className="flex items-center gap-2 bg-accent hover:bg-accent-h text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
        <UserPlus size={15} /> {cfg.btn}
      </button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TeamManagement() {
  const { profile } = useAuth()
  const [activeTab,    setActiveTab]    = useState('employee')
  const [users,        setUsers]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [showModal,    setShowModal]    = useState(false)
  const [credential,   setCredential]   = useState(null) // { user, password }

  const currentTab = TABS.find(t => t.id === activeTab)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await usersAPI.list({ role: currentTab?.role, search: search || undefined })
      setUsers(res.data.data || [])
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [activeTab, search])

  useEffect(() => {
    const t = setTimeout(load, 300) // debounce
    return () => clearTimeout(t)
  }, [load])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    try {
      await usersAPI.delete(id)
      toast.success(`${name} removed`)
      load()
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const handleCreated = ({ user, password }) => {
    setShowModal(false)
    setCredential({ user, password })
    load()
  }

  // Stats per tab
  const stats = {
    total:  users.length,
    active: users.filter(u => u.is_active !== false).length,
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-p">Team Management</h1>
          <p className="text-text-f text-sm mt-1">
            Create and manage login credentials for your employees and clients.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-h text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all glow-accent"
        >
          <UserPlus size={16} />
          Add {activeTab === 'employee' ? 'Employee' : 'Client'}
        </button>
      </div>

      {/* ── How it works banner ── */}
      <div className="bg-accent/5 border border-accent/15 rounded-2xl p-4 flex items-start gap-3">
        <KeyRound size={16} className="text-accent mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-text-p text-sm font-semibold mb-0.5">How credentials work</p>
          <p className="text-text-m text-xs leading-relaxed">
            Only <span className="text-accent font-medium">Admins</span> can create accounts.
            After creating an employee or client, you'll receive their <span className="text-accent font-medium">email + temporary password</span> to share with them.
            They sign in at <span className="font-mono text-accent/80">{window.location.origin}/login</span>
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 bg-surface border border-white/5 rounded-2xl p-1.5 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearch('') }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-accent/15 text-accent border border-accent/20' : 'text-text-m hover:text-text-p hover:bg-white/4'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-4 max-w-xs">
        <div className="bg-surface border border-white/5 rounded-xl p-4">
          <p className="text-text-f text-xs mb-1">Total {currentTab?.label}</p>
          <p className="text-text-p text-2xl font-bold">{loading ? '—' : stats.total}</p>
        </div>
        <div className="bg-surface border border-white/5 rounded-xl p-4">
          <p className="text-text-f text-xs mb-1">Active</p>
          <p className="text-success text-2xl font-bold">{loading ? '—' : stats.active}</p>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-f" />
        <input
          type="text"
          placeholder={`Search ${currentTab?.label?.toLowerCase()}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-surface border border-white/8 focus:border-accent/40 rounded-xl pl-10 pr-4 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-f hover:text-text-m">
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner />
          </div>
        ) : users.length === 0 ? (
          <EmptyTab type={activeTab} onAdd={() => setShowModal(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="text-left px-5 py-3 text-text-f text-xs font-semibold uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-text-f text-xs font-semibold uppercase tracking-wider">Contact</th>
                  <th className="text-left px-5 py-3 text-text-f text-xs font-semibold uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-text-f text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <UserRow key={user.id} user={user} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      <AnimatePresence>
        {showModal && (
          <CreateModal
            type={activeTab}
            onClose={() => setShowModal(false)}
            onSuccess={handleCreated}
          />
        )}
      </AnimatePresence>

      {/* ── Credential Reveal ── */}
      <AnimatePresence>
        {credential && (
          <CredentialCard
            user={credential.user}
            password={credential.password}
            onClose={() => setCredential(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
