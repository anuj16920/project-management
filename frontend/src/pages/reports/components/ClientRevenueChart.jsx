import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'

const COLORS = ['#01696f','#4f98a3','#10B981','#6366F1','#F59E0B','#3B82F6','#EC4899','#8B5CF6','#F97316','#EF4444']
const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { notation:'compact', maximumFractionDigits:1 })}`

export default function ClientRevenueChart({ data, loading }) {
  if (loading) return <div className="h-80 bg-surface rounded-2xl animate-pulse"/>

  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      className="bg-surface border border-white/5 rounded-2xl p-5">
      <h3 className="font-display font-bold text-base text-text-p mb-1">Top Clients by Revenue</h3>
      <p className="text-text-f text-xs mb-5">Paid invoices only</p>

      {!data?.length ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-text-f text-sm">No client revenue data</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top:5, right:10, bottom:60, left:10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
            <XAxis dataKey="name"
              tick={{ fill:'#797876', fontSize:10 }}
              axisLine={false} tickLine={false}
              angle={-30} textAnchor="end" interval={0}/>
            <YAxis tickFormatter={fmt} tick={{ fill:'#797876', fontSize:11 }} axisLine={false} tickLine={false} width={60}/>
            <Tooltip
              formatter={(v) => [fmt(v), 'Revenue']}
              contentStyle={{ background:'#1c1b19', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px' }}
              labelStyle={{ color:'#cdccca' }} itemStyle={{ color:'#cdccca' }}
            />
            <Bar dataKey="revenue" name="Revenue" radius={[6,6,0,0]}>
              {data.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  )
}