'use client'

import { useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, CalendarDays, MessageSquareText, PhoneCall, X } from 'lucide-react'
import type { CrmInteraction } from '@/lib/db'

const interactionTypes: { value: CrmInteraction['type']; label: string; hint: string; icon: typeof BriefcaseBusiness }[] = [
  { value: 'presupuesto', label: 'Presupuesto', hint: 'Se envió propuesta o presupuesto', icon: BriefcaseBusiness },
  { value: 'respuesta', label: 'Respuesta', hint: 'Se recibió feedback o respuesta', icon: MessageSquareText },
  { value: 'videollamada', label: 'Videollamada', hint: 'Se programó una reunión virtual', icon: PhoneCall },
]

const typeTemplates: Record<CrmInteraction['type'], string> = {
  presupuesto: 'Se envió el presupuesto con alcance, plazo y condiciones principales.',
  respuesta: 'Se recibió la respuesta del cliente con comentarios y próximos pasos.',
  videollamada: 'Se coordinó una videollamada para revisar necesidades y cerrar dudas.'
}

type CrmInteractionDialogProps = {
  open: boolean
  onClose: () => void
  onSave: (data: { type: CrmInteraction['type']; description: string; date: string }) => void
  title: string
}

export function CrmInteractionDialog({ open, onClose, onSave, title }: CrmInteractionDialogProps) {
  const [type, setType] = useState<CrmInteraction['type']>('presupuesto')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split('T')[0]
      setType('presupuesto')
      setDescription(typeTemplates.presupuesto)
      setDate(today)
    }
  }, [open])

  const selectedType = useMemo(
    () => interactionTypes.find(item => item.value === type) ?? interactionTypes[0],
    [type],
  )

  const isValid = description.trim().length > 0 && date.length > 0

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    onSave({ type, description: description.trim(), date })
    onClose()
  }

  function applyTemplate(nextType: CrmInteraction['type']) {
    setType(nextType)
    setDescription(typeTemplates[nextType])
  }

  const inputClass = 'w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-lg rounded-3xl border border-border bg-card p-5 shadow-2xl shadow-black/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">CRM</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label="Cerrar"><X className="size-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <div className="rounded-2xl border border-border bg-secondary/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Tipo de interacción</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {interactionTypes.map(it => {
                const Icon = it.icon
                const active = type === it.value
                return (
                  <button
                    key={it.value}
                    type="button"
                    onClick={() => applyTemplate(it.value)}
                    className={`rounded-2xl border p-3 text-left transition ${active ? 'border-primary bg-primary/5 text-foreground shadow-sm' : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-background'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`grid size-8 place-items-center rounded-xl ${active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                        <Icon className="size-4" />
                      </span>
                      <span className="text-sm font-medium">{it.label}</span>
                    </div>
                    <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{it.hint}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Fecha</label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`${inputClass} pl-9`} />
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-border bg-background px-3 py-2 text-[11px] text-muted-foreground">
              {selectedType.label}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Resumen de la interacción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`${inputClass} min-h-[98px] resize-none`}
              placeholder="Describe lo que ocurrió, el feedback del cliente o el siguiente paso..."
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Se guarda como seguimiento del deal</span>
              <span>{description.length}/300</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground">Cancelar</button>
            <button type="submit" disabled={!isValid} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">Guardar interacción</button>
          </div>
        </form>
      </div>
    </div>
  )
}
