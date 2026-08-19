'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al procesar la solicitud')
        return
      }
      setMessage(data.message || 'Si el email existe, recibirás un enlace de recuperación. Revisa la consola del servidor para el token.')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">TasksFlow</h1>
          <p className="mt-2 text-sm text-muted-foreground">Recupera tu contraseña</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-border bg-card p-6">
          {error && <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          {message && <p className="rounded-sm bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">{message}</p>}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-sm bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">Volver al login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
