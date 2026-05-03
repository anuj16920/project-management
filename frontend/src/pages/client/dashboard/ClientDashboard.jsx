import React, { useEffect, useState } from 'react'
import { FolderKanban, CheckSquare, FileText, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth }    from '@/hooks/useAuth'
import { projectAPI } from '@/lib/projectAPI'
import { invoiceAPI } from '@/lib/invoiceAPI'
import KPICard        from '@/pages/dashboard/components/KPICard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { toast } from 'sonner'

export default function ClientDashboard() {
  const { profile } = useAuth()
  const [projects,  setProjects]  = useState([])
  const [invoices,  setInvoices]  = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [p, inv] = await Promise.all([
          projectAPI.list({}),
          invoiceAPI.myInvoices(),
        ])
        setProjects(p.data.data   || [])
        setInvoices(inv.data.data || [])
      } catch { toast.error('Failed to load dashboard') }
      finally { setLoading(false) }
    }
    if (profile) load()
  }, [profile])

  const activeProjects  = projects.filter(p => p.status === 'active')
  const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'overdue')
  const totalTasks      = projects.reduce((s, p) => s + (p.task_count || 0), 0)

  const KPIs = [
    { title:'Active Projects', value: activeProjects.length,  icon:'FolderKanban', color:'#6366F1', index:0 },
    { title:'Total Tasks',     value: totalTasks,             icon:'CheckSquare',  color:'#06B6D4', index:1 },
    { title:'Pending Invoices',value: pendingInvoices.length, icon:'FileText',     color:'#F59E0B', index:2 },
    { title:'Due Amount',      value:`$${pendingInvoices.reduce((s,i)=>s+(i.amount||0),0).toLocaleString()}`, icon:'FileText', color:'#EF4444', index:3 },
  ]

  return (
    <div>
      {/* Welcome */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <h2 className="font-display font-black text-2xl text-text-p">
          Welcome back, {profile?.full_name?.split(' ')[0]} 👋
        </h2>
        <p className="text-text-m text-sm mt-1">Here's what's happening with your projects</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array(4).fill(0).map((_,i) => <SkeletonCard key={i} />)
          : KPIs.map((k,i) => <KPICard key={i} {...k} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* My Projects */}
        <div className="bg-surface border border-white/5 rounded-2xl p-5">
          <h3 className="font-display font-bold text-base text-text-p mb-4">My Projects</h3>
          {loading ? <SkeletonCard /> : projects.length === 0 ? (
            <p className="text-text-f text-sm text-center py-8">No projects yet</p>
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id}
                  className="bg-surface2 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all cursor-pointer"
                  onClick={() => window.location.href=`/client/projects/${p.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-text-p text-sm font-semibold">{p.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize
                      ${p.status==='active'?'bg-accent/15 text-accent':
                        p.status==='completed'?'bg-success/15 text-success':'bg-white/10 text-text-m'}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-f text-xs">{p.progress||0}% complete</span>
                    {p.due_date && (
                      <span className="text-text-f text-xs">
                        Due: {new Date(p.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all"
                      style={{ width:`${p.progress||0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-surface border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-text-p">Recent Invoices</h3>
            <a href="/client/invoices" className="text-accent text-xs hover:underline">View all</a>
          </div>
          {loading ? <SkeletonCard /> : invoices.length === 0 ? (
            <p className="text-text-f text-sm text-center py-8">No invoices yet</p>
          ) : (
            <div className="space-y-2.5">
              {invoices.slice(0,5).map(inv => (
                <div key={inv.id}
                  className="flex items-center justify-between bg-surface2 border border-white/5 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-text-p text-sm font-medium">#{inv.invoice_number}</p>
                    <p className="text-text-f text-xs">
                      {new Date(inv.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-p text-sm font-bold tabular-nums">${(inv.amount||0).toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize
                      ${inv.status==='paid'?'bg-success/15 text-success':
                        inv.status==='overdue'?'bg-error/15 text-error':'bg-warning/15 text-warning'}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}