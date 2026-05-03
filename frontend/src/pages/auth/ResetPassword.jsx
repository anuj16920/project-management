import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
import { confirmPasswordReset, getAuth } from 'firebase/auth'
import { toast } from 'sonner'
import AuthLayout from './components/AuthLayout'

export default function ResetPassword() {
  const navigate = useNavigate()
  const oobCode  = new URLSearchParams(window.location.search).get('oobCode')

  const [form,    setForm]    = useState({ password:'', confirm:'' })
  const [show,    setShow]    = useState({ p:false, c:false })
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})
  const [done,    setDone]    = useState(false)

  const validate = () => {
    const e = {}
    if (form.password.length < 8) e.password = 'Minimum 8 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    if (!oobCode) return toast.error('Invalid or expired reset link')
    setLoading(true)
    try {
      await confirmPasswordReset(getAuth(), oobCode, form.password)
      setDone(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      toast.error('Reset link expired. Please request a new one.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong password for your account.">
      {done ? (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={28} className="text-success" />
          </div>
          <p className="text-text-m text-sm">Password updated! Redirecting to sign in...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* New Password */}
          <div>
            <label className="text-text-m text-sm font-medium block mb-1.5">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-f" />
              <input type={show.p?'text':'password'} placeholder="Min. 8 characters"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className={`w-full bg-surface2 border ${errors.password?'border-error/60':'border-white/10'} focus:border-accent/60 focus:ring-2 focus:ring-accent/20 rounded-xl pl-10 pr-12 py-3 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
              <button type="button" onClick={() => setShow({...show, p:!show.p})} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-f hover:text-text-m transition-colors">
                {show.p ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-error text-xs mt-1.5">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-text-m text-sm font-medium block mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-f" />
              <input type={show.c?'text':'password'} placeholder="Repeat your password"
                value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})}
                className={`w-full bg-surface2 border ${errors.confirm?'border-error/60':'border-white/10'} focus:border-accent/60 focus:ring-2 focus:ring-accent/20 rounded-xl pl-10 pr-12 py-3 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
              <button type="button" onClick={() => setShow({...show, c:!show.c})} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-f hover:text-text-m transition-colors">
                {show.c ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm && <p className="text-error text-xs mt-1.5">{errors.confirm}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-h text-white font-semibold py-3 rounded-xl transition-all glow-accent hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed mt-2">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                     : <><span>Reset Password</span><ArrowRight size={16} /></>}
          </button>

          <Link to="/login" className="flex items-center justify-center gap-2 text-text-m text-sm hover:text-text-p transition-colors mt-2">
            Back to Sign In
          </Link>
        </form>
      )}
    </AuthLayout>
  )
}