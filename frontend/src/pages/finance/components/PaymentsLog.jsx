import React, { useEffect, useState } from 'react'
import { CreditCard } from 'lucide-react'
import { financeAPI } from '@/lib/invoiceAPI'
import { toast }       from 'sonner'

const METHOD_META = {
  bank_transfer: { label: 'Bank Transfer', color: 'text-blue-400'    },
  upi:           { label: 'UPI',           color: 'text-green-400'   },
  card:          { label: 'Card',          color: 'text-purple-400'  },
  cash:          { label: 'Cash',          color: 'text-yellow-400'  },
  cheque:        { label: 'Cheque',        color: 'text-orange-400'  },
  stripe:        { label: 'Stripe',        color: 'text-accent'      },
  razorpay:      { label: 'Razorpay',      color: 'text-cyan-400'    },
}

export default function PaymentsLog() {
  const [payments, setPayments] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    financeAPI.listPayments()
      .then(r => setPayments(r.data.data || []))
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false))
  }, [])

  const total = payments.reduce((s,p) => s+(p.amount||0), 0)
  const fmt   = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`

  return (
    <div>
      {payments.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-text-m text-sm">{payments.length} payment{payments.length!==1?'s':''}</p>
          <p className="text-success font-bold tabular-nums">{fmt(total)}</p>
        </div>
      )}
      {loading ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_,i) => <div key={i} className="h-14 bg-surface rounded-xl animate-pulse"/>)}
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-white/5 rounded-2xl">
          <CreditCard size={32} className="text-text-f mx-auto mb-2 opacity-40"/>
          <p className="text-text-f text-sm">No payments recorded yet</p>
        </div>
      ) : (
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Invoice','Method','Transaction ID','Amount','Date'].map(h => (
                  <th key={h} className="text-left text-text-f text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map(p => {
                const method = METHOD_META[p.payment_method] || { label: p.payment_method, color: 'text-text-m' }
                return (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-text-p text-sm font-medium">{p.invoices?.invoice_number || '—'}</p>
                      <p className="text-text-f text-xs truncate max-w-32">{p.invoices?.title}</p>
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${method.color}`}>{method.label}</td>
                    <td className="px-4 py-3 text-text-m text-xs font-mono">
                      {p.transaction_id || '—'}
                    </td>
                    <td className="px-4 py-3 text-success font-bold text-sm tabular-nums">{fmt(p.amount)}</td>
                    <td className="px-4 py-3 text-text-m text-sm tabular-nums">
                      {new Date(p.paid_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
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