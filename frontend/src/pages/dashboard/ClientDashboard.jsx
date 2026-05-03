import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import KPICard from './components/KPICard'
import { SkeletonDashboard } from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '@/lib/api'

const PROJECTS = [
  { name:'Mobile App Redesign',  progress:78, status:'on_track', due:'Apr 30' },
  { name:'E-Commerce Platform',  progress:45, status:'at_risk',  due:'May 15' },
  { name:'Brand Identity Update',progress:92, status:'on_track', due:'Apr 10' },
]

const INV_DATA = [
  { month:'Jan',amount:4200 },{ month:'Feb',amount:5800 },{ month:'Mar',amount:3900 },
  { month:'Apr',amount:6200 },{ month:'May',amount:5100 },{ month:'Jun',amount:7400 },
]

const STATUS_LABELS = { on_track:'On Track', at_risk:'At Risk', delayed:'Delayed' }
const STATUS_BADGE  = { on_track:'success',  at_risk:'warning', delayed:'error'   }

export default function ClientDashboard() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/client').catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonDashboard />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-black text-2xl text-text-p">
          Welcome back, <span className="gradient-text">{profile?.full_name?.split(' ')[0]} 👋</span>
        </h2>
        <p className="text-text-m text-sm mt-1">Here's your project and billing overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title:'Active Projects', value:3,        change:1,    changeLabel:'new',          icon:'FolderKanban', color:'#6366F1' },
          { title:'Pending Invoices',value:'$12,400', change:-2,   changeLabel:'vs last month',icon:'Receipt',      color:'#F59E0B' },
          { title:'Total Paid',      value:'$48,200', change:18.5, changeLabel:'this year',    icon:'CheckCircle',  color:'#10B981' },
          { title:'Open Tickets',    value:2,         change:-1,   changeLabel:'resolved',     icon:'MessageSquare',color:'#06B6D4' },
        ].map((k,i) => <KPICard key={i} {...k} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* My Projects */}
        <div className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-text-p">My Projects</h3>
            <button className="text-accent text-xs">View all</button>
          </div>
          <div className="space-y-4">
            {PROJECTS.map((p, i) => (
              <div key={i} className="bg-surface2 border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-text-p text-sm font-semibold">{p.name}</p>
                    <p className="text-text-f text-xs mt-0.5">Due {p.due}</p>
                  </div>
                  <Badge variant={STATUS_BADGE[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width:`${p.progress}%` }} />
                  </div>
                  <span className="text-text-m text-xs w-8 text-right font-semibold">{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Chart */}
        <div className="bg-surface border border-white/5 rounded-2xl p-5">
          <h3 className="font-display font-bold text-base text-text-p mb-1">Invoice History</h3>
          <p className="text-text-f text-xs mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={INV_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background:'#111118', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, fontSize:12 }} />
              <Bar dataKey="amount" fill="#6366F1" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}