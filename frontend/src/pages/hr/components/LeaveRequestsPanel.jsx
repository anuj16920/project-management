import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import Avatar    from '@/components/ui/Avatar'
import { hrAPI } from '@/lib/hrAPI'
import { toast }  from 'sonner'

const STATUS_META = {
  pending:  { color:'bg-warning/15 text-warning',  label:'Pending'  },
  approved: { color:'bg-success/15 text-success',  label:'Approved' },
  rejected: { color:'bg-red-400/15 text-red-400',  label:'Rejected' },
  cancelled:{ color:'bg-white/10 text-text-m',     label:'Cancelled'},
}

export default function LeaveRequestsPanel({ onRefresh }) {
  const [leaves,  setLeaves]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('pending')

  const load = async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const r = await hrAPI.listLeaves(params)
      setLeaves(r.data.data || [])
    } catch { toast.error('Failed to load leaves') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const handleReview = async (id, status) => {
    try {
      await hrAPI.reviewLeave(id, { status })
      toast.success(`Leave ${status} ✅`)
      load(); onRefresh?.()
    } catch { toast.error('Failed') }
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 bg-surface border border-white/5 rounded-xl p-1 mb-5 w-fit">
        {['all','pending','approved','rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${filter===f ? 'bg-accent/20 text-accent' : 'text-text-m hover:text-text-p'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_,i) => <div key={i} className="h-20 bg-surface rounded-2xl animate-pulse"/>)}
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-16">
          <Calendar size={32} className="text-text-f mx-auto mb-2 opacity-40"/>
          <p className="text-text-f text-sm">No {filter !== 'all' ? filter : ''} leave requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((l,i) => {
            const meta = STATUS_META[l.status] || STATUS_META.pending
            return (
              <motion.div key={l.id}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i*0.05 }}
                className="bg-surface border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all">
                <div className="flex items-start gap-3">
                  <Avatar name={l.profiles?.full_name||'E'} size="sm"/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                      <p className="text-text-p text-sm font-semibold">{l.profiles?.full_name}</p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-3 text-text-m text-xs mb-1">
                      {l.leave_types && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ background: l.leave_types.color||'#6366F1' }}/>
                          {l.leave_types.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={10}/>
                        {new Date(l.from_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} –{' '}
                        {new Date(l.to_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                        <strong className="ml-1">{l.days}d</strong>
                      </span>
                    </div>
                    {l.reason && <p className="text-text-f text-xs italic">"{l.reason}"</p>}
                  </div>
                  {l.status === 'pending' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleReview(l.id, 'approved')}
                        className="flex items-center gap-1.5 bg-success/15 hover:bg-success/25 text-success text-xs px-3 py-1.5 rounded-lg transition-all">
                        <CheckCircle size={12}/> Approve
                      </button>
                      <button onClick={() => handleReview(l.id, 'rejected')}
                        className="flex items-center gap-1.5 bg-red-400/15 hover:bg-red-400/25 text-red-400 text-xs px-3 py-1.5 rounded-lg transition-all">
                        <XCircle size={12}/> Reject
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}