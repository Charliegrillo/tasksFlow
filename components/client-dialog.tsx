'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

type ClientDialogProps = {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; email: string; company: string }) => void
  initialData?: { name: string; email: string; company: string }
  title: string
}

export function ClientDialog({ open, onClose, onSave, initialData, title }: ClientDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? '')
      setEmail(initialData?.email ?? '')
      setCompany(initialData?.company ?? '')
    }
  }, [open, initialData])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), email: email.trim(), company: company.trim() })
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
            <label htmlFor="client-name" className="text-sm font-medium">Nombre</label>
            <input id="client-name" value={name} onChange={e => setName(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Nombre del cliente" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="client-email" className="text-sm font-medium">Email</label>
            <input id="client-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="contacto@empresa.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="client-company" className="text-sm font-medium">Empresa</label>
            <input id="client-company" value={company} onChange={e => setCompany(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Nombre de la empresa" />
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
