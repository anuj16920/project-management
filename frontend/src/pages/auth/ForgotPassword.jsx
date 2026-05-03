import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import AuthLayout from './components/AuthLayout'

export default function ForgotPassword() {
  const { forgotPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      setError('Email is required')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      await forgotPassword(email)
      setSent(true)
      toast.success('Reset link sent!')
    } catch (err) {
      console.error(err)
      toast.error('Could not send reset email. Check the address and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={sent ? 'Check your inbox' : 'Reset your password'}
      subtitle={
        sent
          ? `We've sent a reset link to ${email}`
          : "Enter your email and we'll send a reset link."
      }
    >
      {sent ? (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={28} className="text-success" />
          </div>

          <p className="text-text-m text-sm mb-8">
            Didn't receive it? Check your spam folder or{' '}
            <button
              onClick={() => setSent(false)}
              className="text-accent hover:underline"
            >
              try again
            </button>.
          </p>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-text-m text-sm hover:text-text-p transition-colors"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="text-text-m text-sm font-medium block mb-1.5">
              Email address
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-f"
              />

              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                className={`w-full bg-surface2 border ${
                  error ? 'border-error/60' : 'border-white/10'
                } focus:border-accent/60 focus:ring-2 focus:ring-accent/20 rounded-xl pl-10 pr-4 py-3 text-text-p text-sm outline-none transition-all placeholder:text-text-f`}
              />
            </div>

            {error && <p className="text-error text-xs mt-1.5">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-h text-white font-semibold py-3 rounded-xl transition-all glow-accent hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-text-m text-sm hover:text-text-p transition-colors mt-4"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </form>
      )}
    </AuthLayout>
  )
}