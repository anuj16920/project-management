import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit3, Users, CheckSquare, Calendar, DollarSign, Flag, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import { projectAPI }    from '@/lib/projectAPI'
import { useRoleGuard }  from '@/hooks/useRoleGuard'
import Badge             from '@/components/ui/Badge'
import Avatar            from '@/components/ui/Avatar'
import MilestonePanel    from './components/MilestonePanel'
import ActivityLog       from './components/ActivityLog'
import Spinner           from '@/components/ui/Spinner'
import { toast }         from 'sonner'

const STATUS_BADGE   = { active:'accent', on_hold:'warning', completed:'success', cancelled:'error' }
const PRIORITY_BADGE = { low:'success', medium:'warning', high:'error', urgent:'error' }

export default function ProjectDetail() {
  const { id }            = useParams()
  const navigate          = useNavigate()
  const { canCreateStaff }= useRoleGuard()
  const [project,  setProject]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [activeTab,setActiveTab]= useState('overview') // overview | tasks | members | activity

  const load = async () => {
    try {
      const res = await projectAPI.get(id)
      setProject(res.data.data)
    } catch { toast.error('Failed to load project') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <Spinner size="lg" />
    </div>
  )

  if (!project) return (
    <div className="text-center py-20">
      <p className="text-text-m">Project not found</p>
      <button onClick={() => navigate('/admin/projects')} className="text-accent text-sm mt-2">Go back</button>
    </div>
  )

  const tasksDone  = project.tasks?.filter(t => t.status === 'done').length  || 0
  const tasksTotal = project.tasks?.length || 0
  const progress   = tasksTotal ? Math.round((tasksDone/tasksTotal)*100) : 0

  const TABS = ['overview','tasks','members','activity']

  return (
    <div>
      {/* Back button */}
      <button onClick={() => navigate('/admin/projects')}
        className="flex items-center gap-2 text-text-m hover:text-text-p text-sm mb-6 transition-colors group">
        <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
        Back to Projects
      </button>

      {/* Hero */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        className="bg-surface border border-white/5 rounded-2xl p-6 mb-6"
        style={{ borderLeft:`4px solid ${project.cover_color || '#6366F1'}` }}>
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="font-display font-black text-2xl text-text-p">{project.name}</h1>
              <Badge variant={STATUS_BADGE[project.status] || 'default'} className="capitalize">
                {project.status?.replace('_',' ')}
              </Badge>
              <Badge variant={PRIORITY_BADGE[project.priority] || 'default'} className="capitalize">
                <Flag size={10} className="mr-1" />{project.priority}
              </Badge>
            </div>
            {project.description && (
              <p className="text-text-m text-sm leading-relaxed mb-3 max-w-2xl">{project.description}</p>
            )}
            {/* Tags */}
            {project.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {project.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/8 rounded-full text-text-f text-xs">
                    <Tag size={9} className="inline mr-1" />{t}
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Quick stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
            {[
              { icon: CheckSquare, label:'Tasks',    value:`${tasksDone}/${tasksTotal}`, color:'text-accent'  },
              { icon: Users,       label:'Members',  value:project.project_members?.length || 0, color:'text-cyan' },
              { icon: Calendar,    label:'Due',      value: project.due_date
                  ? new Date(project.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})
                  : '—',                                                                  color:'text-warning' },
              { icon: DollarSign,  label:'Budget',   value: project.budget
                  ? `$${Number(project.budget).toLocaleString()}`
                  : '—',                                                                  color:'text-success' },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="bg-surface2 border border-white/5 rounded-xl p-3 text-center">
                  <Icon size={14} className={`${s.color} mx-auto mb-1`} />
                  <p className="text-text-p text-sm font-bold tabular-nums">{s.value}</p>
                  <p className="text-text-f text-xs">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-m text-xs">Overall Progress</span>
            <span className="text-text-p text-xs font-bold tabular-nums">{progress}%</span>
          </div>
          <div className="h-2 bg-surface2 rounded-full overflow-hidden">
            <motion.div initial={{ width:0 }} animate={{ width:`${progress}%` }} transition={{ duration:1, ease:'easeOut' }}
              className="h-full rounded-full" style={{ background: project.cover_color || '#6366F1' }} />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface border border-white/5 rounded-xl p-1 mb-6 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${activeTab===t ? 'bg-accent/20 text-accent' : 'text-text-m hover:text-text-p'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MilestonePanel projectId={id} milestones={project.milestones || []} onRefresh={load} />
          </div>
          <ActivityLog activities={(project.project_activity || []).slice(0, 10)} />
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-surface border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-text-p">Tasks ({tasksTotal})</h3>
            <button className="text-accent text-xs">+ Add Task</button>
          </div>
          {project.tasks?.length === 0 && (
            <p className="text-text-f text-sm text-center py-8">No tasks yet. Add tasks from the Tasks module.</p>
          )}
          <div className="space-y-2">
            {project.tasks?.map(t => (
              <div key={t.id} className="flex items-center gap-3 bg-surface2 border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status==='done'?'bg-success':t.status==='in_progress'?'bg-accent':'bg-white/20'}`} />
                <span className={`text-sm flex-1 ${t.status==='done'?'text-text-f line-through':'text-text-p'}`}>{t.title}</span>
                <Badge variant={t.priority==='high'||t.priority==='urgent'?'error':'warning'} className="capitalize text-xs">{t.priority}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-surface border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-text-p">Members ({project.project_members?.length || 0})</h3>
            {canCreateStaff && <button className="text-accent text-xs">+ Add Member</button>}
          </div>
          <div className="space-y-3">
            {project.project_members?.map(m => (
              <div key={m.id} className="flex items-center gap-3 bg-surface2 border border-white/5 rounded-xl p-3">
                <Avatar name={m.profiles?.full_name || 'User'} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-p text-sm font-medium">{m.profiles?.full_name || 'User'}</p>
                  <p className="text-text-f text-xs">{m.profiles?.email}</p>
                </div>
                <Badge variant={m.role==='owner'?'accent':m.role==='manager'?'cyan':'default'} className="capitalize">{m.role}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <ActivityLog activities={project.project_activity || []} />
      )}
    </div>
  )
}