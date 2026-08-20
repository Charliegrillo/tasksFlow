import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/db'
import { createSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password, remember } = await request.json()
    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
    }
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }
    await createSession(user.id, remember)
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
