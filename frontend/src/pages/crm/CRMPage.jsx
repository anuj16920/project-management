import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Users, TrendingUp, DollarSign,
         CheckSquare, Search, LayoutGrid, List } from 'lucide-react'
import { motion } from 'framer-motion'
import { crmAPI }           from '@/lib/crmAPI'
import { useRoleGuard }     from '@/hooks/useRoleGuard'
import ClientCard           from './components/ClientCard'
import DealsPipeline        from './components/DealsPipeline'
import ActivityTimeline     from './components/ActivityTimeline'
import CreateClientModal    from './components/CreateClientModal'
import KPICard              from '@/pages/dashboard/components/KPICard'
import { SkeletonCard }     from '@/components/ui/Skeleton'
import { toast }            from 'sonner'

const TABS = ['clients','pipeline','activities']

export default function CRMPage() {
  const { canCreateStaff } = useRoleGuard()
  const [tab,         setTab]         = useState('clients')
  const [clients,     setClients]     = useState([])
  const [deals,       setDeals]       = useState([])
  const [activities,  setActivities]  = useState([])
  const [stats,       setStats]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [showCreate,  setShowCreate]  = useState(false)
  const [filters,     setFilters]     = useState({ search:'', status:'' })
  const [view,        setView]        = useState('grid')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v))
      const [c, d, a, s] = await Promise.all([
        crmAPI.listClients(params),
        crmAPI.listDeals({}),
        crmAPI.listActivities({}),
        crmAPI.stats(),
      ])
      setClients(c.data.data    || [])
      setDeals(d.data.data      || [])
      setActivities(a.data.data || [])
      setStats(s.data.data      || null)
    } catch { toast.error('Failed to load CRM data') }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load() }, [load])

  const KPIs = stats ? [
    { title:'Total Clients',  value: stats.totalClients,  change: 0,  icon:'Users',      color:'#06B6D4', index:0 },
    { title:'Open Deals',     value: stats.openDeals,     change: 0,  icon:'TrendingUp', color:'#6366F1', index:1 },
    { title:'Pipeline Value', value: `$${(stats.pipeline||0).toLocaleString()}`, change:0, icon:'DollarSign', color:'#F59E0B', index:2 },
    { title:'Won Revenue',    value: `$${(stats.revenue||0).toLocaleString()}`,  change:0, icon:'CheckSquare', color:'#10B981', index:3 },
  ] : []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-black text-2xl text-text-p">CRM</h2>
          <p className="text-text-m text-sm mt-1">Client relationships & deal pipeline</p>
        </div>
        {canCreateStaff && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-cyan hover:bg-cyan/80 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95">
            <Plus size={16} /> Add Client
          </button>
        )}
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {KPIs.map((k, i) => <KPICard key={i} {...k} />)}
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

      {/* ── CLIENTS TAB ── */}
      {tab === 'clients' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-48">
              <Search size={14} className="text-text-f" />
              <input placeholder="Search by company..." value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                className="bg-transparent text-text-p text-sm outline-none w-full placeholder:text-text-f" />
            </div>
            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              className="bg-surface border border-white/10 text-text-m text-sm rounded-xl px-3 py-2 outline-none focus:border-accent/40">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="lead">Lead</option>
              <option value="inactive">Inactive</option>
              <option value="churned">Churned</option>
            </select>
            <div className="flex items-center bg-surface border border-white/10 rounded-xl p-1 gap-0.5">
              <button onClick={() => setView('grid')}
                className={`p-1.5 rounded-lg transition-all ${view==='grid'?'bg-accent/20 text-accent':'text-text-f hover:text-text-m'}`}>
                <LayoutGrid size={15} />
              </button>
              <button onClick={() => setView('list')}
                className={`p-1.5 rounded-lg transition-all ${view==='list'?'bg-accent/20 text-accent':'text-text-f hover:text-text-m'}`}>
                <List size={15} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_,i) => <SkeletonCard key={i} />)}
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-f text-sm mb-4">No clients yet</p>
              {canCreateStaff && (
                <button onClick={() => setShowCreate(true)}
                  className="bg-cyan text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-cyan/80 transition-all">
                  Add First Client
                </button>
              )}
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {clients.map((c, i) => (
                <ClientCard key={c.id} client={c} index={i} onRefresh={load} />
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Company','Contact','Industry','Status','Projects','Value'].map(h => (
                      <th key={h} className="text-left text-text-f text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {clients.map(c => (
                    <tr key={c.id} onClick={() => window.location.href=`/admin/crm/${c.id}`}
                      className="hover:bg-white/2 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <p className="text-text-p text-sm font-medium">{c.company_name || '—'}</p>
                        {c.city && <p className="text-text-f text-xs">{c.city}, {c.country}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-text-m text-sm">{c.primaryContact?.full_name || '—'}</p>
                        {c.primaryContact?.email && <p className="text-text-f text-xs">{c.primaryContact.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-text-m text-sm">{c.industry || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize
                          ${c.status==='active'?'bg-success/15 text-success':
                            c.status==='lead'?'bg-accent/15 text-accent':
                            c.status==='churned'?'bg-error/15 text-error':'bg-white/10 text-text-m'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-m text-sm tabular-nums">{c.activeProjects}</td>
                      <td className="px-4 py-3 text-success text-sm font-semibold tabular-nums">
                        ${(c.total_value||0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── PIPELINE TAB ── */}
      {tab === 'pipeline' && (
        <DealsPipeline deals={deals} clients={clients} onRefresh={load} />
      )}

      {/* ── ACTIVITIES TAB ── */}
      {tab === 'activities' && (
        <ActivityTimeline activities={activities} onRefresh={load} />
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateClientModal
          onClose={() => setShowCreate(false)}
          onSuccess={load}
        />
      )}
    </div>
  )
}