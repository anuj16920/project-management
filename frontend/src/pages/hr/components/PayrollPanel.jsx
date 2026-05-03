import React, { useEffect, useState } from 'react'
import { DollarSign, Play, CheckCircle, RefreshCw } from 'lucide-react'
import { hrAPI } from '@/lib/hrAPI'
import { toast }  from 'sonner'

const now    = new Date()
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const STATUS_META = {
  draft:     { color:'bg-white/10 text-text-m',    label:'Draft'     },
  processed: { color:'bg-warning/15 text-warning', label:'Processed' },
  paid:      { color:'bg-success/15 text-success', label:'Paid'      },
}

export default function PayrollPanel() {
  const [payroll,    setPayroll]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [month,      setMonth]      = useState(now.getMonth()+1)
  const [year,       setYear]       = useState(now.getFullYear())
  const [generating, setGenerating] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await hrAPI.listPayroll({ month, year })
      setPayroll(r.data.data || [])
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [month, year])

  const handleGenerate = async () => {
    setGenerating(true)
    try { await hrAPI.generatePayroll(month, year); toast.success('Payroll generated! 🎉'); load() }
    catch { toast.error('Failed to generate') }
    finally { setGenerating(false) }
  }

  const totalNet = payroll.reduce((s,p) => s + (p.net_salary||0), 0)

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            className="bg-surface border border-white/10 text-text-m text-sm rounded-xl px-3 py-2 outline-none focus:border-accent/40">
            {MONTHS.map((m,i) => <option key={i+1} value={i+1} className="bg-surface">{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="bg-surface border border-white/10 text-text-m text-sm rounded-xl px-3 py-2 outline-none focus:border-accent/40">
            {[2024,2025,2026,2027].map(y => <option key={y} value={y} className="bg-surface">{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          {payroll.length > 0 && (
            <div className="text-right">
              <p className="text-text-f text-xs">Total Payroll</p>
              <p className="text-success font-bold text-sm tabular-nums">₹{totalNet.toLocaleString()}</p>
            </div>
          )}
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-2 bg-accent hover:bg-accent-h text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-60">
            {generating
              ? <><RefreshCw size={14} className="animate-spin"/>Generating...</>
              : <><Play size={14}/>Generate Payroll</>}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_,i) => <div key={i} className="h-14 bg-surface rounded-xl animate-pulse"/>)}
        </div>
      ) : payroll.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-white/5 rounded-2xl">
          <DollarSign size={32} className="text-text-f mx-auto mb-2 opacity-40"/>
          <p className="text-text-f text-sm mb-3">No payroll for {MONTHS[month-1]} {year}</p>
          <button onClick={handleGenerate}
            className="bg-accent text-white text-sm px-4 py-2 rounded-xl hover:bg-accent-h transition-all">
            Generate Now
          </button>
        </div>
      ) : (
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Employee','Basic','HRA','Allowances','Tax','Net Salary','Status','Action'].map(h => (
                  <th key={h} className="text-left text-text-f text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payroll.map(p => {
                const meta = STATUS_META[p.status] || STATUS_META.draft
                return (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-text-p text-sm font-medium">{p.profiles?.full_name||'—'}</p>
                      <p className="text-text-f text-xs">{p.employees?.designation||''}</p>
                    </td>
                    {[p.basic_salary, p.hra, p.allowances, p.tax].map((v,i) => (
                      <td key={i} className="px-4 py-3 text-text-m text-sm tabular-nums">₹{(v||0).toLocaleString()}</td>
                    ))}
                    <td className="px-4 py-3 text-success text-sm font-bold tabular-nums">₹{(p.net_salary||0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'draft' && (
                        <button onClick={async () => { await hrAPI.processPayroll(p.id); toast.success('Processed'); load() }}
                          className="text-accent text-xs hover:underline">Process</button>
                      )}
                      {p.status === 'processed' && (
                        <button onClick={async () => { await hrAPI.markPaid(p.id); toast.success('Paid! 💰'); load() }}
                          className="text-success text-xs hover:underline">Mark Paid</button>
                      )}
                      {p.status === 'paid' && <CheckCircle size={14} className="text-success"/>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}