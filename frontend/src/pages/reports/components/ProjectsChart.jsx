import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion } from 'framer-motion'

const STATUS_COLORS = {
  active:    '#01696f',
  completed: '#10B981',
  on_hold:   '#F59E0B',
  cancelled: '#EF4444',
  planning:  '#6366F1',
}

export default function ProjectsChart({ data, loading }) {
  if (loading) return <div className="h-80 bg-surface rounded-2xl animate-pulse"/>
  if (!data)   return null

  const pieData = Object.entries(data.status_counts || {}).map(([k, v]) => ({
    name: k.replace('_',' '), value: v, key: k,
  }))

  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* Pie */}
      <div className="bg-surface border border-white/5 rounded-2xl p-5">
        <h3 className="font-display font-bold text-base text-text-p mb-5">Projects by Status</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
              dataKey="value" paddingAngle={3}>
              {pieData.map((e, i) => (
                <Cell key={i} fill={STATUS_COLORS[e.key] || '#6366F1'}/>
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background:'#1c1b19', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px' }}
              labelStyle={{ color:'#cdccca' }} itemStyle={{ color:'#cdccca' }}
            />
            <Legend wrapperStyle={{ fontSize:'12px' }}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Project completion table */}
      <div className="bg-surface border border-white/5 rounded-2xl p-5">
        <h3 className="font-display font-bold text-base text-text-p mb-4">Project Progress</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {(data.projects || []).slice(0, 8).map(p => (
            <div key={p.id}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-text-p text-xs font-medium truncate max-w-48">{p.name}</p>
                <span className="text-text-m text-xs tabular-nums flex-shrink-0 ml-2">
                  {p.completion}%
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${p.completion}%`,
                    background: STATUS_COLORS[p.status] || '#6366F1'
                  }}/>
              </div>
              <p className="text-text-f text-xs mt-0.5">
                {p.completed_tasks}/{p.total_tasks} tasks
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}