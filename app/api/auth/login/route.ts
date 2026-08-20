import { NextResponse } from 'next/server'
import { container } from '@/lib/infrastructure/di/container'
import { createSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password, remember } = await request.json()
    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
    }
    const user = await container.authService.login(email, password)
    await createSession(user.id, remember)
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } })
  } catch {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }
}
