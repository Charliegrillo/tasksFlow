'use client'

import { useEffect, useState } from 'react'
import { Paperclip, Phone, Mail, Building2, Calendar, Trash2, Plus } from 'lucide-react'
import type { Contact, CrmDeal, CrmInteraction, CrmStage } from '@/lib/db'

const typeLabels: Record<CrmInteraction['type'], string> = { presupuesto: 'Presupuesto', respuesta: 'Respuesta', videollamada: 'Videollamada' }
const typeIcons: Record<CrmInteraction['type'], typeof Mail> = { presupuesto: Paperclip, respuesta: Mail, videollamada: Phone }

type CrmDealCardProps = {
  deal: CrmDeal
  contact: Contact | undefined
  interactions: CrmInteraction[]
  onOpenDeal: (dealId: number) => void
  onOpenInteraction: (dealId: number) => void
  onDeleteInteraction: (id: number) => void
  onDeleteDeal: (id: number) => void
}

export function CrmDealCard({ deal, contact, interactions, onOpenDeal, onOpenInteraction, onDeleteInteraction, onDeleteDeal }: CrmDealCardProps) {
  if (!contact) return null

  return (
    <div role="button" tabIndex={0} onClick={() => onOpenDeal(deal.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenDeal(deal.id) } }} className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary/40 hover:bg-secondary/40 cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">{contact.name}</h3>
          {contact.company && <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><Building2 className="size-3" />{contact.company}</p>}
        </div>
        <button type="button" onClick={e => { e.stopPropagation(); onDeleteDeal(deal.id) }} className="rounded p-1 text-muted-foreground hover:text-destructive" aria-label="Eliminar deal"><Trash2 className="size-3.5" /></button>
      </div>
      {deal.budgetAmount > 0 && <p className="mt-2 rounded-lg bg-secondary px-2 py-1 text-xs font-medium">${deal.budgetAmount.toLocaleString()}</p>}
      {contact.email && <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><Mail className="size-3" />{contact.email}</p>}
      {contact.phone && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Phone className="size-3" />{contact.phone}</p>}
      {interactions.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Actividad reciente</p>
          {interactions.slice(0, 3).map(inter => {
            const Icon = typeIcons[inter.type]
            return (
              <div key={inter.id} className="flex items-start gap-2 rounded-lg bg-secondary/50 px-2 py-1.5">
                <Icon className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium">{typeLabels[inter.type]}</p>
                  {inter.description && <p className="text-[11px] text-muted-foreground truncate">{inter.description}</p>}
                </div>
                <button onClick={e => { e.stopPropagation(); onDeleteInteraction(inter.id) }} className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive"><Trash2 className="size-2.5" /></button>
              </div>
            )
          })}
        </div>
      )}
      <button type="button" onClick={e => { e.stopPropagation(); onOpenInteraction(deal.id) }} className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary"><Plus className="size-3" /> Interacción</button>
    </div>
  )
}
