import React from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

const RANK_COLORS = ['text-yellow-400','text-gray-300','text-amber-600']
const RANK_ICONS  = ['🥇','🥈','🥉']

export default function EmployeeTable({ data, loading }) {
  if (loading) return <div className="h-80 bg-surface rounded-2xl animate-pulse"/>

  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-yellow-400"/>
          <h3 className="font-display font-bold text-base text-text-p">Employee Performance</h3>
        </div>
        <p className="text-text-f text-xs mt-0.5">Ranked by task completion rate</p>
      </div>

      {!data?.length ? (
        <div className="text-center py-12">
          <p className="text-text-f text-sm">No employee data available</p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Rank','Employee','Role','Total Tasks','Completed','In Progress','Score'].map(h => (
                <th key={h} className="text-left text-text-f text-xs font-medium
                  uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((emp, i) => (
              <motion.tr key={emp.uid}
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                transition={{ delay: i * 0.04 }}
                className="hover:bg-white/2 transition-colors">
                <td className="px-5 py-3">
                  <span className="text-base">{RANK_ICONS[i] || `#${i+1}`}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center
                      justify-center text-accent text-xs font-bold flex-shrink-0">
                      {emp.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <p className="text-text-p text-sm font-medium">{emp.name}</p>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="text-text-f text-xs capitalize bg-white/5 px-2 py-0.5 rounded-full">
                    {emp.profile?.role || '—'}
                  </span>
                </td>
                <td className="px-5 py-3 text-text-m text-sm tabular-nums">{emp.total}</td>
                <td className="px-5 py-3 text-success text-sm tabular-nums">{emp.completed}</td>
                <td className="px-5 py-3 text-warning text-sm tabular-nums">{emp.in_progress}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-20">
                      <div className="h-full rounded-full"
                        style={{
                          width: `${emp.completion}%`,
                          background: emp.completion >= 75 ? '#10B981'
                            : emp.completion >= 50 ? '#F59E0B' : '#EF4444'
                        }}/>
                    </div>
                    <span className="text-text-p text-sm font-bold tabular-nums w-10">
                      {emp.completion}%
                    </span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  )
}