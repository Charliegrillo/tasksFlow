'use client'

import { useEffect, useState } from 'react'
import { Plus, Settings, Trash2 } from 'lucide-react'
import type { Contact, CrmDeal, CrmInteraction, CrmStage } from '@/lib/db'
import { CrmDealCard } from './crm-deal-card'
import { CrmStageDialog } from './crm-stage-dialog'
import { CrmInteractionDialog } from './crm-interaction-dialog'
import { CrmDealDialog } from './crm-deal-dialog'
import { ContactSelectDialog } from './contact-select-dialog'
import { ConfirmDialog } from './confirm-dialog'

type CrmBoardProps = {
  stages: CrmStage[]
  deals: CrmDeal[]
  contacts: Contact[]
  interactions: Record<number, CrmInteraction[]>
  onAddDeal: (contactId: number, stageId: number) => void
  onMoveDeal: (dealId: number, stageId: number) => void
  onDeleteDeal: (dealId: number) => void
  onAddStage: (name: string, color: string) => void
  onDeleteStage: (id: number) => void
  onAddInteraction: (dealId: number, type: CrmInteraction['type'], description: string, date: string) => void
  onDeleteInteraction: (id: number) => void
  onRefreshInteractions: (dealId: number) => void
  onAddContact: () => void
}

export function CrmBoard({ stages, deals, contacts, interactions, onAddDeal, onMoveDeal, onDeleteDeal, onAddStage, onDeleteStage, onAddInteraction, onDeleteInteraction, onRefreshInteractions, onAddContact }: CrmBoardProps) {
  const [stageDialog, setStageDialog] = useState<{ open: boolean; edit?: CrmStage }>({ open: false })
  const [interactionDialog, setInteractionDialog] = useState<{ open: boolean; dealId: number | null }>({ open: false, dealId: null })
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => {} })
  const [dragOverStage, setDragOverStage] = useState<number | null>(null)
  const [contactSelectStageId, setContactSelectStageId] = useState<number | null>(null)
  const [dealDialog, setDealDialog] = useState<{ open: boolean; dealId: number | null }>({ open: false, dealId: null })
  const selectedDeal = dealDialog.dealId !== null ? deals.find(deal => deal.id === dealDialog.dealId) ?? null : null

  function handleDragOver(e: React.DragEvent, stageId: number) {
    e.preventDefault()
    setDragOverStage(stageId)
  }

  function handleDrop(e: React.DragEvent, stageId: number) {
    e.preventDefault()
    const dealId = Number(e.dataTransfer.getData('text/plain'))
    if (dealId) onMoveDeal(dealId, stageId)
    setDragOverStage(null)
  }

  function handleAddContactForDeal(stageId: number) {
    if (contacts.length === 0) {
      onAddContact()
      return
    }
    setContactSelectStageId(stageId)
  }

  return (
    <div className="px-5 py-6 md:px-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {stages.map(s => <span key={s.id} className={`h-2 w-8 rounded-full ${s.color}`} />)}
          <span className="text-sm text-muted-foreground">{deals.length} deals</span>
        </div>
        <button onClick={() => setStageDialog({ open: true })} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"><Settings className="size-4" /> Gestionar etapas</button>
      </div>
      <div className="mt-6 flex items-start gap-5 overflow-x-auto pb-4">
        {stages.map(stage => {
          const stageDeals = deals.filter(d => d.stageId === stage.id)
          return (
            <div key={stage.id} onDragOver={e => handleDragOver(e, stage.id)} onDragLeave={() => setDragOverStage(null)} onDrop={e => handleDrop(e, stage.id)} className={`flex w-[300px] min-w-[300px] flex-col rounded-xl p-2 transition-colors ${dragOverStage === stage.id ? 'bg-secondary/70' : ''}`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`size-2.5 rounded-full ${stage.color}`} />
                  <h3 className="text-sm font-semibold">{stage.name}</h3>
                  <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">{stageDeals.length}</span>
                </div>
                <button onClick={() => { setConfirmDialog({ open: true, title: 'Eliminar etapa', message: `Ã‚Â¿Eliminar la etapa "${stage.name}" y sus deals?`, onConfirm: () => { onDeleteStage(stage.id); setConfirmDialog(v => ({ ...v, open: false })) } }) }} className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
              </div>
              <div className="flex flex-1 flex-col gap-3">
                {stageDeals.map(deal => (
                  <div key={deal.id} draggable onDragStart={e => { e.dataTransfer.setData('text/plain', String(deal.id)); e.dataTransfer.effectAllowed = 'move' }}>
                    <CrmDealCard deal={deal} contact={contacts.find(c => c.id === deal.contactId)} interactions={interactions[deal.id] ?? []} onOpenDeal={dealId => setDealDialog({ open: true, dealId })} onOpenInteraction={dealId => setInteractionDialog({ open: true, dealId })} onDeleteInteraction={onDeleteInteraction} onDeleteDeal={id => { setConfirmDialog({ open: true, title: 'Eliminar deal', message: '¿Eliminar este deal y sus interacciones?', onConfirm: () => { onDeleteDeal(id); setDealDialog(v => (v.dealId === id ? { ...v, open: false, dealId: null } : v)); setConfirmDialog(v => ({ ...v, open: false })) } }) }} />
                  </div>
                ))}
              </div>
              <button onClick={() => handleAddContactForDeal(stage.id)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary"><Plus className="size-4" /> Añadir deal</button>
            </div>
          )
        })}
      </div>
      <CrmStageDialog open={stageDialog.open} onClose={() => setStageDialog({ open: false })} onSave={data => { onAddStage(data.name, data.color); setStageDialog({ open: false }) }} title="Nueva etapa" />
      <CrmInteractionDialog open={interactionDialog.open} onClose={() => setInteractionDialog({ open: false, dealId: null })} onSave={data => { if (interactionDialog.dealId) onAddInteraction(interactionDialog.dealId, data.type, data.description, data.date); setInteractionDialog({ open: false, dealId: null }) }} title="Nueva interacción" />
      <CrmDealDialog open={dealDialog.open} deal={selectedDeal} contact={selectedDeal ? contacts.find(c => c.id === selectedDeal.contactId) : undefined} onClose={() => setDealDialog({ open: false, dealId: null })} />
      <ContactSelectDialog
        open={contactSelectStageId !== null}
        onClose={() => setContactSelectStageId(null)}
        onSelect={contactId => { if (contactSelectStageId !== null) onAddDeal(contactId, contactSelectStageId); setContactSelectStageId(null) }}
        contacts={contacts}
        assignedContactIds={deals.map(deal => deal.contactId)}
      />
      <ConfirmDialog open={confirmDialog.open} title={confirmDialog.title} message={confirmDialog.message} onConfirm={confirmDialog.onConfirm} onCancel={() => setConfirmDialog(v => ({ ...v, open: false }))} />
    </div>
  )
}
