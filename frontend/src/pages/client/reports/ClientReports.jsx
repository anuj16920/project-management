import React, { useEffect, useState } from 'react'
import {
  FolderKanban, CheckSquare, FileText, DollarSign,
  TrendingUp, BarChart2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useAuth }     from '@/hooks/useAuth'
import { projectAPI }  from '@/lib/projectAPI'
import { invoiceAPI }  from '@/lib/invoiceAPI'
import { taskAPI }     from '@/lib/taskAPI'
import { toast }       from 'sonner'

// ─── Status badge meta ────────────────────────────────────────────────────────
const INVOICE_STATUS = {
  draft:     { label: 'Draft',   cls: 'bg-white/10 text-text-m'          },
  sent:      { label: 'Sent',    cls: 'bg-blue-400/15 text-blue-400'     },
  viewed:    { label: 'Viewed',  cls: 'bg-cyan-400/15 text-cyan-400'     },
  paid:      { label: 'Paid',    cls: 'bg-success/15 text-success'       },
  overdue:   { label: 'Overdue', cls: 'bg-error/15 text-error'           },
  cancelled: { label: 'Void',    cls: 'bg-white/5 text-text-f'           },
}

// ─── Task status colours for the bar chart ───────────────────────────────────
const TASK_COLORS = {
  todo:        '#6366F1',
  in_progress: '#06B6D4',
  review:      '#F59E0B',
  done:        '#10B981',
  blocked:     '#EF4444',
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface2 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-text-m font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.fill }} className="tabular-nums">
          {p.value} task{p.value !== 1 ? 's' : ''}
        </p>
      ))}
    </div>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KPICard({ title, value, icon: Icon, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-surface border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-text-m text-xs font-medium uppercase tracking-wider">{title}</p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
          style={{ background: `${color}18`, border: `1px solid ${color}25` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p className="font-display font-black text-2xl text-text-p tabular-nums">{value}</p>
    </motion.div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton({ h = 'h-20' }) {
  return <div className={`${h} bg-surface border border-white/5 rounded-2xl animate-pulse`} />
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ClientReports() {
  const { profile } = useAuth()

  const [projects,  setProjects]  = useState([])
  const [invoices,  setInvoices]  = useState([])
  const [tasks,     setTasks]     = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!profile) return
    const load = async () => {
      try {
        const [pr, inv, tk] = await Promise.all([
          projectAPI.list({}),
          invoiceAPI.listInvoices({ client_uid: profile.firebase_uid }),
          taskAPI.list({}),
        ])
        setProjects(pr.data.data  || [])
        setInvoices(inv.data.data || [])
        setTasks(tk.data.data     || [])
      } catch {
        toast.error('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile])

  // ── Derived KPI values ───────────────────────────────────────────────────
  const totalProjects    = projects.length
  const completedTasks   = tasks.filter(t => t.status === 'done').length
  const totalInvoiced    = invoices.reduce((s, i) => s + (i.total || 0), 0)
  const amountPaid       = invoices
    .filter(i => i.status === 'paid')
    .reduce((s, i) => s + (i.total || 0), 0)

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  // ── Task-status chart data ───────────────────────────────────────────────
  const STATUS_LABELS = {
    todo:        'To Do',
    in_progress: 'In Progress',
    review:      'In Review',
    done:        'Done',
    blocked:     'Blocked',
  }

  const taskChartData = Object.entries(STATUS_LABELS).map(([status, name]) => ({
    name,
    count: tasks.filter(t => t.status === status).length,
    color: TASK_COLORS[status],
  })).filter(d => d.count > 0)

  return (
    <div className="space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-display font-black text-2xl text-text-p">Reports</h2>
        <p className="text-text-m text-sm mt-1">Overview of your projects, tasks, and invoices</p>
      </motion.div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} h="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard index={0} title="Total Projects"   value={totalProjects}  icon={FolderKanban} color="#6366F1" />
          <KPICard index={1} title="Completed Tasks"  value={completedTasks} icon={CheckSquare}  color="#10B981" />
          <KPICard index={2} title="Total Invoiced"   value={fmt(totalInvoiced)} icon={FileText} color="#F59E0B" />
          <KPICard index={3} title="Amount Paid"      value={fmt(amountPaid)}    icon={DollarSign} color="#06B6D4" />
        </div>
      )}

      {/* ── Project Progress ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-surface border border-white/5 rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} className="text-accent" />
          <h3 className="font-display font-bold text-base text-text-p">Project Progress</h3>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} h="h-14" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-10">
            <FolderKanban size={36} className="text-text-f mx-auto mb-2 opacity-40" />
            <p className="text-text-f text-sm">No projects assigned yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-text-p text-sm font-medium truncate">{p.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${
                      p.status === 'active'    ? 'bg-accent/15 text-accent'   :
                      p.status === 'completed' ? 'bg-success/15 text-success' :
                                                 'bg-white/10 text-text-m'
                    }`}>
                      {p.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-text-p text-sm font-bold tabular-nums ml-3 flex-shrink-0">
                    {p.progress || 0}%
                  </span>
                </div>
                <div className="h-2 bg-surface2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.progress || 0}%` }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.06, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: p.cover_color || '#6366F1' }}
                  />
                </div>
                {p.due_date && (
                  <p className="text-text-f text-xs mt-1">
                    Due: {new Date(p.due_date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Invoice Summary Table ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <FileText size={16} className="text-accent" />
            <h3 className="font-display font-bold text-base text-text-p">Invoice Summary</h3>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} h="h-12" />)}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-10">
              <FileText size={36} className="text-text-f mx-auto mb-2 opacity-40" />
              <p className="text-text-f text-sm">No invoices yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-text-f text-xs font-medium pb-2 pr-3">Invoice</th>
                    <th className="text-right text-text-f text-xs font-medium pb-2 pr-3">Amount</th>
                    <th className="text-right text-text-f text-xs font-medium pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 8).map((inv, i) => {
                    const meta = INVOICE_STATUS[inv.status] || INVOICE_STATUS.draft
                    return (
                      <tr key={inv.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                        <td className="py-3 pr-3">
                          <p className="text-text-p font-medium truncate max-w-[120px]">
                            #{inv.invoice_number}
                          </p>
                          {inv.created_at && (
                            <p className="text-text-f text-xs">
                              {new Date(inv.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short',
                              })}
                            </p>
                          )}
                        </td>
                        <td className="py-3 pr-3 text-right">
                          <p className="text-text-p font-bold tabular-nums">{fmt(inv.total)}</p>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${meta.cls}`}>
                            {meta.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {invoices.length > 8 && (
                <p className="text-text-f text-xs text-center mt-3">
                  + {invoices.length - 8} more invoices
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Tasks by Status Chart ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-surface border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={16} className="text-accent" />
            <h3 className="font-display font-bold text-base text-text-p">Tasks by Status</h3>
          </div>

          {loading ? (
            <Skeleton h="h-52" />
          ) : tasks.length === 0 ? (
            <div className="text-center py-10">
              <CheckSquare size={36} className="text-text-f mx-auto mb-2 opacity-40" />
              <p className="text-text-f text-sm">No tasks found</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={taskChartData} barCategoryGap="30%">
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={28}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {taskChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {taskChartData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-text-f text-xs">{d.name}</span>
                    <span className="text-text-m text-xs font-semibold">({d.count})</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

      </div>
    </div>
  )
}
