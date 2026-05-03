import React from 'react'
import {
  TrendingUp, TrendingDown, DollarSign,
  FolderKanban, CheckSquare, Users, AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'

const fmt = (n) => n != null
  ? `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  : '—'

const CARDS = (d) => d ? [
  {
    label:  'Total Revenue',
    value:  fmt(d.revenue),
    icon:   DollarSign,
    color:  'text-success',
    bg:     'bg-success/10',
    sub:    `${d.profit_margin}% margin`,
  },
  {
    label:  'Net Profit',
    value:  fmt(d.profit),
    icon:   d.profit >= 0 ? TrendingUp : TrendingDown,
    color:  d.profit >= 0 ? 'text-success' : 'text-red-400',
    bg:     d.profit >= 0 ? 'bg-success/10' : 'bg-red-400/10',
    sub:    `Expenses: ${fmt(d.expenses)}`,
  },
  {
    label:  'Outstanding',
    value:  fmt(d.outstanding),
    icon:   AlertCircle,
    color:  'text-warning',
    bg:     'bg-warning/10',
    sub:    'Unpaid invoices',
  },
  {
    label:  'Projects',
    value:  d.total_projects,
    icon:   FolderKanban,
    color:  'text-accent',
    bg:     'bg-accent/10',
    sub:    `${d.active_projects} active · ${d.completed_projects} done`,
  },
  {
    label:  'Task Completion',
    value:  `${d.task_completion}%`,
    icon:   CheckSquare,
    color:  'text-blue',
    bg:     'bg-blue/10',
    sub:    `${d.completed_tasks} / ${d.total_tasks} tasks`,
  },
  {
    label:  'Team Members',
    value:  d.total_employees,
    icon:   Users,
    color:  'text-purple',
    bg:     'bg-purple/10',
    sub:    `${d.total_clients} active clients`,
  },
] : []

export default function KPICards({ data, loading }) {
  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array(6).fill(0).map((_,i) => (
        <div key={i} className="h-28 bg-surface rounded-2xl animate-pulse"/>
      ))}
    </div>
  )

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {CARDS(data).map((card, i) => {
        const Icon = card.icon
        return (
          <motion.div key={card.label}
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-surface border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
            <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={card.color}/>
            </div>
            <p className="text-text-f text-xs mb-1">{card.label}</p>
            <p className={`font-display font-bold text-xl ${card.color} tabular-nums`}>{card.value}</p>
            <p className="text-text-f text-xs mt-1 leading-tight">{card.sub}</p>
          </motion.div>
        )
      })}
    </div>
  )
}