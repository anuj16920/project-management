import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Globe, Phone, Mail, MoreHorizontal,
         FolderKanban, TrendingUp, Trash2, Edit3 } from 'lucide-react'
import Badge  from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { useRoleGuard } from '@/hooks/useRoleGuard'
import { crmAPI } from '@/lib/crmAPI'
import { toast } from 'sonner'

const STATUS_BADGE = {
  active:   'success',
  inactive: 'default',
  lead:     'accent',
  churned:  'error',
}

export default function ClientCard({ client, index = 0, onRefresh }) {
  const navigate = useNavigate()
  const { canCreateStaff } = useRoleGuard()
  const [menu, setMenu] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm(`Delete ${client.company_name || client.profile_uid}?`)) return
    try {
      await crmAPI.deleteClient(client.id)
      toast.success('Client deleted')
      onRefresh?.()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.35, delay: index * 0.07 }}
      onClick={() => navigate(`/admin/crm/${client.id}`)}
      className="bg-surface border border-white/5 hover:border-white/15 rounded-2xl p-5 cursor-pointer group transition-all hover:-translate-y-0.5 hover:shadow-card">

      {/* Top */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={client.company_name || 'Client'} size="md"
            src={client.avatar_url} />
          <div className="min-w-0">
            <h3 className="font-display font-bold text-sm text-text-p truncate group-hover:text-accent transition-colors">
              {client.company_name || '(No company)'}
            </h3>
            {client.industry && (
              <p className="text-text-f text-xs truncate">{client.industry}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={STATUS_BADGE[client.status] || 'default'} className="capitalize">
            {client.status}
          </Badge>
          {canCreateStaff && (
            <div className="relative">
              <button onClick={e => { e.stopPropagation(); setMenu(!menu) }}
                className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-f opacity-0 group-hover:opacity-100 transition-all">
                <MoreHorizontal size={14} />
              </button>
              {menu && (
                <div className="absolute right-0 top-8 w-36 glass border border-white/10 rounded-xl py-1 z-20 shadow-card-h"
                  onClick={e => e.stopPropagation()}>
                  <button onClick={() => navigate(`/admin/crm/${client.id}`)}
                    className="w-full text-left px-3 py-2 text-text-m text-xs hover:text-text-p hover:bg-white/5 flex items-center gap-2">
                    <Edit3 size={11} /> View / Edit
                  </button>
                  <button onClick={handleDelete}
                    className="w-full text-left px-3 py-2 text-error text-xs hover:bg-error/10 flex items-center gap-2">
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5 mb-4">
        {client.primaryContact?.email && (
          <div className="flex items-center gap-2 text-text-f text-xs">
            <Mail size={11} /><span className="truncate">{client.primaryContact.email}</span>
          </div>
        )}
        {client.primaryContact?.phone && (
          <div className="flex items-center gap-2 text-text-f text-xs">
            <Phone size={11} /><span>{client.primaryContact.phone}</span>
          </div>
        )}
        {client.website && (
          <div className="flex items-center gap-2 text-text-f text-xs">
            <Globe size={11} />
            <span className="truncate text-accent">{client.website.replace(/https?:\/\//,'')}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
        <div className="text-center">
          <p className="text-text-p text-sm font-bold tabular-nums">{client.activeProjects}</p>
          <p className="text-text-f text-xs flex items-center justify-center gap-1">
            <FolderKanban size={9} /> Projects
          </p>
        </div>
        <div className="text-center">
          <p className="text-text-p text-sm font-bold tabular-nums">{client.openDeals}</p>
          <p className="text-text-f text-xs">Open Deals</p>
        </div>
        <div className="text-center">
          <p className="text-success text-sm font-bold tabular-nums">
            ${(client.total_value||0).toLocaleString()}
          </p>
          <p className="text-text-f text-xs flex items-center justify-center gap-1">
            <TrendingUp size={9} /> Value
          </p>
        </div>
      </div>
    </motion.div>
  )
}