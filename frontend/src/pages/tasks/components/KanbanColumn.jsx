import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard'
import { motion, AnimatePresence } from 'framer-motion'

const COLUMN_META = {
  todo:        { label:'To Do',      color:'#475569', dot:'bg-slate-400'  },
  in_progress: { label:'In Progress',color:'#6366F1', dot:'bg-accent'     },
  review:      { label:'In Review',  color:'#F59E0B', dot:'bg-warning'    },
  done:        { label:'Done',       color:'#10B981', dot:'bg-success'    },
}

export default function KanbanColumn({ status, tasks = [], onCardClick, onAddTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const meta = COLUMN_META[status] || { label: status, color:'#475569', dot:'bg-slate-400' }

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
          <span className="text-text-p text-sm font-semibold">{meta.label}</span>
          <span className="bg-surface2 border border-white/8 text-text-f text-xs px-2 py-0.5 rounded-full tabular-nums">
            {tasks.length}
          </span>
        </div>
        <button onClick={() => onAddTask?.(status)}
          className="w-6 h-6 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-f hover:text-text-m transition-all">
          <Plus size={14} />
        </button>
      </div>

      {/* Drop zone */}
      <div ref={setNodeRef}
        className={`flex-1 min-h-20 rounded-2xl p-2 space-y-2.5 transition-all duration-150
          ${isOver ? 'bg-accent/5 border-2 border-accent/30 border-dashed' : 'bg-surface/40 border-2 border-transparent'}`}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {tasks.map(task => (
              <motion.div key={task.id}
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, scale:0.95 }}
                transition={{ duration:0.2 }}>
                <TaskCard task={task} onClick={onCardClick} />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>

        {/* Empty state per column */}
        {tasks.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center py-8 text-text-f text-xs opacity-50">
            <p>Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  )
}