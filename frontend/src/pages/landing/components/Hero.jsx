import React from 'react'
import { ArrowRight, Play, Star, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const BADGES = ['No credit card required', 'Free 14-day trial', 'Cancel anytime']

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg">
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
        {/* Badge */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-accent/20">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-text-m text-xs font-medium">Trusted by 12,000+ companies worldwide</span>
          <Star size={12} className="text-warning" fill="#F59E0B" />
          <span className="text-warning text-xs font-semibold">4.9/5</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.1 }}
          className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-text-p leading-tight mb-6">
          Run Your Entire <br />
          <span className="gradient-text">Business</span> From <br />
          One Platform
        </motion.h1>

        {/* Subtext */}
        <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.2 }}
          className="text-text-m text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          NexaWork brings together project management, CRM, HR, finance, and team collaboration
          into one beautifully unified workspace.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a href="/signup" className="group flex items-center gap-2 bg-accent hover:bg-accent-h text-white font-semibold px-8 py-4 rounded-xl transition-all glow-accent hover:scale-105 active:scale-95 text-base">
            Start for Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <button className="group flex items-center gap-2 glass border border-white/10 hover:border-accent/30 text-text-p font-medium px-8 py-4 rounded-xl transition-all hover:scale-105 text-base">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Play size={12} fill="#6366F1" className="text-accent ml-0.5" />
            </div>
            Watch Demo
          </button>
        </motion.div>

        {/* Trust badges */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.6, delay:0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-16">
          {BADGES.map(b => (
            <div key={b} className="flex items-center gap-1.5 text-text-f text-sm">
              <CheckCircle size={14} className="text-success" /><span>{b}</span>
            </div>
          ))}
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.9, delay:0.5 }}
          className="relative max-w-5xl mx-auto">
          <div className="glass rounded-2xl overflow-hidden border border-white/10 shadow-card animate-float">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-surface2 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-error/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="glass rounded-md px-3 py-1 text-text-f text-xs text-center">app.nexawork.io/dashboard</div>
              </div>
            </div>
            {/* Mock UI */}
            <div className="bg-surface p-6 min-h-[360px]">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label:'Total Revenue',   value:'$48,290', change:'+12%', color:'text-success' },
                  { label:'Active Projects', value:'24',      change:'+3',   color:'text-accent'  },
                  { label:'Team Members',    value:'36',      change:'+2',   color:'text-cyan'    },
                  { label:'Open Tasks',      value:'142',     change:'-8%',  color:'text-warning' },
                ].map(k => (
                  <div key={k.label} className="bg-surface2 rounded-xl p-4 border border-white/5">
                    <p className="text-text-f text-xs mb-2">{k.label}</p>
                    <p className="text-text-p text-lg font-bold font-display">{k.value}</p>
                    <p className={`text-xs font-medium mt-1 ${k.color}`}>{k.change} this month</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-surface2 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-text-p text-sm font-semibold">Revenue Overview</p>
                    <span className="text-success text-xs bg-success/10 px-2 py-0.5 rounded-full">+18.2%</span>
                  </div>
                  <div className="flex items-end gap-2 h-24">
                    {[40,65,45,80,60,90,75,95,70,85,100,88].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{ height:`${h}%`, background: i===11?'#6366F1':`rgba(99,102,241,${0.2+i*0.05})` }} />
                    ))}
                  </div>
                </div>
                <div className="bg-surface2 rounded-xl p-4 border border-white/5">
                  <p className="text-text-p text-sm font-semibold mb-3">Recent Tasks</p>
                  <div className="space-y-2.5">
                    {['Design system update','API integration','User testing','Deploy v2.0'].map((t,i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${i<2?'bg-success':'bg-accent'}`} />
                        <span className="text-text-m text-xs">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-accent/20 blur-[40px] rounded-full" />
        </motion.div>
      </div>
    </section>
  )
}