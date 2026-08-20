import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createUser, getUserByEmail } from '@/lib/db'
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
    const existing = await getUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una cuenta con este email' }, { status: 409 })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await createUser(name, email, passwordHash)
    await createSession(user.id)
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
