import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const DATA = [
  { month:'Jan', revenue:32000, expenses:18000 },
  { month:'Feb', revenue:38000, expenses:21000 },
  { month:'Mar', revenue:35000, expenses:19000 },
  { month:'Apr', revenue:42000, expenses:22000 },
  { month:'May', revenue:48000, expenses:25000 },
  { month:'Jun', revenue:44000, expenses:23000 },
  { month:'Jul', revenue:52000, expenses:27000 },
  { month:'Aug', revenue:58000, expenses:29000 },
  { month:'Sep', revenue:54000, expenses:26000 },
  { month:'Oct', revenue:62000, expenses:31000 },
  { month:'Nov', revenue:68000, expenses:33000 },
  { month:'Dec', revenue:72000, expenses:35000 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass border border-white/10 rounded-xl p-3 text-xs">
      <p className="text-text-m font-semibold mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background:p.color }} />
          <span className="text-text-m capitalize">{p.name}:</span>
          <span className="text-text-p font-semibold">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function RevenueChart({ data = DATA }) {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-base text-text-p">Revenue vs Expenses</h3>
          <p className="text-text-f text-xs mt-0.5">Last 12 months</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-text-m text-xs">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-error" />
            <span className="text-text-m text-xs">Expenses</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false}
            tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke:'rgba(255,255,255,0.08)', strokeWidth:1 }} />
          <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r:4, fill:'#6366F1' }} />
          <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} fill="url(#expGrad)" dot={false} activeDot={{ r:4, fill:'#EF4444' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}