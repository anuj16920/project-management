import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowRight, CheckCircle, Users, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import AuthLayout from './components/AuthLayout'
import GoogleLoginBtn from './components/GoogleLoginBtn'
import { ROUTES } from '@/lib/constants'

const REQUIREMENTS = [
  { test: v => v.length >= 8,  label:'At least 8 characters' },
  { test: v => /[A-Z]/.test(v), label:'One uppercase letter'  },
  { test: v => /[0-9]/.test(v), label:'One number'            },
]

const PERKS = [
  { icon: Shield, label: 'You become the workspace Admin' },
  { icon: Users,  label: 'Invite employees & clients from Team Management' },
  { icon: Building2, label: 'Full CRM, HR, Finance & Projects access' },
]

export default function Signup() {
  const { signup } = useAuth()
  const navigate   = useNavigate()

  const [form,    setForm]    = useState({ fullName:'', companyName:'', email:'', password:'' })
  const [show,    setShow]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  const validate = () => {
    const e = {}
    if (!form.fullName.trim())    e.fullName    = 'Full name is required'
    if (!form.companyName.trim()) e.companyName = 'Company name is required'
    if (!form.email)              e.email       = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address'
    if (!form.password)           e.password    = 'Password is required'
    else if (form.password.length < 8) e.password = 'Minimum 8 characters'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signup(form)
      toast.success('Workspace created! Welcome to NexaWork 🎉')
      navigate(ROUTES.ADMIN_DASH)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Signup failed'
      toast.error(msg)
      if (msg.toLowerCase().includes('email')) setErrors({ email: 'Email already in use' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create your workspace" subtitle="One account to run your entire company." page="signup">
      {/* Admin-only notice */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-xl bg-accent/8 border border-accent/20 p-4 space-y-2"
      >
        <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Workspace Admin Account</p>
        {PERKS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon size={13} className="text-accent/70 flex-shrink-0" />
            <p className="text-text-m text-xs">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Google */}
      <GoogleLoginBtn label="Sign up with Google" />
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-text-f text-xs">or sign up with email</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div>
          <label className="text-text-m text-sm font-medium block mb-1.5">Your Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-f" />
            <input type="text" placeholder="John Doe"
              value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
              className={`w-full bg-surface2 border ${errors.fullName?'border-error/60':'border-white/10'} focus:border-accent/60 focus:ring-2 focus:ring-accent/20 rounded-xl pl-10 pr-4 py-3 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
          </div>
          {errors.fullName && <p className="text-error text-xs mt-1.5">{errors.fullName}</p>}
        </div>

        {/* Company Name */}
        <div>
          <label className="text-text-m text-sm font-medium block mb-1.5">Company / Organisation Name</label>
          <div className="relative">
            <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-f" />
            <input type="text" placeholder="Acme Technologies Pvt. Ltd."
              value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})}
              className={`w-full bg-surface2 border ${errors.companyName?'border-error/60':'border-white/10'} focus:border-accent/60 focus:ring-2 focus:ring-accent/20 rounded-xl pl-10 pr-4 py-3 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
          </div>
          {errors.companyName && <p className="text-error text-xs mt-1.5">{errors.companyName}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="text-text-m text-sm font-medium block mb-1.5">Work Email</label>
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
          <label className="text-text-m text-sm font-medium block mb-1.5">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-f" />
            <input type={show?'text':'password'} placeholder="Min. 8 characters"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className={`w-full bg-surface2 border ${errors.password?'border-error/60':'border-white/10'} focus:border-accent/60 focus:ring-2 focus:ring-accent/20 rounded-xl pl-10 pr-12 py-3 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-f hover:text-text-m transition-colors">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-error text-xs mt-1.5">{errors.password}</p>}
          {/* Password strength */}
          {form.password && (
            <div className="mt-2 space-y-1">
              {REQUIREMENTS.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle size={12} className={r.test(form.password)?'text-success':'text-text-f'} />
                  <span className={`text-xs ${r.test(form.password)?'text-success':'text-text-f'}`}>{r.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-h text-white font-semibold py-3 rounded-xl transition-all glow-accent hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2">
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                   : <><span>Create Workspace</span><ArrowRight size={16} /></>}
        </button>

        <p className="text-text-f text-xs text-center">
          By signing up, you agree to our{' '}
          <a href="#" className="text-accent hover:underline">Terms</a> and{' '}
          <a href="#" className="text-accent hover:underline">Privacy Policy</a>
        </p>
      </form>

      <p className="text-center text-text-m text-sm mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-accent hover:text-accent-h font-medium transition-colors">Sign in</Link>
      </p>
    </AuthLayout>
  )
}