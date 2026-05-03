import React, { useEffect, useState } from 'react'
import { Search, CheckCircle, Circle, Clock } from 'lucide-react'
import { taskAPI }    from '@/lib/taskAPI'
import { projectAPI } from '@/lib/projectAPI'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { toast } from 'sonner'

const STATUS_LABEL = { todo:'To Do', in_progress:'In Progress', review:'In Review', done:'Done' }
const STATUS_COLOR = {
  todo:        'bg-slate-400/15 text-slate-400',
  in_progress: 'bg-accent/15 text-accent',
  review:      'bg-warning/15 text-warning',
  done:        'bg-success/15 text-success',
}

export default function ClientTasks() {
  const [tasks,       setTasks]       = useState([])
  const [projects,    setProjects]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [projectFilter, setProjectFilter] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [t, p] = await Promise.all([taskAPI.list({}), projectAPI.list({})])
        setTasks(t.data.data    || [])
        setProjects(p.data.data || [])
      } catch { toast.error('Failed to load') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = tasks.filter(t => {
    if (search      && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (projectFilter && t.project_id !== projectFilter) return false
    return true
  })

  // Group by project
  const byProject = filtered.reduce((acc, t) => {
    const key = t.project_id || 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display font-black text-2xl text-text-p">Project Tasks</h2>
        <p className="text-text-m text-sm mt-1">Track task progress across your projects</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={14} className="text-text-f" />
          <input placeholder="Search tasks..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-text-p text-sm outline-none w-full placeholder:text-text-f" />
        </div>
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}
          className="bg-surface border border-white/10 text-text-m text-sm rounded-xl px-3 py-2 outline-none focus:border-accent/40">
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_,i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-f text-sm">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byProject).map(([projectId, ptasks]) => {
            const project = projects.find(p => p.id === projectId)
            const done    = ptasks.filter(t => t.status === 'done').length
            return (
              <div key={projectId} className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
                {/* Project header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full"
                      style={{ background: project?.cover_color||'#6366F1' }} />
                    <h3 className="text-text-p text-sm font-semibold">{project?.name || 'Unknown Project'}</h3>
                    <span className="text-text-f text-xs">({ptasks.length} tasks)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-f text-xs">{done}/{ptasks.length} done</span>
                    <div className="w-20 h-1.5 bg-surface2 rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full"
                        style={{ width:`${ptasks.length>0?(done/ptasks.length)*100:0}%` }} />
                    </div>
                  </div>
                </div>
                {/* Tasks list */}
                <div className="divide-y divide-white/5">
                  {ptasks.map(t => (
                    <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors">
                      {t.status === 'done'
                        ? <CheckCircle size={15} className="text-success flex-shrink-0" />
                        : <Circle size={15} className="text-text-f flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${t.status==='done'?'line-through text-text-f':'text-text-p'}`}>{t.title}</p>
                        {t.profiles?.full_name && <p className="text-text-f text-xs">Assigned: {t.profiles.full_name}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {t.due_date && (
                          <span className="text-text-f text-xs">
                            {new Date(t.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[t.status]||''}`}>
                          {STATUS_LABEL[t.status]||t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}