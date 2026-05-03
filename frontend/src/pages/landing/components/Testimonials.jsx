import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { TESTIMONIALS } from '@/lib/constants'

export default function Testimonials() {
  const { ref, inView } = useScrollAnimation()
  return (
    <section className="py-28 bg-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-error text-sm font-semibold tracking-widest uppercase mb-4 block">Testimonials</span>
          <h2 className="font-display font-black text-4xl md:text-5xl text-text-p mb-4">Loved by teams worldwide</h2>
          <p className="text-text-m text-lg max-w-xl mx-auto">Join thousands of companies that trust NexaWork to run their business.</p>
        </div>
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:30 }} animate={inView?{opacity:1,y:0}:{}}
              transition={{ duration:0.5, delay:i*0.1 }}
              className="bg-surface border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:shadow-card-h">
              <div className="flex gap-1 mb-4">
                {Array(t.rating).fill(0).map((_,j) => <Star key={j} size={14} className="text-warning" fill="#F59E0B" />)}
              </div>
              <p className="text-text-m text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center font-display font-bold text-accent text-sm">{t.avatar}</div>
                <div>
                  <p className="text-text-p text-sm font-semibold">{t.name}</p>
                  <p className="text-text-f text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}