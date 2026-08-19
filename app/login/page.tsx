'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const REMEMBER_EMAIL_KEY = 'tasksflow_remember_email'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY)
    if (saved) {
      setEmail(saved)
      setRemember(true)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión')
        return
      }
      if (remember) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email)
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY)
      }
      router.push('/')
      router.refresh()
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
          <p className="mt-2 text-sm text-muted-foreground">Inicia sesión en tu cuenta</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-border bg-card p-6">
          {error && <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" autoFocus />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">Contraseña</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" autoFocus={!!email} />
          </div>
          <div className="flex items-center gap-2">
            <input id="remember" type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="size-4 rounded border-border accent-primary" />
            <label htmlFor="remember" className="text-sm text-muted-foreground">Recordarme</label>
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-sm bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
          <div className="flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-muted-foreground hover:text-foreground">¿Olvidaste tu contraseña?</Link>
            <Link href="/register" className="text-primary hover:underline">Crear cuenta</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
