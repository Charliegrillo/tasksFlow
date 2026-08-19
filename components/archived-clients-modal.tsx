'use client'

import { useState, useEffect } from 'react'
import { X, Archive, RotateCcw, Trash2 } from 'lucide-react'
import type { Client } from '@/lib/db'

interface ArchivedClientsModalProps {
  open: boolean
  onClose: () => void
  onRestore: (client: Client) => void
  onDelete: (client: Client) => void
}

export function ArchivedClientsModal({ open, onClose, onRestore, onDelete }: ArchivedClientsModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch('/api/clients?archived=true')
      .then(r => r.json())
      .then(d => setClients(d.data ?? []))
      .finally(() => setLoading(false))
  }, [open])

  function handleRestore(client: Client) {
    onRestore(client)
    setClients(v => v.filter(c => c.id !== client.id))
  }

  function handleDelete(client: Client) {
    onDelete(client)
    setClients(v => v.filter(c => c.id !== client.id))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-sm border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Clientes archivados</h2>
          </div>
          <button onClick={onClose} className="rounded-sm p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar">
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay clientes archivados.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {clients.map(client => (
                <div key={client.id} className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-sm bg-primary/10 text-[10px] font-bold text-primary">{client.name.slice(0, 2).toUpperCase()}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{client.name}</p>
                      {client.company && <p className="truncate text-xs text-muted-foreground">{client.company}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => handleRestore(client)}
                      className="rounded-sm border border-border p-1.5 text-muted-foreground transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500"
                      aria-label={`Restaurar cliente ${client.name}`}
                      title="Restaurar"
                    >
                      <RotateCcw className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client)}
                      className="rounded-sm border border-border p-1.5 text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Eliminar cliente ${client.name}`}
                      title="Eliminar permanentemente"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
