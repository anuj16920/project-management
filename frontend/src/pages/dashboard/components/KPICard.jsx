import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import * as Icons from 'lucide-react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'

export default function KPICard({ title, value, prefix = '', suffix = '', change, changeLabel, icon, color = '#6366F1', index = 0, isAmount = false }) {
  const Icon    = Icons[icon] || Icons.Activity
  const isPos   = change > 0
  const isZero  = change === 0
  const num     = parseFloat(String(value).replace(/[^0-9.]/g,''))
  const isFloat = String(value).includes('.')

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, delay:index*0.08 }}
      className="bg-surface border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-300 hover:shadow-card group">
      <div className="flex items-start justify-between mb-4">
        <p className="text-text-m text-xs font-medium uppercase tracking-wider">{title}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ background:`${color}18`, border:`1px solid ${color}25` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div className="mb-3">
        <p className="font-display font-black text-2xl text-text-p tabular-nums">
          {prefix}<CountUp end={num} duration={1.8} decimals={isFloat?2:0} separator="," />{suffix}
        </p>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          {isZero ? <Minus size={13} className="text-text-f" /> :
           isPos  ? <TrendingUp size={13} className="text-success" /> :
                    <TrendingDown size={13} className="text-error" />}
          <span className={`text-xs font-semibold ${isZero?'text-text-f':isPos?'text-success':'text-error'}`}>
            {isPos?'+':''}{change}%
          </span>
          {changeLabel && <span className="text-text-f text-xs">{changeLabel}</span>}
        </div>
      )}
    </motion.div>
  )
}