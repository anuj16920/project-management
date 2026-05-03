import React from 'react'
import Avatar from '@/components/ui/Avatar'
import { CheckCircle, Plus, MessageSquare, Upload, UserPlus } from 'lucide-react'

const FEED = [
  { user:'Arjun Mehta',  action:'completed task',  target:'"API Integration"',       time:'2m ago',  type:'done'    },
  { user:'Sara Lee',     action:'created project', target:'"Mobile App v3"',          time:'18m ago', type:'create'  },
  { user:'Rohan K.',     action:'commented on',    target:'"Dashboard Design"',        time:'34m ago', type:'comment' },
  { user:'Emily Chen',   action:'uploaded file',   target:'"Q4 Report.pdf"',           time:'1h ago',  type:'upload'  },
  { user:'Vikram Nair',  action:'joined team',     target:'"Engineering"',             time:'2h ago',  type:'join'    },
  { user:'Priya Singh',  action:'completed task',  target:'"Database Migration"',      time:'3h ago',  type:'done'    },
]

const TYPE_ICONS = {
  done:    { icon: CheckCircle, color:'text-success' },
  create:  { icon: Plus,        color:'text-accent'  },
  comment: { icon: MessageSquare,color:'text-cyan'   },
  upload:  { icon: Upload,      color:'text-warning' },
  join:    { icon: UserPlus,    color:'text-success' },
}

export default function TeamActivityFeed() {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-base text-text-p">Team Activity</h3>
        <button className="text-accent text-xs hover:text-accent-h transition-colors">View all</button>
      </div>
      <div className="space-y-4">
        {FEED.map((f, i) => {
          const { icon: Icon, color } = TYPE_ICONS[f.type]
          return (
            <div key={i} className="flex items-start gap-3">
              <Avatar name={f.user} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-text-p text-xs leading-relaxed">
                  <span className="font-semibold">{f.user}</span>
                  {' '}<span className="text-text-m">{f.action}</span>
                  {' '}<span className="text-accent font-medium">{f.target}</span>
                </p>
                <p className="text-text-f text-xs mt-0.5">{f.time}</p>
              </div>
              <Icon size={13} className={`${color} flex-shrink-0 mt-0.5`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}