'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const colorOptions = ['bg-slate-400', 'bg-amber-500', 'bg-violet-500', 'bg-emerald-500', 'bg-red-500', 'bg-blue-500', 'bg-pink-500', 'bg-cyan-500']

type CrmStageDialogProps = {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; color: string }) => void
  initialData?: { name: string; color: string }
  title: string
}

export function CrmStageDialog({ open, onClose, onSave, initialData, title }: CrmStageDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('bg-violet-500')

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? '')
      setColor(initialData?.color ?? 'bg-violet-500')
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
      <div onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar"><X className="size-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Nombre *</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Nombre de la etapa" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2">
              {colorOptions.map(c => (
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
