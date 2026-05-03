import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Users, Search, LayoutGrid, List } from 'lucide-react'
import { motion } from 'framer-motion'
import { hrAPI }            from '@/lib/hrAPI'
import KPICard              from '@/pages/dashboard/components/KPICard'
import { SkeletonCard }     from '@/components/ui/Skeleton'
import EmployeeCard         from './components/EmployeeCard'
import EmployeeTable        from './components/EmployeeTable'
import LeaveRequestsPanel   from './components/LeaveRequestsPanel'
import PayrollPanel         from './components/PayrollPanel'
import AttendanceCalendar   from './components/AttendanceCalendar'
import AddEmployeeModal     from './components/AddEmployeeModal'
import { toast } from 'sonner'

const TABS = ['employees', 'attendance', 'leaves', 'payroll']

export default function EmployeesList() {
  const [tab,        setTab]        = useState('employees')
  const [employees,  setEmployees]  = useState([])
  const [depts,      setDepts]      = useState([])
  const [stats,      setStats]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [showAdd,    setShowAdd]    = useState(false)
  const [view,       setView]       = useState('grid')
  const [filters,    setFilters]    = useState({ search:'', status:'', department_id:'' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v))
      const [e, d, s] = await Promise.all([
        hrAPI.listEmployees(params),
        hrAPI.listDepts(),
        hrAPI.stats(),
      ])
      setEmployees(e.data.data || [])
      setDepts(d.data.data     || [])
      setStats(s.data.data     || null)
    } catch { toast.error('Failed to load HR data') }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load() }, [load])

  const KPIs = stats ? [
    { title:'Total Employees',  value: stats.totalEmployees,  icon:'Users',        color:'#6366F1', index:0 },
    { title:'Present Today',    value: stats.presentToday,    icon:'Clock',        color:'#10B981', index:1 },
    { title:'On Leave Today',   value: stats.onLeaveToday,    icon:'Calendar',     color:'#F59E0B', index:2 },
    { title:'Pending Leaves',   value: stats.pendingLeaves,   icon:'AlertCircle',  color:'#EF4444', index:3 },
  ] : []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-black text-2xl text-text-p">HR Management</h2>
          <p className="text-text-m text-sm mt-1">Employees · Attendance · Leaves · Payroll</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-h text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95">
          <Plus size={16}/> Add Employee
        </button>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {KPIs.map((k,i) => <KPICard key={i} {...k} />)}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-surface border border-white/5 rounded-xl p-1 mb-6 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${tab===t ? 'bg-accent/20 text-accent' : 'text-text-m hover:text-text-p'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── EMPLOYEES TAB ── */}
      {tab === 'employees' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-48">
              <Search size={14} className="text-text-f"/>
              <input placeholder="Search by name, code, designation..."
                value={filters.search}
                onChange={e => setFilters(f => ({...f, search: e.target.value}))}
                className="bg-transparent text-text-p text-sm outline-none w-full placeholder:text-text-f"/>
            </div>
            <select value={filters.status}
              onChange={e => setFilters(f => ({...f, status: e.target.value}))}
              className="bg-surface border border-white/10 text-text-m text-sm rounded-xl px-3 py-2 outline-none focus:border-accent/40">
              <option value="">All Status</option>
              {['active','inactive','on_leave','terminated'].map(s => (
                <option key={s} value={s} className="bg-surface capitalize">{s.replace('_',' ')}</option>
              ))}
            </select>
            <select value={filters.department_id}
              onChange={e => setFilters(f => ({...f, department_id: e.target.value}))}
              className="bg-surface border border-white/10 text-text-m text-sm rounded-xl px-3 py-2 outline-none focus:border-accent/40">
              <option value="">All Departments</option>
              {depts.map(d => (
                <option key={d.id} value={d.id} className="bg-surface">{d.name}</option>
              ))}
            </select>
            {/* View toggle */}
            <div className="flex items-center bg-surface border border-white/10 rounded-xl p-1 gap-0.5">
              <button onClick={() => setView('grid')}
                className={`p-1.5 rounded-lg transition-all ${view==='grid' ? 'bg-accent/20 text-accent' : 'text-text-f hover:text-text-m'}`}>
                <LayoutGrid size={15}/>
              </button>
              <button onClick={() => setView('list')}
                className={`p-1.5 rounded-lg transition-all ${view==='list' ? 'bg-accent/20 text-accent' : 'text-text-f hover:text-text-m'}`}>
                <List size={15}/>
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_,i) => <SkeletonCard key={i}/>)}
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-20">
              <Users size={40} className="text-text-f mx-auto mb-3 opacity-40"/>
              <p className="text-text-m font-medium mb-1">No employees found</p>
              <p className="text-text-f text-sm mb-5">Add your first team member to get started</p>
              <button onClick={() => setShowAdd(true)}
                className="bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-accent-h transition-all">
                Add Employee
              </button>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {employees.map((e,i) => (
                <EmployeeCard key={e.id} employee={e} index={i} onRefresh={load}/>
              ))}
            </div>
          ) : (
            <EmployeeTable employees={employees} onRefresh={load}/>
          )}
        </>
      )}

      {tab === 'attendance' && <AttendanceCalendar employees={employees}/>}
      {tab === 'leaves'     && <LeaveRequestsPanel onRefresh={load}/>}
      {tab === 'payroll'    && <PayrollPanel/>}

      {showAdd && (
        <AddEmployeeModal
          depts={depts}
          onClose={() => setShowAdd(false)}
          onSuccess={load}/>
      )}
    </div>
  )
}