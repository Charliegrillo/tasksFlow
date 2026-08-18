'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const colorOptions = [
  { value: 'bg-violet-500', label: 'Violeta' },
  { value: 'bg-amber-500', label: 'Ámbar' },
  { value: 'bg-emerald-500', label: 'Esmeralda' },
  { value: 'bg-rose-500', label: 'Rosa' },
  { value: 'bg-sky-500', label: 'Celeste' },
  { value: 'bg-orange-500', label: 'Naranja' },
  { value: 'bg-teal-500', label: 'Turquesa' },
  { value: 'bg-pink-500', label: 'Fucsia' },
]

type SpaceDialogProps = {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; color: string; secretPassword?: string | null }) => void
  initialData?: { name: string; color: string; secretPassword?: string | null }
  title: string
}

export function SpaceDialog({ open, onClose, onSave, initialData, title }: SpaceDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('bg-violet-500')
  const [secretPassword, setSecretPassword] = useState('')

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? '')
      setColor(initialData?.color ?? 'bg-violet-500')
      setSecretPassword(initialData?.secretPassword ?? '')
    }
  }, [open, initialData])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), color, secretPassword: secretPassword.trim() || null })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-sm border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-sm p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="space-name" className="text-sm font-medium">Nombre</label>
            <input id="space-name" value={name} onChange={e => setName(e.target.value)} className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Nombre del espacio" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="space-password" className="text-sm font-medium">Contraseña del espacio</label>
            <input id="space-password" type="password" value={secretPassword} onChange={e => setSecretPassword(e.target.value)} className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Opcional: deja vacío si no quieres protegerlo" />
            <p className="text-xs text-muted-foreground">Sin contraseña, el candado no podrá desbloquearse.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2">
              {colorOptions.map(opt => (
                <button key={opt.value} type="button" onClick={() => setColor(opt.value)} className={`size-8 rounded-sm ${opt.value} transition-all ${color === opt.value ? 'ring-2 ring-offset-2 ring-offset-card ring-primary scale-110' : 'hover:scale-105'}`} aria-label={opt.label} />
              ))}
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-sm border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary">Cancelar</button>
            <button type="submit" disabled={!name.trim()} className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
