import React, { useEffect, useState } from 'react'
import { FolderKanban, Users, Calendar, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { projectAPI } from '@/lib/projectAPI'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function EmployeeProjects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    projectAPI.list({})
      .then(r => setProjects(r.data.data || []))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false))
  }, [])

  const STATUS_COLOR = {
    active:    'bg-accent/15 text-accent',
    completed: 'bg-success/15 text-success',
    on_hold:   'bg-warning/15 text-warning',
    cancelled: 'bg-error/15 text-error',
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display font-black text-2xl text-text-p">My Projects</h2>
        <p className="text-text-m text-sm mt-1">Projects you're assigned to</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_,i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderKanban size={40} className="text-text-f mx-auto mb-3 opacity-40" />
          <p className="text-text-f text-sm">You haven't been added to any projects yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i*0.07 }}
              onClick={() => navigate(`/employee/projects/${p.id}`)}
              className="bg-surface border border-white/5 hover:border-white/15 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-card">

              {/* Color bar */}
              <div className="w-full h-1 rounded-full mb-4 opacity-70"
                style={{ background: p.cover_color || '#6366F1' }} />

              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-bold text-sm text-text-p leading-snug flex-1 pr-2">{p.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${STATUS_COLOR[p.status]||'bg-white/10 text-text-m'}`}>
                  {p.status?.replace('_',' ')}
                </span>
              </div>

              {p.description && (
                <p className="text-text-f text-xs leading-relaxed mb-3 line-clamp-2">{p.description}</p>
              )}

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-text-f text-xs">Progress</span>
                  <span className="text-text-p text-xs font-bold tabular-nums">{p.progress||0}%</span>
                </div>
                <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width:`${p.progress||0}%`, background: p.cover_color||'#6366F1' }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-1 text-text-f text-xs">
                  <Users size={11} />
                  <span>{p.member_count||0} members</span>
                </div>
                {p.due_date && (
                  <div className="flex items-center gap-1 text-text-f text-xs">
                    <Calendar size={11} />
                    <span>{new Date(p.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}