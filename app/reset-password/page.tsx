'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al restablecer la contraseña')
        return
      }
      setMessage('Contraseña actualizada. Redirigiendo al login...')
      setTimeout(() => router.push('/login'), 2000)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-2xl font-bold">Token no válido</h1>
          <p className="text-sm text-muted-foreground">No se proporcionó un token de recuperación válido.</p>
          <Link href="/forgot-password" className="inline-block rounded-sm bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Solicitar nuevo token</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">TasksFlow</h1>
          <p className="mt-2 text-sm text-muted-foreground">Establece tu nueva contraseña</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-border bg-card p-6">
          {error && <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          {message && <p className="rounded-sm bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">{message}</p>}
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">Nueva contraseña</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <p className="mt-1 text-xs text-muted-foreground">Mínimo 6 caracteres</p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">Confirmar contraseña</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-sm bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">Volver al login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
