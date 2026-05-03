import React from 'react'
import { ArrowRight, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

export default function CTA() {
  const { ref, inView } = useScrollAnimation()
  return (
    <section className="py-28 bg-surface">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div ref={ref}
          initial={{ opacity:0, y:40 }} animate={inView?{opacity:1,y:0}:{}}
          transition={{ duration:0.7 }}
          className="relative bg-gradient-to-br from-accent/20 via-surface2 to-cyan/10 border border-accent/20 rounded-3xl p-16 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto mb-6">
              <Zap size={28} className="text-accent" fill="#6366F1" />
            </div>
            <h2 className="font-display font-black text-4xl md:text-5xl text-text-p mb-4">Ready to transform<br />your business?</h2>
            <p className="text-text-m text-lg max-w-lg mx-auto mb-10">Join 12,000+ companies already using NexaWork. Set up your workspace in under 2 minutes.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/signup" className="group flex items-center gap-2 bg-accent hover:bg-accent-h text-white font-semibold px-8 py-4 rounded-xl transition-all glow-accent hover:scale-105 text-base">
                Start for Free Today <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#pricing" className="text-text-m text-sm hover:text-text-p transition-colors">View pricing →</a>
            </div>
            <p className="text-text-f text-xs mt-6">No credit card required · Free 14-day trial on Pro</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}