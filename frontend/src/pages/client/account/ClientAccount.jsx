import React, { useEffect, useState } from 'react'
import { User, Building2, Globe, MapPin, Mail, Phone,
         FileText, Edit3, Save, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { crmAPI }  from '@/lib/crmAPI'
import Avatar from '@/components/ui/Avatar'
import { toast } from 'sonner'

export default function ClientAccount() {
  const { profile } = useAuth()
  const [client,   setClient]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(false)
  const [form,     setForm]     = useState({})
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    crmAPI.listClients({})
      .then(r => {
        // Backend filters by tenant+profile_uid automatically
        const me = r.data.data?.[0]
        setClient(me)
        setForm({
          company_name: me?.company_name || '',
          industry:     me?.industry     || '',
          website:      me?.website      || '',
          address:      me?.address      || '',
          city:         me?.city         || '',
          country:      me?.country      || 'India',
          gstin:        me?.gstin        || '',
          notes:        me?.notes        || '',
        })
      })
      .catch(() => toast.error('Failed to load account'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!client) return
    setSaving(true)
    try {
      await crmAPI.updateClient(client.id, form)
      setClient(c => ({ ...c, ...form }))
      setEditing(false)
      toast.success('Account updated!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-black text-2xl text-text-p">My Account</h2>
          <p className="text-text-m text-sm mt-1">Your profile and company information</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-surface border border-white/10 hover:border-white/20 text-text-m text-sm px-4 py-2 rounded-xl transition-all">
            <Edit3 size={14} /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)}
              className="flex items-center gap-2 border border-white/10 text-text-m text-sm px-3 py-2 rounded-xl transition-all hover:border-white/20">
              <X size={14} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-accent hover:bg-accent-h text-white text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-60">
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        className="bg-surface border border-white/5 rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={profile?.full_name || 'Client'} size="xl" />
          <div>
            <h3 className="font-display font-bold text-lg text-text-p">{profile?.full_name}</h3>
            <p className="text-text-m text-sm">{profile?.email}</p>
            {profile?.phone && <p className="text-text-f text-sm">{profile.phone}</p>}
            <span className="inline-block mt-1.5 text-xs px-2.5 py-0.5 bg-cyan/15 text-cyan rounded-full">Client</span>
          </div>
        </div>

        {/* Company Info */}
        <div className="space-y-4">
          <h4 className="text-text-m text-xs font-semibold uppercase tracking-wider border-b border-white/5 pb-2">
            Company Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Building2, label:'Company Name',  key:'company_name', type:'text',  placeholder:'Acme Corp'        },
              { icon: FileText,  label:'Industry',       key:'industry',     type:'text',  placeholder:'Technology'       },
              { icon: Globe,     label:'Website',        key:'website',      type:'url',   placeholder:'https://...'      },
              { icon: FileText,  label:'GSTIN',          key:'gstin',        type:'text',  placeholder:'22AAAAA0000A1Z5'  },
              { icon: MapPin,    label:'City',           key:'city',         type:'text',  placeholder:'Hyderabad'        },
              { icon: MapPin,    label:'Country',        key:'country',      type:'text',  placeholder:'India'            },
            ].map(f => {
              const Icon = f.icon
              return (
                <div key={f.key}>
                  <label className="text-text-f text-xs flex items-center gap-1.5 mb-1.5">
                    <Icon size={11} />{f.label}
                  </label>
                  {editing ? (
                    <input type={f.type} placeholder={f.placeholder}
                      value={form[f.key]||''}
                      onChange={e => set(f.key, e.target.value)}
                      className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2 text-text-p text-sm outline-none transition-all placeholder:text-text-f" />
                  ) : (
                    <p className="text-text-p text-sm bg-surface2 border border-white/5 rounded-xl px-3 py-2">
                      {client?.[f.key] || <span className="text-text-f">Not set</span>}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Notes */}
          <div>
            <label className="text-text-f text-xs block mb-1.5">Notes / About</label>
            {editing ? (
              <textarea rows={3} value={form.notes||''}
                onChange={e => set('notes', e.target.value)}
                placeholder="Tell us about your company..."
                className="w-full bg-surface2 border border-white/10 focus:border-accent/40 rounded-xl px-3 py-2.5 text-text-p text-sm outline-none resize-none transition-all placeholder:text-text-f" />
            ) : (
              <p className="text-text-p text-sm bg-surface2 border border-white/5 rounded-xl px-3 py-2.5 min-h-16">
                {client?.notes || <span className="text-text-f">No notes added</span>}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Contacts */}
      {client?.contacts?.length > 0 && (
        <div className="bg-surface border border-white/5 rounded-2xl p-5">
          <h4 className="font-display font-bold text-sm text-text-p mb-3">Team Contacts</h4>
          <div className="space-y-2.5">
            {client.contacts.map(c => (
              <div key={c.id} className="flex items-center gap-3 bg-surface2 rounded-xl px-3 py-2.5">
                <Avatar name={c.full_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-text-p text-sm font-medium">{c.full_name}</p>
                    {c.is_primary && <span className="text-xs text-cyan bg-cyan/10 px-1.5 py-0.5 rounded-full">Primary</span>}
                  </div>
                  {c.designation && <p className="text-text-f text-xs">{c.designation}</p>}
                </div>
                {c.email && (
                  <a href={`mailto:${c.email}`} className="text-text-f text-xs hover:text-accent transition-colors">
                    <Mail size={13} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}