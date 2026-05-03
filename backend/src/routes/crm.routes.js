import express from 'express'
import {
  listClients, getClient, createClient, updateClient, deleteClient,
  addContact, deleteContact,
  listDeals, createDeal, updateDeal, deleteDeal,
  listActivities, addActivity, toggleActivity,
  getCRMStats,
} from '../controllers/crm.controller.js'
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js'
import { attachTenant }              from '../middleware/tenantMiddleware.js'

const router = express.Router()
router.use(verifyToken, attachTenant)

// Stats
router.get('/stats',                      getCRMStats)

// Clients
router.get('/clients',                    listClients)
router.get('/clients/:id',                getClient)
router.post('/clients',        requireAdmin, createClient)
router.patch('/clients/:id',   requireAdmin, updateClient)
router.delete('/clients/:id',  requireAdmin, deleteClient)

// Contacts
router.post('/clients/:id/contacts',               requireAdmin, addContact)
router.delete('/clients/:id/contacts/:contactId',  requireAdmin, deleteContact)

// Deals
router.get('/deals',                      listDeals)
router.post('/deals',          requireAdmin, createDeal)
router.patch('/deals/:id',     requireAdmin, updateDeal)
router.delete('/deals/:id',    requireAdmin, deleteDeal)

// Activities
router.get('/activities',                 listActivities)
router.post('/activities',                addActivity)
router.patch('/activities/:id/toggle',    toggleActivity)

export default router