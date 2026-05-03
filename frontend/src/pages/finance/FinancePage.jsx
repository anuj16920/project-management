import React, { useEffect, useState, useCallback } from 'react'
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { financeAPI }      from '@/lib/invoiceAPI'
import KPICard             from '@/pages/dashboard/components/KPICard'
import InvoicesList        from './components/InvoicesList'
import ExpensesList        from './components/ExpensesList'
import PaymentsLog         from './components/PaymentsLog'
import CreateInvoiceModal  from './components/CreateInvoiceModal'
import CreateExpenseModal  from './components/CreateExpenseModal'
import { toast } from 'sonner'

const TABS = ['invoices', 'expenses', 'payments']

export default function FinancePage() {
  const [tab,     setTab]     = useState('invoices')
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [showInvoiceModal,  setShowInvoiceModal]  = useState(false)
  const [showExpenseModal,  setShowExpenseModal]  = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await financeAPI.stats()
      setStats(r.data.data)
    } catch { toast.error('Failed to load finance stats') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`

  const KPIs = stats ? [
    { title: 'Total Revenue',      value: fmt(stats.totalRevenue),     icon: 'TrendingUp',   color: '#10B981', index: 0 },
    { title: 'Pending Invoices',   value: fmt(stats.pendingInvoices),  icon: 'Clock',        color: '#F59E0B', index: 1 },
    { title: 'Monthly Expenses',   value: fmt(stats.monthlyExpenses),  icon: 'TrendingDown', color: '#EF4444', index: 2 },
    { title: 'Overdue',            value: stats.overdueCount,          icon: 'AlertCircle',  color: '#F97316', index: 3 },
  ] : []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-black text-2xl text-text-p">Finance</h2>
          <p className="text-text-m text-sm mt-1">Invoices · Expenses · Payments</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 border border-white/10 hover:border-white/20
              text-text-m text-sm font-medium px-4 py-2.5 rounded-xl transition-all">
            <Plus size={15}/> Add Expense
          </button>
          <button onClick={() => setShowInvoiceModal(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-h text-white
              text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95">
            <Plus size={15}/> New Invoice
          </button>
        </div>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {KPIs.map((k,i) => <KPICard key={i} {...k}/>)}
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

      {tab === 'invoices' && <InvoicesList onRefresh={load}/>}
      {tab === 'expenses' && <ExpensesList onRefresh={load}/>}
      {tab === 'payments' && <PaymentsLog/>}

      {showInvoiceModal && (
        <CreateInvoiceModal
          onClose={() => setShowInvoiceModal(false)}
          onSuccess={() => { load(); setShowInvoiceModal(false) }}/>
      )}
      {showExpenseModal && (
        <CreateExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSuccess={() => { load(); setShowExpenseModal(false) }}/>
      )}
    </div>
  )
}