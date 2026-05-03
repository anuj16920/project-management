import React from 'react'
import { Plus, UserPlus, Receipt, FolderPlus, Calendar, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ACTIONS = [
  { label:'New Project',  icon: FolderPlus, color:'#6366F1', to:'/admin/projects?new=1'    },
  { label:'Add Task',     icon: Plus,       color:'#06B6D4', to:'/admin/tasks?new=1'        },
  { label:'Invite User',  icon: UserPlus,   color:'#10B981', to:'/admin/hr?invite=1'        },
  { label:'New Invoice',  icon: Receipt,    color:'#F59E0B', to:'/admin/finance?invoice=1'  },
  { label:'Schedule',     icon: Calendar,   color:'#EF4444', to:'/admin/hr?schedule=1'      },
  { label:'Export Report',icon: Download,   color:'#8B5CF6', to:'/admin/reports?export=1'  },
]

export default function QuickActionsPanel() {
  const navigate = useNavigate()
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-5">
      <h3 className="font-display font-bold text-base text-text-p mb-4">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-3">
        {ACTIONS.map((a, i) => {
          const Icon = a.icon
          return (
            <button key={i} onClick={() => navigate(a.to)}
              className="flex flex-col items-center gap-2 bg-surface2 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl p-3 transition-all hover:-translate-y-0.5 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background:`${a.color}18`, border:`1px solid ${a.color}25` }}>
                <Icon size={15} style={{ color:a.color }} />
              </div>
              <span className="text-text-m text-xs text-center leading-tight group-hover:text-text-p transition-colors">{a.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}