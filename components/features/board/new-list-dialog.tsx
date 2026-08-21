'use client'

import { X } from 'lucide-react'

interface NewListDialogProps {
  open: boolean
  name: string
  onSetName: (name: string) => void
  onClose: () => void
  onSubmit: () => void
}

export function NewListDialog({ open, name, onSetName, onClose, onSubmit }: NewListDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-3 sm:p-4" role="presentation" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-sm border border-border bg-card p-4 shadow-xl sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Nueva lista</p>
          </div>
          <button onClick={onClose} className="rounded-sm p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar nueva lista"><X className="size-4" /></button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-foreground">Nombre</label>
          <input value={name} onChange={(e) => onSetName(e.target.value)} className="w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary" placeholder="Ej. En revisión" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSubmit() } }} />
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-sm border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary">Cancelar</button>
          <button onClick={onSubmit} className="rounded-sm bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50" disabled={!name.trim()}>Crear lista</button>
        </div>
      </div>
    </div>
  )
}
