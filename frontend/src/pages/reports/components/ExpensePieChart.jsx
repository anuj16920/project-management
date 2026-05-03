import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion } from 'framer-motion'

const COLORS  = ['#01696f','#F59E0B','#EF4444','#3B82F6','#10B981','#8B5CF6','#EC4899','#F97316']
const fmt     = (v) => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits:0 })}`

export default function ExpensePieChart({ data, loading }) {
  if (loading) return <div className="h-80 bg-surface rounded-2xl animate-pulse"/>

  const total = data?.reduce((s, e) => s + e.amount, 0) || 0

  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* Pie */}
      <div className="bg-surface border border-white/5 rounded-2xl p-5">
        <h3 className="font-display font-bold text-base text-text-p mb-1">Expenses by Category</h3>
        <p className="text-text-f text-xs mb-4">Total: {fmt(total)}</p>
        {!data?.length ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-text-f text-sm">No expense data</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={90}
                dataKey="amount" nameKey="category" paddingAngle={2}>
                {data.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
              </Pie>
              <Tooltip
                formatter={(v) => [fmt(v), 'Amount']}
                contentStyle={{ background:'#1c1b19', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px' }}
                labelStyle={{ color:'#cdccca' }} itemStyle={{ color:'#cdccca' }}
              />
              <Legend wrapperStyle={{ fontSize:'11px' }}/>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category breakdown list */}
      <div className="bg-surface border border-white/5 rounded-2xl p-5">
        <h3 className="font-display font-bold text-base text-text-p mb-4">Breakdown</h3>
        <div className="space-y-3">
          {(data||[]).map((e, i) => {
            const pct = total > 0 ? Math.round((e.amount / total) * 100) : 0
            return (
              <div key={e.category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}/>
                    <p className="text-text-p text-xs font-medium capitalize">{e.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-text-f text-xs">{pct}%</span>
                    <span className="text-text-m text-xs font-semibold tabular-nums">{fmt(e.amount)}</span>
                  </div>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{ width:`${pct}%`, background: COLORS[i % COLORS.length] }}/>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}