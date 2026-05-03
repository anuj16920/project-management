import React from 'react'
import { Zap, ShieldCheck, Users, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

const PANEL_CONTENT = {
  login: {
    headline: 'Your entire business, one login.',
    sub: 'Projects, CRM, HR, Finance and Team Chat — all in a single workspace.',
    stats: [
      { label: 'Revenue',  value: '$48,290', color: 'text-success' },
      { label: 'Projects', value: '24 Active', color: 'text-accent' },
      { label: 'Tasks',    value: '142 Open',  color: 'text-warning' },
      { label: 'Team',     value: '36 Members', color: 'text-cyan' },
    ],
    badges: [
      { icon: ShieldCheck, label: 'Admin',    color: 'bg-red-500/20 text-red-400 border-red-500/30' },
      { icon: Users,       label: 'Employee', color: 'bg-accent/20 text-accent border-accent/30' },
      { icon: TrendingUp,  label: 'Client',   color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    ],
    badgeTitle: 'Every role has its own portal',
    barData: [40,65,45,80,60,90,75,95,70,85,100,88],
  },
  signup: {
    headline: 'Set up in under 2 minutes.',
    sub: 'Create your workspace, then invite your team. Everything is ready out of the box.',
    stats: [
      { label: 'Setup Time', value: '< 2 min', color: 'text-success' },
      { label: 'Modules',    value: '10+',      color: 'text-accent' },
      { label: 'Users',      value: 'Unlimited', color: 'text-warning' },
      { label: 'Support',    value: '24/7',      color: 'text-cyan' },
    ],
    badges: [
      { icon: ShieldCheck, label: 'You → Admin', color: 'bg-accent/20 text-accent border-accent/30' },
      { icon: Users,       label: 'You add → Employees', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
      { icon: TrendingUp,  label: 'You add → Clients', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    ],
    badgeTitle: 'You control who gets access',
    barData: [20,40,55,70,60,80,90,85,95,100,98,100],
  },
}

export default function AuthLayout({ children, title, subtitle, page = 'login' }) {
  const panel = PANEL_CONTENT[page] || PANEL_CONTENT.login

  return (
    <div className="min-h-screen bg-bg flex">
      {/* ── Left — Form ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 relative overflow-y-auto">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center glow-accent">
              <Zap size={18} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-xl text-text-p">NexaWork</span>
          </a>

          {/* Title */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
            <h1 className="font-display font-black text-3xl text-text-p mb-2">{title}</h1>
            <p className="text-text-m text-sm mb-8">{subtitle}</p>
          </motion.div>

          {/* Form Content */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.1 }}>
            {children}
          </motion.div>
        </div>
      </div>

      {/* ── Right — Visual panel ── */}
      <div className="hidden lg:flex w-1/2 bg-surface border-l border-white/5 flex-col justify-center items-center p-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/15 rounded-full blur-[100px]" />

        <div className="relative z-10 text-center max-w-md w-full">
          {/* Mock dashboard card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="glass rounded-2xl border border-white/10 p-6 mb-8 text-left shadow-card"
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              {panel.stats.map(k => (
                <div key={k.label} className="bg-surface2 rounded-xl p-3 border border-white/5">
                  <p className="text-text-f text-xs mb-1">{k.label}</p>
                  <p className={`font-display font-bold text-sm ${k.color}`}>{k.value}</p>
                </div>
              ))}
            </div>
            {/* Bar chart */}
            <div className="flex items-end gap-1.5 h-14 mb-4">
              {panel.barData.map((h,i) => (
                <div key={i} className="flex-1 rounded-t-sm transition-all"
                  style={{ height:`${h}%`, background: i === panel.barData.length-1 ? '#6366F1' : `rgba(99,102,241,${0.12+i*0.06})` }} />
              ))}
            </div>
            {/* Role badges */}
            <div>
              <p className="text-text-f text-xs mb-2">{panel.badgeTitle}</p>
              <div className="flex flex-wrap gap-2">
                {panel.badges.map(({ icon: Icon, label, color }) => (
                  <span key={label} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${color}`}>
                    <Icon size={11} /> {label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-display font-black text-2xl text-text-p mb-3"
          >
            {panel.headline}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-text-m text-sm leading-relaxed"
          >
            {panel.sub}
          </motion.p>
        </div>
      </div>
    </div>
  )
}