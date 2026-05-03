import React from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { HOW_IT_WORKS } from '@/lib/constants'

export default function HowItWorks() {
  const { ref, inView } = useScrollAnimation()
  return (
    <section id="how-it-works" className="py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-cyan text-sm font-semibold tracking-widest uppercase mb-4 block">How It Works</span>
          <h2 className="font-display font-black text-4xl md:text-5xl text-text-p mb-4">Up and running in minutes</h2>
          <p className="text-text-m text-lg max-w-xl mx-auto">No complex setup. No technical knowledge required. Just three simple steps.</p>
        </div>
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0" />
          {HOW_IT_WORKS.map((s, i) => {
            const Icon = Icons[s.icon]
            return (
              <motion.div key={i}
                initial={{ opacity:0, y:40 }} animate={inView?{opacity:1,y:0}:{}}
                transition={{ duration:0.6, delay:i*0.15 }}
                className="relative text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-6 mx-auto">
                  {Icon && <Icon size={26} className="text-accent" />}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center font-display">{i+1}</span>
                </div>
                <h3 className="font-display font-bold text-xl text-text-p mb-3">{s.title}</h3>
                <p className="text-text-m text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}