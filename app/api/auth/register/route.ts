import { NextResponse } from 'next/server'
import { container } from '@/lib/infrastructure/di/container'
import { createSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'Nombre, email y contraseña son requeridos' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }
    const user = await container.authService.register(name, email, password)
    await createSession(user.id)
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    if (message.includes('Ya existe')) {
      return NextResponse.json({ error: message }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
