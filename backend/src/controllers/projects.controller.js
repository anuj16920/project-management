import * as PS from '../services/projects.service.js'
import { success, error } from '../utils/response.js'

export const listProjects = async (req, res) => {
  try {
    const data = await PS.listProjects(req.tenantId, req.query)
    return success(res, data)
  } catch (err) { return error(res, err.message, 500) }
}

export const getProject = async (req, res) => {
  try {
    const data = await PS.getProject(req.tenantId, req.params.id)
    return success(res, data)
  } catch (err) { return error(res, err.message, 500) }
}

export const createProject = async (req, res) => {
  try {
    const { name, description, status, priority, start_date, due_date, budget, client_uid, tags, cover_color } = req.body
    if (!name) return error(res, 'Project name is required', 400)
    const data = await PS.createProject(req.tenantId, req.user.uid, {
      name, description, status: status || 'active',
      priority: priority || 'medium',
      start_date, due_date, budget, client_uid, tags, cover_color,
    })
    return success(res, data, 'Project created', 201)
  } catch (err) { return error(res, err.message, 500) }
}

export const updateProject = async (req, res) => {
  try {
    const data = await PS.updateProject(req.tenantId, req.params.id, req.user.uid, req.body)
    return success(res, data, 'Project updated')
  } catch (err) { return error(res, err.message, 500) }
}

export const archiveProject = async (req, res) => {
  try {
    const data = await PS.archiveProject(req.tenantId, req.params.id, req.user.uid)
    return success(res, data, 'Project archived')
  } catch (err) { return error(res, err.message, 500) }
}

export const addMilestone = async (req, res) => {
  try {
    const { title, due_date } = req.body
    if (!title) return error(res, 'Title required', 400)
    const data = await PS.addMilestone(req.tenantId, req.params.id, req.user.uid, { title, due_date })
    return success(res, data, 'Milestone added', 201)
  } catch (err) { return error(res, err.message, 500) }
}

export const toggleMilestone = async (req, res) => {
  try {
    const data = await PS.toggleMilestone(req.tenantId, req.params.milestoneId, req.user.uid)
    return success(res, data)
  } catch (err) { return error(res, err.message, 500) }
}

export const addMember = async (req, res) => {
  try {
    const { userUid, role } = req.body
    if (!userUid) return error(res, 'userUid required', 400)
    const data = await PS.addMember(req.tenantId, req.params.id, req.user.uid, userUid, role)
    return success(res, data, 'Member added', 201)
  } catch (err) { return error(res, err.message, 500) }
}

export const removeMember = async (req, res) => {
  try {
    await PS.removeMember(req.tenantId, req.params.id, req.user.uid, req.params.userUid)
    return success(res, null, 'Member removed')
  } catch (err) { return error(res, err.message, 500) }
}