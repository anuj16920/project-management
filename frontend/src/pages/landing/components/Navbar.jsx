import React, { useState, useEffect } from 'react'
import { Menu, X, Zap } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-card py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center glow-accent">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-xl text-text-p">NexaWork</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} className="text-text-m text-sm font-medium hover:text-text-p transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href="/login"  className="text-text-m text-sm font-medium hover:text-text-p transition-colors px-4 py-2">Sign In</a>
          <a href="/signup" className="bg-accent hover:bg-accent-h text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all glow-accent hover:scale-105 active:scale-95">
            Get Started Free
          </a>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-text-m hover:text-text-p p-2" aria-label="Toggle menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-white/5 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-text-m text-sm font-medium hover:text-text-p transition-colors py-2">
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2 border-t border-white/5">
            <a href="/login"  className="text-text-m text-sm text-center py-2.5 border border-white/10 rounded-lg hover:border-accent/50 transition-colors">Sign In</a>
            <a href="/signup" className="bg-accent text-white text-sm font-semibold text-center py-2.5 rounded-lg">Get Started Free</a>
          </div>
        </div>
      )}
    </header>
  )
}