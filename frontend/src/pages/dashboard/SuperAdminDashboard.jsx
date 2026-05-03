import React, { useEffect, useState } from 'react'
import KPICard from './components/KPICard'
import { SkeletonDashboard } from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Shield, CheckCircle, XCircle } from 'lucide-react'
import api from '@/lib/api'

const TENANT_DATA = [
  { month:'Oct', tenants:210 },{ month:'Nov', tenants:248 },{ month:'Dec', tenants:290 },
  { month:'Jan', tenants:320 },{ month:'Feb', tenants:380 },{ month:'Mar', tenants:450 },
]

const RECENT_TENANTS = [
  { name:'TechVentures IN', plan:'pro',        users:24, status:'active',   joined:'Today'    },
  { name:'GrowthCo Ltd',    plan:'enterprise', users:82, status:'active',   joined:'Yesterday'},
  { name:'Buildify LLC',    plan:'starter',    users:5,  status:'active',   joined:'2 days ago'},
  { name:'NovaStar Agency', plan:'pro',        users:18, status:'suspended',joined:'3 days ago'},
  { name:'DataSync Corp',   plan:'enterprise', users:145,status:'active',   joined:'1 week ago'},
]

const PLAN_BADGE = { starter:'default', pro:'accent', enterprise:'cyan' }

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/superadmin').catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonDashboard />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
          <Shield size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="font-display font-black text-2xl text-text-p">Platform Overview</h2>
          <p className="text-text-m text-sm">Monitor all tenants, subscriptions and platform health.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title:'Total Tenants',  value:450,       change:12.5, changeLabel:'vs last month', icon:'Building2',   color:'#6366F1' },
          { title:'MRR',            value:'$38,200', prefix:'',   change:18.2, changeLabel:'growth',  icon:'TrendingUp',  color:'#10B981' },
          { title:'Active Users',   value:'12,480',  change:8.4,  changeLabel:'this month',    icon:'Users',       color:'#06B6D4' },
          { title:'Uptime',         value:99.98,     suffix:'%',  change:0,    changeLabel:'SLA met',  icon:'Activity',    color:'#F59E0B' },
        ].map((k,i) => <KPICard key={i} {...k} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tenant growth */}
        <div className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl p-5">
          <h3 className="font-display font-bold text-base text-text-p mb-1">Tenant Growth</h3>
          <p className="text-text-f text-xs mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TENANT_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#111118', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, fontSize:12 }} />
              <Line type="monotone" dataKey="tenants" stroke="#6366F1" strokeWidth={2.5} dot={false} activeDot={{ r:4, fill:'#6366F1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Plan distribution */}
        <div className="bg-surface border border-white/5 rounded-2xl p-5">
          <h3 className="font-display font-bold text-base text-text-p mb-4">Plan Distribution</h3>
          <div className="space-y-4">
            {[
              { label:'Enterprise', count:48,  pct:11, color:'bg-cyan'   },
              { label:'Pro',        count:182, pct:40, color:'bg-accent'  },
              { label:'Starter',    count:220, pct:49, color:'bg-surface2'},
            ].map(p => (
              <div key={p.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-text-m text-sm">{p.label}</span>
                  <span className="text-text-p text-sm font-bold">{p.count}</span>
                </div>
                <div className="h-2 bg-surface2 rounded-full overflow-hidden">
                  <div className={`h-full ${p.color} rounded-full`} style={{ width:`${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Tenants */}
      <div className="bg-surface border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-base text-text-p">Recent Tenants</h3>
          <button className="text-accent text-xs hover:text-accent-h">Manage all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Company','Plan','Users','Status','Joined'].map(h => (
                  <th key={h} className="text-left text-text-f text-xs font-medium uppercase tracking-wider pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {RECENT_TENANTS.map((t, i) => (
                <tr key={i} className="hover:bg-white/2 transition-colors">
                  <td className="py-3 pr-4 text-text-p text-sm font-medium">{t.name}</td>
                  <td className="py-3 pr-4"><Badge variant={PLAN_BADGE[t.plan]} className="capitalize">{t.plan}</Badge></td>
                  <td className="py-3 pr-4 text-text-m text-sm tabular-nums">{t.users}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      {t.status==='active'
                        ? <CheckCircle size={13} className="text-success" />
                        : <XCircle size={13} className="text-error" />}
                      <span className={`text-xs capitalize ${t.status==='active'?'text-success':'text-error'}`}>{t.status}</span>
                    </div>
                  </td>
                  <td className="py-3 text-text-f text-sm">{t.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}