import React from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

const DATA = [
  { name:'Done',      value:62, fill:'#10B981' },
  { name:'In Progress',value:28, fill:'#6366F1' },
  { name:'Pending',   value:10, fill:'#F59E0B' },
]

export default function TaskProgressWidget({ total = 142, done = 88, inProgress = 40, pending = 14 }) {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-5">
      <h3 className="font-display font-bold text-base text-text-p mb-1">Task Progress</h3>
      <p className="text-text-f text-xs mb-4">Current sprint overview</p>
      <div className="flex items-center gap-4">
        <div className="relative w-28 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="90%" data={DATA} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={4} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-black text-xl text-text-p">{total}</span>
            <span className="text-text-f text-xs">Tasks</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {[
            { label:'Completed',    value:done,       color:'bg-success', pct: Math.round(done/total*100)  },
            { label:'In Progress',  value:inProgress, color:'bg-accent',  pct: Math.round(inProgress/total*100) },
            { label:'Pending',      value:pending,    color:'bg-warning', pct: Math.round(pending/total*100)},
          ].map(s => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="text-text-m text-xs">{s.label}</span>
                </div>
                <span className="text-text-p text-xs font-semibold">{s.value}</span>
              </div>
              <div className="h-1 bg-surface2 rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full`} style={{ width:`${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}