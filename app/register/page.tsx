'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al registrar')
        return
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
          <p className="mt-2 text-sm text-muted-foreground">Crea tu cuenta</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-border bg-card p-6">
          {error && <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">Nombre</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">Contraseña</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <p className="mt-1 text-xs text-muted-foreground">Mínimo 6 caracteres</p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">Confirmar contraseña</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-sm bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta? <Link href="/login" className="text-primary hover:underline">Iniciar sesión</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
