import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import KPICard from './components/KPICard'
import { SkeletonDashboard } from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import { Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react'
import api from '@/lib/api'

const MY_TASKS = [
  { title:'Update API documentation',    project:'Backend Revamp',     due:'Today',     priority:'high'   },
  { title:'Review PR #142',              project:'Dashboard UI',        due:'Tomorrow',  priority:'medium' },
  { title:'Write unit tests for auth',   project:'Backend Revamp',     due:'Apr 5',     priority:'medium' },
  { title:'Design review meeting prep',  project:'Mobile App v3',      due:'Apr 6',     priority:'low'    },
]

const PRIORITY_COLORS = { high:'error', medium:'warning', low:'success' }

export default function EmployeeDashboard() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/employee').catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonDashboard />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-black text-2xl text-text-p">
          Hey, <span className="gradient-text">{profile?.full_name?.split(' ')[0]} 👋</span>
        </h2>
        <p className="text-text-m text-sm mt-1">You have <span className="text-warning font-semibold">4 tasks</span> due this week.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title:'Tasks Completed',  value:18, change:12,  changeLabel:'this week',  icon:'CheckSquare', color:'#10B981' },
          { title:'Hours Logged',     value:38, suffix:'h', change:5,   changeLabel:'vs last week', icon:'Clock',      color:'#6366F1' },
          { title:'Projects Active',  value:3,              change:0,   changeLabel:'same as before',icon:'FolderKanban',color:'#06B6D4' },
          { title:'Leave Balance',    value:12, suffix:' days',change:0,changeLabel:'remaining',    icon:'CalendarOff',color:'#F59E0B' },
        ].map((k,i) => <KPICard key={i} {...k} index={i} />)}
      </div>

      {/* My Tasks + Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* My Tasks */}
        <div className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-text-p">My Tasks Due Soon</h3>
            <button className="text-accent text-xs hover:text-accent-h">View all</button>
          </div>
          <div className="space-y-3">
            {MY_TASKS.map((t, i) => (
              <motion.div key={i} initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.08 }}
                className="flex items-center gap-3 bg-surface2 border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all">
                <div className="w-5 h-5 rounded-full border-2 border-white/20 flex-shrink-0 cursor-pointer hover:border-success transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-p text-sm font-medium truncate">{t.title}</p>
                  <p className="text-text-f text-xs">{t.project}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-m text-xs">{t.due}</span>
                  <Badge variant={PRIORITY_COLORS[t.priority]} className="capitalize">{t.priority}</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Today's Status */}
        <div className="bg-surface border border-white/5 rounded-2xl p-5 space-y-4">
          <h3 className="font-display font-bold text-base text-text-p">Today's Status</h3>
          {[
            { icon: Clock,        label:'Check-In Time',   value:'9:02 AM',        color:'text-success' },
            { icon: CheckCircle,  label:'Tasks Done Today',value:'3 of 5',          color:'text-accent'  },
            { icon: AlertCircle,  label:'Pending Approvals',value:'1 Leave Request',color:'text-warning' },
            { icon: Calendar,     label:'Next Meeting',    value:'3:00 PM Standup', color:'text-cyan'    },
          ].map((s,i) => {
            const Icon = s.icon
            return (
              <div key={i} className="flex items-center gap-3 bg-surface2 rounded-xl p-3 border border-white/5">
                <Icon size={16} className={s.color} />
                <div>
                  <p className="text-text-f text-xs">{s.label}</p>
                  <p className="text-text-p text-sm font-semibold">{s.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}