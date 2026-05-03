import React, { useEffect, useState } from 'react'
import { Building2, Users, DollarSign, TrendingUp,
         Activity, Shield, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/lib/api'
import KPICard from '@/pages/dashboard/components/KPICard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { toast } from 'sonner'

export default function SuperAdminDashboard() {
  const [stats,    setStats]    = useState(null)
  const [tenants,  setTenants]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, t] = await Promise.all([
          api.get('/superadmin/stats'),
          api.get('/superadmin/tenants'),
        ])
        setStats(s.data.data   || null)
        setTenants(t.data.data || [])
      } catch { toast.error('Failed to load stats') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const KPIs = stats ? [
    { title:'Total Workspaces', value: stats.totalTenants,  icon:'Building2',   color:'#6366F1', index:0 },
    { title:'Total Users',      value: stats.totalUsers,    icon:'Users',       color:'#06B6D4', index:1 },
    { title:'Active Plans',     value: stats.activePlans,   icon:'Shield',      color:'#10B981', index:2 },
    { title:'Platform Revenue', value:`$${(stats.revenue||0).toLocaleString()}`, icon:'DollarSign', color:'#F59E0B', index:3 },
  ] : []

  const PLAN_COLOR = { free:'bg-white/10 text-text-m', pro:'bg-accent/15 text-accent', enterprise:'bg-success/15 text-success' }

  return (
    <div>
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <h2 className="font-display font-black text-2xl text-text-p">Platform Overview</h2>
        <p className="text-text-m text-sm mt-1">All tenants and platform-wide metrics</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array(4).fill(0).map((_,i) => <SkeletonCard key={i} />)
          : KPIs.map((k,i) => <KPICard key={i} {...k} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Tenants Table */}
        <div className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h3 className="font-display font-bold text-base text-text-p">All Workspaces</h3>
            <a href="/superadmin/tenants" className="text-accent text-xs hover:underline">Manage all</a>
          </div>
          {loading ? (
            <div className="p-5"><SkeletonCard /></div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Workspace','Owner','Plan','Users','Status'].map(h => (
                    <th key={h} className="text-left text-text-f text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tenants.slice(0,8).map(t => (
                  <tr key={t.id} className="hover:bg-white/2 transition-colors cursor-pointer"
                    onClick={() => window.location.href=`/superadmin/tenants/${t.id}`}>
                    <td className="px-4 py-3">
                      <p className="text-text-p text-sm font-medium">{t.name}</p>
                      <p className="text-text-f text-xs">{new Date(t.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                    </td>
                    <td className="px-4 py-3 text-text-m text-sm">{t.owner_email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${PLAN_COLOR[t.plan]||PLAN_COLOR.free}`}>
                        {t.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-m text-sm tabular-nums">{t.user_count||0}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.is_active?'bg-success/15 text-success':'bg-error/15 text-error'}`}>
                        {t.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right stats */}
        <div className="space-y-4">
          {/* Plan distribution */}
          <div className="bg-surface border border-white/5 rounded-2xl p-5">
            <h3 className="font-display font-bold text-sm text-text-p mb-4">Plan Distribution</h3>
            {stats ? (
              <div className="space-y-3">
                {[
                  { plan:'Enterprise', count: stats.enterpriseTenants||0, color:'bg-success', pct: stats.totalTenants?Math.round(((stats.enterpriseTenants||0)/stats.totalTenants)*100):0 },
                  { plan:'Pro',        count: stats.proTenants||0,        color:'bg-accent',  pct: stats.totalTenants?Math.round(((stats.proTenants||0)/stats.totalTenants)*100):0 },
                  { plan:'Free',       count: stats.freeTenants||0,       color:'bg-slate-400', pct: stats.totalTenants?Math.round(((stats.freeTenants||0)/stats.totalTenants)*100):0 },
                ].map(p => (
                  <div key={p.plan}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-text-m text-xs">{p.plan}</span>
                      <span className="text-text-p text-xs font-bold tabular-nums">{p.count}</span>
                    </div>
                    <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                      <div className={`h-full ${p.color} rounded-full`} style={{ width:`${p.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <SkeletonCard />}
          </div>

          {/* Recent signups */}
          <div className="bg-surface border border-white/5 rounded-2xl p-5">
            <h3 className="font-display font-bold text-sm text-text-p mb-3">Recent Signups</h3>
            <div className="space-y-2.5">
              {tenants.slice(0,4).map(t => (
                <div key={t.id} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Building2 size={12} className="text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-text-p text-xs font-medium truncate">{t.name}</p>
                    <p className="text-text-f text-xs">{new Date(t.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}