import React, { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import Avatar    from '@/components/ui/Avatar'
import { hrAPI } from '@/lib/hrAPI'
import { toast }  from 'sonner'

const now = new Date()
const STATUS_META = {
  present:  { color:'text-success',  bg:'bg-success/15',  label:'Present'  },
  absent:   { color:'text-red-400',  bg:'bg-red-400/15',  label:'Absent'   },
  late:     { color:'text-warning',  bg:'bg-warning/15',  label:'Late'     },
  half_day: { color:'text-cyan-400', bg:'bg-cyan-400/15', label:'Half Day' },
  on_leave: { color:'text-accent',   bg:'bg-accent/15',   label:'On Leave' },
  holiday:  { color:'text-purple-400', bg:'bg-purple-400/15', label:'Holiday'},
}
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function AttendanceCalendar() {
  const [attendance, setAttendance] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [view,       setView]       = useState('daily')
  const [date,       setDate]       = useState(now.toISOString().split('T')[0])
  const [month,      setMonth]      = useState(now.getMonth()+1)
  const [year,       setYear]       = useState(now.getFullYear())

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = view === 'daily' ? { date } : { month, year }
        const r = await hrAPI.getAttendance(params)
        setAttendance(r.data.data || [])
      } catch { toast.error('Failed') }
      finally { setLoading(false) }
    }
    load()
  }, [view, date, month, year])

  const summary = Object.entries(STATUS_META).map(([k,m]) => ({
    status: k, ...m,
    count: attendance.filter(a => a.status === k).length,
  })).filter(s => s.count > 0)

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-1 bg-surface border border-white/5 rounded-xl p-1">
          {['daily','monthly'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
                ${view===v ? 'bg-accent/20 text-accent' : 'text-text-m hover:text-text-p'}`}>
              {v}
            </button>
          ))}
        </div>
        {view === 'daily' ? (
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="bg-surface border border-white/10 text-text-m text-sm rounded-xl px-3 py-2 outline-none focus:border-accent/40"/>
        ) : (
          <div className="flex gap-2">
            <select value={month} onChange={e => setMonth(Number(e.target.value))}
              className="bg-surface border border-white/10 text-text-m text-sm rounded-xl px-3 py-2 outline-none focus:border-accent/40">
              {MONTHS.map((m,i) => <option key={i+1} value={i+1} className="bg-surface">{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="bg-surface border border-white/10 text-text-m text-sm rounded-xl px-3 py-2 outline-none focus:border-accent/40">
              {[2024,2025,2026,2027].map(y => <option key={y} value={y} className="bg-surface">{y}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Summary badges */}
      {summary.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {summary.map(s => (
            <span key={s.status} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${s.bg} ${s.color}`}>
              {s.label}: <strong>{s.count}</strong>
            </span>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array(6).fill(0).map((_,i) => <div key={i} className="h-14 bg-surface rounded-xl animate-pulse"/>)}
        </div>
      ) : attendance.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-white/5 rounded-2xl">
          <Calendar size={32} className="text-text-f mx-auto mb-2 opacity-40"/>
          <p className="text-text-f text-sm">No attendance records for this period</p>
        </div>
      ) : (
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Employee','Date','Clock In','Clock Out','Hours','Status'].map(h => (
                  <th key={h} className="text-left text-text-f text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {attendance.map(a => {
                const meta = STATUS_META[a.status] || STATUS_META.present
                return (
                  <tr key={a.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={a.profiles?.full_name||'E'} size="xs"/>
                        <span className="text-text-p text-sm">{a.profiles?.full_name||'—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-m text-sm">
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
        </div>
      )}
    </div>
  )
}