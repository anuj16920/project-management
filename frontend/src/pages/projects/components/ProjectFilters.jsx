import React from 'react'
import { Search, LayoutGrid, List } from 'lucide-react'

export default function ProjectFilters({ filters, onChange, view, onViewChange }) {
  const set = (k, v) => onChange({ ...filters, [k]: v })

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Search */}
      <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-48">
        <Search size={14} className="text-text-f" />
        <input placeholder="Search projects..." value={filters.search || ''}
          onChange={e => set('search', e.target.value)}
          className="bg-transparent text-text-p text-sm outline-none w-full placeholder:text-text-f" />
      </div>

      {/* Status */}
      <select value={filters.status || ''} onChange={e => set('status', e.target.value)}
        className="bg-surface border border-white/10 text-text-m text-sm rounded-xl px-3 py-2 outline-none focus:border-accent/40">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="on_hold">On Hold</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {/* Priority */}
      <select value={filters.priority || ''} onChange={e => set('priority', e.target.value)}
        className="bg-surface border border-white/10 text-text-m text-sm rounded-xl px-3 py-2 outline-none focus:border-accent/40">
        <option value="">All Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      {/* View toggle */}
      <div className="flex items-center bg-surface border border-white/10 rounded-xl p-1 gap-0.5">
        <button onClick={() => onViewChange('grid')}
          className={`p-1.5 rounded-lg transition-all ${view==='grid'?'bg-accent/20 text-accent':'text-text-f hover:text-text-m'}`}>
          <LayoutGrid size={15} />
        </button>
        <button onClick={() => onViewChange('list')}
          className={`p-1.5 rounded-lg transition-all ${view==='list'?'bg-accent/20 text-accent':'text-text-f hover:text-text-m'}`}>
          <List size={15} />
        </button>
      </div>
    </div>
  )
}