import React, { useEffect, useState } from 'react'
import { FolderKanban, Calendar, TrendingUp, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { projectAPI } from '@/lib/projectAPI'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function ClientProjects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    projectAPI.list({})
      .then(r => setProjects(r.data.data || []))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display font-black text-2xl text-text-p">My Projects</h2>
        <p className="text-text-m text-sm mt-1">Track the progress of your projects</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_,i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderKanban size={40} className="text-text-f mx-auto mb-3 opacity-40" />
          <p className="text-text-f text-sm">No projects assigned to your account</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i*0.08 }}
              className="bg-surface border border-white/5 hover:border-white/15 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-card"
              onClick={() => navigate(`/client/projects/${p.id}`)}>

              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-3">
                  <h3 className="font-display font-bold text-base text-text-p mb-1">{p.name}</h3>
                  {p.description && <p className="text-text-f text-xs line-clamp-2">{p.description}</p>}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full capitalize flex-shrink-0
                  ${p.status==='active'?'bg-accent/15 text-accent':
                    p.status==='completed'?'bg-success/15 text-success':'bg-white/10 text-text-m'}`}>
                  {p.status?.replace('_',' ')}
                </span>
              </div>

              {/* Big progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-m text-sm">Overall Progress</span>
                  <span className="text-text-p text-sm font-bold tabular-nums">{p.progress||0}%</span>
                </div>
                <div className="h-2.5 bg-surface2 rounded-full overflow-hidden">
                  <motion.div initial={{ width:0 }} animate={{ width:`${p.progress||0}%` }}
                    transition={{ duration:1, delay:0.3 }}
                    className="h-full rounded-full"
                    style={{ background: p.cover_color||'#6366F1' }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                {p.due_date && (
                  <div className="flex items-center gap-1.5 text-text-m text-xs">
                    <Calendar size={12} />
                    Due: {new Date(p.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-accent text-xs ml-auto">
                  <Eye size={12} /> View Details
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}