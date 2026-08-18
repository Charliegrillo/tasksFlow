'use client'

import { useEffect, useState } from 'react'
import { Building2, FileText, MessageSquare, Paperclip, Save, Sparkles, X } from 'lucide-react'
import type { Contact, CrmDeal } from '@/lib/db'

type Props = {
  open: boolean
  deal: CrmDeal | null
  contact: Contact | undefined
  onClose: () => void
}

type DealDetails = {
  comments: { id: number; author: string; content: string; createdAt: string }[]
  attachments: { id: number; name: string; pathname: string; size: number; contentType: string; createdAt: string }[]
}

export function CrmDealDialog({ open, deal, contact, onClose }: Props) {
  const [notes, setNotes] = useState('')
  const [comment, setComment] = useState('')
  const [details, setDetails] = useState<DealDetails>({ comments: [], attachments: [] })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !deal) return

    setLoading(true)
    fetch(`/api/crm/deals/${deal.id}/details`)
      .then(r => r.json())
      .then(result => {
        const data = result.data ?? { comments: [], attachments: [] }
        setDetails(data)
        setNotes(deal.notes ?? '')
      })
      .finally(() => setLoading(false))
  }, [open, deal])

  async function persistNotes() {
    if (!deal) return
    setSaving(true)
    const res = await fetch(`/api/crm/deals/${deal.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }) })
    setSaving(false)
    if (!res.ok) return
    onClose()
  }

  async function addComment() {
    if (!deal || !comment.trim()) return
    const res = await fetch(`/api/crm/deals/${deal.id}/details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'comment', author: contact?.name ?? 'Usuario', content: comment }),
    })
    if (!res.ok) return
    const { data } = await res.json()
    setDetails(v => ({ ...v, comments: [...v.comments, data] }))
    setComment('')
  }

  async function uploadFile(file: File) {
    if (!deal) return
    const form = new FormData()
    form.append('file', file)
    form.append('dealId', String(deal.id))
    const res = await fetch('/api/crm/deals/uploads', { method: 'POST', body: form })
    if (!res.ok) return
    const { data } = await res.json()
    setDetails(v => ({ ...v, attachments: [data, ...v.attachments] }))
  }

  async function removeComment(commentId: number) {
    if (!deal) return
    const res = await fetch(`/api/crm/deals/${deal.id}/details`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'comment', commentId }),
    })
    if (!res.ok) return
    setDetails(v => ({ ...v, comments: v.comments.filter(item => item.id !== commentId) }))
  }

  async function removeAttachment(attachmentId: number) {
    if (!deal) return
    const res = await fetch(`/api/crm/deals/${deal.id}/details`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'attachment', attachmentId }),
    })
    if (!res.ok) return
    setDetails(v => ({ ...v, attachments: v.attachments.filter(item => item.id !== attachmentId) }))
  }

  if (!open || !deal) return null

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-background/70 p-4 backdrop-blur-sm" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="flex max-h-[82vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-border/80 bg-card shadow-[0_20px_80px_rgba(15,23,42,0.18)] ring-1 ring-border/60">
        <div className="flex items-center justify-between border-b border-border/80 bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-sm bg-gradient-to-br from-violet-500/20 to-primary/10 text-primary ring-1 ring-primary/20">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">Deal</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">{contact?.name ?? 'Contacto'}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {contact?.company ? contact.company : 'Sin empresa asociada'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-sm border border-border bg-background/60 p-2.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label="Cerrar">
            <X className="size-4" />
          </button>
        </div>

        <div className="grid flex-1 gap-0 overflow-hidden lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col overflow-y-auto border-b border-border/80 lg:border-b-0 lg:border-r">
            <div className="space-y-5 p-6">
              <div className="rounded-sm border border-border/80 bg-gradient-to-b from-secondary/40 to-background p-4">
                <div className="mb-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground"><Sparkles className="size-4 text-violet-500" /> Notas del deal</label>
                  <span className="rounded-sm border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Resumen</span>
                </div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={8} placeholder="Añade contexto del cliente, próximos pasos, objecciones, presupuesto o indicadores clave..." className="w-full resize-none bg-background/80 px-3 py-3 text-sm leading-6 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" />
              </div>

              <div className="flex items-center justify-between rounded-sm border border-dashed border-border bg-secondary/20 px-4 py-3">
                <div>
                  <p className="text-xs tracking-[0.2em] text-muted-foreground">Última actualización</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{new Date(deal.updatedAt).toLocaleString('es-ES')}</p>
                </div>
                <button onClick={persistNotes} disabled={saving} className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
                  <Save className="size-4" />
                  {saving ? 'Guardando...' : 'Guardar notas'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden bg-background/60">
            <div className="border-b border-border/80 px-5 py-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><MessageSquare className="size-4 text-primary" /> Comentarios ({details.comments.length})</h3>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto px-5 py-4">
              {loading ? <p className="text-sm text-muted-foreground">Cargando...</p> : details.comments.length === 0 ? (
                <div className="rounded-sm border border-dashed border-border bg-secondary/20 px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay comentarios todavía.
                </div>
              ) : details.comments.map(item => (
                <div key={item.id} className="rounded-sm border border-border/80g-secondary/30 p-2 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{item.author}</span>
                    <button onClick={() => removeComment(item.id)} className="text-[10px] text-muted-foreground transition hover:text-destructive">Eliminar</button>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/90">{item.content}</p>
                  <p className="mt-2 text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleString('es-ES')}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border/80 px-5 py-4">
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Escribe un comentario para este deal..." className="w-full resize-none bg-background/80 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <div className="mt-2 flex justify-end">
                <button onClick={addComment} disabled={!comment.trim()} className="rounded-sm bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">Guardar comentario</button>
              </div>
            </div>

            <div className="border-t border-border/80 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold"><Paperclip className="size-4 text-violet-500" /> Archivos ({details.attachments.length})</h3>
                <label className="cursor-pointer rounded-sm border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary">
                  <span>Adjuntar</span>
                  <input type="file" className="sr-only" onChange={e => { const file = e.target.files?.[0]; if (file) void uploadFile(file); e.currentTarget.value = '' }} />
                </label>
              </div>
              <div className="mt-3 space-y-2">
                {details.attachments.length === 0 ? (
                  <div className="rounded-sm border border-dashed border-border bg-secondary/20 px-4 py-6 text-center text-sm text-muted-foreground">
                    Sin archivos adjuntos.
                  </div>
                ) : details.attachments.map(item => (
                  <div key={item.id} className="flex items-center gap-3 rounded-sm border border-border/80 bg-secondary/20 px-3 py-2.5">
                    <div className="grid size-10 place-items-center rounded-sm bg-background text-[10px] font-bold uppercase text-muted-foreground ring-1 ring-border">
                      {item.name.split('.').pop() || 'FILE'}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{item.name}</span>
                    <a href={item.pathname} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline">Abrir</a>
                    <button onClick={() => removeAttachment(item.id)} className="text-xs text-muted-foreground transition hover:text-destructive">Eliminar</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
