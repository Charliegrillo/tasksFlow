'use client'

import { useEffect, useState } from 'react'
import { X, Search, UserPlus } from 'lucide-react'
import type { Contact } from '@/lib/db'

type ContactSelectDialogProps = {
  open: boolean
  onClose: () => void
  onSelect: (contactId: number) => void
  contacts: Contact[]
  assignedContactIds?: number[]
}

export function ContactSelectDialog({ open, onClose, onSelect, contacts, assignedContactIds = [] }: ContactSelectDialogProps) {
  const [search, setSearch] = useState('')

  useEffect(() => { if (open) setSearch('') }, [open])

  if (!open) return null

  const availableContacts = contacts.filter(contact => !assignedContactIds.includes(contact.id))

  const filtered = availableContacts.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)
  })

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="flex max-h-[70vh] w-full max-w-md flex-col rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Seleccionar contacto</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar"><X className="size-4" /></button>
        </div>

        <div className="border-b border-border px-6 py-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"><Search className="size-4 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Buscar por nombre, email o empresa..." autoFocus /></div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <UserPlus className="mb-2 size-8" />
              <p className="text-sm">{availableContacts.length === 0 ? 'Todos los contactos ya están en Pipelines' : 'No se encontraron contactos'}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 p-2">
              {filtered.map(contact => (
                <button key={contact.id} onClick={() => { onSelect(contact.id); onClose() }} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-secondary">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">{contact.name.slice(0, 2).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{contact.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{[contact.company, contact.email].filter(Boolean).join(' · ')}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
