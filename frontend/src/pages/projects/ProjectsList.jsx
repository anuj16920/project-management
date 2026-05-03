import React, { useEffect, useState, useCallback } from 'react'
import { Plus, FolderOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { projectAPI }          from '@/lib/projectAPI'
import { useRoleGuard }        from '@/hooks/useRoleGuard'
import ProjectCard             from './components/ProjectCard'
import ProjectFilters          from './components/ProjectFilters'
import CreateProject from './components/CreateProject'
import EmptyState              from '@/components/ui/EmptyState'
import { SkeletonCard }        from '@/components/ui/Skeleton'

export default function ProjectList() {
  const { canCreateStaff }    = useRoleGuard()
  const [projects,  setProjects]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filters,   setFilters]   = useState({ search:'', status:'', priority:'' })
  const [view,      setView]      = useState('grid') // 'grid' | 'list'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v))
      const res    = await projectAPI.list(params)
      setProjects(res.data.data || [])
    } catch {}
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load() }, [load])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-black text-2xl text-text-p">Projects</h2>
          <p className="text-text-m text-sm mt-1">
            {loading ? '...' : `${projects.length} project${projects.length!==1?'s':''}`}
          </p>
        </div>
        {canCreateStaff && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-h text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 glow-accent">
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <ProjectFilters filters={filters} onChange={setFilters} view={view} onViewChange={setView} />

      {/* Content */}
      {loading ? (
        <div className={view==='grid'
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
          : 'space-y-3'}>
          {Array(6).fill(0).map((_,i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState icon="FolderOpen" title="No projects yet"
          description="Create your first project to start managing tasks, milestones and your team."
          actionLabel={canCreateStaff ? 'Create Project' : undefined}
          onAction={canCreateStaff ? () => setShowModal(true) : undefined} />
      ) : (
        <div className={view==='grid'
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
          : 'space-y-3'}>
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} onRefresh={load} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <CreateProject
          onClose={() => setShowModal(false)}
          onSuccess={load}
        />
      )}
    </div>
  )
}