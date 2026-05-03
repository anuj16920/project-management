import React, { useEffect, useState, useCallback } from 'react'
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Plus, LayoutList, Columns, Search } from 'lucide-react'
import { taskAPI }         from '@/lib/taskAPI'
import KanbanColumn        from './components/KanbanColumn'
import TaskCard            from './components/TaskCard'
import TaskDetailDrawer    from './components/TaskDetailDrawer'
import CreateTaskModal     from './components/CreateTaskModal'
import { SkeletonCard }    from '@/components/ui/Skeleton'
import { toast }           from 'sonner'
import { useRoleGuard }    from '@/hooks/useRoleGuard'

const COLUMNS = ['todo','in_progress','review','done']

export default function KanbanBoard() {
  const { canCreateStaff, isEmployee } = useRoleGuard()
  const [tasks,       setTasks]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [activeTask,  setActiveTask]  = useState(null)     // currently dragging
  const [drawerTask,  setDrawerTask]  = useState(null)     // task in detail drawer
  const [showCreate,  setShowCreate]  = useState(false)
  const [defaultStatus, setDefaultStatus] = useState('todo')
  const [search,      setSearch]      = useState('')
  const [view,        setView]        = useState('kanban') // kanban | list

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await taskAPI.list(search ? { search } : {})
      setTasks(res.data.data || [])
    } catch {}
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { load() }, [load])

  // Group tasks by status
  const getColumnTasks = (status) =>
    tasks
      .filter(t => t.status === status)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

  // ── DnD Handlers ─────────────────────────────────────────────────────────────
  const handleDragStart = (event) => {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    if (!over) return

    const activeId   = active.id
    const overId     = over.id
    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

    // Over a column (droppable) or a task in another column
    const overStatus = COLUMNS.includes(overId)
      ? overId
      : tasks.find(t => t.id === overId)?.status

    if (!overStatus || activeTask.status === overStatus) return

    setTasks(prev => prev.map(t =>
      t.id === activeId ? { ...t, status: overStatus } : t
    ))
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const activeId = active.id
    const overId   = over.id
    const task     = tasks.find(t => t.id === activeId)
    if (!task) return

    // Determine target status
    const targetStatus = COLUMNS.includes(overId)
      ? overId
      : tasks.find(t => t.id === overId)?.status || task.status

    // Build new column order
    const colTasks = getColumnTasks(targetStatus)
    const oldIndex = colTasks.findIndex(t => t.id === activeId)
    const newIndex = colTasks.findIndex(t => t.id === overId)
    const reordered = oldIndex >= 0 && newIndex >= 0
      ? arrayMove(colTasks, oldIndex, newIndex)
      : colTasks

    // Optimistic update
    setTasks(prev => {
      const others = prev.filter(t => t.status !== targetStatus || t.id === activeId)
      return [
        ...others.filter(t => t.id !== activeId),
        ...reordered.map((t, i) => ({ ...t, status: targetStatus, position: i })),
      ]
    })

    // Persist
    try {
      await taskAPI.move(activeId, targetStatus, newIndex >= 0 ? newIndex : 0)
      const updates = reordered.map((t, i) => ({ id: t.id, status: targetStatus, position: i }))
      if (updates.length > 1) await taskAPI.reorder(updates)
    } catch {
      toast.error('Failed to save position')
      load() // revert
    }
  }

  const handleAddTask = (status) => {
    setDefaultStatus(status)
    setShowCreate(true)
  }

  const filteredTasks = search
    ? tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    : tasks

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-black text-2xl text-text-p">Tasks</h2>
          <p className="text-text-m text-sm mt-1">
            {loading ? '...' : `${tasks.length} task${tasks.length!==1?'s':''} total`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-xl px-3 py-2 w-48">
            <Search size={13} className="text-text-f" />
            <input placeholder="Search tasks..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-text-p text-sm outline-none w-full placeholder:text-text-f" />
          </div>
          {/* View toggle */}
          <div className="flex items-center bg-surface border border-white/10 rounded-xl p-1 gap-0.5">
            <button onClick={() => setView('kanban')}
              className={`p-1.5 rounded-lg transition-all ${view==='kanban'?'bg-accent/20 text-accent':'text-text-f hover:text-text-m'}`}>
              <Columns size={15} />
            </button>
            <button onClick={() => setView('list')}
              className={`p-1.5 rounded-lg transition-all ${view==='list'?'bg-accent/20 text-accent':'text-text-f hover:text-text-m'}`}>
              <LayoutList size={15} />
            </button>
          </div>
          {/* Create */}
          <button onClick={() => { setDefaultStatus('todo'); setShowCreate(true) }}
            className="flex items-center gap-2 bg-accent hover:bg-accent-h text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 glow-accent">
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      {view === 'kanban' && (
        loading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(c => (
              <div key={c} className="w-72 flex-shrink-0 space-y-2.5">
                {Array(3).fill(0).map((_,i) => <SkeletonCard key={i} />)}
              </div>
            ))}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-6">
              {COLUMNS.map(col => (
                <KanbanColumn key={col} status={col}
                  tasks={getColumnTasks(col)}
                  onCardClick={t => setDrawerTask(t.id)}
                  onAddTask={handleAddTask} />
              ))}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeTask && (
                <div className="rotate-2 scale-105 opacity-90">
                  <TaskCard task={activeTask} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Task','Project','Status','Priority','Assignee','Due Date'].map(h => (
                  <th key={h} className="text-left text-text-f text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.map(t => (
                <tr key={t.id} onClick={() => setDrawerTask(t.id)}
                  className="hover:bg-white/2 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <p className={`text-sm font-medium ${t.status==='done'?'text-text-f line-through':'text-text-p'}`}>{t.title}</p>
                    {t.label && <span className="text-xs text-accent">{t.label}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {t.projects ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.projects.cover_color || '#6366F1' }} />
                        <span className="text-text-m text-xs">{t.projects.name}</span>
                      </div>
                    ) : <span className="text-text-f text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize
                      ${t.status==='done'?'bg-success/15 text-success':
                        t.status==='in_progress'?'bg-accent/15 text-accent':
                        t.status==='review'?'bg-warning/15 text-warning':'bg-white/10 text-text-m'}`}>
                      {t.status.replace('_',' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs capitalize font-medium
                      ${t.priority==='high'||t.priority==='urgent'?'text-error':
                        t.priority==='medium'?'text-warning':'text-success'}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {t.profiles?.full_name
                      ? <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                            {t.profiles.full_name.charAt(0)}
                          </div>
                          <span className="text-text-m text-xs">{t.profiles.full_name.split(' ')[0]}</span>
                        </div>
                      : <span className="text-text-f text-xs">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3">
                    {t.due_date
                      ? <span className={`text-xs ${new Date(t.due_date)<new Date()&&t.status!=='done'?'text-error':'text-text-m'}`}>
                          {new Date(t.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                        </span>
                      : <span className="text-text-f text-xs">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-text-f text-sm">No tasks found</div>
          )}
        </div>
      )}

      {/* Task Detail Drawer */}
      {drawerTask && (
        <TaskDetailDrawer
          taskId={drawerTask}
          onClose={() => setDrawerTask(null)}
          onUpdate={load}
        />
      )}

      {/* Create Task Modal */}
      {showCreate && (
        <CreateTaskModal
          defaultStatus={defaultStatus}
          onClose={() => setShowCreate(false)}
          onSuccess={load}
        />
      )}
    </div>
  )
}