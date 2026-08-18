'use client'

import { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, KeyRound, Pencil, Plus, Shield, Trash2, X } from 'lucide-react'

type Secret = {
  id: number
  spaceId: number
  name: string
  value: string
  type: string
  notes: string
  createdAt: string
}

type Props = {
  spaceId: number
  onClose: () => void
}

export function SpaceSecretsPanel({ spaceId, onClose }: Props) {
  const [password, setPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [quickNotes, setQuickNotes] = useState<Secret[]>([])
  const [quickNoteText, setQuickNoteText] = useState('')
  const [form, setForm] = useState({ name: '', value: '', notes: '' })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showValue, setShowValue] = useState<Record<number, boolean>>({})

  const passwordValid = useMemo(() => password.trim().length > 0, [password])

  useEffect(() => {
    async function prepareSpace() {
      const res = await fetch(`/api/spaces/${spaceId}`)
      const result = await res.json()
      const hasPassword = !!result?.data?.secretPassword

      if (!hasPassword) {
        setIsUnlocked(true)
        const secretRes = await fetch(`/api/spaces/${spaceId}/secrets`)
        const secretResult = await secretRes.json()
        const all = secretResult.data ?? []
        const notes = all.filter((s: Secret) => s.name === 'Nota rápida')
        setQuickNotes(notes)
        setQuickNoteText(notes.length > 0 ? notes[0].value : '')
        setSecrets(all.filter((s: Secret) => s.name !== 'Nota rápida'))
        return
      }

      setIsUnlocked(false)
      setPassword('')
      setSecrets([])
      setQuickNotes([])
      setForm({ name: '', value: '', notes: '' })
      setShowForm(false)
      setEditingId(null)
    }

    void prepareSpace()
  }, [spaceId])

  async function unlock() {
    const response = await fetch(`/api/spaces/${spaceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    const result = await response.json()
    if (!result.valid) {
      alert('Contraseña incorrecta')
      return
    }

    setIsUnlocked(true)
    const secretRes = await fetch(`/api/spaces/${spaceId}/secrets`)
    const secretResult = await secretRes.json()
    const all = secretResult.data ?? []
    const notes = all.filter((s: Secret) => s.name === 'Nota rápida')
    setQuickNotes(notes)
    setQuickNoteText(notes.length > 0 ? notes[0].value : '')
    setSecrets(all.filter((s: Secret) => s.name !== 'Nota rápida'))
  }

  async function saveQuickNote() {
    if (!quickNoteText.trim()) return
    if (quickNotes.length > 0) {
      const existing = quickNotes[0]
      const response = await fetch(`/api/spaces/${spaceId}/secrets`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: existing.id, value: quickNoteText.trim() })
      })
      if (!response.ok) return
      const { data } = await response.json()
      setQuickNotes([data])
    } else {
      const response = await fetch(`/api/spaces/${spaceId}/secrets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Nota rápida', value: quickNoteText.trim(), notes: '' })
      })
      if (!response.ok) return
      const { data } = await response.json()
      setQuickNotes([data])
    }
  }

  async function addSecret() {
    if (!form.name.trim() || !form.value.trim()) return
    const response = await fetch(`/api/spaces/${spaceId}/secrets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (!response.ok) return
    const { data } = await response.json()
    setSecrets(v => [...v, data])
    resetForm()
  }

  async function updateSecret() {
    if (!editingId || !form.name.trim() || !form.value.trim()) return
    const response = await fetch(`/api/spaces/${spaceId}/secrets`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, name: form.name.trim(), value: form.value, notes: form.notes })
    })
    if (!response.ok) return
    const { data } = await response.json()
    setSecrets(v => v.map(s => s.id === editingId ? data : s))
    resetForm()
  }

  async function deleteSecret(id: number) {
    const response = await fetch(`/api/spaces/${spaceId}/secrets?secretId=${id}`, { method: 'DELETE' })
    if (!response.ok) return
    setSecrets(v => v.filter(item => item.id !== id))
  }

  function startEdit(secret: Secret) {
    setEditingId(secret.id)
    setForm({ name: secret.name, value: secret.value, notes: secret.notes })
    setShowForm(true)
  }

  function resetForm() {
    setForm({ name: '', value: '', notes: '' })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-sm border border-border bg-card shadow-xl">
        <div className="flex items-start justify-between gap-4 shrink-0 p-4 sm:p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-sm bg-primary/10"><Shield className="size-5 text-primary" /></div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Espacio seguro</p>
              <h2 className="mt-1 text-lg font-semibold">Credenciales y secretos</h2>
            </div>
          </div>
          <button onClick={onClose} className="rounded-sm p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar"><X className="size-4" /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:px-6 sm:py-4">
          {!isUnlocked ? (
            <div className="rounded-sm border border-border bg-background/60 p-4">
              <label className="text-sm font-medium text-foreground">Contraseña del espacio</label>
              <div className="mt-3 flex gap-2">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && passwordValid) void unlock() }}
                  className="flex-1 rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Ingresa la contraseña"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => void unlock()}
                  disabled={!passwordValid}
                  className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Desbloquear
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Notas rápidas - independiente */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Notas</p>
                  <button onClick={() => void saveQuickNote()} disabled={!quickNoteText.trim()} className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Guardar</button>
                </div>
                <textarea
                  value={quickNoteText}
                  onChange={e => setQuickNoteText(e.target.value)}
                  rows={5}
                  placeholder="Escribe o pega información rápida..."
                  className="w-full rounded-sm border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Secretos key/value */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Clave / Valor</p>
                  <button onClick={() => { setEditingId(null); setForm({ name: '', value: '', notes: '' }); setShowForm(v => !v) }} className="inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                    <Plus className="size-3.5" /> Agregar
                  </button>
                </div>

                {showForm && (
                  <div className="mb-3 rounded-sm border border-border bg-background/60 p-3">
                    <div className="grid gap-3">
                      <input value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} placeholder="Nombre" className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      <textarea value={form.value} onChange={e => setForm(v => ({ ...v, value: e.target.value }))} rows={4} placeholder="Contraseña, token, key, configuración..." className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <button onClick={resetForm} className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary">Cancelar</button>
                      <button onClick={() => editingId ? void updateSecret() : void addSecret()} disabled={!form.name.trim() || !form.value.trim()} className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{editingId ? 'Actualizar' : 'Guardar'}</button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {secrets.length ? secrets.map(secret => (
                    <div key={secret.id} className="group rounded-sm border border-border bg-background/60 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="grid size-8 place-items-center rounded-sm bg-primary/10 text-primary"><KeyRound className="size-4" /></div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{secret.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => startEdit(secret)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary" aria-label={`Editar ${secret.name}`}><Pencil className="size-4" /></button>
                          <button onClick={() => void deleteSecret(secret.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive" aria-label={`Eliminar ${secret.name}`}><Trash2 className="size-4" /></button>
                        </div>
                      </div>

                        <div className="mt-3 rounded-sm border border-border bg-background px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Valor</span>
                          <button type="button" onClick={() => setShowValue(v => ({ ...v, [secret.id]: !v[secret.id] }))} className="invisible group-hover:visible inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                            {showValue[secret.id] ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                            {showValue[secret.id] ? 'Ocultar' : 'Mostrar'}
                          </button>
                        </div>
                        <p className="mt-2 break-all text-sm font-medium text-foreground">
                          {showValue[secret.id] ? secret.value : '••••••••••••••••'}
                        </p>
                      </div>

                      {secret.notes && <p className="mt-3 text-xs text-muted-foreground">{secret.notes}</p>}
                    </div>
                  )) : (
                    <div className="rounded-sm border border-dashed border-border bg-background/60 p-6 text-center text-sm text-muted-foreground">
                      No hay secretos guardados en este espacio.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
