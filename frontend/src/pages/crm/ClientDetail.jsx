import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, Globe, MapPin, Phone,
         Mail, FileText, Plus, Trash2, Edit3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { crmAPI } from '@/lib/crmAPI'
import { useRoleGuard } from '@/hooks/useRoleGuard'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import ActivityTimeline from './components/ActivityTimeline'
import DealsPipeline from './components/DealsPipeline'
import Spinner from '@/components/ui/Spinner'
import { toast } from 'sonner'

const STATUS_BADGE = { active:'success', inactive:'default', lead:'accent', churned:'error' }

export default function ClientDetail() {
  const { id }              = useParams()
  const navigate            = useNavigate()
  const { canCreateStaff }  = useRoleGuard()
  const [client,  setClient]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('overview')

  // Add contact form
  const [addingContact, setAddingContact] = useState(false)
  const [contactForm,   setContactForm]   = useState({ full_name:'', email:'', phone:'', designation:'', is_primary:false })
  const [savingContact, setSavingContact] = useState(false)

  const load = async () => {
    try {
      const res = await crmAPI.getClient(id)
      setClient(res.data.data)
    } catch { toast.error('Failed to load client') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleAddContact = async (e) => {
    e.preventDefault()
    if (!contactForm.full_name) return
    setSavingContact(true)
    try {
      await crmAPI.addContact(id, contactForm)
      toast.success('Contact added')
      setAddingContact(false)
      setContactForm({ full_name:'', email:'', phone:'', designation:'', is_primary:false })
      load()
    } catch { toast.error('Failed') }
    finally { setSavingContact(false) }
  }

  const handleDeleteContact = async (contactId) => {
    try {
      await crmAPI.deleteContact(id, contactId)
      toast.success('Contact removed')
      load()
    } catch { toast.error('Failed') }
  }

  if (loading) return <div className="flex items-center justify-center min-h-96"><Spinner size="lg" /></div>
  if (!client) return <div className="text-center py-20"><p className="text-text-m">Client not found</p></div>

  const TABS = ['overview','deals','contacts','activity']

  return (
    <div>
      <button onClick={() => navigate('/admin/crm')}
        className="flex items-center gap-2 text-text-m hover:text-text-p text-sm mb-6 transition-colors group">
        <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> Back to CRM
      </button>

      {/* Hero */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        className="bg-surface border border-white/5 rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-5">
          <Avatar name={client.company_name || 'Client'} size="xl" src={client.avatar_url} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="font-display font-black text-2xl text-text-p">{client.company_name || '(No company)'}</h1>
              <Badge variant={STATUS_BADGE[client.status]||'default'} className="capitalize">{client.status}</Badge>
            </div>
            {client.industry && <p className="text-text-m text-sm mb-3">{client.industry}</p>}
            <div className="flex flex-wrap gap-4">
              {client.website && (
                <a href={client.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-accent text-sm hover:underline">
                  <Globe size={13} />{client.website.replace(/https?:\/\//,'')}
                </a>
              )}
              {client.city && (
                <span className="flex items-center gap-1.5 text-text-m text-sm">
                  <MapPin size={13} />{client.city}, {client.country}
                </span>
              )}
              {client.gstin && (
                <span className="flex items-center gap-1.5 text-text-m text-sm">
                  <FileText size={13} />GSTIN: {client.gstin}
                </span>
              )}
            </div>
          </div>
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 flex-shrink-0">
            {[
              { label:'Projects', value: client.projects?.filter(p=>p.status==='active').length||0, color:'text-accent' },
              { label:'Deals',    value: client.deals?.length||0,                                    color:'text-cyan'   },
              { label:'Revenue',  value:`$${(client.total_value||0).toLocaleString()}`,              color:'text-success'},
            ].map(s => (
              <div key={s.label} className="bg-surface2 border border-white/5 rounded-xl p-3 text-center">
                <p className={`${s.color} text-sm font-bold tabular-nums`}>{s.value}</p>
                <p className="text-text-f text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        {client.notes && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-text-m text-sm leading-relaxed">{client.notes}</p>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface border border-white/5 rounded-xl p-1 mb-6 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${tab===t?'bg-accent/20 text-accent':'text-text-m hover:text-text-p'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Projects */}
          <div className="bg-surface border border-white/5 rounded-2xl p-5">
            <h3 className="font-display font-bold text-base text-text-p mb-4">Projects</h3>
            {client.projects?.length === 0 && <p className="text-text-f text-sm text-center py-4">No projects</p>}
            <div className="space-y-3">
              {client.projects?.map(p => (
                <div key={p.id} className="bg-surface2 border border-white/5 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-text-p text-sm font-medium">{p.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize
                      ${p.status==='active'?'bg-accent/15 text-accent':
                        p.status==='completed'?'bg-success/15 text-success':'bg-white/10 text-text-m'}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width:`${p.progress||0}%` }} />
                  </div>
                  <p className="text-text-f text-xs mt-1 text-right">{p.progress||0}%</p>
                </div>
              ))}
            </div>
          </div>
          {/* Recent activity */}
          <ActivityTimeline
            activities={(client.crm_activities||[]).slice(0,5)}
            clientId={id}
            onRefresh={load} />
        </div>
      )}

      {/* Deals */}
      {tab === 'deals' && (
        <div className="bg-surface border border-white/5 rounded-2xl p-5">
          <DealsPipeline deals={client.deals||[]} clients={[client]} onRefresh={load} />
        </div>
      )}

      {/* Contacts */}
      {tab === 'contacts' && (
        <div className="bg-surface border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-text-p">Contacts ({client.contacts?.length||0})</h3>
            {canCreateStaff && (
              <button onClick={() => setAddingContact(!addingContact)}
                className="flex items-center gap-1.5 text-accent text-xs hover:text-accent-h">
                <Plus size={13} /> Add Contact
              </button>
            )}
          </div>

          {/* Add contact form */}
          {addingContact && (
            <form onSubmit={handleAddContact}
              className="bg-surface2 border border-white/8 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Full Name *" value={contactForm.full_name}
                  onChange={e => setContactForm(f=>({...f,full_name:e.target.value}))}
                  className="bg-surface border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f" />
                <input type="text" placeholder="Designation" value={contactForm.designation}
                  onChange={e => setContactForm(f=>({...f,designation:e.target.value}))}
                  className="bg-surface border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="email" placeholder="Email" value={contactForm.email}
                  onChange={e => setContactForm(f=>({...f,email:e.target.value}))}
                  className="bg-surface border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f" />
                <input type="tel" placeholder="Phone" value={contactForm.phone}
                  onChange={e => setContactForm(f=>({...f,phone:e.target.value}))}
                  className="bg-surface border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none placeholder:text-text-f" />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-text-m text-sm cursor-pointer">
                  <input type="checkbox" checked={contactForm.is_primary}
                    onChange={e => setContactForm(f=>({...f,is_primary:e.target.checked}))}
                    className="w-4 h-4 rounded accent-cyan" />
                  Set as primary contact
                </label>
                <div className="flex gap-2 ml-auto">
                  <button type="button" onClick={() => setAddingContact(false)}
                    className="text-text-m text-xs px-3 py-1.5 border border-white/10 rounded-lg hover:border-white/20 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={savingContact}
                    className="bg-accent text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all hover:bg-accent-h">
                    {savingContact ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {client.contacts?.length === 0 && !addingContact && (
              <p className="text-text-f text-sm text-center py-6">No contacts added yet</p>
            )}
            {client.contacts?.map(c => (
              <div key={c.id} className="flex items-center gap-3 bg-surface2 border border-white/5 rounded-xl p-3 group">
                <Avatar name={c.full_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-text-p text-sm font-medium">{c.full_name}</p>
                    {c.is_primary && <span className="text-xs text-cyan bg-cyan/10 px-1.5 py-0.5 rounded-full">Primary</span>}
                  </div>
                  {c.designation && <p className="text-text-f text-xs">{c.designation}</p>}
                  <div className="flex gap-3 mt-0.5">
                    {c.email && <span className="text-text-f text-xs flex items-center gap-1"><Mail size={9}/>{c.email}</span>}
                    {c.phone && <span className="text-text-f text-xs flex items-center gap-1"><Phone size={9}/>{c.phone}</span>}
                  </div>
                </div>
                {canCreateStaff && (
                  <button onClick={() => handleDeleteContact(c.id)}
                    className="opacity-0 group-hover:opacity-100 text-text-f hover:text-error transition-all">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Activity */}
      {tab === 'activity' && (
        <ActivityTimeline activities={client.crm_activities||[]} clientId={id} onRefresh={load} />
      )}
    </div>
  )
}