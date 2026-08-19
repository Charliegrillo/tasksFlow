'use client'

import { useState, useEffect } from 'react'
import { X, Archive, RotateCcw, Trash2 } from 'lucide-react'
import type { Milestone } from '@/lib/db'

interface ArchivedMilestonesModalProps {
  open: boolean
  clientId: number | null
  onClose: () => void
  onRestore: (milestone: Milestone) => void
  onDelete: (milestone: Milestone) => void
}

export function ArchivedMilestonesModal({ open, clientId, onClose, onRestore, onDelete }: ArchivedMilestonesModalProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !clientId) return
    setLoading(true)
    fetch(`/api/milestones?clientId=${clientId}&archived=true`)
      .then(r => r.json())
      .then(d => setMilestones(d.data ?? []))
      .finally(() => setLoading(false))
  }, [open, clientId])

  function handleRestore(milestone: Milestone) {
    onRestore(milestone)
    setMilestones(v => v.filter(m => m.id !== milestone.id))
  }

  function handleDelete(milestone: Milestone) {
    onDelete(milestone)
    setMilestones(v => v.filter(m => m.id !== milestone.id))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-sm border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Hitos archivados</h2>
          </div>
          <button onClick={onClose} className="rounded-sm p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar">
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay hitos archivados.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {milestones.map(milestone => (
                <div key={milestone.id} className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className={`size-3 shrink-0 rounded-sm ${milestone.color}`} />
                    <p className="truncate text-sm font-medium">{milestone.name}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => handleRestore(milestone)}
                      className="rounded-sm border border-border p-1.5 text-muted-foreground transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500"
                      aria-label={`Restaurar hito ${milestone.name}`}
                      title="Restaurar"
                    >
                      <RotateCcw className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(milestone)}
                      className="rounded-sm border border-border p-1.5 text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Eliminar hito ${milestone.name}`}
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
