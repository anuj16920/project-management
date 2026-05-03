import * as CRM from '../services/crm.service.js'
import { success, error } from '../utils/response.js'

// ── Clients ───────────────────────────────────────────────────────────────────
export const listClients    = async (req, res) => {
  try {
    const filters = { ...req.query }
    if (req.userRole === 'client') filters.profile_uid = req.user.uid
    return success(res, await CRM.listClients(req.tenantId, filters))
  } catch (err) { return error(res, err.message, 500) }
}

export const getClient      = async (req, res) => {
  try { return success(res, await CRM.getClient(req.tenantId, req.params.id)) }
  catch (err) { return error(res, err.message, 500) }
}

export const createClient   = async (req, res) => {
  try {
    if (!req.body.email || !req.body.fullName || !req.body.tempPassword)
      return error(res, 'email, fullName and tempPassword are required', 400)
    const data = await CRM.createClient(req.tenantId, req.userRole, req.body)
    return success(res, data, 'Client created', 201)
  } catch (err) { return error(res, err.message, err.status || 500) }
}

export const updateClient   = async (req, res) => {
  try { return success(res, await CRM.updateClient(req.tenantId, req.params.id, req.body), 'Updated') }
  catch (err) { return error(res, err.message, 500) }
}

export const deleteClient   = async (req, res) => {
  try { await CRM.deleteClient(req.tenantId, req.params.id); return success(res, null, 'Deleted') }
  catch (err) { return error(res, err.message, 500) }
}

// ── Contacts ──────────────────────────────────────────────────────────────────
export const addContact     = async (req, res) => {
  try {
    if (!req.body.full_name) return error(res, 'full_name required', 400)
    const data = await CRM.addContact(req.tenantId, req.params.id, req.body)
    return success(res, data, 'Contact added', 201)
  } catch (err) { return error(res, err.message, 500) }
}

export const deleteContact  = async (req, res) => {
  try { await CRM.deleteContact(req.tenantId, req.params.contactId); return success(res, null, 'Deleted') }
  catch (err) { return error(res, err.message, 500) }
}

// ── Deals ─────────────────────────────────────────────────────────────────────
export const listDeals      = async (req, res) => {
  try { return success(res, await CRM.listDeals(req.tenantId, req.query)) }
  catch (err) { return error(res, err.message, 500) }
}

export const createDeal     = async (req, res) => {
  try {
    if (!req.body.title || !req.body.client_id) return error(res, 'title and client_id required', 400)
    return success(res, await CRM.createDeal(req.tenantId, req.body), 'Deal created', 201)
  } catch (err) { return error(res, err.message, 500) }
}

export const updateDeal     = async (req, res) => {
  try { return success(res, await CRM.updateDeal(req.tenantId, req.params.id, req.body), 'Updated') }
  catch (err) { return error(res, err.message, 500) }
}

export const deleteDeal     = async (req, res) => {
  try { await CRM.deleteDeal(req.tenantId, req.params.id); return success(res, null, 'Deleted') }
  catch (err) { return error(res, err.message, 500) }
}

// ── Activities ────────────────────────────────────────────────────────────────
export const listActivities  = async (req, res) => {
  try { return success(res, await CRM.listActivities(req.tenantId, req.query.client_id || null)) }
  catch (err) { return error(res, err.message, 500) }
}

export const addActivity     = async (req, res) => {
  try {
    if (!req.body.title || !req.body.type) return error(res, 'title and type required', 400)
    return success(res, await CRM.addActivity(req.tenantId, req.user.uid, req.body), 'Activity added', 201)
  } catch (err) { return error(res, err.message, 500) }
}

export const toggleActivity  = async (req, res) => {
  try { return success(res, await CRM.toggleActivity(req.tenantId, req.params.id)) }
  catch (err) { return error(res, err.message, 500) }
}

export const getCRMStats     = async (req, res) => {
  try { return success(res, await CRM.getCRMStats(req.tenantId)) }
  catch (err) { return error(res, err.message, 500) }
}