import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Building2, Loader2, CreditCard } from 'lucide-react'
import api from '@/lib/api'
import { SkeletonCard, Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'

const PLANS = [
  {
    key: 'free',
    label: 'Free',
    price: '$0',
    period: '/mo',
    color: '#94A3B8',
    badge: 'bg-white/10 text-text-m',
    features: [
      'Up to 5 users',
      '3 projects',
      'Basic task management',
      'Email support',
    ],
  },
  {
    key: 'pro',
    label: 'Pro',
    price: '$49',
    period: '/mo',
    color: '#6366F1',
    badge: 'bg-accent/15 text-accent',
    highlight: true,
    features: [
      'Up to 50 users',
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      'Custom roles',
    ],
  },
  {
    key: 'enterprise',
    label: 'Enterprise',
    price: '$199',
    period: '/mo',
    color: '#10B981',
    badge: 'bg-success/15 text-success',
    features: [
      'Unlimited users',
      'Unlimited projects',
      'Platform analytics',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
]

const PLAN_ORDER = { free: 0, pro: 1, enterprise: 2 }

export default function SubscriptionManager() {
  const [tenants,   setTenants]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [upgrading, setUpgrading] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/superadmin/tenants')
        setTenants(res.data.data || res.data || [])
      } catch {
        toast.error('Failed to load tenants')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleUpgrade = async (tenant, newPlan) => {
    if (tenant.plan === newPlan) return
    const confirmed = window.confirm(
      `Change "${tenant.name}" plan from ${tenant.plan?.toUpperCase()} to ${newPlan.toUpperCase()}?`
    )
    if (!confirmed) return

    setUpgrading(prev => ({ ...prev, [tenant.id]: true }))
    try {
      await api.patch(`/superadmin/tenants/${tenant.id}`, { plan: newPlan })
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, plan: newPlan } : t))
      toast.success(`${tenant.name} moved to ${newPlan} plan`)
    } catch {
      toast.error('Failed to update plan')
    } finally {
      setUpgrading(prev => ({ ...prev, [tenant.id]: false }))
    }
  }

  const planCounts = tenants.reduce((acc, t) => {
    const p = t.plan || 'free'
    acc[p] = (acc[p] || 0) + 1
    return acc
  }, {})

  const PLAN_BADGE = {
    free:       'bg-white/10 text-text-m',
    pro:        'bg-accent/15 text-accent',
    enterprise: 'bg-success/15 text-success',
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="font-display font-black text-2xl text-text-p">Subscription Manager</h2>
        <p className="text-text-m text-sm mt-1">Manage tenant plans and subscription tiers</p>
      </motion.div>

      {/* Plan Stat Row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-4 mb-6"
      >
        {PLANS.map(plan => (
          <div key={plan.key} className="bg-surface border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}30` }}
            >
              <CreditCard size={16} style={{ color: plan.color }} />
            </div>
            <div>
              <p className="text-text-f text-xs uppercase tracking-wider">{plan.label}</p>
              <p className="text-text-p text-xl font-black tabular-nums">
                {loading ? '—' : planCounts[plan.key] || 0}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Plan Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
      >
        {PLANS.map(plan => (
          <div
            key={plan.key}
            className={`bg-surface rounded-2xl p-5 relative overflow-hidden
              ${plan.highlight
                ? 'border border-accent/30 shadow-[0_0_30px_rgba(99,102,241,0.08)]'
                : 'border border-white/5'}`}
          >
            {plan.highlight && (
              <div className="absolute top-3 right-3">
                <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full font-semibold">Popular</span>
              </div>
            )}
            <div className="mb-4">
              <p className="text-text-m text-xs font-semibold uppercase tracking-wider mb-1">{plan.label}</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-text-p font-black text-3xl">{plan.price}</span>
                <span className="text-text-f text-sm">{plan.period}</span>
              </div>
            </div>
            <ul className="space-y-2">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-text-m text-xs">
                  <Check size={13} style={{ color: plan.color }} className="flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-text-f text-xs">
                <span className="font-bold text-text-m">{loading ? '—' : planCounts[plan.key] || 0}</span> tenant{planCounts[plan.key] !== 1 ? 's' : ''} on this plan
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tenant Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="bg-surface border border-white/5 rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-text-m" />
            <h3 className="font-display font-bold text-sm text-text-p">All Tenants</h3>
          </div>
          <span className="text-text-f text-xs">
            {loading ? '—' : `${tenants.length} workspace${tenants.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface2 flex items-center justify-center mb-4">
              <Building2 size={22} className="text-text-f" />
            </div>
            <p className="text-text-p text-sm font-semibold mb-1">No tenants found</p>
            <p className="text-text-f text-xs">Tenant workspaces will appear here once registered.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Workspace', 'Owner', 'Current Plan', 'Users', 'Status', 'Upgrade Plan'].map(h => (
                    <th key={h} className="text-left text-text-f text-xs font-medium uppercase tracking-wider px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tenants.map(t => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-text-p text-sm font-medium">{t.name}</p>
                      <p className="text-text-f text-xs">
                        {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-text-m text-sm">{t.owner_email || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${PLAN_BADGE[t.plan] || PLAN_BADGE.free}`}>
                        {t.plan || 'free'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-text-m text-sm tabular-nums">{t.user_count || 0}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${t.is_active ? 'bg-success/15 text-success' : 'bg-error/15 text-error'}`}>
                        {t.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {upgrading[t.id] ? (
                        <Loader2 size={16} className="animate-spin text-text-f" />
                      ) : (
                        <select
                          value={t.plan || 'free'}
                          onChange={e => handleUpgrade(t, e.target.value)}
                          className="bg-surface2 border border-white/10 text-text-m text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent/50 cursor-pointer hover:border-white/20 transition-colors"
                        >
                          {PLANS.map(p => (
                            <option
                              key={p.key}
                              value={p.key}
                              disabled={p.key === (t.plan || 'free')}
                            >
                              {p.label} ({p.price}/mo)
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
