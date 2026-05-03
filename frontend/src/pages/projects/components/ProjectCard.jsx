import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Users, CheckSquare, Flag, MoreHorizontal, Archive } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { useRoleGuard } from '@/hooks/useRoleGuard'
import { projectAPI } from '@/lib/projectAPI'
import { toast } from 'sonner'

const STATUS_BADGE    = { active:'accent', on_hold:'warning', completed:'success', cancelled:'error' }
const PRIORITY_COLORS = { low:'#10B981', medium:'#F59E0B', high:'#EF4444', urgent:'#EC4899' }
const PRIORITY_BADGE  = { low:'success', medium:'warning', high:'error', urgent:'error' }

export default function ProjectCard({ project, index = 0, onRefresh }) {
  const navigate = useNavigate()
  const { canCreateStaff } = useRoleGuard()
  const [menuOpen, setMenuOpen] = React.useState(false)

  const handleArchive = async (e) => {
    e.stopPropagation()
    try {
      await projectAPI.archive(project.id)
      toast.success('Project archived')
      onRefresh?.()
    } catch { toast.error('Failed to archive') }
  }

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35, delay:index*0.07 }}
      onClick={() => navigate(`/admin/projects/${project.id}`)}
      className="bg-surface border border-white/5 hover:border-white/15 rounded-2xl p-5 cursor-pointer group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card">

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        {/* Color dot + Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: project.cover_color || '#6366F1' }} />
          <h3 className="font-display font-bold text-sm text-text-p truncate group-hover:text-accent transition-colors">
            {project.name}
          </h3>
        </div>
        {/* Menu */}
        {canCreateStaff && (
          <div className="relative flex-shrink-0 ml-2">
            <button onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
              className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-f hover:text-text-m opacity-0 group-hover:opacity-100 transition-all">
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-36 glass border border-white/10 rounded-xl py-1 z-10 shadow-card-h"
                onClick={e => e.stopPropagation()}>
                <button onClick={() => navigate(`/admin/projects/${project.id}/edit`)}
                  className="w-full text-left px-3 py-2 text-text-m text-xs hover:text-text-p hover:bg-white/5 transition-colors">Edit Project</button>
                <button onClick={handleArchive}
                  className="w-full text-left px-3 py-2 text-error text-xs hover:bg-error/10 transition-colors flex items-center gap-2">
                  <Archive size={11} /> Archive
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-text-m text-xs mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge variant={STATUS_BADGE[project.status] || 'default'} className="capitalize">{project.status?.replace('_',' ')}</Badge>
        <Badge variant={PRIORITY_BADGE[project.priority] || 'default'} className="capitalize">
          <Flag size={9} className="mr-1" />{project.priority}
        </Badge>
        {project.tags?.slice(0,2).map(t => (
          <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/8 rounded-full text-text-f text-xs">{t}</span>
        ))}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-text-f text-xs">Progress</span>
          <span className="text-text-p text-xs font-bold tabular-nums">{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width:`${project.progress}%`, background: project.cover_color || '#6366F1' }} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Members */}
          <div className="flex items-center gap-1 text-text-f text-xs">
            <Users size={11} />
            <span>{project.memberCount || 0}</span>
          </div>
          {/* Tasks */}
          <div className="flex items-center gap-1 text-text-f text-xs">
            <CheckSquare size={11} />
            <span>{project.taskCount || 0}</span>
          </div>
          {/* Milestones */}
          {project.milestonesTotal > 0 && (
            <div className="flex items-center gap-1 text-text-f text-xs">
              <span>🏁</span>
              <span>{project.milestonesDone}/{project.milestonesTotal}</span>
            </div>
          )}
        </div>
        {/* Due date */}
        {project.due_date && (
          <div className="flex items-center gap-1 text-text-f text-xs">
            <Calendar size={11} />
            <span>{new Date(project.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}