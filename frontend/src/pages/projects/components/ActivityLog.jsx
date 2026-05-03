import React from 'react'
import { FolderPlus, Edit3, UserPlus, UserMinus, CheckCircle, RefreshCw, Archive } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'

const ACTION_META = {
  created_project:     { icon: FolderPlus,  color:'text-accent',   label:'created this project'   },
  updated_project:     { icon: Edit3,       color:'text-cyan',     label:'updated project details' },
  added_member:        { icon: UserPlus,    color:'text-success',  label:'added a member'          },
  removed_member:      { icon: UserMinus,   color:'text-error',    label:'removed a member'        },
  added_milestone:     { icon: CheckCircle, color:'text-success',  label:'added a milestone'       },
  completed_milestone: { icon: CheckCircle, color:'text-success',  label:'completed a milestone'   },
  reopened_milestone:  { icon: RefreshCw,   color:'text-warning',  label:'reopened a milestone'    },
  archived_project:    { icon: Archive,     color:'text-error',    label:'archived this project'   },
}

export default function ActivityLog({ activities = [] }) {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-5">
      <h3 className="font-display font-bold text-base text-text-p mb-4">Activity Log</h3>
      {activities.length === 0 && (
        <p className="text-text-f text-sm text-center py-6">No activity yet</p>
      )}
      <div className="relative">
        {/* Timeline line */}
        {activities.length > 1 && (
          <div className="absolute left-4 top-4 bottom-4 w-px bg-white/5" />
        )}
        <div className="space-y-4">
          {activities.map((a, i) => {
            const meta   = ACTION_META[a.action] || { icon: Edit3, color:'text-text-f', label: a.action }
            const Icon   = meta.icon
            const name   = a.profiles?.full_name || 'Someone'
            return (
              <div key={a.id || i} className="flex items-start gap-3 relative">
                <div className="w-8 h-8 rounded-full bg-surface2 border border-white/8 flex items-center justify-center flex-shrink-0 z-10">
                  <Icon size={13} className={meta.color} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-text-p text-xs leading-relaxed">
                    <span className="font-semibold">{name}</span>
                    {' '}<span className="text-text-m">{meta.label}</span>
                    {a.meta?.title && <span className="text-accent"> "{a.meta.title}"</span>}
                    {a.meta?.name  && <span className="text-accent"> "{a.meta.name}"</span>}
                  </p>
                  <p className="text-text-f text-xs mt-0.5">
                    {new Date(a.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}