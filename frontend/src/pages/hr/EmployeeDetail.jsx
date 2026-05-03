import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Building2, Briefcase,
         Calendar, DollarSign, Edit3, Save, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { hrAPI } from '@/lib/hrAPI'
import Avatar    from '@/components/ui/Avatar'
import Badge     from '@/components/ui/Badge'
import { toast } from 'sonner'

const STATUS_BADGE = {
  active:     'success',
  inactive:   'default',
  on_leave:   'warning',
  terminated: 'error',
}

export default function EmployeeDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [emp,      setEmp]      = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(false)
  const [form,     setForm]     = useState({})
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const r = await hrAPI.getEmployee(id)
        setEmp(r.data.data)
        setForm(r.data.data)
      } catch { toast.error('Failed to load employee') }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await hrAPI.updateEmployee(id, {
        designation:     form.designation,
        department_id:   form.department_id,
        employment_type: form.employment_type,
        salary:          form.salary,
        phone:           form.phone,
        address:         form.address,
        status:          form.status,
      })
      toast.success('Employee updated!')
      setEditing(false)
      const r = await hrAPI.getEmployee(id)
      setEmp(r.data.data)
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  if (!emp) return null

  return (
    <div>
      {/* Back + Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/hr')}
          className="w-9 h-9 rounded-xl border border-white/10 hover:border-white/20 flex items-center justify-center text-text-m transition-all">
          <ArrowLeft size={16}/>
        </button>
        <div className="flex-1">
          <h2 className="font-display font-black text-xl text-text-p">
            {emp.profiles?.full_name || 'Employee'}
          </h2>
          <p className="text-text-f text-sm">{emp.employee_code}</p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 border border-white/10 text-text-m text-sm px-3 py-2 rounded-xl hover:border-white/20 transition-all">
              <X size={14}/> Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 bg-accent hover:bg-accent-h text-white text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-60">
              <Save size={14}/> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 border border-white/10 hover:border-accent/40 text-text-m text-sm px-3 py-2 rounded-xl transition-all">
            <Edit3 size={14}/> Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          className="bg-surface border border-white/5 rounded-2xl p-6 text-center">
          <Avatar name={emp.profiles?.full_name||'E'} src={emp.avatar_url} size="xl" className="mx-auto mb-4"/>
          <h3 className="font-display font-bold text-lg text-text-p mb-1">{emp.profiles?.full_name}</h3>
          <p className="text-text-m text-sm mb-3">{emp.designation || 'No designation'}</p>
          <Badge variant={STATUS_BADGE[emp.status]||'default'} className="capitalize mb-4">
            {emp.status?.replace('_',' ')}
          </Badge>
          <div className="space-y-2 text-left mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-text-m text-sm">
              <Mail size={13} className="text-text-f flex-shrink-0"/>
              <span className="truncate">{emp.profiles?.email}</span>
            </div>
            {emp.phone && (
              <div className="flex items-center gap-2 text-text-m text-sm">
                <Phone size={13} className="text-text-f flex-shrink-0"/>
                <span>{emp.phone}</span>
              </div>
            )}
            {emp.departments?.name && (
              <div className="flex items-center gap-2 text-text-m text-sm">
                <Building2 size={13} className="text-text-f flex-shrink-0"/>
                <span>{emp.departments.name}</span>
              </div>
            )}
            {emp.date_of_joining && (
              <div className="flex items-center gap-2 text-text-m text-sm">
                <Calendar size={13} className="text-text-f flex-shrink-0"/>
                <span>Joined {new Date(emp.date_of_joining).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Edit / Info */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.05 }}
          className="lg:col-span-2 space-y-4">

          {/* Work Details */}
          <div className="bg-surface border border-white/5 rounded-2xl p-5">
            <h4 className="font-display font-bold text-sm text-text-p mb-4">Work Details</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label:'Designation',      key:'designation',     type:'text' },
                { label:'Employment Type',  key:'employment_type', type:'select',
                  options:['full_time','part_time','contract','intern'] },
                { label:'Monthly Salary',   key:'salary',          type:'number' },
                { label:'Status',           key:'status',          type:'select',
                  options:['active','inactive','on_leave','terminated'] },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-text-f text-xs block mb-1.5">{field.label}</label>
                  {editing ? (
                    field.type === 'select' ? (
                      <select value={form[field.key]||''}
                        onChange={e => setForm(f => ({...f,[field.key]:e.target.value}))}
                        className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none capitalize">
                        {field.options.map(o => (
                          <option key={o} value={o} className="bg-surface capitalize">{o.replace('_',' ')}</option>
                        ))}
                      </select>
                    ) : (
                      <input type={field.type} value={form[field.key]||''}
                        onChange={e => setForm(f => ({...f,[field.key]:e.target.value}))}
                        className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none"/>
                    )
                  ) : (
                    <p className="text-text-p text-sm py-2 capitalize">
                      {field.key === 'salary'
                        ? `₹${Number(emp[field.key]||0).toLocaleString()}`
                        : emp[field.key]?.replace('_',' ') || '—'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Leaves */}
          {emp.leave_requests?.length > 0 && (
            <div className="bg-surface border border-white/5 rounded-2xl p-5">
              <h4 className="font-display font-bold text-sm text-text-p mb-4">Recent Leaves</h4>
              <div className="space-y-2">
                {emp.leave_requests.slice(0,3).map(l => (
                  <div key={l.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: l.leave_types?.color||'#6366F1' }}/>
                      <span className="text-text-m">{l.leave_types?.name}</span>
                      <span className="text-text-f text-xs">
                        {new Date(l.from_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} –{' '}
                        {new Date(l.to_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize
                      ${l.status==='approved'?'bg-success/15 text-success':
                        l.status==='rejected'?'bg-error/15 text-error':'bg-warning/15 text-warning'}`}>
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Payslips */}
          {emp.payroll?.length > 0 && (
            <div className="bg-surface border border-white/5 rounded-2xl p-5">
              <h4 className="font-display font-bold text-sm text-text-p mb-4">Recent Payslips</h4>
              <div className="space-y-2">
                {emp.payroll.slice(0,3).map(p => {
                  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                  return (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span className="text-text-m">{MONTHS[p.month-1]} {p.year}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-success font-semibold tabular-nums">₹{(p.net_salary||0).toLocaleString()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize
                          ${p.status==='paid'?'bg-success/15 text-success':
                            p.status==='processed'?'bg-warning/15 text-warning':'bg-white/10 text-text-m'}`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}