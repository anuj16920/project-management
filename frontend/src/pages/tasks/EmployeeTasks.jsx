import React, { useEffect, useState, useCallback } from 'react'
import { Search, Filter, Calendar, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth }  from '@/hooks/useAuth'
import { taskAPI }  from '@/lib/taskAPI'
import { SkeletonCard } from '@/components/ui/Skeleton'
import TaskDetailDrawer from '@/pages/tasks/components/TaskDetailDrawer'
import Badge  from '@/components/ui/Badge'
import { toast } from 'sonner'

const STATUS_TABS = ['all','todo','in_progress','review','done']
const PRIORITY_BADGE = { low:'success', medium:'warning', high:'error', urgent:'error' }
const STATUS_DOT = {
  todo:'bg-slate-400', in_progress:'bg-accent', review:'bg-warning', done:'bg-success'
}

export default function EmployeeTasks() {
  const { profile } = useAuth()
  const [tasks,       setTasks]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [activeTab,   setActiveTab]   = useState('all')
  const [search,      setSearch]      = useState('')
  const [selectedId,  setSelectedId]  = useState(null)

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    try {
      const params = { assignee_uid: profile.firebase_uid }
      if (activeTab !== 'all') params.status = activeTab
      if (search)              params.search = search
      const r = await taskAPI.list(params)
      setTasks(r.data.data || [])
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }, [profile, activeTab, search])

  useEffect(() => { load() }, [load])

  const grouped = {
    overdue:     tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'),
    today:       tasks.filter(t => t.due_date?.split('T')[0] === new Date().toISOString().split('T')[0] && t.status !== 'done'),
    upcoming:    tasks.filter(t => t.due_date && new Date(t.due_date) >= new Date() && t.due_date?.split('T')[0] !== new Date().toISOString().split('T')[0] && t.status !== 'done'),
    no_due_date: tasks.filter(t => !t.due_date && t.status !== 'done'),
    done:        tasks.filter(t => t.status === 'done'),
  }

  const TaskRow = ({ task }) => (
    <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
      onClick={() => setSelectedId(task.id)}
      className="flex items-center gap-3 bg-surface2 border border-white/5 hover:border-white/12 rounded-xl px-4 py-3 cursor-pointer transition-all group">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[task.status]||'bg-slate-400'}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.status==='done'?'line-through text-text-f':'text-text-p'}`}>
          {task.title}
        </p>
        {task.projects?.name && <p className="text-text-f text-xs truncate">{task.projects.name}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {task.estimated_hrs && (
          <span className="text-text-f text-xs flex items-center gap-1">
            <Clock size={10} />{task.logged_hrs||0}/{task.estimated_hrs}h
          </span>
        )}
        {task.due_date && (
          <span className={`text-xs flex items-center gap-1 ${new Date(task.due_date)<new Date()&&task.status!=='done'?'text-error':'text-text-f'}`}>
            <Calendar size={10} />
            {new Date(task.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
          </span>
        )}
        <Badge variant={PRIORITY_BADGE[task.priority]||'default'} className="capitalize text-xs">{task.priority}</Badge>
      </div>
    </motion.div>
  )

  const Section = ({ title, tasks, color='text-text-m' }) => tasks.length === 0 ? null : (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className={`text-xs font-semibold uppercase tracking-wider ${color}`}>{title}</span>
        <span className="bg-surface2 border border-white/8 text-text-f text-xs px-2 py-0.5 rounded-full tabular-nums">{tasks.length}</span>
      </div>
      <div className="space-y-2">
        {tasks.map(t => <TaskRow key={t.id} task={t} />)}
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-black text-2xl text-text-p">My Tasks</h2>
          <p className="text-text-m text-sm mt-1">{tasks.length} tasks assigned to you</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={14} className="text-text-f" />
          <input placeholder="Search tasks..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-text-p text-sm outline-none w-full placeholder:text-text-f" />
        </div>
        {/* Status tabs */}
        <div className="flex gap-1 bg-surface border border-white/5 rounded-xl p-1">
          {STATUS_TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                ${activeTab===t?'bg-accent/20 text-accent':'text-text-m hover:text-text-p'}`}>
              {t.replace('_',' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks */}
      {loading ? (
        <div className="space-y-2">{Array(5).fill(0).map((_,i) => <SkeletonCard key={i} />)}</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-f text-sm">No tasks found 🎉</p>
        </div>
      ) : activeTab === 'all' ? (
        <>
          <Section title="⚠️ Overdue"    tasks={grouped.overdue}     color="text-error"   />
          <Section title="📅 Due Today"  tasks={grouped.today}       color="text-warning" />
          <Section title="🗓️ Upcoming"   tasks={grouped.upcoming}    color="text-accent"  />
          <Section title="📋 No Due Date"tasks={grouped.no_due_date} color="text-text-m"  />
          <Section title="✅ Completed"  tasks={grouped.done}        color="text-success" />
        </>
      ) : (
        <div className="space-y-2">{tasks.map(t => <TaskRow key={t.id} task={t} />)}</div>
      )}

      {/* Drawer */}
      {selectedId && (
        <TaskDetailDrawer taskId={selectedId} onClose={() => setSelectedId(null)} onUpdate={load} />
      )}
    </div>
  )
}