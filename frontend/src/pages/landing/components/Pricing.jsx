import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { PRICING } from '@/lib/constants'

export default function Pricing() {
  const { ref, inView } = useScrollAnimation()
  const [annual, setAnnual] = useState(false)
  return (
    <section id="pricing" className="py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-warning text-sm font-semibold tracking-widest uppercase mb-4 block">Pricing</span>
          <h2 className="font-display font-black text-4xl md:text-5xl text-text-p mb-4">Simple, transparent pricing</h2>
          <p className="text-text-m text-lg max-w-xl mx-auto mb-8">No hidden fees. No surprises. Start free and scale when ready.</p>
          <div className="inline-flex items-center gap-2 glass rounded-full p-1 border border-white/10">
            <button onClick={() => setAnnual(false)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!annual?'bg-accent text-white':'text-text-m hover:text-text-p'}`}>Monthly</button>
            <button onClick={() => setAnnual(true)}  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${annual?'bg-accent text-white':'text-text-m hover:text-text-p'}`}>
              Annual <span className="text-xs bg-success text-white px-1.5 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING.map((p, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:30 }} animate={inView?{opacity:1,y:0}:{}}
              transition={{ duration:0.5, delay:i*0.1 }}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${p.highlighted?'bg-accent/10 border-accent/40 glow-accent scale-105':'bg-bg border-white/5 hover:border-white/15'}`}>
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Zap size={10} fill="white" />{p.badge}
                </span>
              )}
              <h3 className="font-display font-bold text-xl text-text-p mb-2">{p.name}</h3>
              <p className="text-text-m text-sm mb-6">{p.desc}</p>
              <div className="mb-6">
                <span className="font-display font-black text-5xl text-text-p">${annual?Math.round(p.price*0.8):p.price}</span>
                {p.price>0 && <span className="text-text-m text-sm ml-2">/ {p.period}</span>}
              </div>
              <a href="/signup" className={`block text-center font-semibold py-3 rounded-xl text-sm transition-all mb-8 ${p.highlighted?'bg-accent hover:bg-accent-h text-white glow-accent':'border border-white/15 hover:border-accent/50 text-text-p hover:text-accent'}`}>
                {p.cta}
              </a>
              <ul className="space-y-3">
                {p.features.map((f,j) => (
                  <li key={j} className="flex items-center gap-3 text-text-m text-sm">
                    <Check size={15} className="text-success flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}