import React, { useState } from 'react'
import { X, User, Mail, Lock, Phone, Building2, Briefcase, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { userAPI } from '@/lib/api'
import { useRoleGuard } from '@/hooks/useRoleGuard'

export default function CreateUserModal({ type = 'employee', onClose, onSuccess }) {
  const { canCreateStaff, canCreateAdmin } = useRoleGuard()
  const [form, setForm] = useState({
    fullName:'', email:'', tempPassword:'', phone:'', department:'', companyName:'',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})

  // Block unauthorised access right in the component too
  if (type === 'admin'    && !canCreateAdmin)  return null
  if (type !== 'admin'    && !canCreateStaff)  return null

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
      if (type === 'employee') res = await userAPI.createEmployee(form)
      if (type === 'client')   res = await userAPI.createClient(form)
      if (type === 'admin')    res = await userAPI.createAdmin(form)
      toast.success(`${type.charAt(0).toUpperCase()+type.slice(1)} account created! 🎉`)
      onSuccess?.(res.data.data)
      onClose?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to create ${type}`)
    } finally {
      setLoading(false)
    }
  }

  const TITLES  = { employee:'Create Employee Account', client:'Create Client Account', admin:'Create Admin Account' }
  const COLORS  = { employee:'text-accent', client:'text-cyan', admin:'text-warning' }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
          className="relative z-10 w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-card-h overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className={`font-display font-bold text-lg ${COLORS[type]}`}>{TITLES[type]}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-m hover:text-text-p transition-all">
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-text-m text-xs font-medium block mb-1.5">Full Name *</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-f" />
                <input type="text" placeholder="John Doe"
                  value={form.fullName} onChange={e => setForm({...form, fullName:e.target.value})}
                  className={`w-full bg-surface2 border ${errors.fullName?'border-error/60':'border-white/10'} focus:border-accent/60 rounded-xl pl-9 pr-3 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
              </div>
              {errors.fullName && <p className="text-error text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-text-m text-xs font-medium block mb-1.5">Work Email *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-f" />
                <input type="email" placeholder="john@company.com"
                  value={form.email} onChange={e => setForm({...form, email:e.target.value})}
                  className={`w-full bg-surface2 border ${errors.email?'border-error/60':'border-white/10'} focus:border-accent/60 rounded-xl pl-9 pr-3 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
              </div>
              {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Conditional fields */}
            {type === 'employee' && (
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">Department</label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-f" />
                  <input type="text" placeholder="Engineering, Sales, HR..."
                    value={form.department} onChange={e => setForm({...form, department:e.target.value})}
                    className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl pl-9 pr-3 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f" />
                </div>
              </div>
            )}

            {type === 'client' && (
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">Client Company</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-f" />
                  <input type="text" placeholder="Client Corp Ltd."
                    value={form.companyName} onChange={e => setForm({...form, companyName:e.target.value})}
                    className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl pl-9 pr-3 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f" />
                </div>
              </div>
            )}

            {/* Phone */}
            {type !== 'admin' && (
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-f" />
                  <input type="tel" placeholder="+91 98765 43210"
                    value={form.phone} onChange={e => setForm({...form, phone:e.target.value})}
                    className="w-full bg-surface2 border border-white/10 focus:border-accent/60 rounded-xl pl-9 pr-3 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f" />
                </div>
              </div>
            )}

            {/* Temp Password */}
            <div>
              <label className="text-text-m text-xs font-medium block mb-1.5">Temporary Password *</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-f" />
                <input type={showPass?'text':'password'} placeholder="Min. 8 characters"
                  value={form.tempPassword} onChange={e => setForm({...form, tempPassword:e.target.value})}
                  className={`w-full bg-surface2 border ${errors.tempPassword?'border-error/60':'border-white/10'} focus:border-accent/60 rounded-xl pl-9 pr-10 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-f hover:text-text-m transition-colors">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.tempPassword && <p className="text-error text-xs mt-1">{errors.tempPassword}</p>}
              <p className="text-text-f text-xs mt-1.5">User will be prompted to change this on first login.</p>
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
                  : `Create ${type.charAt(0).toUpperCase()+type.slice(1)}`}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}