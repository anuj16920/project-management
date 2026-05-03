import React from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { motion } from 'framer-motion'

const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { notation:'compact', maximumFractionDigits:1 })}`

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface2 border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-text-f text-xs mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function RevenueChart({ data, loading, detailed }) {
  if (loading) return <div className="h-80 bg-surface rounded-2xl animate-pulse"/>

  if (!data?.length) return (
    <div className="h-80 bg-surface rounded-2xl flex items-center justify-center">
      <p className="text-text-f text-sm">No revenue data for this period</p>
    </div>
  )

  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      className="space-y-4">

      {/* Area chart — revenue vs expenses */}
      <div className="bg-surface border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-base text-text-p">Revenue vs Expenses</h3>
            <p className="text-text-f text-xs">Monthly trend</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top:5, right:10, bottom:5, left:10 }}>
            <defs>
              <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#01696f" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#01696f" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
            <XAxis dataKey="period" tick={{ fill:'#797876', fontSize:11 }} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={fmt} tick={{ fill:'#797876', fontSize:11 }} axisLine={false} tickLine={false} width={60}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Legend wrapperStyle={{ fontSize:'12px', paddingTop:'16px' }}/>
            <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#01696f" strokeWidth={2} fill="url(#gRevenue)"/>
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} fill="url(#gExpense)"/>
            <Area type="monotone" dataKey="profit"   name="Profit"   stroke="#10B981" strokeWidth={2} fill="url(#gProfit)" strokeDasharray="4 2"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart */}
      {detailed && (
        <div className="bg-surface border border-white/5 rounded-2xl p-5">
          <h3 className="font-display font-bold text-base text-text-p mb-5">Monthly Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top:5, right:10, bottom:5, left:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
              <XAxis dataKey="period" tick={{ fill:'#797876', fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={fmt} tick={{ fill:'#797876', fontSize:11 }} axisLine={false} tickLine={false} width={60}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend wrapperStyle={{ fontSize:'12px', paddingTop:'16px' }}/>
              <Bar dataKey="revenue"  name="Revenue"  fill="#01696f" radius={[4,4,0,0]}/>
              <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}