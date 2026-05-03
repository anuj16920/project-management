import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import KPICard            from './components/KPICard'
import RevenueChart       from './components/RevenueChart'
import TaskProgressWidget from './components/TaskProgressWidget'
import TeamActivityFeed   from './components/TeamActivityFeed'
import QuickActionsPanel  from './components/QuickActionsPanel'
import { SkeletonDashboard } from '@/components/ui/Skeleton'
import api from '@/lib/api'

const KPIs = [
  { title:'Total Revenue',   value:'72000', prefix:'$', change:18.2, changeLabel:'vs last month', icon:'DollarSign',     color:'#10B981' },
  { title:'Active Projects', value:24,                  change:3,    changeLabel:'new this month', icon:'FolderKanban',   color:'#6366F1' },
  { title:'Open Tasks',      value:142,                 change:-8,   changeLabel:'vs last week',   icon:'CheckSquare',    color:'#F59E0B' },
  { title:'Team Members',    value:36,                  change:5.6,  changeLabel:'vs last month',  icon:'Users',          color:'#06B6D4' },
]

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [stats,    setStats]    = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/dashboard/admin')
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonDashboard />

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="font-display font-black text-2xl text-text-p">
          Good {new Date().getHours()<12?'morning':new Date().getHours()<17?'afternoon':'evening'},{' '}
          <span className="gradient-text">{profile?.full_name?.split(' ')[0]} 👋</span>
        </h2>
        <p className="text-text-m text-sm mt-1">Here's what's happening in your workspace today.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIs.map((k, i) => <KPICard key={i} {...k} index={i} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><RevenueChart /></div>
        <TaskProgressWidget />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><TeamActivityFeed /></div>
        <QuickActionsPanel />
      </div>
    </div>
  )
}