import React from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { MODULES } from '@/lib/constants'

export default function Modules() {
  const { ref, inView } = useScrollAnimation()
  return (
    <section id="modules" className="py-28 bg-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-success text-sm font-semibold tracking-widest uppercase mb-4 block">Platform Modules</span>
          <h2 className="font-display font-black text-4xl md:text-5xl text-text-p mb-4">12+ powerful modules</h2>
          <p className="text-text-m text-lg max-w-xl mx-auto">Activate only what you need. Scale as you grow. Every module works beautifully together.</p>
        </div>
        <div ref={ref} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {MODULES.map((m, i) => {
            const Icon = Icons[m.icon]
            return (
              <motion.div key={i}
                initial={{ opacity:0, scale:0.8 }} animate={inView?{opacity:1,scale:1}:{}}
                transition={{ duration:0.4, delay:i*0.05 }}
                className="group flex flex-col items-center gap-3 bg-surface border border-white/5 hover:border-white/15 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ background:`${m.color}18`, border:`1px solid ${m.color}30` }}>
                  {Icon && <Icon size={18} style={{ color:m.color }} />}
                </div>
                <span className="text-text-m text-xs font-medium text-center group-hover:text-text-p transition-colors">{m.label}</span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}