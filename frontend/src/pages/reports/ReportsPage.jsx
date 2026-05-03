import React, { useEffect, useState, useCallback } from 'react'
import {
  TrendingUp, FolderKanban, CheckSquare,
  Users, Building2, CreditCard, Receipt, Download,
} from 'lucide-react'
import { reportsAPI, downloadBlob } from '@/lib/reportsAPI'
import DateRangeFilter   from './components/DateRangeFilter'
import KPICards          from './components/KPICards'
import RevenueChart      from './components/RevenueChart'
import ProjectsChart     from './components/ProjectsChart'
import TasksChart        from './components/TasksChart'
import EmployeeTable     from './components/EmployeeTable'
import ClientRevenueChart from './components/ClientRevenueChart'
import ExpensePieChart   from './components/ExpensePieChart'
import { toast }         from 'sonner'

const TABS = [
  { id:'overview',   label:'Overview',   icon: TrendingUp   },
  { id:'revenue',    label:'Revenue',    icon: CreditCard   },
  { id:'projects',   label:'Projects',   icon: FolderKanban },
  { id:'tasks',      label:'Tasks',      icon: CheckSquare  },
  { id:'employees',  label:'Employees',  icon: Users        },
  { id:'clients',    label:'Clients',    icon: Building2    },
  { id:'expenses',   label:'Expenses',   icon: Receipt      },
]

const DEFAULT_RANGE = {
  from: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().slice(0,10),
  to:   new Date().toISOString().slice(0,10),
}

export default function ReportsPage() {
  const [tab,       setTab]      = useState('overview')
  const [range,     setRange]    = useState(DEFAULT_RANGE)
  const [kpis,      setKpis]     = useState(null)
  const [revenue,   setRevenue]  = useState([])
  const [projects,  setProjects] = useState(null)
  const [tasks,     setTasks]    = useState(null)
  const [employees, setEmployees]= useState([])
  const [clients,   setClients]  = useState([])
  const [exps,      setExps]     = useState([])
  const [loading,   setLoading]  = useState(true)
  const [exporting, setExporting]= useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { from: range.from, to: range.to }
      const [k, r, p, t, e, c, ex] = await Promise.all([
        reportsAPI.overview(params),
        reportsAPI.revenue(params),
        reportsAPI.projects(params),
        reportsAPI.tasks(params),
        reportsAPI.employees(params),
        reportsAPI.clients(params),
        reportsAPI.expenses(params),
      ])
      setKpis(k.data.data)
      setRevenue(r.data.data || [])
      setProjects(p.data.data)
      setTasks(t.data.data)
      setEmployees(e.data.data || [])
      setClients(c.data.data || [])
      setExps(ex.data.data || [])
    } catch { toast.error('Failed to load reports') }
    finally { setLoading(false) }
  }, [range])

  useEffect(() => { load() }, [load])

  const handleExport = async (type, format) => {
    setExporting(true)
    try {
      const r = await reportsAPI.export({ type, format, from: range.from, to: range.to })
      downloadBlob(r.data, `${type}-report-${range.from}-to-${range.to}.${format}`)
      toast.success(`${format.toUpperCase()} downloaded! 📥`)
    } catch { toast.error('Export failed') }
    finally { setExporting(false) }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-accent">Reports & Analytics</h1>
          <p className="text-text-f text-sm mt-0.5">Business insights at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter value={range} onChange={setRange}/>
          <div className="relative group">
            <button disabled={exporting}
              className="flex items-center gap-2 border border-white/10 hover:border-white/20
                text-text-m hover:text-text-p text-sm px-4 py-2 rounded-xl transition-all">
              <Download size={14}/> Export
            </button>
            {/* Dropdown */}
            <div className="absolute right-0 top-10 z-20 bg-surface2 border border-white/10
              rounded-xl shadow-2xl py-1 w-48 hidden group-hover:block">
              {[
                { type:'revenue',   label:'Revenue (CSV)',    format:'csv'   },
                { type:'revenue',   label:'Revenue (Excel)',  format:'excel' },
                { type:'projects',  label:'Projects (CSV)',   format:'csv'   },
                { type:'projects',  label:'Projects (Excel)', format:'excel' },
                { type:'employees', label:'Employees (CSV)',  format:'csv'   },
              ].map(e => (
                <button key={`${e.type}-${e.format}`}
                  onClick={() => handleExport(e.type, e.format)}
                  className="w-full text-left px-4 py-2 text-xs text-text-m
                    hover:text-text-p hover:bg-white/4 transition-all">
                  {e.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards — always visible */}
      <KPICards data={kpis} loading={loading}/>

      {/* Tab nav */}
      <div className="flex gap-1 bg-surface border border-white/5 rounded-2xl p-1.5 overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                whitespace-nowrap transition-all flex-shrink-0
                ${tab === t.id
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-text-m hover:text-text-p hover:bg-white/4'}`}>
              <Icon size={14}/>{t.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {tab === 'overview'  && <RevenueChart   data={revenue}   loading={loading}/>}
      {tab === 'revenue'   && <RevenueChart   data={revenue}   loading={loading} detailed/>}
      {tab === 'projects'  && <ProjectsChart  data={projects}  loading={loading}/>}
      {tab === 'tasks'     && <TasksChart     data={tasks}     loading={loading}/>}
      {tab === 'employees' && <EmployeeTable  data={employees} loading={loading}/>}
      {tab === 'clients'   && <ClientRevenueChart data={clients} loading={loading}/>}
      {tab === 'expenses'  && <ExpensePieChart data={exps}     loading={loading}/>}
    </div>
  )
}