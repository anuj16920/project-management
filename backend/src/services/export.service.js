import { Parser }       from 'json2csv'
import ExcelJS          from 'exceljs'
// import puppeteer        from 'puppeteer'  // Not installed yet
// import supabaseAdmin    from '../config/supabase.admin.js'

// ─── CSV EXPORT ───────────────────────────────────────────────────────────────
export const exportCSV = (data, fields) => {
  const parser = new Parser({ fields })
  return parser.parse(data)
}

// ─── EXCEL EXPORT ─────────────────────────────────────────────────────────────
export const exportExcel = async (sheets) => {
  // sheets = [{ name, columns: [{header, key, width}], rows }]
  const wb = new ExcelJS.Workbook()
  wb.creator  = 'SaaS App'
  wb.created  = new Date()

  for (const sheet of sheets) {
    const ws = wb.addWorksheet(sheet.name)

    // Header style
    ws.columns = sheet.columns
    ws.getRow(1).eachCell(cell => {
      cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.border    = {
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      }
    })

    // Data rows
    sheet.rows.forEach((row, i) => {
      const wsRow = ws.addRow(row)
      wsRow.eachCell(cell => {
        cell.alignment = { vertical: 'middle' }
        cell.fill = {
          type: 'pattern', pattern: 'solid',
          fgColor: { argb: i % 2 === 0 ? 'FFFFFFFF' : 'FFF9FAFB' }
        }
      })
    })

    ws.getRow(1).height = 30
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to:   { row: 1, column: sheet.columns.length }
    }
  }

  return wb.xlsx.writeBuffer()
}

// ─── DATA FORMATTERS ──────────────────────────────────────────────────────────
export const formatRevenueData = (data) => ({
  fields: ['period', 'revenue', 'expenses', 'profit'],
  rows:   data.map(r => ({
    Period:   r.period,
    Revenue:  `₹${r.revenue?.toLocaleString('en-IN')}`,
    Expenses: `₹${r.expenses?.toLocaleString('en-IN')}`,
    Profit:   `₹${r.profit?.toLocaleString('en-IN')}`,
  })),
  columns: [
    { header: 'Period',   key: 'Period',   width: 20 },
    { header: 'Revenue',  key: 'Revenue',  width: 20 },
    { header: 'Expenses', key: 'Expenses', width: 20 },
    { header: 'Profit',   key: 'Profit',   width: 20 },
  ],
})

export const formatProjectData = (data) => ({
  fields: ['name', 'status', 'budget', 'total_tasks', 'completed_tasks', 'completion'],
  rows:   data.map(p => ({
    'Project':          p.name,
    'Status':           p.status,
    'Budget':           p.budget ? `₹${p.budget.toLocaleString('en-IN')}` : '—',
    'Total Tasks':      p.total_tasks,
    'Completed':        p.completed_tasks,
    'Completion %':     `${p.completion}%`,
  })),
  columns: [
    { header: 'Project',      key: 'Project',      width: 30 },
    { header: 'Status',       key: 'Status',       width: 15 },
    { header: 'Budget',       key: 'Budget',       width: 20 },
    { header: 'Total Tasks',  key: 'Total Tasks',  width: 15 },
    { header: 'Completed',    key: 'Completed',    width: 15 },
    { header: 'Completion %', key: 'Completion %', width: 15 },
  ],
})

export const formatEmployeeData = (data) => ({
  fields: ['name', 'total', 'completed', 'in_progress', 'completion'],
  rows:   data.map(e => ({
    'Employee':    e.name,
    'Total Tasks': e.total,
    'Completed':   e.completed,
    'In Progress': e.in_progress,
    'Score %':     `${e.completion}%`,
  })),
  columns: [
    { header: 'Employee',    key: 'Employee',    width: 25 },
    { header: 'Total Tasks', key: 'Total Tasks', width: 15 },
    { header: 'Completed',   key: 'Completed',   width: 15 },
    { header: 'In Progress', key: 'In Progress', width: 15 },
    { header: 'Score %',     key: 'Score %',     width: 12 },
  ],
})