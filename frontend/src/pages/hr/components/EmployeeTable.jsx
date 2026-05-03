import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge  from '@/components/ui/Badge'
import { hrAPI } from '@/lib/hrAPI'
import { toast }  from 'sonner'

const STATUS_BADGE = { active:'success', inactive:'default', on_leave:'warning', terminated:'error' }

export default function EmployeeTable({ employees=[], onRefresh }) {
  const navigate = useNavigate()

  const handleDelete = async (e, id, name) => {
    e.stopPropagation()
    if (!confirm(`Remove ${name}?`)) return
    try { await hrAPI.deleteEmployee(id); toast.success('Removed'); onRefresh?.() }
    catch { toast.error('Failed') }
  }

  return (
    <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            {['Employee','Department','Designation','Type','Status','Salary','Action'].map(h => (
              <th key={h} className="text-left text-text-f text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {employees.map(e => (
            <tr key={e.id}
              onClick={() => navigate(`/admin/hr/${e.id}`)}
              className="hover:bg-white/2 cursor-pointer transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar name={e.profiles?.full_name||'E'} size="sm"/>
                  <div>
                    <p className="text-text-p text-sm font-medium">{e.profiles?.full_name||'—'}</p>
                    <p className="text-text-f text-xs">{e.profiles?.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-text-m text-sm">{e.departments?.name||'—'}</td>
              <td className="px-4 py-3 text-text-m text-sm">{e.designation||'—'}</td>
              <td className="px-4 py-3 text-text-m text-sm capitalize">{e.employment_type?.replace('_',' ')}</td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_BADGE[e.status]||'default'} className="capitalize text-xs">
                  {e.status?.replace('_',' ')}
                </Badge>
              </td>
              <td className="px-4 py-3 text-text-m text-sm tabular-nums">₹{Number(e.salary||0).toLocaleString()}</td>
              <td className="px-4 py-3">
                <button onClick={ev => handleDelete(ev, e.id, e.profiles?.full_name)}
                  className="w-7 h-7 rounded-lg hover:bg-red-400/10 flex items-center justify-center text-text-f hover:text-red-400 transition-all">
                  <Trash2 size={13}/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}