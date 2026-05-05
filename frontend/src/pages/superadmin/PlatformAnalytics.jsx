import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import api from '@/lib/api'
import KPICard from '@/pages/dashboard/components/KPICard'
import { SkeletonCard, Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'

const ROLE_COLORS = ['#6366F1', '#10B981', '#06B6D4']
const PLAN_COLORS = ['#94A3B8', '#6366F1', '#10B981']

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-white/10 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-text-m font-semibold mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-text-m capitalize">{p.name}:</span>
          <span className="text-text-p font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-white/10 rounded-xl p-3 text-xs shadow-xl">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: payload[0].payload.fill }} />
        <span className="text-text-m capitalize">{payload[0].name}:</span>
        <span className="text-text-p font-semibold">{payload[0].value}</span>
      </div>
    </div>
  )
}

export default function PlatformAnalytics() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/superadmin/analytics')
        setData(res.data.data || res.data)
      } catch {
        toast.error('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const kpis = data ? [
    { title: 'Total Tenants',    value: data.totalTenants  || 0, icon: 'Building2',  color: '#6366F1', index: 0 },
    { title: 'Active Tenants',   value: data.activeTenants || 0, icon: 'Activity',   color: '#10B981', index: 1 },
    { title: 'Total Users',      value: data.totalUsers    || 0, icon: 'Users',      color: '#06B6D4', index: 2 },
    { title: 'Platform Revenue', value: 0,                       icon: 'DollarSign', color: '#F59E0B', index: 3, prefix: '$' },
  ] : []

  const roleData = data ? [
    { name: 'Admins',    value: data.adminCount    || 0, fill: ROLE_COLORS[0] },
    { name: 'Employees', value: data.employeeCount || 0, fill: ROLE_COLORS[1] },
    { name: 'Clients',   value: data.clientCount   || 0, fill: ROLE_COLORS[2] },
  ] : []

  const planData = data ? [
    { name: 'Free',       value: data.freeTenants       || 0, fill: PLAN_COLORS[0] },
    { name: 'Pro',        value: data.proTenants        || 0, fill: PLAN_COLORS[1] },
    { name: 'Enterprise', value: data.enterpriseTenants || 0, fill: PLAN_COLORS[2] },
  ] : []

  const growth = data?.growth || []

  const totalRoles = roleData.reduce((s, x) => s + x.value, 0)

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="font-display font-black text-2xl text-text-p">Platform Analytics</h2>
        <p className="text-text-m text-sm mt-1">Platform-wide metrics, growth trends and distribution</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : kpis.map((k, i) => <KPICard key={i} {...k} />)}
      </div>

      {/* Growth Trends */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-surface border border-white/5 rounded-2xl p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-base text-text-p">Growth Trends</h3>
            <p className="text-text-f text-xs mt-0.5">Tenants and Users over the last 6 months</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span className="text-text-m text-xs">Tenants</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#06B6D4' }} />
              <span className="text-text-m text-xs">Users</span>
            </div>
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-52 w-full" />
        ) : growth.length === 0 ? (
          <div className="h-52 flex items-center justify-center">
            <p className="text-text-f text-sm">No growth data available yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growth}>
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
              <Line type="monotone" dataKey="tenants" stroke="#6366F1" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#6366F1' }} />
              <Line type="monotone" dataKey="users"   stroke="#06B6D4" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#06B6D4' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* User Role Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="bg-surface border border-white/5 rounded-2xl p-5"
        >
          <h3 className="font-display font-bold text-base text-text-p mb-1">User Role Distribution</h3>
          <p className="text-text-f text-xs mb-5">Breakdown of all platform users by role</p>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {roleData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3 w-full">
                {roleData.map((r) => (
                  <div key={r.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.fill }} />
                        <span className="text-text-m text-xs">{r.name}</span>
                      </div>
                      <span className="text-text-p text-xs font-bold tabular-nums">{r.value}</span>
                    </div>
                    <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${totalRoles > 0 ? Math.round((r.value / totalRoles) * 100) : 0}%`,
                          background: r.fill,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Plan Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="bg-surface border border-white/5 rounded-2xl p-5"
        >
          <h3 className="font-display font-bold text-base text-text-p mb-1">Plan Breakdown</h3>
          <p className="text-text-f text-xs mb-5">Tenant distribution by subscription plan</p>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={planData} layout="vertical" margin={{ left: 10, right: 24 }}>
                  <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={30}>
                    {planData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-3 mt-4 flex-wrap">
                {planData.map((p) => (
                  <div key={p.name} className="flex items-center gap-1.5 bg-surface2 rounded-lg px-3 py-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.fill }} />
                    <span className="text-text-m text-xs">{p.name}</span>
                    <span className="text-text-p text-xs font-bold ml-1">{p.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
