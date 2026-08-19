import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth'
import { getUserById, getUserByEmail, updateUserPassword } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Contraseña actual y nueva contraseña son requeridas' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }
    const user = getUserById(session.userId)
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    const fullUser = getUserByEmail(user.email)
    if (!fullUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    const valid = await bcrypt.compare(currentPassword, fullUser.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 401 })
    }
    const passwordHash = await bcrypt.hash(newPassword, 10)
    updateUserPassword(session.userId, passwordHash)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
