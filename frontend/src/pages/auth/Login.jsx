import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Info, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import AuthLayout from './components/AuthLayout'
import GoogleLoginBtn from './components/GoogleLoginBtn'
import { ROLES, ROUTES } from '@/lib/constants'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || null

  const [form,    setForm]    = useState({ email:'', password:'' })
  const [show,    setShow]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})
  const [mode,    setMode]    = useState('login') // 'login' | 'info'

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const profile = await login(form.email, form.password)
      toast.success(`Welcome back, ${profile.full_name?.split(' ')[0]}! 👋`)
      if (from) return navigate(from, { replace: true })
      const redirect = {
        [ROLES.SUPER_ADMIN]: ROUTES.SUPER_DASH,
        [ROLES.ADMIN]:       ROUTES.ADMIN_DASH,
        [ROLES.EMPLOYEE]:    ROUTES.EMPLOYEE_DASH,
        [ROLES.CLIENT]:      ROUTES.CLIENT_DASH,
      }
      navigate(redirect[profile.role] || ROUTES.ADMIN_DASH)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed'
      toast.error(msg)
      if (msg.toLowerCase().includes('password')) setErrors({ password: 'Incorrect password' })
      if (msg.toLowerCase().includes('email'))    setErrors({ email: 'No account with this email' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your NexaWork workspace"
      page="login"
    >
      {/* Google */}
      <GoogleLoginBtn label="Continue with Google" />
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-text-f text-xs">or sign in with email</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label className="text-text-m text-sm font-medium block mb-1.5">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-f" />
            <input type="email" placeholder="you@company.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className={`w-full bg-surface2 border ${errors.email?'border-error/60':'border-white/10'} focus:border-accent/60 focus:ring-2 focus:ring-accent/20 rounded-xl pl-10 pr-4 py-3 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
          </div>
          {errors.email && <p className="text-error text-xs mt-1.5">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-text-m text-sm font-medium">Password</label>
            <Link to="/forgot-password" className="text-accent text-xs hover:text-accent-h transition-colors">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-f" />
            <input type={show?'text':'password'} placeholder="Enter your password"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className={`w-full bg-surface2 border ${errors.password?'border-error/60':'border-white/10'} focus:border-accent/60 focus:ring-2 focus:ring-accent/20 rounded-xl pl-10 pr-12 py-3 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-f hover:text-text-m transition-colors">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-error text-xs mt-1.5">{errors.password}</p>}
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-h text-white font-semibold py-3 rounded-xl transition-all glow-accent hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2">
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                   : <><span>Sign In</span><ArrowRight size={16} /></>}
        </button>
      </form>

      {/* ── Employee / Client info banner ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4"
      >
        <div className="flex items-start gap-3">
          <Info size={15} className="text-accent mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-text-p text-xs font-semibold mb-1">Employee or Client?</p>
            <p className="text-text-m text-xs leading-relaxed">
              Your login credentials are created by your workspace admin.
              Contact your manager or admin if you haven't received them.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Admin workspace creation link ──────────────────────────────────── */}
      <div className="mt-5 pt-5 border-t border-white/[0.06] flex items-center justify-center gap-2">
        <Building2 size={14} className="text-text-f" />
        <p className="text-text-f text-xs">
          Starting a new company?{' '}
          <Link to="/signup" className="text-accent hover:text-accent-h font-medium transition-colors">
            Create a workspace
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}