'use client'

import { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, KeyRound, Lock, Plus, Shield, Trash2, X } from 'lucide-react'

type SecretType = 'password' | 'config' | 'key' | 'token' | 'other'

type Secret = {
  id: number
  spaceId: number
  name: string
  value: string
  type: SecretType
  notes: string
  createdAt: string
}

type Props = {
  spaceId: number
  onClose: () => void
}

const typeOptions: Array<{ value: SecretType; label: string }> = [
  { value: 'password', label: 'Password' },
  { value: 'config', label: 'Configuración' },
  { value: 'key', label: 'API Key' },
  { value: 'token', label: 'Token' },
  { value: 'other', label: 'Otro' },
]

export function SpaceSecretsPanel({ spaceId, onClose }: Props) {
  const [password, setPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [form, setForm] = useState({ name: '', value: '', type: 'password' as SecretType, notes: '' })
  const [showForm, setShowForm] = useState(false)
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
        setSecrets(secretResult.data ?? [])
        return
      }

      setIsUnlocked(false)
      setPassword('')
      setSecrets([])
      setForm({ name: '', value: '', type: 'password', notes: '' })
      setShowForm(false)
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
    setSecrets(secretResult.data ?? [])
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
    setForm({ name: '', value: '', type: 'password', notes: '' })
    setShowForm(false)
  }

  async function deleteSecret(id: number) {
    const response = await fetch(`/api/spaces/${spaceId}/secrets?secretId=${id}`, { method: 'DELETE' })
    if (!response.ok) return
    setSecrets(v => v.filter(item => item.id !== id))
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10"><Shield className="size-5 text-primary" /></div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Espacio seguro</p>
              <h2 className="mt-1 text-lg font-semibold">Credenciales y secretos</h2>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar"><X className="size-4" /></button>
        </div>

        {!isUnlocked ? (
          <div className="mt-6 rounded-xl border border-border bg-background/60 p-4">
            <label className="text-sm font-medium text-foreground">Contraseña del espacio</label>
            <div className="mt-3 flex gap-2">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && passwordValid) void unlock() }}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Ingresa la contraseña"
                autoFocus
              />
              <button
                type="button"
                onClick={() => void unlock()}
                disabled={!passwordValid}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Desbloquear
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Registros protegidos</p>
              <button onClick={() => setShowForm(v => !v)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="size-3.5" /> Agregar
              </button>
            </div>

            {showForm && (
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} placeholder="Nombre del secreto" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <select value={form.type} onChange={e => setForm(v => ({ ...v, type: e.target.value as SecretType }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                    {typeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <input value={form.value} onChange={e => setForm(v => ({ ...v, value: e.target.value }))} placeholder="Valor / contraseña / key" className="sm:col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <textarea value={form.notes} onChange={e => setForm(v => ({ ...v, notes: e.target.value }))} rows={2} placeholder="Notas adicionales" className="sm:col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary">Cancelar</button>
                  <button onClick={() => void addSecret()} disabled={!form.name.trim() || !form.value.trim()} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Guardar</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {secrets.length ? secrets.map(secret => (
                <div key={secret.id} className="rounded-xl border border-border bg-background/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><KeyRound className="size-4" /></div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{secret.name}</p>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{secret.type}</p>
                      </div>
                    </div>
                    <button onClick={() => void deleteSecret(secret.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive" aria-label={`Eliminar ${secret.name}`}><Trash2 className="size-4" /></button>
                  </div>

                  <div className="mt-3 rounded-lg border border-border bg-background px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Valor</span>
                      <button type="button" onClick={() => setShowValue(v => ({ ...v, [secret.id]: !v[secret.id] }))} className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
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
                <div className="rounded-xl border border-dashed border-border bg-background/60 p-6 text-center text-sm text-muted-foreground">
                  No hay secretos guardados en este espacio.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
