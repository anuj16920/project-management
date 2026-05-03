import React, { useEffect, useState } from 'react'
import { CheckSquare, Clock, Calendar, FolderKanban,
         TrendingUp, AlertCircle, Timer } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { taskAPI }    from '@/lib/taskAPI'
import { projectAPI } from '@/lib/projectAPI'
import KPICard        from '@/pages/dashboard/components/KPICard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { toast } from 'sonner'

export default function EmployeeDashboard() {
  const { profile } = useAuth()
  const [tasks,    setTasks]    = useState([])
  const [projects, setProjects] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [t, p] = await Promise.all([
          taskAPI.list({ assignee_uid: profile?.firebase_uid }),
          projectAPI.list({}),
        ])
        setTasks(t.data.data    || [])
        setProjects(p.data.data || [])
      } catch { toast.error('Failed to load dashboard') }
      finally { setLoading(false) }
    }
    if (profile) load()
  }, [profile])

  const myTasks      = tasks
  const todayTasks   = myTasks.filter(t => t.due_date?.split('T')[0] === new Date().toISOString().split('T')[0])
  const overdue      = myTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done')
  const inProgress   = myTasks.filter(t => t.status === 'in_progress')
  const completed    = myTasks.filter(t => t.status === 'done')

  const KPIs = [
    { title:'My Tasks',       value: myTasks.length,   icon:'CheckSquare', color:'#6366F1', index:0 },
    { title:'In Progress',    value: inProgress.length, icon:'Timer',      color:'#F59E0B', index:1 },
    { title:'Due Today',      value: todayTasks.length, icon:'Calendar',   color:'#06B6D4', index:2 },
    { title:'Overdue',        value: overdue.length,    icon:'AlertCircle',color:'#EF4444', index:3 },
  ]

  const STATUS_COLOR = {
    todo:        'bg-slate-400',
    in_progress: 'bg-accent',
    review:      'bg-warning',
    done:        'bg-success',
  }

  return (
    <div>
      {/* Welcome */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        className="mb-6">
        <h2 className="font-display font-black text-2xl text-text-p">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {profile?.full_name?.split(' ')[0]} 👋
        </h2>
        <p className="text-text-m text-sm mt-1">Here's your work overview for today</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array(4).fill(0).map((_,i) => <SkeletonCard key={i} />)
          : KPIs.map((k,i) => <KPICard key={i} {...k} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* My Tasks */}
        <div className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl p-5">
          <h3 className="font-display font-bold text-base text-text-p mb-4">My Tasks</h3>
          {loading ? <SkeletonCard /> : myTasks.length === 0 ? (
            <p className="text-text-f text-sm text-center py-8">No tasks assigned yet 🎉</p>
          ) : (
            <div className="space-y-2.5">
              {myTasks.slice(0,8).map(task => (
                <div key={task.id}
                  className="flex items-center gap-3 bg-surface2 border border-white/5 rounded-xl px-3 py-2.5 hover:border-white/10 transition-all">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLOR[task.status]||'bg-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.status==='done'?'line-through text-text-f':'text-text-p'}`}>
                      {task.title}
                    </p>
                    {task.projects?.name && (
                      <p className="text-text-f text-xs truncate">{task.projects.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {task.due_date && (
                      <span className={`text-xs ${new Date(task.due_date)<new Date()&&task.status!=='done'?'text-error':'text-text-f'}`}>
                        {new Date(task.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize
                      ${task.priority==='high'||task.priority==='urgent'?'bg-error/15 text-error':
                        task.priority==='medium'?'bg-warning/15 text-warning':'bg-white/10 text-text-m'}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="space-y-4">
          {/* Progress ring */}
          <div className="bg-surface border border-white/5 rounded-2xl p-5">
            <h3 className="font-display font-bold text-sm text-text-p mb-4">Task Progress</h3>
            {myTasks.length > 0 ? (
              <>
                <div className="flex items-center justify-center mb-3">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366F1" strokeWidth="3"
                        strokeDasharray={`${(completed.length/myTasks.length)*100} 100`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-text-p text-lg font-bold tabular-nums">
                        {Math.round((completed.length/myTasks.length)*100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label:'Completed', count: completed.length,   color:'bg-success' },
                    { label:'In Progress',count: inProgress.length, color:'bg-accent'  },
                    { label:'Todo',      count: myTasks.filter(t=>t.status==='todo').length, color:'bg-slate-400' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${s.color}`} />
                        <span className="text-text-m text-xs">{s.label}</span>
                      </div>
                      <span className="text-text-p text-xs font-bold tabular-nums">{s.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-text-f text-xs text-center py-4">No tasks yet</p>
            )}
          </div>

          {/* My Projects */}
          <div className="bg-surface border border-white/5 rounded-2xl p-5">
            <h3 className="font-display font-bold text-sm text-text-p mb-3">My Projects</h3>
            {projects.length === 0
              ? <p className="text-text-f text-xs text-center py-3">Not in any project</p>
              : <div className="space-y-2.5">
                  {projects.slice(0,4).map(p => (
                    <div key={p.id} className="bg-surface2 rounded-xl px-3 py-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-text-p text-xs font-medium truncate flex-1">{p.name}</p>
                        <span className="text-text-f text-xs tabular-nums ml-2">{p.progress||0}%</span>
                      </div>
                      <div className="h-1 bg-surface rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all"
                          style={{ width:`${p.progress||0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>}
          </div>
        </div>
      </div>
    </div>
  )
}