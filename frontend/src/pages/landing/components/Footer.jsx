import React from 'react'
import { Zap, Twitter, Linkedin, Github, Mail } from 'lucide-react'

const LINKS = {
  Product: ['Features','Pricing','Changelog','Roadmap'],
  Company: ['About','Blog','Careers','Press'],
  Support: ['Documentation','Help Center','API Reference','Status'],
  Legal:   ['Privacy Policy','Terms of Service','Cookie Policy','GDPR'],
}

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-xl text-text-p">NexaWork</span>
            </div>
            <p className="text-text-m text-sm leading-relaxed max-w-xs mb-6">
              The all-in-one platform to manage your projects, team, clients and finances from a single workspace.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-text-f hover:text-accent hover:border-accent/50 transition-all">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-text-p text-sm font-semibold mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l}><a href="#" className="text-text-m text-sm hover:text-text-p transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-f text-sm">© 2026 NexaWork. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-text-f text-sm">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}