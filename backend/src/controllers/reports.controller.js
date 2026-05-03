import * as Reports from '../services/reports.service.js'
import * as Export  from '../services/export.service.js'
import { success, error } from '../utils/response.js'

const filters = (q) => ({
  from: q.from || null,
  to:   q.to   || null,
  groupBy: q.group_by || 'month',
})

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export const overview     = async (req,res) => {
  try { return success(res, await Reports.getOverviewKPIs(req.tenantId, filters(req.query))) }
  catch(err){ return error(res, err.message, 500) }
}
export const revenue      = async (req,res) => {
  try { return success(res, await Reports.getRevenueTrend(req.tenantId, filters(req.query))) }
  catch(err){ return error(res, err.message, 500) }
}
export const projects     = async (req,res) => {
  try { return success(res, await Reports.getProjectStats(req.tenantId, filters(req.query))) }
  catch(err){ return error(res, err.message, 500) }
}
export const tasks        = async (req,res) => {
  try { return success(res, await Reports.getTaskAnalytics(req.tenantId, filters(req.query))) }
  catch(err){ return error(res, err.message, 500) }
}
export const employees    = async (req,res) => {
  try { return success(res, await Reports.getEmployeePerformance(req.tenantId, filters(req.query))) }
  catch(err){ return error(res, err.message, 500) }
}
export const clients      = async (req,res) => {
  try { return success(res, await Reports.getClientRevenue(req.tenantId, filters(req.query))) }
  catch(err){ return error(res, err.message, 500) }
}
export const expenses     = async (req,res) => {
  try { return success(res, await Reports.getExpenseBreakdown(req.tenantId, filters(req.query))) }
  catch(err){ return error(res, err.message, 500) }
}
export const invoices     = async (req,res) => {
  try { return success(res, await Reports.getInvoiceSummary(req.tenantId, filters(req.query))) }
  catch(err){ return error(res, err.message, 500) }
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────
export const exportReport = async (req, res) => {
  try {
    const { type, format = 'csv', from, to, group_by } = req.query
    if (!type) return error(res, 'type required', 400)

    const f = { from, to, groupBy: group_by || 'month' }
    let data, formatted

    if (type === 'revenue') {
      data      = await Reports.getRevenueTrend(req.tenantId, f)
      formatted = Export.formatRevenueData(data)
    } else if (type === 'projects') {
      const r   = await Reports.getProjectStats(req.tenantId, f)
      data      = r.projects
      formatted = Export.formatProjectData(data)
    } else if (type === 'employees') {
      data      = await Reports.getEmployeePerformance(req.tenantId, f)
      formatted = Export.formatEmployeeData(data)
    } else {
      return error(res, 'Unsupported report type', 400)
    }

    const filename = `${type}-report-${new Date().toISOString().slice(0,10)}`

    if (format === 'csv') {
      const csv = Export.exportCSV(formatted.rows, Object.keys(formatted.rows[0] || {}))
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`)
      return res.send(csv)
    }

    if (format === 'excel') {
      const buf = await Export.exportExcel([{ name: type, columns: formatted.columns, rows: formatted.rows }])
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`)
      return res.send(buf)
    }

    return error(res, 'Unsupported format', 400)
  } catch(err){ return error(res, err.message, 500) }
}

// ─── SAVED REPORTS ────────────────────────────────────────────────────────────
export const listSaved   = async (req,res) => {
  try { return success(res, await Reports.listSavedReports(req.tenantId)) }
  catch(err){ return error(res, err.message, 500) }
}
export const createSaved = async (req,res) => {
  try {
    if (!req.body.name || !req.body.type) return error(res, 'name and type required', 400)
    return success(res, await Reports.createSavedReport(req.tenantId, req.user.uid, req.body), 'Saved', 201)
  } catch(err){ return error(res, err.message, 500) }
}
export const deleteSaved = async (req,res) => {
  try { await Reports.deleteSavedReport(req.tenantId, req.params.id); return success(res, null, 'Deleted') }
  catch(err){ return error(res, err.message, 500) }
}