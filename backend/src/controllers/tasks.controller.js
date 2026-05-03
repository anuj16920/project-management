import * as TS from '../services/tasks.service.js'
import { success, error } from '../utils/response.js'

export const listTasks = async (req, res) => {
  try {
    const data = await TS.listTasks(req.tenantId, req.query)
    return success(res, data)
  } catch (err) { return error(res, err.message, 500) }
}

export const getTask = async (req, res) => {
  try {
    const data = await TS.getTask(req.tenantId, req.params.id)
    return success(res, data)
  } catch (err) { return error(res, err.message, 500) }
}

export const createTask = async (req, res) => {
  try {
    const { title, description, project_id, assignee_uid, priority, status,
            due_date, estimated_hrs, label, cover_color } = req.body
    if (!title) return error(res, 'Title is required', 400)
    const data = await TS.createTask(req.tenantId, req.user.uid, {
      title, description, project_id, assignee_uid,
      priority: priority || 'medium',
      status:   status   || 'todo',
      due_date, estimated_hrs, label, cover_color,
    })
    return success(res, data, 'Task created', 201)
  } catch (err) { return error(res, err.message, 500) }
}

export const updateTask = async (req, res) => {
  try {
    const data = await TS.updateTask(req.tenantId, req.params.id, req.body)
    return success(res, data, 'Task updated')
  } catch (err) { return error(res, err.message, 500) }
}

export const deleteTask = async (req, res) => {
  try {
    await TS.deleteTask(req.tenantId, req.params.id)
    return success(res, null, 'Task deleted')
  } catch (err) { return error(res, err.message, 500) }
}

export const moveTask = async (req, res) => {
  try {
    const { newStatus, newPosition } = req.body
    if (!newStatus) return error(res, 'newStatus required', 400)
    const data = await TS.moveTask(req.tenantId, req.params.id, newStatus, newPosition ?? 0)
    return success(res, data)
  } catch (err) { return error(res, err.message, 500) }
}

export const reorderTasks = async (req, res) => {
  try {
    const { updates } = req.body
    if (!Array.isArray(updates)) return error(res, 'updates array required', 400)
    await TS.reorderTasks(req.tenantId, updates)
    return success(res, null, 'Reordered')
  } catch (err) { return error(res, err.message, 500) }
}

export const addComment = async (req, res) => {
  try {
    const { content } = req.body
    if (!content) return error(res, 'Content required', 400)
    const data = await TS.addComment(req.tenantId, req.params.id, req.user.uid, content)
    return success(res, data, 'Comment added', 201)
  } catch (err) { return error(res, err.message, 500) }
}

export const deleteComment = async (req, res) => {
  try {
    await TS.deleteComment(req.tenantId, req.params.commentId, req.user.uid)
    return success(res, null, 'Comment deleted')
  } catch (err) { return error(res, err.message || 'Failed', err.status || 500) }
}

export const logTime = async (req, res) => {
  try {
    const { hours, description, logged_date } = req.body
    if (!hours) return error(res, 'hours required', 400)
    const data = await TS.logTime(req.tenantId, req.params.id, req.user.uid, { hours, description, logged_date })
    return success(res, data, 'Time logged', 201)
  } catch (err) { return error(res, err.message, 500) }
}

export const createSubtask = async (req, res) => {
  try {
    const { title, assignee_uid, due_date } = req.body
    if (!title) return error(res, 'Title required', 400)
    const data = await TS.createSubtask(req.tenantId, req.params.id, { title, assignee_uid, due_date })
    return success(res, data, 'Subtask created', 201)
  } catch (err) { return error(res, err.message, 500) }
}