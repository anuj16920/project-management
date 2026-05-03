import React, { useEffect, useState } from 'react'
import { Search, Building2, Users, Shield,
         MoreHorizontal, Ban, CheckCircle, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/lib/api'
import { toast } from 'sonner'

const PLAN_BADGE = {
  free:       'bg-white/10 text-text-m',
  pro:        'bg-accent/15 text-accent',
  enterprise: 'bg-success/15 text-success',
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [plan,    setPlan]    = useState('')
  const [menu,    setMenu]    = useState(null)

  const load = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (plan)   params.plan   = plan
      const r = await api.get('/superadmin/tenants', { params })
      setTenants(r.data.data || [])
    } catch { toast.error('Failed to load tenants') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, plan])

  const handleToggleActive = async (id, current) => {
    try {
      await api.patch(`/superadmin/tenants/${id}`, { is_active: !current })
      toast.success(current ? 'Workspace suspended' : 'Workspace activated')
      load()
    } catch { toast.error('Failed') }
    setMenu(null)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Permanently delete workspace "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/superadmin/tenants/${id}`)
      toast.success('Workspace deleted')
      load()
    } catch { toast.error('Failed to delete') }
    setMenu(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-black text-2xl text-text-p">Workspaces</h2>
          <p className="text-text-m text-sm mt-1">{tenants.length} total workspaces on the platform</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={14} className="text-text-f" />
          <input placeholder="Search workspaces..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-text-p text-sm outline-none w-full placeholder:text-text-f" />
        </div>
        <select value={plan} onChange={e => setPlan(e.target.value)}
          className="bg-surface border border-white/10 text-text-m text-sm rounded-xl px-3 py-2 outline-none focus:border-accent/40">
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Workspace','Owner','Plan','Users','Status','Created','Actions'].map(h => (
                <th key={h} className="text-left text-text-f text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array(5).fill(0).map((_,i) => (
                <tr key={i}>
                  {Array(7).fill(0).map((__,j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-surface2 rounded-lg animate-pulse w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : tenants.map(t => (
              <motion.tr key={t.id}
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Building2 size={13} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-text-p text-sm font-medium">{t.name}</p>
                      <p className="text-text-f text-xs">{t.id.slice(0,8)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-text-m text-sm">{t.owner_email || '—'}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${PLAN_BADGE[t.plan]||PLAN_BADGE.free}`}>
                    {t.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-text-m text-sm tabular-nums flex items-center gap-1">
                    <Users size={11} className="text-text-f" />{t.user_count||0}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.is_active?'bg-success/15 text-success':'bg-error/15 text-error'}`}>
                    {t.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-m text-sm">
                  {new Date(t.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <button onClick={() => setMenu(menu===t.id ? null : t.id)}
                      className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-f hover:text-text-m transition-all">
                      <MoreHorizontal size={14} />
                    </button>
                    {menu === t.id && (
                      <div className="absolute right-0 top-8 w-44 glass border border-white/10 rounded-xl py-1 z-20 shadow-card-h">
                        <button onClick={() => handleToggleActive(t.id, t.is_active)}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 flex items-center gap-2
                            ${t.is_active?'text-warning':'text-success'}`}>
                          {t.is_active
                            ? <><Ban size={11} /> Suspend</>
                            : <><CheckCircle size={11} /> Activate</>}
                        </button>
                        <button onClick={() => handleDelete(t.id, t.name)}
                          className="w-full text-left px-3 py-2 text-error text-xs hover:bg-error/10 flex items-center gap-2">
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {!loading && tenants.length === 0 && (
          <div className="text-center py-16">
            <Building2 size={32} className="text-text-f mx-auto mb-2 opacity-40" />
            <p className="text-text-f text-sm">No workspaces found</p>
          </div>
        )}
      </div>
    </div>
  )
}