'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { BoardPaymentStatus } from '@/lib/db'

const typeOptions = [
  { value: 'roadmap', label: 'Roadmap', description: 'Planificación de versiones y features' },
  { value: 'maintenance', label: 'Mantenimiento', description: 'Soporte y bugs' },
  { value: 'backlog', label: 'Backlog', description: 'Ideas y tareas pendientes' },
]

const paymentOptions: { value: BoardPaymentStatus; label: string; color: string }[] = [
  { value: 'pendiente', label: 'Pendiente', color: 'border-amber-500 text-amber-500' },
  { value: 'pagado', label: 'Pagado', color: 'border-emerald-500 text-emerald-500' },
  { value: 'cancelado', label: 'Cancelado', color: 'border-destructive text-destructive' },
]

type BoardDialogProps = {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; type: string; paymentStatus?: BoardPaymentStatus }) => void
  initialData?: { name: string; type: string; paymentStatus?: BoardPaymentStatus }
  title: string
}

export function BoardDialog({ open, onClose, onSave, initialData, title }: BoardDialogProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('roadmap')
  const [paymentStatus, setPaymentStatus] = useState<BoardPaymentStatus>('pendiente')

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? '')
      setType(initialData?.type ?? 'roadmap')
      setPaymentStatus(initialData?.paymentStatus ?? 'pendiente')
    }
  }, [open, initialData])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), type, paymentStatus })
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
            <label htmlFor="board-name" className="text-sm font-medium">Nombre</label>
            <input id="board-name" value={name} onChange={e => setName(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Ej: Versión 1.0" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Tipo</label>
            <div className="flex gap-2">
              {typeOptions.map(opt => (
                <button key={opt.value} type="button" onClick={() => setType(opt.value)} className={`flex-1 rounded-lg border px-3 py-2.5 text-left transition-all ${type === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80 hover:bg-secondary/50'}`}>
                  <span className={`text-sm font-medium ${type === opt.value ? 'text-primary' : 'text-foreground'}`}>{opt.label}</span>
                  <p className="mt-0.5 text-xs text-muted-foreground">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>
          {initialData && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Estado de pago</label>
              <div className="flex gap-2">
                {paymentOptions.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setPaymentStatus(opt.value)} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${paymentStatus === opt.value ? opt.color + ' bg-current/5' : 'border-border text-muted-foreground hover:bg-secondary'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary">Cancelar</button>
            <button type="submit" disabled={!name.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
