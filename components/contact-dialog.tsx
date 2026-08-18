'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

type ContactDialogProps = {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; email: string; phone: string; company: string; position: string; address: string; website: string; notes: string }) => void
  initialData?: { name: string; email: string; phone: string; company: string; position: string; address: string; website: string; notes: string }
  title: string
}

export function ContactDialog({ open, onClose, onSave, initialData, title }: ContactDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? '')
      setEmail(initialData?.email ?? '')
      setPhone(initialData?.phone ?? '')
      setCompany(initialData?.company ?? '')
      setPosition(initialData?.position ?? '')
      setAddress(initialData?.address ?? '')
      setWebsite(initialData?.website ?? '')
      setNotes(initialData?.notes ?? '')
    }
  }, [open, initialData])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), email: email.trim(), phone: phone.trim(), company: company.trim(), position: position.trim(), address: address.trim(), website: website.trim(), notes: notes.trim() })
    onClose()
  }

  const inputClass = 'rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-sm border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-sm p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar"><X className="size-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Nombre *</label>
              <input value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Nombre completo" autoFocus />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Empresa</label>
              <input value={company} onChange={e => setCompany(e.target.value)} className={inputClass} placeholder="Empresa" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="email@ejemplo.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Teléfono</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+1 234 567 890" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Cargo</label>
              <input value={position} onChange={e => setPosition(e.target.value)} className={inputClass} placeholder="Gerente de Proyecto" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Sitio web</label>
              <input value={website} onChange={e => setWebsite(e.target.value)} className={inputClass} placeholder="https://..." />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Dirección</label>
            <input value={address} onChange={e => setAddress(e.target.value)} className={inputClass} placeholder="Dirección completa" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Notas</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className={inputClass + ' min-h-[80px] resize-none'} placeholder="Notas adicionales..." />
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
