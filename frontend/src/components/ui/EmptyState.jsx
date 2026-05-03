import React from 'react'
import * as Icons from 'lucide-react'

export default function EmptyState({ icon = 'Inbox', title, description, actionLabel, onAction }) {
  const Icon = Icons[icon]
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
        {Icon && <Icon size={24} className="text-accent" />}
      </div>
      <h3 className="font-display font-bold text-base text-text-p mb-2">{title}</h3>
      <p className="text-text-m text-sm max-w-xs mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction}
          className="bg-accent hover:bg-accent-h text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95">
          {actionLabel}
        </button>
      )}
    </div>
  )
}