import * as Finance from '../services/finance.service.js'
import { success, error } from '../utils/response.js'

// Stats
export const getStats = async (req,res) => {
  try { return success(res, await Finance.getFinanceStats(req.tenantId)) }
  catch(err){ return error(res, err.message, 500) }
}

// Invoices
export const listInvoices = async (req,res) => {
  try { 
    const result = await Finance.listInvoices(req.tenantId, req.query)
    return success(res, result)
  }
  catch(err){ 
    console.error('❌ listInvoices error:', err)
    return error(res, err.message, 500) 
  }
}
export const getInvoice = async (req,res) => {
  try { return success(res, await Finance.getInvoice(req.tenantId, req.params.id)) }
  catch(err){ return error(res, err.message, 500) }
}
export const createInvoice = async (req,res) => {
  try {
    if (!req.body.title) return error(res, 'title required', 400)
    return success(res, await Finance.createInvoice(req.tenantId, req.body), 'Invoice created', 201)
  } catch(err){ return error(res, err.message, 500) }
}
export const updateInvoice = async (req,res) => {
  try { return success(res, await Finance.updateInvoice(req.tenantId, req.params.id, req.body), 'Updated') }
  catch(err){ return error(res, err.message, 500) }
}
export const updateStatus = async (req,res) => {
  try {
    if (!req.body.status) return error(res, 'status required', 400)
    return success(res, await Finance.updateInvoiceStatus(req.tenantId, req.params.id, req.body.status))
  } catch(err){ return error(res, err.message, err.status||500) }
}
export const deleteInvoice = async (req,res) => {
  try { await Finance.deleteInvoice(req.tenantId, req.params.id); return success(res, null, 'Deleted') }
  catch(err){ return error(res, err.message, 500) }
}

// Expenses
export const listExpenses = async (req,res) => {
  try { return success(res, await Finance.listExpenses(req.tenantId, req.query)) }
  catch(err){ return error(res, err.message, 500) }
}
export const createExpense = async (req,res) => {
  try {
    if (!req.body.title || !req.body.amount) return error(res, 'title and amount required', 400)
    return success(res, await Finance.createExpense(req.tenantId, req.user.uid, req.body), 'Created', 201)
  } catch(err){ return error(res, err.message, 500) }
}
export const updateExpense = async (req,res) => {
  try { return success(res, await Finance.updateExpense(req.tenantId, req.params.id, req.body)) }
  catch(err){ return error(res, err.message, 500) }
}
export const reviewExpense = async (req,res) => {
  try {
    if (!req.body.status) return error(res, 'status required', 400)
    return success(res, await Finance.reviewExpense(req.tenantId, req.params.id, req.user.uid, req.body.status))
  } catch(err){ return error(res, err.message, err.status||500) }
}
export const deleteExpense = async (req,res) => {
  try { await Finance.deleteExpense(req.tenantId, req.params.id); return success(res, null, 'Deleted') }
  catch(err){ return error(res, err.message, 500) }
}

// Expense Categories
export const listCategories = async (req,res) => {
  try { return success(res, await Finance.listExpenseCategories(req.tenantId)) }
  catch(err){ return error(res, err.message, 500) }
}
export const createCategory = async (req,res) => {
  try {
    if (!req.body.name) return error(res, 'name required', 400)
    return success(res, await Finance.createExpenseCategory(req.tenantId, req.body), 'Created', 201)
  } catch(err){ return error(res, err.message, 500) }
}

// Payments
export const listPayments = async (req,res) => {
  try { return success(res, await Finance.listPayments(req.tenantId, req.query)) }
  catch(err){ return error(res, err.message, 500) }
}
export const recordPayment = async (req,res) => {
  try {
    if (!req.body.amount) return error(res, 'amount required', 400)
    return success(res, await Finance.recordPayment(req.tenantId, req.body), 'Payment recorded 💰', 201)
  } catch(err){ return error(res, err.message, 500) }
}