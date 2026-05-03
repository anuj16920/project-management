import React from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { FEATURES } from '@/lib/constants'

export default function Features() {
  const { ref, inView } = useScrollAnimation()
  return (
    <section id="features" className="py-28 bg-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase mb-4 block">Features</span>
          <h2 className="font-display font-black text-4xl md:text-5xl text-text-p mb-4">Everything your team needs</h2>
          <p className="text-text-m text-lg max-w-xl mx-auto">Stop juggling multiple tools. NexaWork brings all your workflows under one roof.</p>
        </div>
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = Icons[f.icon]
            return (
              <motion.div key={i}
                initial={{ opacity:0, y:30 }} animate={inView?{opacity:1,y:0}:{}}
                transition={{ duration:0.5, delay:i*0.1 }}
                className="group bg-surface border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:shadow-card-h hover:-translate-y-1 cursor-pointer">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background:`${f.color}18`, border:`1px solid ${f.color}30` }}>
                  {Icon && <Icon size={22} style={{ color:f.color }} />}
                </div>
                <h3 className="font-display font-bold text-lg text-text-p mb-2">{f.title}</h3>
                <p className="text-text-m text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}