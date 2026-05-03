import React, { useState } from 'react'
import { X, Building2, Globe, MapPin, FileText, Mail,
         Lock, Phone, User, Eye, EyeOff, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { crmAPI } from '@/lib/crmAPI'

const INDUSTRIES = [
  'Technology','Finance','Healthcare','Education','E-Commerce',
  'Manufacturing','Real Estate','Media','Consulting','Other',
]
const SOURCES = ['Referral','Website','LinkedIn','Cold Outreach','Event','Partner','Other']

export default function CreateClientModal({ onClose, onSuccess }) {
  const [step,    setStep]    = useState(1)   // 1=account, 2=company
  const [form,    setForm]    = useState({
    // Step 1 — Account
    fullName:'', email:'', phone:'', tempPassword:'',
    // Step 2 — Company
    company_name:'', industry:'', website:'',
    address:'', city:'', country:'India',
    gstin:'', source:'', notes:'',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validateStep1 = () => {
    const e = {}
    if (!form.fullName.trim())   e.fullName    = 'Required'
    if (!form.email.trim())      e.email       = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.tempPassword)      e.tempPassword = 'Required'
    else if (form.tempPassword.length < 8) e.tempPassword = 'Min 8 characters'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleNext = () => { if (validateStep1()) setStep(2) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await crmAPI.createClient(form)
      toast.success('Client created! 🎉')
      onSuccess?.(res.data.data)
      onClose?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create client')
    } finally { setLoading(false) }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
          className="relative z-10 w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-card-h overflow-hidden max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-surface z-10">
            <div>
              <h2 className="font-display font-bold text-lg text-cyan">Add New Client</h2>
              <p className="text-text-f text-xs mt-0.5">Step {step} of 2 — {step===1?'Account Details':'Company Info'}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-m transition-all">
              <X size={16} />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex px-5 pt-4 gap-2">
            {[1,2].map(s => (
              <div key={s} className={`flex-1 h-1 rounded-full transition-all ${s<=step?'bg-cyan':'bg-surface2'}`} />
            ))}
          </div>

          {/* Step 1 — Account */}
          {step === 1 && (
            <div className="p-5 space-y-4">
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">Full Name *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-f" />
                  <input type="text" placeholder="John Smith"
                    value={form.fullName} onChange={e => set('fullName', e.target.value)}
                    className={`w-full bg-surface2 border ${errors.fullName?'border-error/60':'border-white/10'} focus:border-cyan/60 rounded-xl pl-9 pr-3 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
                </div>
                {errors.fullName && <p className="text-error text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">Work Email *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-f" />
                  <input type="email" placeholder="john@company.com"
                    value={form.email} onChange={e => set('email', e.target.value)}
                    className={`w-full bg-surface2 border ${errors.email?'border-error/60':'border-white/10'} focus:border-cyan/60 rounded-xl pl-9 pr-3 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
                </div>
                {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-f" />
                  <input type="tel" placeholder="+91 98765 43210"
                    value={form.phone} onChange={e => set('phone', e.target.value)}
                    className="w-full bg-surface2 border border-white/10 focus:border-cyan/60 rounded-xl pl-9 pr-3 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f" />
                </div>
              </div>
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">Temporary Password *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-f" />
                  <input type={showPass?'text':'password'} placeholder="Min. 8 characters"
                    value={form.tempPassword} onChange={e => set('tempPassword', e.target.value)}
                    className={`w-full bg-surface2 border ${errors.tempPassword?'border-error/60':'border-white/10'} focus:border-cyan/60 rounded-xl pl-9 pr-10 py-2.5 text-text-p text-sm outline-none transition-all placeholder:text-text-f`} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-f hover:text-text-m">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.tempPassword && <p className="text-error text-xs mt-1">{errors.tempPassword}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 border border-white/10 hover:border-white/20 text-text-m text-sm font-medium py-2.5 rounded-xl transition-all">
                  Cancel
                </button>
                <button type="button" onClick={handleNext}
                  className="flex-1 bg-cyan hover:bg-cyan/80 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
                  Next: Company Info →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Company */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-m text-xs font-medium block mb-1.5">
                    <Building2 size={11} className="inline mr-1" />Company Name
                  </label>
                  <input type="text" placeholder="Acme Corp"
                    value={form.company_name} onChange={e => set('company_name', e.target.value)}
                    className="w-full bg-surface2 border border-white/10 focus:border-cyan/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none placeholder:text-text-f" />
                </div>
                <div>
                  <label className="text-text-m text-xs font-medium block mb-1.5">Industry</label>
                  <select value={form.industry} onChange={e => set('industry', e.target.value)}
                    className="w-full bg-surface2 border border-white/10 focus:border-cyan/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none">
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i} className="bg-surface">{i}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">
                  <Globe size={11} className="inline mr-1" />Website
                </label>
                <input type="url" placeholder="https://company.com"
                  value={form.website} onChange={e => set('website', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-cyan/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none placeholder:text-text-f" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-m text-xs font-medium block mb-1.5">
                    <MapPin size={11} className="inline mr-1" />City
                  </label>
                  <input type="text" placeholder="Hyderabad"
                    value={form.city} onChange={e => set('city', e.target.value)}
                    className="w-full bg-surface2 border border-white/10 focus:border-cyan/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none placeholder:text-text-f" />
                </div>
                <div>
                  <label className="text-text-m text-xs font-medium block mb-1.5">Country</label>
                  <input type="text" value={form.country} onChange={e => set('country', e.target.value)}
                    className="w-full bg-surface2 border border-white/10 focus:border-cyan/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-m text-xs font-medium block mb-1.5">
                    <FileText size={11} className="inline mr-1" />GSTIN
                  </label>
                  <input type="text" placeholder="22AAAAA0000A1Z5"
                    value={form.gstin} onChange={e => set('gstin', e.target.value)}
                    className="w-full bg-surface2 border border-white/10 focus:border-cyan/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none placeholder:text-text-f" />
                </div>
                <div>
                  <label className="text-text-m text-xs font-medium block mb-1.5">
                    <Tag size={11} className="inline mr-1" />Source
                  </label>
                  <select value={form.source} onChange={e => set('source', e.target.value)}
                    className="w-full bg-surface2 border border-white/10 focus:border-cyan/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none">
                    <option value="">How did they find us?</option>
                    {SOURCES.map(s => <option key={s} value={s} className="bg-surface">{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-text-m text-xs font-medium block mb-1.5">Notes</label>
                <textarea rows={2} placeholder="Any notes about this client..."
                  value={form.notes} onChange={e => set('notes', e.target.value)}
                  className="w-full bg-surface2 border border-white/10 focus:border-cyan/60 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none resize-none placeholder:text-text-f" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 border border-white/10 hover:border-white/20 text-text-m text-sm font-medium py-2.5 rounded-xl transition-all">
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-cyan hover:bg-cyan/80 text-white text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60">
                  {loading
                    ? <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...
                      </span>
                    : '🎉 Create Client'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}