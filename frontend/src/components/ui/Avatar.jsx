import React from 'react'

const SIZES = { sm:'w-7 h-7 text-xs', md:'w-9 h-9 text-sm', lg:'w-11 h-11 text-base', xl:'w-14 h-14 text-lg' }
const COLORS = ['bg-accent/30 text-accent','bg-cyan/30 text-cyan','bg-success/30 text-success','bg-warning/30 text-warning','bg-error/30 text-error']

export default function Avatar({ name = '', src = '', size = 'md', className = '' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  const color    = COLORS[name.charCodeAt(0) % COLORS.length]
  return (
    <div className={`${SIZES[size]} rounded-full flex items-center justify-center font-display font-bold flex-shrink-0 overflow-hidden ${src ? '' : color} ${className}`}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  )
}