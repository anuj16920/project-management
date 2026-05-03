import React, { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const PRESETS = [
  { label: 'Last 7 days',   days: 7   },
  { label: 'Last 30 days',  days: 30  },
  { label: 'Last 3 months', days: 90  },
  { label: 'Last 6 months', days: 180 },
  { label: 'Last year',     days: 365 },
]

const toDate = (d) => d.toISOString().slice(0,10)
const fromDays = (n) => toDate(new Date(Date.now() - n * 86400000))

export default function DateRangeFilter({ value, onChange }) {
  const [open, setOpen] = useState(false)

  const applyPreset = (days) => {
    onChange({ from: fromDays(days), to: toDate(new Date()) })
    setOpen(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-surface border border-white/10
          hover:border-white/20 rounded-xl px-3 py-2 text-text-m text-sm transition-all">
        <Calendar size={13} className="text-accent"/>
        <span>{value.from} → {value.to}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:-8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-8, scale:0.95 }}
            className="absolute right-0 top-10 z-30 bg-surface2 border border-white/10
              rounded-2xl shadow-2xl p-4 w-72">

            {/* Presets */}
            <p className="text-text-f text-xs font-semibold uppercase tracking-wider mb-2">Quick Select</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {PRESETS.map(p => (
                <button key={p.days} onClick={() => applyPreset(p.days)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-accent/15
                    hover:text-accent text-text-m transition-all">
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom range */}
            <p className="text-text-f text-xs font-semibold uppercase tracking-wider mb-2">Custom Range</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-text-f text-xs block mb-1">From</label>
                <input type="date" value={value.from}
                  onChange={e => onChange({ ...value, from: e.target.value })}
                  className="w-full bg-surface border border-white/10 focus:border-accent/40
                    rounded-lg px-2 py-1.5 text-text-p text-xs outline-none"/>
              </div>
              <div>
                <label className="text-text-f text-xs block mb-1">To</label>
                <input type="date" value={value.to}
                  onChange={e => onChange({ ...value, to: e.target.value })}
                  className="w-full bg-surface border border-white/10 focus:border-accent/40
                    rounded-lg px-2 py-1.5 text-text-p text-xs outline-none"/>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-full mt-3 bg-accent hover:bg-accent-h text-white text-xs
                font-medium py-2 rounded-xl transition-all">
              Apply
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}