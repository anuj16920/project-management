import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, Flag, User, Tag, Plus, Trash2,
         CheckSquare, Square, Send, Timer } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { taskAPI } from '@/lib/taskAPI'
import Avatar from '@/components/ui/Avatar'
import Badge  from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'

const STATUSES  = ['todo','in_progress','review','done']
const PRIORITIES= ['low','medium','high','urgent']
const PRIORITY_BADGE = { low:'success', medium:'warning', high:'error', urgent:'error' }

export default function TaskDetailDrawer({ taskId, onClose, onUpdate }) {
  const { profile } = useAuth()
  const [task,     setTask]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('details')  // details | comments | time
  const [comment,  setComment]  = useState('')
  const [posting,  setPosting]  = useState(false)
  const [timeForm, setTimeForm] = useState({ hours:'', description:'', logged_date: new Date().toISOString().split('T')[0] })
  const [subtask,  setSubtask]  = useState('')

  const load = async () => {
    try {
      const res = await taskAPI.get(taskId)
      setTask(res.data.data)
    } catch { toast.error('Failed to load task') }
    finally  { setLoading(false) }
  }

  useEffect(() => { if (taskId) load() }, [taskId])

  const handleUpdate = async (field, value) => {
    try {
      await taskAPI.update(taskId, { [field]: value })
      setTask(t => ({ ...t, [field]: value }))
      onUpdate?.()
    } catch { toast.error('Update failed') }
  }

  const handleComment = async () => {
    if (!comment.trim()) return
    setPosting(true)
    try {
      const res = await taskAPI.addComment(taskId, comment)
      setTask(t => ({ ...t, task_comments: [...(t.task_comments||[]), res.data.data] }))
      setComment('')
    } catch { toast.error('Failed to add comment') }
    finally { setPosting(false) }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await taskAPI.deleteComment(taskId, commentId)
      setTask(t => ({ ...t, task_comments: t.task_comments.filter(c => c.id !== commentId) }))
      toast.success('Comment deleted')
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed') }
  }

  const handleLogTime = async () => {
    if (!timeForm.hours) return
    try {
      const res = await taskAPI.logTime(taskId, timeForm)
      setTask(t => ({
        ...t,
        logged_hrs: (t.logged_hrs || 0) + parseFloat(timeForm.hours),
        task_time_logs: [...(t.task_time_logs||[]), res.data.data],
      }))
      setTimeForm({ hours:'', description:'', logged_date: new Date().toISOString().split('T')[0] })
      toast.success('Time logged!')
    } catch { toast.error('Failed to log time') }
  }

  const handleAddSubtask = async () => {
    if (!subtask.trim()) return
    try {
      const res = await taskAPI.createSubtask(taskId, { title: subtask })
      setTask(t => ({ ...t, subtasks: [...(t.subtasks||[]), res.data.data] }))
      setSubtask('')
    } catch { toast.error('Failed to add subtask') }
  }

  const toggleSubtask = async (subId, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    try {
      await taskAPI.update(subId, { status: newStatus })
      setTask(t => ({
        ...t,
        subtasks: t.subtasks.map(s => s.id === subId ? { ...s, status: newStatus } : s),
      }))
    } catch {}
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        {/* Drawer */}
        <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
          transition={{ type:'spring', stiffness:300, damping:30 }}
          className="absolute right-0 top-0 h-full w-full max-w-xl bg-surface border-l border-white/8 flex flex-col shadow-card-h overflow-hidden">

          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : task ? (
            <>
              {/* Header */}
              <div className="flex items-start gap-3 p-5 border-b border-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-text-f text-xs mb-1 uppercase tracking-wider">Task</p>
                  <h2 className="font-display font-bold text-lg text-text-p leading-snug">{task.title}</h2>
                </div>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-m flex-shrink-0 transition-all">
                  <X size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-3 border-b border-white/5">
                {['details','comments','time'].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                      ${tab===t?'bg-accent/20 text-accent':'text-text-m hover:text-text-p'}`}>
                    {t}
                    {t==='comments' && task.task_comments?.length > 0 &&
                      <span className="ml-1.5 bg-accent/20 text-accent text-xs px-1.5 py-0.5 rounded-full">{task.task_comments.length}</span>}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">

                {/* ── DETAILS TAB ── */}
                {tab === 'details' && (
                  <div className="p-5 space-y-5">
                    {/* Status + Priority */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-text-f text-xs block mb-1.5">Status</label>
                        <select value={task.status}
                          onChange={e => handleUpdate('status', e.target.value)}
                          className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none capitalize">
                          {STATUSES.map(s => <option key={s} value={s} className="bg-surface capitalize">{s.replace('_',' ')}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-text-f text-xs block mb-1.5">Priority</label>
                        <select value={task.priority}
                          onChange={e => handleUpdate('priority', e.target.value)}
                          className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none capitalize">
                          {PRIORITIES.map(p => <option key={p} value={p} className="bg-surface capitalize">{p}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-text-f text-xs block mb-1.5">Description</label>
                      <textarea rows={3} placeholder="Add a description..."
                        defaultValue={task.description || ''}
                        onBlur={e => { if (e.target.value !== task.description) handleUpdate('description', e.target.value) }}
                        className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none resize-none transition-all placeholder:text-text-f" />
                    </div>

                    {/* Due date + Estimate */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-text-f text-xs block mb-1.5 flex items-center gap-1">
                          <Calendar size={11} /> Due Date
                        </label>
                        <input type="date" value={task.due_date?.split('T')[0] || ''}
                          onChange={e => handleUpdate('due_date', e.target.value)}
                          className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none" />
                      </div>
                      <div>
                        <label className="text-text-f text-xs block mb-1.5 flex items-center gap-1">
                          <Clock size={11} /> Estimate (hrs)
                        </label>
                        <input type="number" step="0.5" placeholder="e.g. 4"
                          defaultValue={task.estimated_hrs || ''}
                          onBlur={e => { if (e.target.value) handleUpdate('estimated_hrs', parseFloat(e.target.value)) }}
                          className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f" />
                      </div>
                    </div>

                    {/* Assignee */}
                    <div>
                      <label className="text-text-f text-xs block mb-1.5 flex items-center gap-1">
                        <User size={11} /> Assignee
                      </label>
                      <div className="flex items-center gap-2 bg-surface2 border border-white/10 rounded-xl px-3 py-2">
                        {task.profiles?.full_name
                          ? <><Avatar name={task.profiles.full_name} size="sm" /><span className="text-text-p text-sm">{task.profiles.full_name}</span></>
                          : <span className="text-text-f text-sm">Unassigned</span>}
                      </div>
                    </div>

                    {/* Label */}
                    <div>
                      <label className="text-text-f text-xs block mb-1.5 flex items-center gap-1">
                        <Tag size={11} /> Label
                      </label>
                      <input type="text" placeholder="e.g. bug, feature, design"
                        defaultValue={task.label || ''}
                        onBlur={e => handleUpdate('label', e.target.value)}
                        className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f" />
                    </div>

                    {/* Subtasks */}
                    <div>
                      <label className="text-text-f text-xs block mb-2 flex items-center gap-1">
                        <CheckSquare size={11} /> Subtasks
                        {task.subtasks?.length > 0 && (
                          <span className="ml-1 text-text-f">
                            ({task.subtasks.filter(s=>s.status==='done').length}/{task.subtasks.length})
                          </span>
                        )}
                      </label>
                      <div className="space-y-2 mb-2">
                        {task.subtasks?.map(s => (
                          <div key={s.id} className="flex items-center gap-2.5 bg-surface2 rounded-lg px-3 py-2">
                            <button onClick={() => toggleSubtask(s.id, s.status)} className="flex-shrink-0">
                              {s.status === 'done'
                                ? <CheckSquare size={14} className="text-success" />
                                : <Square size={14} className="text-text-f" />}
                            </button>
                            <span className={`text-sm flex-1 ${s.status==='done'?'text-text-f line-through':'text-text-p'}`}>{s.title}</span>
                          </div>
                        ))}
                      </div>
                      {/* Add subtask */}
                      <div className="flex gap-2">
                        <input type="text" placeholder="Add subtask..." value={subtask}
                          onChange={e => setSubtask(e.target.value)}
                          onKeyDown={e => e.key==='Enter' && handleAddSubtask()}
                          className="flex-1 bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f" />
                        <button onClick={handleAddSubtask}
                          className="w-9 h-9 bg-accent/20 hover:bg-accent/30 border border-accent/30 rounded-xl flex items-center justify-center text-accent transition-all">
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Time summary */}
                    {task.estimated_hrs && (
                      <div className="bg-surface2 border border-white/5 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-text-m text-xs flex items-center gap-1"><Timer size={11} /> Time Tracking</span>
                          <span className="text-text-p text-xs font-bold tabular-nums">{task.logged_hrs || 0}/{task.estimated_hrs}h</span>
                        </div>
                        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full transition-all"
                            style={{ width:`${Math.min(((task.logged_hrs||0)/task.estimated_hrs)*100,100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── COMMENTS TAB ── */}
                {tab === 'comments' && (
                  <div className="p-5 flex flex-col h-full">
                    <div className="flex-1 space-y-4 mb-4">
                      {(!task.task_comments || task.task_comments.length === 0) && (
                        <p className="text-text-f text-sm text-center py-8">No comments yet. Be the first!</p>
                      )}
                      {task.task_comments?.map(c => (
                        <div key={c.id} className="flex items-start gap-3 group">
                          <Avatar name={c.profiles?.full_name || 'User'} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-text-p text-xs font-semibold">{c.profiles?.full_name || 'User'}</span>
                              <span className="text-text-f text-xs">
                                {new Date(c.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                              </span>
                            </div>
                            <div className="bg-surface2 border border-white/5 rounded-xl px-3 py-2.5 text-text-p text-sm leading-relaxed">
                              {c.content}
                            </div>
                          </div>
                          {c.author_uid === profile?.firebase_uid && (
                            <button onClick={() => handleDeleteComment(c.id)}
                              className="opacity-0 group-hover:opacity-100 text-text-f hover:text-error transition-all mt-1">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Comment input */}
                    <div className="flex gap-2 border-t border-white/5 pt-4">
                      <Avatar name={profile?.full_name || 'Me'} size="sm" />
                      <div className="flex-1 flex gap-2">
                        <input type="text" placeholder="Write a comment..." value={comment}
                          onChange={e => setComment(e.target.value)}
                          onKeyDown={e => e.key==='Enter' && !e.shiftKey && handleComment()}
                          className="flex-1 bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f transition-all" />
                        <button onClick={handleComment} disabled={posting || !comment.trim()}
                          className="w-9 h-9 bg-accent hover:bg-accent-h rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-50 glow-accent">
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TIME TAB ── */}
                {tab === 'time' && (
                  <div className="p-5 space-y-5">
                    {/* Log form */}
                    <div className="bg-surface2 border border-white/5 rounded-2xl p-4 space-y-3">
                      <h4 className="text-text-p text-sm font-semibold">Log Time</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-text-f text-xs block mb-1">Hours *</label>
                          <input type="number" step="0.25" placeholder="1.5"
                            value={timeForm.hours}
                            onChange={e => setTimeForm(f => ({ ...f, hours: e.target.value }))}
                            className="w-full bg-surface border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f" />
                        </div>
                        <div>
                          <label className="text-text-f text-xs block mb-1">Date</label>
                          <input type="date" value={timeForm.logged_date}
                            onChange={e => setTimeForm(f => ({ ...f, logged_date: e.target.value }))}
                            className="w-full bg-surface border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none" />
                        </div>
                      </div>
                      <input type="text" placeholder="Description (optional)"
                        value={timeForm.description}
                        onChange={e => setTimeForm(f => ({ ...f, description: e.target.value }))}
                        className="w-full bg-surface border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f" />
                      <button onClick={handleLogTime} disabled={!timeForm.hours}
                        className="w-full bg-accent hover:bg-accent-h text-white text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 glow-accent">
                        Log Time
                      </button>
                    </div>

                    {/* Time log history */}
                    <div>
                      <h4 className="text-text-p text-sm font-semibold mb-3">History</h4>
                      {(!task.task_time_logs || task.task_time_logs.length === 0) && (
                        <p className="text-text-f text-sm text-center py-6">No time logged yet</p>
                      )}
                      <div className="space-y-2">
                        {task.task_time_logs?.map(l => (
                          <div key={l.id} className="flex items-center gap-3 bg-surface2 border border-white/5 rounded-xl p-3">
                            <div className="w-9 h-9 bg-accent/15 border border-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Timer size={14} className="text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-text-p text-sm font-semibold tabular-nums">{l.hours}h</p>
                              {l.description && <p className="text-text-f text-xs truncate">{l.description}</p>}
                            </div>
                            <p className="text-text-f text-xs flex-shrink-0">
                              {new Date(l.logged_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-m">Task not found</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}