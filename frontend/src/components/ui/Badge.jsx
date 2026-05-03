import React from 'react'

const VARIANTS = {
  default: 'bg-white/10 text-text-m',
  accent:  'bg-accent/15 text-accent border border-accent/20',
  success: 'bg-success/15 text-success border border-success/20',
  warning: 'bg-warning/15 text-warning border border-warning/20',
  error:   'bg-error/15 text-error border border-error/20',
  cyan:    'bg-cyan/15 text-cyan border border-cyan/20',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  )
}