'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const COLORS = ['bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500', 'bg-rose-500', 'bg-orange-500', 'bg-teal-500', 'bg-pink-500']

type MilestoneDialogProps = {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; color: string }) => void
  initialData?: { name: string; color: string }
  title: string
}

export function MilestoneDialog({ open, onClose, onSave, initialData, title }: MilestoneDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? '')
      setColor(initialData?.color ?? COLORS[0])
    }
  }, [open, initialData])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), color })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="milestone-name" className="text-sm font-medium">Nombre</label>
            <input id="milestone-name" value={name} onChange={e => setName(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Ej: v1.0, Fase 2, Sprint 5" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)} className={`size-8 rounded-full ${c} ${color === c ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''}`} />
              ))}
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary">Cancelar</button>
            <button type="submit" disabled={!name.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
