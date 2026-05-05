import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Building2, Calendar, MoreHorizontal, Edit3, Trash2 } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge  from '@/components/ui/Badge'
import { hrAPI } from '@/lib/hrAPI'
import { toast }  from 'sonner'

const STATUS_BADGE = {
  active:     'success',
  inactive:   'default',
  on_leave:   'warning',
  terminated: 'error',
}
const EMP_TYPE_COLOR = {
  full_time: 'bg-accent/15 text-accent',
  part_time: 'bg-cyan-400/15 text-cyan-400',
  contract:  'bg-warning/15 text-warning',
  intern:    'bg-purple-400/15 text-purple-400',
}

export default function EmployeeCard({ employee: e, index=0, onRefresh }) {
  const navigate = useNavigate()
  const [menu, setMenu] = useState(false)

  const handleDelete = async (ev) => {
    ev.stopPropagation()
    if (!confirm(`Remove ${e.profiles?.full_name}?`)) return
    try {
      await hrAPI.deleteEmployee(e.id)
      toast.success('Employee removed')
      onRefresh?.()
    } catch { toast.error('Failed to remove employee') }
  }

  return (
    <motion.div
      initial={{ opacity:0, y:16 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.07 }}
      onClick={() => navigate(`/admin/hr/${e.id}`)}
      className="bg-surface border border-white/5 hover:border-white/15 rounded-2xl p-5 cursor-pointer group transition-all hover:-translate-y-0.5 hover:shadow-lg">

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={e.profiles?.full_name||'E'} src={e.avatar_url} size="md"/>
          <div className="min-w-0">
            <h3 className="text-text-p text-sm font-bold truncate group-hover:text-accent transition-colors">
              {e.profiles?.full_name || '—'}
            </h3>
            <p className="text-text-f text-xs truncate">{e.designation || 'No designation'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={STATUS_BADGE[e.status]||'default'} className="capitalize text-xs">
            {e.status?.replace('_',' ')}
          </Badge>
          <div className="relative">
            <button
              onClick={ev => { ev.stopPropagation(); setMenu(!menu) }}
              className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-f opacity-0 group-hover:opacity-100 transition-all">
              <MoreHorizontal size={14}/>
            </button>
            {menu && (
              <div
                onClick={ev => ev.stopPropagation()}
                className="absolute right-0 top-8 w-36 bg-surface2 border border-white/10 rounded-xl py-1 z-20 shadow-xl">
                <button
                  onClick={() => navigate(`/admin/hr/${e.id}`)}
                  className="w-full text-left px-3 py-2 text-text-m text-xs hover:bg-white/5 flex items-center gap-2">
                  <Edit3 size={11}/> View / Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-3 py-2 text-red-400 text-xs hover:bg-red-400/10 flex items-center gap-2">
                  <Trash2 size={11}/> Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        {e.profiles?.email && (
          <div className="flex items-center gap-2 text-text-f text-xs">
            <Mail size={11}/><span className="truncate">{e.profiles.email}</span>
          </div>
        )}
        {e.departments?.name && (
          <div className="flex items-center gap-2 text-text-f text-xs">
            <Building2 size={11}/><span>{e.departments.name}</span>
          </div>
        )}
        {e.date_of_joining && (
          <div className="flex items-center gap-2 text-text-f text-xs">
            <Calendar size={11}/>
            <span>Joined {new Date(e.date_of_joining).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-text-f text-xs font-mono">{e.employee_code}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${EMP_TYPE_COLOR[e.employment_type]||''}`}>
          {e.employment_type?.replace('_',' ')}
        </span>
      </div>
    </motion.div>
  )
}