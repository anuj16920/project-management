import React, { useEffect, useState } from 'react'
import { LogIn, LogOut, Calendar, DollarSign, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { hrAPI }   from '@/lib/hrAPI'
import { toast }   from 'sonner'

const TABS   = ['attendance', 'leaves', 'payslips']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const STATUS_META = {
  present:  { bg:'bg-success/15',  color:'text-success',  label:'Present'  },
  absent:   { bg:'bg-red-400/15',  color:'text-red-400',  label:'Absent'   },
  late:     { bg:'bg-warning/15',  color:'text-warning',  label:'Late'     },
  on_leave: { bg:'bg-accent/15',   color:'text-accent',   label:'On Leave' },
  half_day: { bg:'bg-cyan-400/15', color:'text-cyan-400', label:'Half Day' },
}
const LEAVE_STATUS = {
  pending:   'bg-warning/15 text-warning',
  approved:  'bg-success/15 text-success',
  rejected:  'bg-red-400/15 text-red-400',
  cancelled: 'bg-white/10 text-text-m',
}

export default function EmployeeHRPage() {
  const { profile } = useAuth()
  const [tab,          setTab]          = useState('attendance')
  const [attendance,   setAttendance]   = useState([])
  const [leaves,       setLeaves]       = useState([])
  const [leaveTypes,   setLeaveTypes]   = useState([])
  const [payroll,      setPayroll]      = useState([])
  const [todayAtt,     setTodayAtt]     = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [clocking,     setClocking]     = useState(false)
  const [showLeaveForm,setShowLeaveForm]= useState(false)
  const [leaveForm,    setLeaveForm]    = useState({ leave_type_id:'', from_date:'', to_date:'', reason:'' })
  const [applyingLeave,setApplyingLeave]= useState(false)

  const load = async () => {
    if (!profile) return
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const uid   = profile.firebase_uid
      const [att, myLeaves, lt, pay, todayRec] = await Promise.all([
        hrAPI.getAttendance({ employee_uid: uid }),
        hrAPI.listLeaves({ employee_uid: uid }),
        hrAPI.listLeaveTypes(),
        hrAPI.listPayroll({ employee_uid: uid }),
        hrAPI.getAttendance({ employee_uid: uid, date: today }),
      ])
      setAttendance(att.data.data   || [])
      setLeaves(myLeaves.data.data  || [])
      setLeaveTypes(lt.data.data    || [])
      setPayroll(pay.data.data      || [])
      setTodayAtt(todayRec.data.data?.[0] || null)
    } catch { toast.error('Failed to load HR data') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [profile])

  const handleClockIn = async () => {
    setClocking(true)
    try { await hrAPI.clockIn(); toast.success('Good morning! ☀️ Clocked in'); load() }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed') }
    finally { setClocking(false) }
  }

  const handleClockOut = async () => {
    setClocking(true)
    try { await hrAPI.clockOut(); toast.success('Great work today! 🌙 Clocked out'); load() }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed') }
    finally { setClocking(false) }
  }

  const handleApplyLeave = async (ev) => {
    ev.preventDefault()
    if (!leaveForm.leave_type_id || !leaveForm.from_date || !leaveForm.to_date)
      return toast.error('Please fill all required fields')
    setApplyingLeave(true)
    try {
      await hrAPI.applyLeave(leaveForm)
      toast.success('Leave request submitted! 📋')
      setShowLeaveForm(false)
      setLeaveForm({ leave_type_id:'', from_date:'', to_date:'', reason:'' })
      load()
    } catch { toast.error('Failed to apply leave') }
    finally { setApplyingLeave(false) }
  }

  const handleCancelLeave = async (id) => {
    try { await hrAPI.cancelLeave(id); toast.success('Leave cancelled'); load() }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed') }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display font-black text-2xl text-text-p">My HR</h2>
        <p className="text-text-m text-sm mt-1">Attendance · Leaves · Payslips</p>
      </div>

      {/* ── Clock In/Out Card ── */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        className="bg-surface border border-white/5 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-text-m text-sm mb-2">
              {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
            </p>
            {todayAtt ? (
              <div className="flex items-center gap-5 flex-wrap">
                <div>
                  <p className="text-text-f text-xs mb-0.5">Clock In</p>
                  <p className="text-text-p text-sm font-bold tabular-nums">
                    {todayAtt.clock_in
                      ? new Date(todayAtt.clock_in).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})
                      : '—'}
                  </p>
                </div>
                {todayAtt.clock_out && (
                  <div>
                    <p className="text-text-f text-xs mb-0.5">Clock Out</p>
                    <p className="text-text-p text-sm font-bold tabular-nums">
                      {new Date(todayAtt.clock_out).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
                    </p>
                  </div>
                )}
                {todayAtt.work_hours && (
                  <div>
                    <p className="text-text-f text-xs mb-0.5">Hours</p>
                    <p className="text-success text-sm font-bold tabular-nums">{todayAtt.work_hours}h</p>
                  </div>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full capitalize
                  ${STATUS_META[todayAtt.status]?.bg} ${STATUS_META[todayAtt.status]?.color}`}>
                  {STATUS_META[todayAtt.status]?.label || todayAtt.status}
                </span>
              </div>
            ) : (
              <p className="text-text-f text-sm">You haven't clocked in yet today</p>
            )}
          </div>
          <div className="flex gap-3">
            {!todayAtt?.clock_in && (
              <button onClick={handleClockIn} disabled={clocking}
                className="flex items-center gap-2 bg-success/15 hover:bg-success/25 border border-success/30 text-success text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-60">
                <LogIn size={16}/> {clocking ? 'Clocking...' : 'Clock In'}
              </button>
            )}
            {todayAtt?.clock_in && !todayAtt?.clock_out && (
              <button onClick={handleClockOut} disabled={clocking}
                className="flex items-center gap-2 bg-red-400/15 hover:bg-red-400/25 border border-red-400/30 text-red-400 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-60">
                <LogOut size={16}/> {clocking ? 'Clocking...' : 'Clock Out'}
              </button>
            )}
            {todayAtt?.clock_out && (
              <div className="flex items-center gap-2 bg-success/10 border border-success/20 text-success text-sm px-4 py-2.5 rounded-xl">
                <CheckCircle size={16}/> Day Complete ✅
              </div>
            )}
          </div>
        </div>
      </motion.div>

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

      {/* ── ATTENDANCE ── */}
      {tab === 'attendance' && (
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
          {attendance.length === 0 ? (
            <p className="text-text-f text-sm text-center py-10">No attendance records yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Date','Clock In','Clock Out','Hours','Status'].map(h => (
                    <th key={h} className="text-left text-text-f text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {attendance.slice(0,30).map(a => {
                  const meta = STATUS_META[a.status] || STATUS_META.present
                  return (
                    <tr key={a.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 text-text-p text-sm">
                        {new Date(a.date).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}
                      </td>
                      <td className="px-4 py-3 text-text-m text-sm tabular-nums">
                        {a.clock_in ? new Date(a.clock_in).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '—'}
                      </td>
                      <td className="px-4 py-3 text-text-m text-sm tabular-nums">
                        {a.clock_out ? new Date(a.clock_out).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '—'}
                      </td>
                      <td className="px-4 py-3 text-text-m text-sm tabular-nums">
                        {a.work_hours ? `${a.work_hours}h` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>{meta.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── LEAVES ── */}
      {tab === 'leaves' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-text-p">My Leave Requests</h3>
            <button onClick={() => setShowLeaveForm(!showLeaveForm)}
              className="bg-accent hover:bg-accent-h text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
              + Apply Leave
            </button>
          </div>

          {showLeaveForm && (
            <motion.form initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
              onSubmit={handleApplyLeave}
              className="bg-surface border border-white/5 rounded-2xl p-5 mb-4 space-y-4">
              <h4 className="font-semibold text-sm text-text-p">New Leave Request</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-text-f text-xs block mb-1.5">Leave Type *</label>
                  <select value={leaveForm.leave_type_id}
                    onChange={e => setLeaveForm(f => ({...f, leave_type_id:e.target.value}))}
                    className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none">
                    <option value="">Select type</option>
                    {leaveTypes.map(lt => (
                      <option key={lt.id} value={lt.id} className="bg-surface">{lt.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-text-f text-xs block mb-1.5">From Date *</label>
                  <input type="date" value={leaveForm.from_date}
                    onChange={e => setLeaveForm(f => ({...f, from_date:e.target.value}))}
                    className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none"/>
                </div>
                <div>
                  <label className="text-text-f text-xs block mb-1.5">To Date *</label>
                  <input type="date" value={leaveForm.to_date}
                    min={leaveForm.from_date}
                    onChange={e => setLeaveForm(f => ({...f, to_date:e.target.value}))}
                    className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none"/>
                </div>
              </div>
              <div>
                <label className="text-text-f text-xs block mb-1.5">Reason (optional)</label>
                <textarea rows={2} placeholder="Reason for leave..." value={leaveForm.reason}
                  onChange={e => setLeaveForm(f => ({...f, reason:e.target.value}))}
                  className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none resize-none placeholder:text-text-f"/>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowLeaveForm(false)}
                  className="flex-1 border border-white/10 text-text-m text-sm py-2.5 rounded-xl hover:border-white/20 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={applyingLeave}
                  className="flex-1 bg-accent text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-accent-h transition-all disabled:opacity-60">
                  {applyingLeave ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </motion.form>
          )}

          {leaves.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-white/5 rounded-2xl">
              <Calendar size={32} className="text-text-f mx-auto mb-2 opacity-40"/>
              <p className="text-text-f text-sm">No leave requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaves.map(l => (
                <div key={l.id}
                  className="bg-surface border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {l.leave_types && (
                          <span className="flex items-center gap-1.5 text-text-m text-xs font-medium">
                            <span className="w-2 h-2 rounded-full" style={{ background: l.leave_types.color||'#6366F1' }}/>
                            {l.leave_types.name}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${LEAVE_STATUS[l.status]||''}`}>
                          {l.status}
                        </span>
                      </div>
                      <p className="text-text-p text-sm">
                        {new Date(l.from_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} –{' '}
                        {new Date(l.to_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                        <span className="text-text-f ml-2 text-xs">({l.days} day{l.days>1?'s':''})</span>
                      </p>
                      {l.reason && <p className="text-text-f text-xs mt-1 italic">"{l.reason}"</p>}
                      {l.review_note && <p className="text-text-m text-xs mt-1">Admin note: {l.review_note}</p>}
                    </div>
                    {l.status === 'pending' && (
                      <button onClick={() => handleCancelLeave(l.id)}
                        className="text-red-400 text-xs hover:underline">
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PAYSLIPS ── */}
      {tab === 'payslips' && (
        <div>
          {payroll.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-white/5 rounded-2xl">
              <DollarSign size={32} className="text-text-f mx-auto mb-2 opacity-40"/>
              <p className="text-text-f text-sm">No payslips generated yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payroll.map(p => (
                <motion.div key={p.id}
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  className="bg-surface border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-text-p font-bold">{MONTHS[p.month-1]} {p.year}</p>
                      <p className="text-text-f text-xs mt-0.5">
                        {p.status === 'paid' && p.paid_at
                          ? `Paid on ${new Date(p.paid_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}`
                          : p.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-success text-xl font-black tabular-nums">₹{(p.net_salary||0).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize
                        ${p.status==='paid'?'bg-success/15 text-success':
                          p.status==='processed'?'bg-warning/15 text-warning':'bg-white/10 text-text-m'}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 pt-3 border-t border-white/5">
                    {[
                      { label:'Basic',      value:p.basic_salary, c:'text-text-p' },
                      { label:'HRA',        value:p.hra,          c:'text-text-m' },
                      { label:'Allowances', value:p.allowances,   c:'text-text-m' },
                      { label:'Deductions', value:p.deductions,   c:'text-red-400'},
                      { label:'Tax',        value:p.tax,          c:'text-warning'},
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <p className={`${s.c} text-sm font-semibold tabular-nums`}>₹{(s.value||0).toLocaleString()}</p>
                        <p className="text-text-f text-xs">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}