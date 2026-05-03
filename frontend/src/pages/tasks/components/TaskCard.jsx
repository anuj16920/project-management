import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, MessageSquare, Paperclip, Clock, Flag, GripVertical } from 'lucide-react'
import Badge  from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { motion } from 'framer-motion'

const PRIORITY_COLORS = {
  low:    { bar:'bg-success',  badge:'success'  },
  medium: { bar:'bg-warning',  badge:'warning'  },
  high:   { bar:'bg-error',    badge:'error'    },
  urgent: { bar:'bg-error',    badge:'error'    },
}

export default function TaskCard({ task, onClick }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.4 : 1,
    zIndex:     isDragging ? 999 : 'auto',
  }

  const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

  return (
    <div ref={setNodeRef} style={style}
      className={`bg-surface border rounded-xl p-3.5 cursor-pointer group transition-all duration-150
        ${isDragging ? 'shadow-card-h border-accent/40' : 'border-white/5 hover:border-white/15 hover:shadow-card'}`}
      onClick={() => !isDragging && onClick?.(task)}>

      {/* Drag handle */}
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners}
          onClick={e => e.stopPropagation()}
          className="mt-0.5 text-text-f opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity flex-shrink-0">
          <GripVertical size={13} />
        </button>

        <div className="flex-1 min-w-0">
          {/* Priority bar */}
          <div className={`w-full h-0.5 ${pc.bar} rounded-full mb-2.5 opacity-60`} />

          {/* Title */}
          <p className={`text-sm font-medium leading-snug mb-2
            ${task.status === 'done' ? 'text-text-f line-through' : 'text-text-p'}`}>
            {task.title}
          </p>

          {/* Project */}
          {task.projects && (
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: task.projects.cover_color || '#6366F1' }} />
              <span className="text-text-f text-xs truncate">{task.projects.name}</span>
            </div>
          )}

          {/* Label */}
          {task.label && (
            <span className="inline-block px-2 py-0.5 bg-accent/10 border border-accent/20 text-accent text-xs rounded-full mb-2.5">
              {task.label}
            </span>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Due date */}
              {task.due_date && (
                <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-error' : 'text-text-f'}`}>
                  <Calendar size={10} />
                  <span>{new Date(task.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                </div>
              )}
              {/* Comments */}
              {task.commentCount > 0 && (
                <div className="flex items-center gap-1 text-text-f text-xs">
                  <MessageSquare size={10} />
                  <span>{task.commentCount}</span>
                </div>
              )}
              {/* Attachments */}
              {task.attachmentCount > 0 && (
                <div className="flex items-center gap-1 text-text-f text-xs">
                  <Paperclip size={10} />
                  <span>{task.attachmentCount}</span>
                </div>
              )}
              {/* Time */}
              {task.estimated_hrs && (
                <div className="flex items-center gap-1 text-text-f text-xs">
                  <Clock size={10} />
                  <span>{task.logged_hrs || 0}/{task.estimated_hrs}h</span>
                </div>
              )}
            </div>

            {/* Assignee avatar */}
            {task.profiles?.full_name && (
              <Avatar name={task.profiles.full_name} size="sm" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}